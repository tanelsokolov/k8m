# Kubernetes Monitoring Setup

This document describes the comprehensive monitoring setup for your Kubernetes cluster using Prometheus, Grafana, and additional monitoring components.

## Overview

The monitoring stack includes:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **kube-state-metrics**: Kubernetes state metrics
- **node-exporter**: Node-level system metrics
- **cAdvisor**: Container metrics
- **Alertmanager**: Alerting and notifications

## Components

### 1. Prometheus Configuration

Prometheus is configured to scrape metrics from:

#### Kubernetes Components
- **Kubernetes API Server**: `kubernetes-apiservers` job
- **Kubernetes Nodes**: `kubernetes-nodes` job  
- **Kubernetes Pods**: `kubernetes-pods` job (auto-discovery via annotations)
- **Kubernetes Services**: `kubernetes-services` job
- **Kubernetes Endpoints**: `kubernetes-endpoints` job
- **Kubernetes Ingress**: `kubernetes-ingress` job

#### Application Components
- **metrics-backend**: Custom application metrics at `/metrics/prometheus`
- **metrics-frontend**: Frontend application metrics at `/metrics`
- **ArgoCD Components**: Server, repo-server, and application-controller

#### System Components
- **kube-state-metrics**: Kubernetes state metrics
- **node-exporter**: Node-level system metrics
- **cAdvisor**: Container and resource metrics

### 2. Auto-Discovery Configuration

Applications are automatically discovered by Prometheus using Kubernetes service discovery and pod annotations:

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics/prometheus"
```

### 3. RBAC Configuration

The monitoring stack includes proper RBAC permissions to:
- Read Kubernetes nodes, pods, services, and endpoints
- Access metrics endpoints
- Read ingress configurations

## Verification Steps

### 1. Check Prometheus Targets

Access Prometheus UI and verify targets are being scraped:

```bash
# Port forward to Prometheus
kubectl port-forward -n monitoring svc/monitoring-stack-prometheus 9090:8080
```

Then visit `http://localhost:9090` and check:
- **Status > Targets**: All targets should show as "UP"
- **Status > Service Discovery**: Should show discovered endpoints

### 2. Check Application Metrics

Verify your applications are exposing metrics:

```bash
# Check metrics-backend
kubectl port-forward -n monitoring svc/metrics-backend 3000:3000
curl http://localhost:3000/metrics/prometheus

# Check metrics-frontend  
kubectl port-forward -n monitoring svc/metrics-frontend 5173:5173
curl http://localhost:5173/metrics
```

### 3. Check Grafana Dashboards

Access Grafana to view metrics:

```bash
# Port forward to Grafana
kubectl port-forward -n monitoring svc/monitoring-stack-grafana 3000:3000
```

Default credentials:
- Username: `admin`
- Password: `admin`

### 4. Verify Monitoring Components

Check that all monitoring components are running:

```bash
# Check all monitoring pods
kubectl get pods -n monitoring

# Check services
kubectl get svc -n monitoring

# Check node-exporter DaemonSet
kubectl get daemonset -n monitoring
```

## Key Metrics to Monitor

### Application Metrics
- `api_requests_total`: Total API requests
- `api_request_duration_seconds`: Request duration
- `system_cpu_usage_percent`: CPU usage
- `system_memory_usage_bytes`: Memory usage
- `system_network_bytes_total`: Network traffic

### Kubernetes Metrics
- `kube_pod_status_phase`: Pod status
- `kube_node_status_condition`: Node health
- `kube_service_spec_type`: Service types
- `kube_deployment_status_replicas`: Deployment replicas

### System Metrics
- `node_cpu_seconds_total`: CPU usage
- `node_memory_MemAvailable_bytes`: Available memory
- `container_cpu_usage_seconds_total`: Container CPU
- `container_memory_usage_bytes`: Container memory

## Troubleshooting

### Common Issues

1. **Targets showing as DOWN**
   - Check if applications have proper Prometheus annotations
   - Verify metrics endpoints are accessible
   - Check network policies

2. **No metrics from applications**
   - Ensure applications expose metrics at the correct path
   - Verify Prometheus annotations are correct
   - Check application logs for errors

3. **RBAC issues**
   - Verify ServiceAccount has proper permissions
   - Check ClusterRole and ClusterRoleBinding

### Debug Commands

```bash
# Check Prometheus logs
kubectl logs -n monitoring deployment/monitoring-stack-prometheus

# Check application logs
kubectl logs -n monitoring deployment/metrics-backend
kubectl logs -n monitoring deployment/metrics-frontend

# Check service discovery
kubectl get endpoints -n monitoring
kubectl get services -n monitoring

# Test metrics endpoints directly
kubectl exec -it deployment/metrics-backend -n monitoring -- curl localhost:3000/metrics/prometheus
```

## Configuration Files

### Prometheus Configuration
- **Location**: `charts/monitoring-stack/values.yaml`
- **Key sections**: `prometheus.config.scrape_configs`

### Application Annotations
- **metrics-backend**: `charts/metrics-backend/templates/deployment.yaml`
- **metrics-frontend**: `charts/metrics-frontend/templates/deployment.yaml`

### RBAC Configuration
- **Location**: `charts/monitoring-stack/templates/rbac.yaml`

## Next Steps

1. **Create Custom Dashboards**: Build Grafana dashboards for your specific metrics
2. **Set Up Alerts**: Configure Alertmanager rules for critical metrics
3. **Add More Metrics**: Extend application metrics based on business needs
4. **Performance Tuning**: Adjust scrape intervals and retention based on cluster size

## Useful Queries

### Application Health
```
# Request rate
rate(api_requests_total[5m])

# Error rate
rate(api_requests_total{status_code=~"5.."}[5m])

# Response time
histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))
```

### System Health
```
# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Pod status
kube_pod_status_phase
```

This monitoring setup provides comprehensive visibility into your Kubernetes cluster and applications, enabling proactive monitoring and alerting. 