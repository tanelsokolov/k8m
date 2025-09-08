import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import os from 'os';
import axios from 'axios';
import client from 'prom-client';
import winston from 'winston';
//test 2
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'metrics-collector-app', hostname: os.hostname() },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Prometheus Configuration
const register = new client.Registry();

// Add default labels
register.setDefaultLabels({
  app: 'system-metrics-collector-app',
  version: '1.0.0'
});

// Enable collection of default metrics
client.collectDefaultMetrics({ register });

// Custom Prometheus Metrics
const customMetrics = {
  // System metrics
  cpuUsage: new client.Gauge({
    name: 'system_cpu_usage_percent',
    help: 'Current CPU usage percentage',
    labelNames: ['hostname']
  }),
  memoryUsage: new client.Gauge({
    name: 'system_memory_usage_bytes',
    help: 'Current memory usage in bytes',
    labelNames: ['hostname', 'type']
  }),
  memoryAvailable: new client.Gauge({
    name: 'system_memory_available_bytes',
    help: 'Available memory in bytes',
    labelNames: ['hostname']
  }),
  networkTraffic: new client.Gauge({
    name: 'system_network_bytes_total',
    help: 'Total network traffic in bytes',
    labelNames: ['hostname', 'direction']
  }),
  networkSpeed: new client.Gauge({
    name: 'system_network_speed_bytes_per_second',
    help: 'Current network speed in bytes per second',
    labelNames: ['hostname', 'direction']
  }),
  uptime: new client.Gauge({
    name: 'system_uptime_seconds',
    help: 'System uptime in seconds',
    labelNames: ['hostname']
  }),
  loadAverage: new client.Gauge({
    name: 'system_load_average',
    help: 'System load average',
    labelNames: ['hostname', 'period']
  }),
  
  // Application metrics
  apiRequests: new client.Counter({
    name: 'api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['endpoint', 'method', 'status_code']
  }),
  requestDuration: new client.Histogram({
    name: 'api_request_duration_seconds',
    help: 'Duration of API requests in seconds',
    labelNames: ['endpoint', 'method'],
    buckets: [0.1, 0.5, 1, 2, 5]
  }),
  
  // Custom business metric (Step 8 requirement)
  metricsCollectionErrors: new client.Counter({
    name: 'metrics_collection_errors_total',
    help: 'Total number of metrics collection errors',
    labelNames: ['type', 'hostname']
  }),
  
  // Server connectivity metric
  serverConnectivity: new client.Gauge({
    name: 'server_connectivity_status',
    help: 'Server connectivity status (1=up, 0=down)',
    labelNames: ['hostname', 'server_url']
  })
};

// Register all custom metrics
Object.values(customMetrics).forEach(metric => register.registerMetric(metric));

// Middleware to track API requests and duration
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const endpoint = req.route?.path || req.path;
    
    // Track request count
    customMetrics.apiRequests.inc({
      endpoint: endpoint,
      method: req.method,
      status_code: res.statusCode
    });
    
    // Track request duration
    customMetrics.requestDuration.observe({
      endpoint: endpoint,
      method: req.method
    }, duration);
    
    // Log request
    logger.info('API request processed', {
      method: req.method,
      endpoint: endpoint,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});

// Function to get memory information with better available memory handling
async function getMemoryInfo() {
  try {
    const mem = await si.mem();
    
    // Debug logging for memory info
    logger.debug('Raw memory info from systeminformation', {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      available: mem.available,
      availableExists: mem.available !== undefined,
      availableType: typeof mem.available
    });
    
    // Calculate available memory with fallback
    let available = mem.available;
    
    // If available is undefined, null, or 0, use free as fallback
    if (available === undefined || available === null || available === 0) {
      available = mem.free;
      logger.debug('Using free memory as available fallback', { 
        free: mem.free,
        reason: 'available memory not provided by system'
      });
    }
    
    return {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      available: available
    };
  } catch (error) {
    logger.error('Error getting memory info', { error: error.message });
    throw error;
  }
}

