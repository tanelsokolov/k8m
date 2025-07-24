# ArgoCD Image Updater Integratsioon GitHub Actions'iga

## 1. Uuendatud ArgoCD Applications (Image Updater'iga)

### metrics-backend-prod.yaml
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: metrics-backend-prod
  namespace: argocd
  annotations:
    # Image Updater konfiguratsiooni annotaatsioonid
    argocd-image-updater.argoproj.io/image-list: backend=tanelsokolov/metrics-backend
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/git-branch: main
    
    # Timestamp-based versioning (mitte semantic versioning)
    argocd-image-updater.argoproj.io/backend.update-strategy: latest
    argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^prod-[0-9]{8}-[0-9]{6}$
    argocd-image-updater.argoproj.io/backend.ignore-tags: latest,dev-latest,dev-.*
    
    # Git commit seaded
    argocd-image-updater.argoproj.io/git-commit-user: argocd-image-updater
    argocd-image-updater.argoproj.io/git-commit-email: argocd-image-updater@tanelsokolov.dev
    argocd-image-updater.argoproj.io/git-commit-message: "chore: update {{.AppName}} backend image to {{.NewTag}}"
spec:
  project: default
  source:
    repoURL: https://github.com/tanelsokolov/k8m
    targetRevision: main
    path: charts/metrics-backend
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### metrics-backend-dev.yaml
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: metrics-backend-dev
  namespace: argocd
  annotations:
    # Image Updater konfiguratsiooni annotaatsioonid
    argocd-image-updater.argoproj.io/image-list: backend=tanelsokolov/metrics-backend
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/git-branch: main
    
    # Dev timestamp-based versioning
    argocd-image-updater.argoproj.io/backend.update-strategy: latest
    argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^dev-[0-9]{8}-[0-9]{6}$
    argocd-image-updater.argoproj.io/backend.ignore-tags: latest,prod-latest,prod-.*
    
    # Git commit seaded
    argocd-image-updater.argoproj.io/git-commit-user: argocd-image-updater
    argocd-image-updater.argoproj.io/git-commit-email: argocd-image-updater@tanelsokolov.dev
    argocd-image-updater.argoproj.io/git-commit-message: "chore: update {{.AppName}} backend dev image to {{.NewTag}}"
spec:
  project: default
  source:
    repoURL: https://github.com/tanelsokolov/k8m
    targetRevision: main
    path: charts/metrics-backend
    helm:
      valueFiles:
        - values-dev.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### metrics-frontend-prod.yaml
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: metrics-frontend-prod
  namespace: argocd
  annotations:
    # Image Updater konfiguratsiooni annotaatsioonid
    argocd-image-updater.argoproj.io/image-list: frontend=tanelsokolov/metrics-frontend
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/git-branch: main
    
    # Prod timestamp-based versioning
    argocd-image-updater.argoproj.io/frontend.update-strategy: latest
    argocd-image-updater.argoproj.io/frontend.allow-tags: regexp:^prod-[0-9]{8}-[0-9]{6}$
    argocd-image-updater.argoproj.io/frontend.ignore-tags: latest,dev-latest,dev-.*
    
    # Git commit seaded
    argocd-image-updater.argoproj.io/git-commit-user: argocd-image-updater
    argocd-image-updater.argoproj.io/git-commit-email: argocd-image-updater@tanelsokolov.dev
    argocd-image-updater.argoproj.io/git-commit-message: "chore: update {{.AppName}} frontend image to {{.NewTag}}"
spec:
  project: default
  source:
    repoURL: https://github.com/tanelsokolov/k8m
    targetRevision: main
    path: charts/metrics-frontend
    helm:
      valueFiles:
        - values-prod.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### metrics-frontend-dev.yaml
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: metrics-frontend-dev
  namespace: argocd
  annotations:
    # Image Updater konfiguratsiooni annotaatsioonid
    argocd-image-updater.argoproj.io/image-list: frontend=tanelsokolov/metrics-frontend
    argocd-image-updater.argoproj.io/write-back-method: git
    argocd-image-updater.argoproj.io/git-branch: main
    
    # Dev timestamp-based versioning
    argocd-image-updater.argoproj.io/frontend.update-strategy: latest
    argocd-image-updater.argoproj.io/frontend.allow-tags: regexp:^dev-[0-9]{8}-[0-9]{6}$
    argocd-image-updater.argoproj.io/frontend.ignore-tags: latest,prod-latest,prod-.*
    
    # Git commit seaded
    argocd-image-updater.argoproj.io/git-commit-user: argocd-image-updater
    argocd-image-updater.argoproj.io/git-commit-email: argocd-image-updater@tanelsokolov.dev
    argocd-image-updater.argoproj.io/git-commit-message: "chore: update {{.AppName}} frontend dev image to {{.NewTag}}"
