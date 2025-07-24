# Looge kaustad (PowerShell)
New-Item -ItemType Directory -Force -Path "argocd-system\image-updater"
New-Item -ItemType Directory -Force -Path "argocd-system\rbac"

# argocd-system/image-updater/image-updater-values.yaml
@"
# ArgoCD Image Updater konfiguratsiooni väärtused
image:
  repository: quay.io/argoprojlabs/argocd-image-updater
  tag: v0.12.2
  pullPolicy: Always

config:
  # ArgoCD serveri ühenduse seaded
  argocd.grpc_web: true
  argocd.server_addr: argocd-server.argocd.svc.cluster.local:443
  argocd.insecure: false
  argocd.plaintext: false
  
  # Git repository seaded
  git.commit_user: argocd-image-updater
  git.commit_email: argocd-image-updater@tanelsokolov.dev
  git.commit_message_template: |
    build: automatic update of {{ .AppName }}
    
    {{ range .AppChanges -}}
    updates image {{ .Image }} tag '{{ .OldTag }}' to '{{ .NewTag }}'
    {{ end -}}

# RBAC õigused
rbac:
  enabled: true

serviceAccount:
  create: true
  name: argocd-image-updater

# Logimise tase
logLevel: info

# Registry seaded
registries:
  - name: Docker Hub
    prefix: docker.io
    api_url: https://registry-1.docker.io
    default: true
"@ | Out-File -FilePath "argocd-system\image-updater\image-updater-values.yaml" -Encoding UTF8

# argocd-system/image-updater/install.ps1
@"
# ArgoCD Image Updater installimise skript Windows jaoks

Write-Host "🚀 Installing ArgoCD Image Updater..." -ForegroundColor Green

# Lisa ArgoCD Image Updater repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Installi ArgoCD Image Updater
helm install argocd-image-updater argo/argocd-image-updater ``
  --namespace argocd ``
  --create-namespace ``
  -f image-updater-values.yaml

Write-Host "✅ ArgoCD Image Updater installed successfully!" -ForegroundColor Green

# Kontrolli installimist
Write-Host "📋 Checking installation..." -ForegroundColor Yellow
kubectl get pods -n argocd | Select-String "image-updater"

Write-Host "📝 To view logs, run:" -ForegroundColor Cyan
Write-Host "kubectl logs -n argocd deployment/argocd-image-updater -f" -ForegroundColor White
"@ | Out-File -FilePath "argocd-system\image-updater\install.ps1" -Encoding UTF8

# argocd-system/rbac/image-updater-rbac.yaml
@"
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
  labels:
    app.kubernetes.io/name: argocd-rbac-cm
    app.kubernetes.io/part-of: argocd
data:
  policy.default: role:readonly
  policy.csv: |
    # Image Updater spetsiifilised õigused
    p, role:image-updater, applications, get, *, allow
    p, role:image-updater, applications, update, *, allow
    p, role:image-updater, applications, sync, *, allow
    p, role:image-updater, applications, action/*, *, allow
    p, role:image-updater, repositories, get, *, allow
    p, role:image-updater, repositories, update, *, allow
    p, role:image-updater, repositories, create, *, allow
    p, role:image-updater, certificates, get, *, allow
    
    # Määra image-updater kasutajale roll
    g, image-updater, role:image-updater
    
    # Admin rolli säilitamine
    g, admin, role:admin
"@ | Out-File -FilePath "argocd-system\rbac\image-updater-rbac.yaml" -Encoding UTF8

# argocd-system/rbac/github-repo-secret.yaml (template)
@"
apiVersion: v1
kind: Secret
metadata:
  name: k8m-repo-secret
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
stringData:
  type: git
  url: https://github.com/tanelsokolov/k8m
  username: tanelsokolov
  password: ababa  # Asendage oma GitHub token'iga
"@ | Out-File -FilePath "argocd-system\rbac\github-repo-secret.yaml" -Encoding UTF8

# argocd-system/setup-all.ps1 (Kogu seadistuse skript)
@"
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
kubectl patch configmap argocd-cm -n argocd --type merge --patch='{"data":{"accounts.image-updater":"apiKey, login","accounts.image-updater.enabled":"true"}}'

# 5. Restart ArgoCD server
Write-Host "🔄 Restarting ArgoCD server..." -ForegroundColor Yellow
kubectl rollout restart deployment argocd-server -n argocd
kubectl rollout status deployment argocd-server -n argocd

Write-Host "✅ Setup completed! Next steps:" -ForegroundColor Green
Write-Host "1. Update github-repo-secret.yaml with your GitHub token" -ForegroundColor White
Write-Host "2. kubectl apply -f rbac\github-repo-secret.yaml" -ForegroundColor White
Write-Host "3. Generate ArgoCD token for image-updater user" -ForegroundColor White
Write-Host "4. Update your application manifests with Image Updater annotations" -ForegroundColor White
"@ | Out-File -FilePath "argocd-system\setup-all.ps1" -Encoding UTF8

Write-Host "✅ Created ArgoCD Image Updater files for Windows!" -ForegroundColor Green
Write-Host "📁 Files created in: argocd-system\" -ForegroundColor Cyan