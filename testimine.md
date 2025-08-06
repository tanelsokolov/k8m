up{job="kubernetes-apiservers"} == 0

kubectl exec -it metrics-backend-678bbb9578-zxqh8 -n monitoring -- /bin/sh
curl http://localhost:3000/fake-endpoint

Node-related alerts:

Node CPU usage exceeds 80% for more than 5 minutes
stress-ng --cpu 4 --timeout 3360s


Node available disk space falls below 20%


Node memory usage exceeds 90% for more than 5 minutes
Pod and Container-related alerts:

Pod restarts more than 3 times in 15 minutes
Container memory usage exceeds 80% of its limit
Pod is in a pending state for more than 5 minutes
Cluster-related alerts:

Kubernetes API server becomes unreachable
minikube ssh
docker ps | grep kube-apiserver
docker stop k8s_kube-apiserver_kube-apiserver-minikube_kube-system_78e1292e1d47cc7d09b2c6f5826fa624_7


Monitoring and Logging system alerts:

Elasticsearch cluster status changes to yellow or red
Fluentd experiences log collection errors