spec:
  project: default
  source:
    repoURL: https://github.com/tanelsokolov/k8m
    targetRevision: main
    path: charts/metrics-frontend
    helm:
      valueFiles:
        - values-dev.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

## 2. Uuendatud Values.yaml Failid

### charts/metrics-backend/values-prod.yaml
```yaml
# Production environment values for metrics-backend

replicaCount: 2

image:
  repository: tanelsokolov/metrics-backend
  pullPolicy: Always
  # Image Updater uuendab seda automaatselt timestamp tag'iga
  tag: "prod-20250724-120000"  # Näide: prod-YYYYMMDD-HHMMSS

env:
  NODE_ENV: "production"
  PORT: "3000"

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi

service:
  type: ClusterIP
  nodePort: 30301

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: metrics-backend-prod.local
      paths:
        - path: /
          pathType: Prefix

logging:
  level: info
  format: json

cors:
  origin: "*"
  methods: "GET,POST,PUT,DELETE,OPTIONS"

# Enable autoscaling in production
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

# Enable PDB for high availability
podDisruptionBudget:
  enabled: true
  minAvailable: 1

# Production monitoring annotations
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"
  # Image versiooni märgistamine
  image.version: "prod-20250724-120000"
  updated.by: "argocd-image-updater"
```

### charts/metrics-backend/values-dev.yaml
```yaml
# Development environment values for metrics-backend

replicaCount: 1

image:
  repository: tanelsokolov/metrics-backend
  pullPolicy: Always
  # Image Updater uuendab seda automaatselt timestamp tag'iga
  tag: "dev-20250724-120000"

env:
  NODE_ENV: "development"
  PORT: "3000"

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 64Mi

service:
  type: ClusterIP
  nodePort: 30300

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: metrics-backend-dev.local
      paths:
        - path: /
          pathType: Prefix

logging:
  level: debug
  format: json

cors:
  origin: "*"
  methods: "GET,POST,PUT,DELETE,OPTIONS"

healthCheck:
  initialDelaySeconds: 20
  readinessInitialDelaySeconds: 10

# Development debugging
podAnnotations:
  env: "development"
  image.version: "dev-20250724-120000"
  updated.by: "argocd-image-updater"
```

## 3. GitHub Actions Workflow Täiendus (Semantic Versioning)

Kui soovite kasutada semantic versioning'ut ArgoCD Image Updater'iga, saate täiendada oma GitHub Actions workflow'i:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'  # Semantic version tags

jobs:
  build-dev:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, 'deploy dev') || contains(github.event.head_commit.message, 'deploy both')
    
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Generate timestamp
        id: timestamp
        run: echo "timestamp=$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT

      - name: Build and push dev images
        env:
          TIMESTAMP: ${{ steps.timestamp.outputs.timestamp }}
        run: |
          # Backend
          docker build -t tanelsokolov/metrics-backend:dev-latest -t tanelsokolov/metrics-backend:dev-${TIMESTAMP} ./backend
          docker push tanelsokolov/metrics-backend:dev-latest
          docker push tanelsokolov/metrics-backend:dev-${TIMESTAMP}
          
          # Frontend
          docker build -t tanelsokolov/metrics-frontend:dev-latest -t tanelsokolov/metrics-frontend:dev-${TIMESTAMP} ./frontend
          docker push tanelsokolov/metrics-frontend:dev-latest
          docker push tanelsokolov/metrics-frontend:dev-${TIMESTAMP}

  build-prod:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, 'deploy prod') || contains(github.event.head_commit.message, 'deploy both')
    
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Generate timestamp
        id: timestamp
        run: echo "timestamp=$(date +%Y%m%d-%H%M%S)" >> $GITHUB_OUTPUT

      - name: Build and push prod images
        env:
          TIMESTAMP: ${{ steps.timestamp.outputs.timestamp }}
        run: |
          # Backend
          docker build -t tanelsokolov/metrics-backend:prod-latest -t tanelsokolov/metrics-backend:prod-${TIMESTAMP} ./backend
          docker push tanelsokolov/metrics-backend:prod-latest
          docker push tanelsokolov/metrics-backend:prod-${TIMESTAMP}
          
          # Frontend
          docker build -t tanelsokolov/metrics-frontend:prod-latest -t tanelsokolov/metrics-frontend:prod-${TIMESTAMP} ./frontend
          docker push tanelsokolov/metrics-frontend:prod-latest
          docker push tanelsokolov/metrics-frontend:prod-${TIMESTAMP}

  # Uus job semantic versioning jaoks
  build-semantic:
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Build and push semantic versioned images
        env:
          VERSION: ${{ steps.version.outputs.version }}
        run: |
          # Backend
          docker build -t tanelsokolov/metrics-backend:${VERSION} ./backend
          docker push tanelsokolov/metrics-backend:${VERSION}
          
          # Frontend
          docker build -t tanelsokolov/metrics-frontend:${VERSION} ./frontend
          docker push tanelsokolov/metrics-frontend:${VERSION}
