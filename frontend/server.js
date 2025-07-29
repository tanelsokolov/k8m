import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5173;

// Trust proxy for correct IP addresses
app.set('trust proxy', true);

// Proxy /api/metrics to backend metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL;
    const response = await axios.get(`${backendUrl}/metrics`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching metrics:', error.message);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Serve static files
app.use(express.static(__dirname));

// Logimine
app.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] New client connected - IP: ${ip} - User-Agent: ${userAgent}`);
  
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Docker healthcheck
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard server running on port ${PORT}`);
});