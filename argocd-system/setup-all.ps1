# Täielik ArgoCD Image Updater seadistamise skript

Write-Host "🔧 Setting up ArgoCD Image Updater for k8m project..." -ForegroundColor Magenta

# 1. Installi Image Updater
Write-Host "📦 Installing Image Updater..." -ForegroundColor Yellow
Set-Location "image-updater"
.\install.ps1
Set-Location ".."

# 2. Seadista RBAC
Write-Host "🔐 Setting up RBAC..." -ForegroundColor Yellow
kubectl apply -f "rbac\image-updater-rbac.yaml"

# 3. GitHub repository secret (enne seda asendage GITHUB_TOKEN_HERE)
Write-Host "🔑 Please update github-repo-secret.yaml with your GitHub token first!" -ForegroundColor Red
Write-Host "Then run: kubectl apply -f rbac\github-repo-secret.yaml" -ForegroundColor White

# 4. ArgoCD kasutaja seadistamine
Write-Host "👤 Setting up ArgoCD user..." -ForegroundColor Yellow

# Fixed JSON patch - using proper PowerShell string handling
$patchData = @"
{
  "data": {
    "accounts.image-updater": "apiKey, login",
    "accounts.image-updater.enabled": "true"
  }
}
"@

kubectl patch configmap argocd-cm -n argocd --type merge --patch $patchData

# 5. Restart ArgoCD server
Write-Host "🔄 Restarting ArgoCD server..." -ForegroundColor Yellow
kubectl rollout restart deployment argocd-server -n argocd
kubectl rollout status deployment argocd-server -n argocd

Write-Host "✅ Setup completed! Next steps:" -ForegroundColor Green
Write-Host "1. Update github-repo-secret.yaml with your GitHub token" -ForegroundColor White
Write-Host "2. kubectl apply -f rbac\github-repo-secret.yaml" -ForegroundColor White
Write-Host "3. Generate ArgoCD token for image-updater user" -ForegroundColor White
Write-Host "4. Update your application manifests with Image Updater annotations" -ForegroundColor White