```

## 4. ArgoCD Image Updater Installimine

### image-updater-values.yaml
```yaml
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
```

### Helm install
```bash
# Lisa ArgoCD Image Updater repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Installi ArgoCD Image Updater
helm install argocd-image-updater argo/argocd-image-updater \
  --namespace argocd \
  -f image-updater-values.yaml

# Kontrolli installimist
kubectl get pods -n argocd | grep image-updater
kubectl logs -n argocd deployment/argocd-image-updater --tail=50
```

## 5. GitHub Repository Juurdepääsu Seadistamine

### 5.1 GitHub Personal Access Token (PAT) loomine

1. **Mine GitHub'i Settings:**
   - Ava https://github.com/settings/tokens
   - Või: Profile picture -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic)

2. **Loo uus token:**
   - Kliki "Generate new token" -> "Generate new token (classic)"
   - Anna nimi: `argocd-image-updater-k8m`
   - Vali kehtivusaeg: `No expiration` (või pikem periood)

3. **Vali õigused (Scopes):**
   ```
   ✅ repo (Full control of private repositories)
     ✅ repo:status
     ✅ repo_deployment  
     ✅ public_repo
     ✅ repo:invite
     ✅ security_events
   ```

4. **Kopeeri token** - see kuvatakse ainult üks kord!

### 5.2 ArgoCD Repository Secret Loomine

```bash
# Määra oma GitHub token muutujasse
export GITHUB_TOKEN="ghp_your_token_here"

# Loo ArgoCD repository secret
kubectl create secret generic k8m-repo-secret \
  --from-literal=type=git \
  --from-literal=url=https://github.com/tanelsokolov/k8m \
  --from-literal=password=$GITHUB_TOKEN \
  --from-literal=username=tanelsokolov \
  -n argocd

# Lisa ArgoCD label
kubectl label secret k8m-repo-secret -n argocd argocd.argoproj.io/secret-type=repository

# Kontrolli, et secret on loodud
kubectl get secrets -n argocd | grep k8m-repo
```

### 5.3 ArgoCD Repository Registreerimine UI kaudu

1. **Mine ArgoCD UI-sse:**
   - Settings -> Repositories -> Connect Repo using HTTPS

2. **Täida väljad:**
   ```
   Type: git
   Project: default
   Repository URL: https://github.com/tanelsokolov/k8m
   Username: tanelsokolov
   Password: [sinu GitHub token]
   ```

3. **Kliki "Connect"** ja kontrolli ühendust

### 5.4 Alternatiiv: SSH Key seadistamine (soovituslik)

```bash
# Genereeri SSH võtmepaar
ssh-keygen -t ed25519 -C "argocd-image-updater@tanelsokolov.dev" -f ~/.ssh/argocd-image-updater

# Lisa avalik võti GitHub'i Deploy Keys'i all
cat ~/.ssh/argocd-image-updater.pub
# Mine: GitHub repo -> Settings -> Deploy keys -> Add deploy key
# ✅ Allow write access (väga oluline!)

