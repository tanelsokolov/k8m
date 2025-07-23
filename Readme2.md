# Metrics Suite: Kubernetes Setup Guide

## Prerequisites

- Docker Desktop (with Kubernetes enabled) or Minikube
- kubectl
- Helm
- ArgoCD

## 1. Start Kubernetes Cluster

If using Minikube:
```sh
minikube start
```
If using Docker Desktop, enable Kubernetes in settings.

## 2. Install ArgoCD

```sh
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Access ArgoCD UI at [https://localhost:8080](https://localhost:8080).

## 3. Connect ArgoCD to Your GitHub Repo

- Login to ArgoCD UI (`admin` / password from secret).
- Add your repo (`https://github.com/tanelsokolov/k8`) under Settings → Repositories.

## 4. Deploy Metrics Suite (App of Apps)

```sh
kubectl apply -f argocd/apps-of-suite/metrics-suite.yaml -n argocd
```
This will create all child applications for backend and frontend (dev/prod).

## 5. Monitor & Manage

- Use ArgoCD UI to monitor sync status and health.
- Use `kubectl get pods -n monitoring-dev` and `kubectl get pods -n monitoring-prod` to check deployments.

## 6. Update & Sync

- Push changes to your GitHub repo.
- ArgoCD will automatically sync and deploy updates.

## 7. Clean Up

```sh
kubectl delete -f argocd/apps-of-suite/metrics-suite.yaml -n argocd
```

---

**Tip:**  
- Helm values files (`values-dev.yaml`, `values-prod.yaml`) are used for environment-specific configs.
- All manifests point to your monorepo: `https://github.com/tanelsokolov/k8`.