# Kubernetes Learning Objectives - Student Q&A

## Architecture and Core Concepts

### Student demonstrates understanding of key Kubernetes architecture components
**Q: Describe the roles of the API server, etcd, controller manager, scheduler, kubelet.**

**A:** 
- **API Server**: Central management component that exposes the Kubernetes API and handles all REST requests
- **etcd**: Distributed key-value store that holds cluster state and configuration data
- **Controller Manager**: Runs controllers that handle routine tasks like node monitoring and pod replication
- **Scheduler**: Assigns pods to nodes based on resource requirements and constraints
- **kubelet**: Node agent that manages pods and communicates with the API server

### Student can articulate the benefits and drawbacks of using Kubernetes over traditional VM-based deployments
**A:** 
**Benefits:**
- Better resource utilization through containerization
- Automated scaling and self-healing
- Declarative configuration management
- Built-in load balancing and service discovery

**Drawbacks:**
- Higher complexity and learning curve
- Additional operational overhead
- Potential over-engineering for simple applications

### Student can explain the purpose and benefits of using namespaces in Kubernetes
**A:** Namespaces provide logical isolation within a cluster, allowing multiple teams or environments to share the same cluster while maintaining separation of resources. They help with resource organization, access control, and resource quotas.

### Student can explain the difference between a Deployment and a StatefulSet in Kubernetes and when to use one over the other
**A:** 
- **Deployment**: Best for stateless applications, provides rolling updates, and treats pods as interchangeable
- **StatefulSet**: Used for stateful applications requiring stable network identities, ordered deployment/scaling, and persistent storage

### Student can describe the Kubernetes networking model and how pods communicate with each other across nodes
**A:** Kubernetes uses a flat network where every pod gets its own IP address. Pods can communicate directly across nodes without NAT. The cluster DNS provides service discovery, and Services abstract access to groups of pods.

### Student can explain the purpose of the kube-proxy component in Kubernetes and how it facilitates service load balancing
**A:** kube-proxy runs on each node and maintains network rules for Services. It handles load balancing by distributing traffic to backend pods using iptables rules or IPVS.

### Student can explain the concept of Kubernetes Operators and how they extend Kubernetes functionality
**A:** Operators extend Kubernetes by encoding operational knowledge into software. They use custom resources and controllers to automate complex application lifecycle management beyond basic Kubernetes primitives.

### Student can explain the limitations of Minikube compared to a production Kubernetes cluster and identify features that are not available or behave differently
**A:** 
- Single-node cluster (no true multi-node testing)
- Limited resource capacity
- Some cloud provider features unavailable
- Simplified networking compared to production
- No high availability testing possible

## Pod Configuration and Management

### Student can explain the use Kubernetes probes (readiness, liveness, startup) in deployment manifests
**A:** 
- **Readiness Probe**: Determines if pod is ready to receive traffic
- **Liveness Probe**: Checks if pod is healthy and restarts if failing
- **Startup Probe**: Handles slow-starting containers before other probes take over

### Student can explain how to implement resource requests and limits for pods and describe what happens if a pod exceeds its memory limit
**A:** 
**Requests**: Guaranteed resources for scheduling decisions
**Limits**: Maximum resources a container can use

If a pod exceeds memory limits, it gets OOMKilled and potentially restarted based on the restart policy.

### Student can explain the purpose of init containers in a pod and provide an example where init containers solve a deployment problem
**A:** Init containers run before main containers and must complete successfully. Example use case: database schema migration that must finish before the application starts.

## Troubleshooting

### Student can troubleshoot deployment issues
**A:** Mostly used those kubectl commands to diagnose and fix issues:
- `kubectl describe pod <name>`
- `kubectl logs <pod-name>`
- `kubectl get events`
- `kubectl exec -it <pod> -- /bin/sh`

## Security and Networking

### Student can explain how to configure network policies to restrict pod-to-pod communication and address security considerations
**A:** Network policies act as a firewall for pods, controlling ingress and egress traffic. They use label selectors to define which pods can communicate with each other, implementing microsegmentation.

### Student can explain the difference between ClusterIP, NodePort, and LoadBalancer service types and justify the choice of specific service types for components
**A:** 
- **ClusterIP**: Internal cluster communication only (default)
- **NodePort**: Exposes service on each node's IP at a static port
- **LoadBalancer**: Creates external load balancer (cloud provider dependent)

## Storage Management