// Function to collect local metrics (with improved available memory handling)
async function getLocalMetrics() {
  try {
    const [cpu, mem, currentLoad, networkStats] = await Promise.all([
      si.cpu(),
      getMemoryInfo(),
      si.currentLoad(),
      si.networkStats(),
    ]);
    
    // Sum up total network traffic across all interfaces
    const totalNetwork = networkStats.reduce((acc, iface) => ({
      rx_bytes: acc.rx_bytes + iface.rx_bytes,
      tx_bytes: acc.tx_bytes + iface.tx_bytes,
      rx_sec: acc.rx_sec + (iface.rx_sec || 0),
      tx_sec: acc.tx_sec + (iface.tx_sec || 0),
    }), { rx_bytes: 0, tx_bytes: 0, rx_sec: 0, tx_sec: 0 });
    
    return {
      hostname: os.hostname(),
      osType: `${os.type()} ${os.release()}`,
      webServer: 'nginx',
      memoryUsage: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        available: mem.available
      },
      cpuInfo: {
        model: cpu.manufacturer + ' ' + cpu.brand,
        cores: cpu.cores,
        usage: currentLoad.currentLoad
      },
      networkTraffic: {
        bytesReceived: totalNetwork.rx_bytes,
        bytesSent: totalNetwork.tx_bytes,
        receiveSpeed: totalNetwork.rx_sec,
        sendSpeed: totalNetwork.tx_sec
      },
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    };
  } catch (error) {
    logger.error('Error collecting local metrics', { error: error.message });
    throw error;
  }
}

// Function to update Prometheus metrics with improved error handling
async function updatePrometheusMetrics() {
  try {
    const metrics = await getLocalMetrics();
    const hostname = metrics.hostname;
    
    // Update system metrics
    customMetrics.cpuUsage.set({ hostname }, metrics.cpuInfo.usage);
    customMetrics.memoryUsage.set({ hostname, type: 'total' }, metrics.memoryUsage.total);
    customMetrics.memoryUsage.set({ hostname, type: 'used' }, metrics.memoryUsage.used);
    customMetrics.memoryUsage.set({ hostname, type: 'free' }, metrics.memoryUsage.free);
    customMetrics.memoryUsage.set({ hostname, type: 'available' }, metrics.memoryUsage.available);
    
    // Also set the separate available memory metric
    customMetrics.memoryAvailable.set({ hostname }, metrics.memoryUsage.available);
    
    customMetrics.networkTraffic.set({ hostname, direction: 'rx' }, metrics.networkTraffic.bytesReceived);
    customMetrics.networkTraffic.set({ hostname, direction: 'tx' }, metrics.networkTraffic.bytesSent);
    customMetrics.networkSpeed.set({ hostname, direction: 'rx' }, metrics.networkTraffic.receiveSpeed);
    customMetrics.networkSpeed.set({ hostname, direction: 'tx' }, metrics.networkTraffic.sendSpeed);
    customMetrics.uptime.set({ hostname }, metrics.uptime);
    
    // Update load average metrics
    metrics.loadAverage.forEach((load, index) => {
      const periods = ['1m', '5m', '15m'];
      customMetrics.loadAverage.set({ hostname, period: periods[index] }, load);
    });
    
    logger.debug('Prometheus metrics updated successfully', { 
      hostname,
      availableMemory: metrics.memoryUsage.available,
      totalMemory: metrics.memoryUsage.total
    });
  } catch (error) {
    logger.error('Error updating Prometheus metrics', { 
      error: error.message, 
      stack: error.stack 
    });
    customMetrics.metricsCollectionErrors.inc({ type: 'prometheus_update', hostname: os.hostname() });
  }
}

// Update Prometheus metrics every 15 seconds
setInterval(updatePrometheusMetrics, 15000);
updatePrometheusMetrics(); // Initial update

