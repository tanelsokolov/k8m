# ArgoCD Image Updater installimise skript Windows jaoks

Write-Host "🚀 Installing ArgoCD Image Updater..." -ForegroundColor Green

# Lisa ArgoCD Image Updater repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Installi ArgoCD Image Updater
helm install argocd-image-updater argo/argocd-image-updater `
  --namespace argocd `
  --create-namespace `
  -f image-updater-values.yaml

Write-Host "✅ ArgoCD Image Updater installed successfully!" -ForegroundColor Green

# Kontrolli installimist
Write-Host "📋 Checking installation..." -ForegroundColor Yellow
kubectl get pods -n argocd | Select-String "image-updater"

Write-Host "📝 To view logs, run:" -ForegroundColor Cyan
Write-Host "kubectl logs -n argocd deployment/argocd-image-updater -f" -ForegroundColor White