### Student can explain the importance of persistent storage in Kubernetes
**A:** Kubernetes pods are ephemeral, so persistent storage is crucial for stateful applications to maintain data across pod restarts and rescheduling.

### Student can explain the difference between ReadWriteOnce, ReadOnlyMany, and ReadWriteMany access modes for PersistentVolumes and justify the choice of access modes used
**A:** 
- **ReadWriteOnce (RWO)**: Single node read-write access
- **ReadOnlyMany (ROX)**: Multiple nodes read-only access  
- **ReadWriteMany (RWX)**: Multiple nodes read-write access

### Student can explain how to handle potential data loss scenarios when pods with persistent storage are rescheduled to different nodes
**A:** Use proper backup strategies, storage classes with replication.


### Student can articulate their choice of chosen CI/CD tool
**A:** Used GitHub Actions because of easy setup, have used it in previous tasks.

### Student can demonstrate how to secure secrets used in the CI/CD pipeline and explain the management and rotation of these secrets
**A:** I stored secrets inside GitHub Actions, secret keys are rotated every 30 days.

### Student can explain how to implement rolling updates in deployment strategy and handle failed deployments and rollbacks
**A:** Following commands do all of those.
```bash
kubectl set image deployment/app container=image:v2
kubectl rollout status deployment/app
kubectl rollout undo deployment/app
```


### Student can demonstrate how to implement custom metrics in the application and ensure these are scraped by Prometheus
**A:** I used a package inside my original application and used it to create new Prometheus acceptable metrics. Also needed to create a endpoint for Prometheus to scrape.

### Student can show how to configure Prometheus to use service discovery for scraping metrics and address challenges in ensuring all necessary targets are discovered
**A:** Can be seen in values.yaml file starting form line 40. Challenges are that some info can be scraped multiple times by different applications if not filtered out.

### Student can explain how to set up log rotation and retention policies in the EFK stack and manage log storage to prevent disk space issues
**A:** Configure log rotation policies, set retention periods, and monitor disk usage. Use index lifecycle management to automatically delete old logs.

### Student can describe the process of defining alert rules and routing them through Alertmanager
**A:** Alert rules are being set inside prometehus-rules.yaml file and Alermanager scrapes said alerts from Prometheus.

### Student can show how to configure alerting for frequent pod restarts and implement alert grouping and throttling to reduce alert fatigue
**A:** Alert rule is made in prometheus-rules.yaml and is grouped into Pod-Alerts group and alert fires if there is more than 15 restarts in 3 minutes.

## Security Implementation

### Student can explain the importance of RBAC in Kubernetes setup and provide examples
**A:** Role-Based Access Control ensures users and services have minimum required permissions. It provides fine-grained access control and audit trails.

### Student can explain the network segmentation within the cluster and provide examples
**A:** Implement network policies to create security boundaries between namespaces and applications. Use label selectors to define communication rules.

### Student can explain the use of Kubernetes Secrets for storing sensitive data
**A:** Kubernetes Secrets store sensitive data like passwords, tokens, and keys in base64 encoded format with encryption at rest.

### Student can show how to mount Secrets as volumes or environment variables in pods
**A:** Secrets can be mounted as volumes in the filesystem or injected as environment variables using secretKeyRef in pod specifications.

### No sensitive information (API keys, passwords, ssh keys, etc) is exposed in plain text in configuration files or manifests
**Requirement Met:** No sensitive information in any files.

### Appropriate namespaces are created for different components of the application
**A:** Namespace strategy:
- `argocd` - ArgoCD pod manager
- `monitoring` - Prometheus, Grafana
- `kube-system` - Kube-Proxy/ApiServer ect.
- `ingress-nginx` - Ingress


## Advanced Troubleshooting

### Student can walk through the process for debugging a pod stuck in a CrashLoopBackOff state and describe the commands used and what to look for
**A:** 
1. `kubectl describe pod <name>` - Check events and status
2. `kubectl logs <pod> --previous` - Check previous container logs
3. Check resource limits and requests
4. Verify configuration and environment variables
5. Validate image and entry point

### Student can explain how to diagnose and resolve a situation where pods are stuck in a Pending state due to insufficient cluster resources
**A:** 
1. `kubectl describe pod <name>` - Check scheduling events
2. `kubectl describe nodes` - Check node resources
3. `kubectl top nodes` - Monitor resource usage
4. Check resource requests vs available capacity
5. Consider cluster autoscaling or manual node addition