
Näidata töötavaid rakendusi
näidata et on 1 backend 2 fronti
näidata et kõik toimib
näidata prometheus
näidata grafana
näidata kibana
alertide testid
näidata namespaced ette


up{job="kubernetes-apiservers"} == 0

kubectl exec -it metrics-backend-678bbb9578-zxqh8 -n monitoring -- /bin/sh
curl http://localhost:3000/fake-endpoint

Node-related alerts:

Node CPU usage exceeds 80% for more than 5 minutes
stress-ng --cpu 4 --timeout 3360s


Node available disk space falls below 20%
sudo mount -t tmpfs -o size=100M tmpfs /mnt/testdisk
dd if=/dev/zero of=/mnt/testdisk/fill bs=1M count=90


Pod and Container-related alerts:

Pod restarts more than 3 times in 15 minutes
kubectl run test-pod --image=alpine --restart=Always -- /bin/sh -c "sleep 10; exit 1"
kubectl delete pod test-pod

Pod is in a pending state for more than 5 minutes
kubectl apply -f insufficient-resources-pod.yaml


Cluster-related alerts:

Kubernetes API server becomes unreachable
values.yaml failis muuta kubernetes regex


Monitoring and Logging system alerts:
Elasticsearch cluster status changes to yellow or red
es0 maha

Fluentd experiences log collection errors
values failist es output lõhkuda

Näidata github actionsis secreteid.
https://github.com/tanelsokolov/k8m/settings/secrets/actions

Secretite demo
kubectl create secret generic db-secret --from-literal=username=myuser --from-literal=password=mypassword

kubectl apply -f secret-demo-deployment.yaml

kubectl get pods

kubectl logs <podi-nimi>