# Loo ArgoCD SSH secret
kubectl create secret generic k8m-repo-ssh-secret \
  --from-literal=type=git \
  --from-literal=url=git@github.com:tanelsokolov/k8m.git \
  --from-file=sshPrivateKey=$HOME/.ssh/argocd-image-updater \
  -n argocd

kubectl label secret k8m-repo-ssh-secret -n argocd argocd.argoproj.io/secret-type=repository
```

## 6. ArgoCD RBAC ja Kasutaja Seadistamine

### 6.1 Image-updater kasutaja loomine

```bash
# Kontrolli praegust ArgoCD konfiguratsiooni
kubectl get configmap argocd-cm -n argocd -o yaml

# Lisa image-updater kasutaja ArgoCD ConfigMap'i
kubectl patch configmap argocd-cm -n argocd --type merge --patch='
data:
  accounts.image-updater: "apiKey, login"
  accounts.image-updater.enabled: "true"
'
```

### 6.2 RBAC õiguste seadistamine

```bash
# Loo või uuenda RBAC ConfigMap
kubectl apply -f - <<EOF
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
EOF
```

### 6.3 API Token genereerimine

```bash
# Restart ArgoCD server, et muudatused rakenduks
kubectl rollout restart deployment argocd-server -n argocd

# Oota, kuni server on taas valmis
kubectl rollout status deployment argocd-server -n argocd

# Logi ArgoCD CLI-sse (kui teil see puudub, installige)
# Linux/Mac:
# curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
# sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd

# Logi sisse (kasutage oma ArgoCD admin parooli)
argocd login argocd-server.local --username admin --password <your-admin-password> --insecure

# Genereeri API token image-updater kasutajale
argocd account generate-token --account image-updater --id image-updater-token

# Salvesta token (näiteks: eyJhbGciOiJIUzI1...)
export ARGOCD_TOKEN="your_generated_token_here"
```

### 6.4 Image Updater Secret loomine

```bash
# Loo secret ArgoCD API token jaoks
kubectl create secret generic argocd-image-updater-secret \
  --from-literal=argocd.token=$ARGOCD_TOKEN \
  -n argocd

# Lisa label
kubectl label secret argocd-image-updater-secret -n argocd app.kubernetes.io/part-of=argocd-image-updater
```

### 6.5 Alternatiivne meetod: ArgoCD UI kaudu

1. **Mine ArgoCD UI-sse:**
   - Settings -> Accounts

2. **Loo image-updater kasutaja:**
   - User info section'is lisa:
   ```
   accounts.image-updater: apiKey, login
   accounts.image-updater.enabled: true
   ```

3. **Genereeri token:**
   - Accounts list'is leia "image-updater"
   - Kliki "Generate New" tokens section'is
   - Anna nimi: "image-updater-token"
   - Kopeeri genereeritud token

## 7. Image Updater Konfiguratsiooni Täiendamine

### 7.1 Image Updater ConfigMap uuendamine

```bash
# Loo Image Updater täiendav konfiguratsioon
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-config
  namespace: argocd
  labels:
    app.kubernetes.io/name: argocd-image-updater-config
    app.kubernetes.io/part-of: argocd-image-updater
data:
  # Logi konfiguratsioon
  log.level: "info"
  
  # ArgoCD ühendus
  argocd.grpc_web: "true"
  argocd.server_addr: "argocd-server.argocd.svc.cluster.local:443"
  argocd.insecure: "false"
  argocd.plaintext: "false"
  
  # Git konfiguratsiooni template
  git.commit-message-template: |
    build: automatic update of {{ .AppName }}
    
    {{ range .AppChanges -}}
    updates image {{ .Image }} tag '{{ .OldTag }}' to '{{ .NewTag }}'
    {{ end -}}
  
  # Registry konfiguratsiooni
  registries.conf: |
    registries:
    - name: Docker Hub
      prefix: docker.io
      api_url: https://registry-1.docker.io
      default: true
      credentials: pullsecret:argocd/regcred
      
  # SSH host keys
  ssh_config: |
    Host github.com
        HostName github.com
        User git
        IdentityFile /app/config/ssh/id_rsa
        StrictHostKeyChecking no
