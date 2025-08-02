kubectl port-forward svc/argocd-server -n argocd 8080:443
kubectl port-forward -n monitoring svc/monitoring-stack-grafana 3000:3000
kubectl port-forward -n monitoring svc/monitoring-stack-prometheus 9090:8080
kubectl port-forward svc/monitoring-stack-kibana 5601:5601 -n monitoring