// Debug endpoint to check memory metrics
app.get('/debug/memory', async (req, res) => {
  try {
    const rawMem = await si.mem();
    const processedMem = await getMemoryInfo();
    const metrics = await getLocalMetrics();
    
    res.json({
      raw_systeminformation: {
        total: rawMem.total,
        used: rawMem.used,
        free: rawMem.free,
        available: rawMem.available,
        availableExists: rawMem.available !== undefined,
        availableType: typeof rawMem.available
      },
      processed_memory: processedMem,
      final_metrics: metrics.memoryUsage,
      prometheus_values: {
        available_set: metrics.memoryUsage.available,
        total_set: metrics.memoryUsage.total,
        used_set: metrics.memoryUsage.used,
        free_set: metrics.memoryUsage.free
      }
    });
  } catch (error) {
    logger.error('Error in debug memory endpoint', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get('/local-metrics', async (req, res) => {
  try {
    const metrics = await getLocalMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching local metrics', { 
      error: error.message, 
      stack: error.stack 
    });
    customMetrics.metricsCollectionErrors.inc({ type: 'local_metrics', hostname: os.hostname() });
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

app.get('/metrics', async (req, res) => {
  const startTime = Date.now();
  try {
    const targetServer = req.headers['x-target-server'];
    
    logger.info('Metrics request received', { 
      targetServer: targetServer,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    if (targetServer) {
      // If X-Target-Server header is present, return only the metrics for that server
      const localMetrics = await getLocalMetrics();
      localMetrics.hostname = targetServer; // Override hostname to match target server name
      res.json([localMetrics]);
    } else {
      // Get local metrics
      const localMetrics = await getLocalMetrics();
      
      // Configuration for remote servers using WireGuard VPN IPs
      const servers = [
        //{ url: 'http://192.168.189.102:3000/local-metrics' }, // web-server-1
        //{ url: 'http://192.168.189.103:3000/local-metrics' }, // web-server-2
        //{ url: 'http://192.168.189.104:3000/local-metrics' },  // load-balancer
        //{ url: 'http://192.168.189.105:3000/local-metrics' },  // cicd server
        // test full app server down
      ];
      
      // Fetch metrics from all servers
      const remoteMetricsPromises = servers.map(server =>
        axios.get(server.url, { timeout: 5000 })
          .then(response => {
            // Update server connectivity metric
            customMetrics.serverConnectivity.set({ 
              hostname: os.hostname(), 
              server_url: server.url 
            }, 1);
            return response.data;
          })
          .catch(error => {
            logger.error(`Error fetching metrics from ${server.url}`, { 
              error: error.message,
              server_url: server.url
            });
            
            // Update server connectivity metric
            customMetrics.serverConnectivity.set({ 
              hostname: os.hostname(), 
              server_url: server.url 
            }, 0);
            
            customMetrics.metricsCollectionErrors.inc({ type: 'remote_server', hostname: os.hostname() });
            return null;
          })
      );
      
      // Wait for all requests to complete
      const remoteMetrics = await Promise.allSettled(remoteMetricsPromises);
      
      // Combine all metrics
      const allMetrics = [
        localMetrics,
        ...remoteMetrics
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value)
      ];
      
      res.json(allMetrics);
    }
    
    const duration = Date.now() - startTime;
    logger.info('Metrics request completed successfully', { 
      duration: duration,
      targetServer: targetServer,
      metricsCount: Array.isArray(res.locals.metrics) ? res.locals.metrics.length : 1
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error fetching metrics', { 
      error: error.message, 
      stack: error.stack,
      duration: duration
    });
    customMetrics.metricsCollectionErrors.inc({ type: 'general', hostname: os.hostname() });
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

app.get('/metrics/prometheus', async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('Prometheus metrics request received');
    
    // Update metrics before serving
    await updatePrometheusMetrics();
    
    // Set proper content type for Prometheus
    res.set('Content-Type', register.contentType);
    
    // Get the metrics string
    const metrics = await register.metrics();
    
    // Ensure we're sending proper Prometheus format
    if (!metrics || metrics.trim() === '') {
      throw new Error('No metrics available');
    }
    
    res.send(metrics);
    
    const duration = Date.now() - startTime;
    logger.info('Prometheus metrics served successfully', { 
      duration,
      metricsLength: metrics.length 
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error serving Prometheus metrics', { 
      error: error.message, 
      stack: error.stack,
      duration: duration
    });
    
    // Increment error counter if it exists
    if (customMetrics.metricsCollectionErrors) {
      customMetrics.metricsCollectionErrors.inc({ 
        type: 'prometheus_serve', 
        hostname: os.hostname() 
      });
    }
    
    res.status(500).set('Content-Type', 'text/plain').send('Error generating Prometheus metrics');
  }
});

// METRICS SUMMARY ENDPOINT (Updated with improved available memory)
app.get('/metrics/summary', async (req, res) => {
  try {
    const metrics = await getLocalMetrics();
    const summary = {
      timestamp: new Date().toISOString(),
      hostname: metrics.hostname,
      status: 'healthy',
      summary: {
        cpu_usage_percent: Math.round(metrics.cpuInfo.usage * 100) / 100,
        memory_usage_percent: Math.round(((metrics.memoryUsage.total - metrics.memoryUsage.available) / metrics.memoryUsage.total) * 100 * 100) / 100,
        memory_available_percent: Math.round((metrics.memoryUsage.available / metrics.memoryUsage.total) * 100 * 100) / 100,
        memory_available_bytes: metrics.memoryUsage.available,
        memory_total_bytes: metrics.memoryUsage.total,
        disk_usage_status: 'ok', // You can enhance this with actual disk metrics
        network_active: metrics.networkTraffic.receiveSpeed > 0 || metrics.networkTraffic.sendSpeed > 0,
        uptime_hours: Math.round(metrics.uptime / 3600 * 100) / 100,
        load_average_1m: metrics.loadAverage[0]
      }
    };
    
    res.json(summary);
    logger.info('Metrics summary served', { hostname: metrics.hostname });
  } catch (error) {
    logger.error('Error generating metrics summary', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ error: 'Failed to generate metrics summary' });
  }
});

// ORIGINAL HEALTH CHECK - KEPT INTACT
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Enhanced health check with more details (Updated with improved available memory)
app.get('/health/detailed', async (req, res) => {
  try {
    const metrics = await getLocalMetrics();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      hostname: metrics.hostname,
      version: '1.0.0',
      checks: {
        memory: ((metrics.memoryUsage.total - metrics.memoryUsage.available) / metrics.memoryUsage.total) < 0.9 ? 'ok' : 'warning',
        cpu: metrics.cpuInfo.usage < 80 ? 'ok' : 'warning',
        load: metrics.loadAverage[0] < metrics.cpuInfo.cores * 2 ? 'ok' : 'warning'
      },
      memory_details: {
        total_bytes: metrics.memoryUsage.total,
        available_bytes: metrics.memoryUsage.available,
        used_bytes: metrics.memoryUsage.used,
        free_bytes: metrics.memoryUsage.free,
        usage_percent: ((metrics.memoryUsage.total - metrics.memoryUsage.available) / metrics.memoryUsage.total) * 100
      }
    };
    
    const overallHealthy = Object.values(health.checks).every(check => check === 'ok');
    health.status = overallHealthy ? 'healthy' : 'degraded';
    
    res.status(overallHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Error in detailed health check', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Health check failed' 
    });
  }
});

app.get('/simulate-error', (req, res) => {
  customMetrics.metricsCollectionErrors.inc({ type: 'manual_test', hostname: os.hostname() });
  logger.warn('Manual test error triggered');
  res.status(500).json({ message: 'Simuleeritud error registreeritud' }); 
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Metrics server running on port ${PORT}`, {
    port: PORT,
    hostname: os.hostname(),
    nodeVersion: process.version
  });
  console.log(`Metrics server running on port ${PORT}`);
});