EOF
```

### 7.2 Image Updater Deployment uuendamine

```bash
# Patch Image Updater deployment, et lisada ArgoCD token
kubectl patch deployment argocd-image-updater -n argocd --type json -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/containers/0/env/-",
    "value": {
      "name": "ARGOCD_TOKEN",
      "valueFrom": {
        "secretKeyRef": {
          "name": "argocd-image-updater-secret",
          "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcmdvY2QiLCJzdWIiOiJpbWFnZS11cGRhdGVyOmFwaUtleSIsIm5iZiI6MTc1MzM0MzIwMCwiaWF0IjoxNzUzMzQzMjAwLCJqdGkiOiJmY2RhZjVhOC1kNTE3LTRmYzAtODlkZi1iYTg1NDNmODVmOTEifQ.3ILlC3v16yIRoXvnpi-RabKRxbagfcVDVZzNH7CDpzo"
        }
      }
    }
  }
]'

# Restart deployment
kubectl rollout restart deployment argocd-image-updater -n argocd
kubectl rollout status deployment argocd-image-updater -n argocd
```

### 7.3 Docker Hub credentials (valikuline)

Kui teil on Docker Hub rate limiting probleeme:

```bash
# Loo Docker Hub credentials secret
kubectl create secret docker-registry regcred \
  --docker-server=docker.io \
  --docker-username=tanelsokolov \
  --docker-password=<your-docker-hub-token> \
  --docker-email=<your-email> \
  -n argocd
```

## 8. Rakenduste Uuendamine ja Testimine

### 8.1 ArgoCD Applications uuendamine

```bash
# Loo kausta ArgoCD applications jaoks
mkdir -p argocd-apps

# Salvesta uuendatud manifests
# Kasuta ülalolevaid YAML faile ja salvesta need:
# - argocd-apps/metrics-backend-prod.yaml
# - argocd-apps/metrics-backend-dev.yaml  
# - argocd-apps/metrics-frontend-prod.yaml
# - argocd-apps/metrics-frontend-dev.yaml

# Rakenda kõik applications
kubectl apply -f argocd-apps/

# Kontrolli applications
kubectl get applications -n argocd
```

### 8.2 Süsteemi oleku kontroll

```bash
# Kontrolli Image Updater pod'i
kubectl get pods -n argocd | grep image-updater

# Vaata Image Updater logi
kubectl logs -n argocd deployment/argocd-image-updater --tail=100

# Kontrolli ArgoCD applications olekut
argocd app list

# Vaata konkreetse application detaile
argocd app get metrics-backend-prod
```

### 8.3 GitHub Actions testimine

```bash
# Tee muudatus koodis
echo "// Test change $(date)" >> backend/src/index.js

# Commit ja push prod deployment jaoks
git add .
git commit -m "deploy prod - test image updater integration"
git push origin main

# Jälgi GitHub Actions
# Mine: https://github.com/tanelsokolov/k8m/actions

# Jälgi Image Updater logi (uues terminalis)
kubectl logs -n argocd deployment/argocd-image-updater -f
```

kubectl create secret generic argocd-image-updater-secret -n argocd `
  --from-literal=argocd.token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcmdvY2QiLCJzdWIiOiJpbWFnZS11cGRhdGVyOmFwaUtleSIsIm5iZiI6MTc1MzM0MzUxMiwiaWF0IjoxNzUzMzQzNTEyLCJqdGkiOiIxNzM1NzcyNi0wMjQzLTQwMjUtYmYzZi1jYjA0NmY1N2VjOTcifQ.dzaU3dsLHT-q3YFT5xjsci1GilBGp81VeZKdYePGX-4"

### 8.4 Manuaalne Image Updater käivitamine

```bash
# Force Image Updater käivitamiseks
kubectl annotate app metrics-backend-prod -n argocd \
  argocd-image-updater.argoproj.io/image-list=backend=tanelsokolov/metrics-backend --overwrite

# Või restart Image Updater
kubectl rollout restart deployment argocd-image-updater -n argocd

# Kontrolli, kas Image Updater leidis uusi versioone
kubectl logs -n argocd deployment/argocd-image-updater --tail=50 | grep -i "found\|update\|tag"
```

### 8.5 Git repository muudatuste kontroll

```bash
# Kontrolli, kas Image Updater tegi commit'e
git log --oneline -n 10

# Vaata values.yaml faili muudatusi
git show HEAD:charts/metrics-backend/values-prod.yaml | grep tag
```