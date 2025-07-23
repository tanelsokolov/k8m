# Metrics Suite Kubernetes Deployment with ArgoCD & Helm

## Prerequisites

- Docker Desktop (with Kubernetes enabled)
- Minikube (optional, if not using Docker Desktop's Kubernetes)
- kubectl
- Helm
- ArgoCD (installed in your cluster)
- GitHub repository containing your Helm charts and ArgoCD manifests

## 1. Start Your Local Kubernetes Cluster

If using Minikube:
```sh
minikube start
```
If using Docker Desktop, ensure Kubernetes is enabled in settings.

## 2. Install ArgoCD

```sh
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Access ArgoCD UI at [https://localhost:8080](https://localhost:8080).

## 3. Configure ArgoCD

- Login with default credentials (`admin` / initial password from `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`).
- Connect ArgoCD to your GitHub repo (Settings → Repositories).

## 4. Deploy the Metrics Suite (App of Apps Pattern)

Apply the App of Apps manifest:
```sh
kubectl apply -f argocd/app-of-apps/metrics-suite.yaml -n argocd
```
This will create all child applications for backend and frontend (dev/prod).

## 5. Monitor & Manage

- Use ArgoCD UI to monitor sync status and health.
- Use `kubectl get pods -n monitoring-dev` and `kubectl get pods -n monitoring-prod` to check deployments.

## 6. Update & Sync

- Push changes to your GitHub repo.
- ArgoCD will automatically sync and deploy updates.

## 7. Clean Up

To remove all resources:
```sh
kubectl delete -f argocd/app-of-apps/metrics-suite.yaml -n argocd
```

---

**Tip:**  
- Update `<your-username>/<your-repo>` in manifests to your actual GitHub repo.
- Use Helm values files (`values-dev.yaml`, `values-prod.yaml`) for environment-specific configs.

---