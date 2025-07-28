# デプロイメントガイド

## 目次

1. [概要](#概要)
2. [デプロイメント戦略](#デプロイメント戦略)
3. [本番環境の要件](#本番環境の要件)
4. [デプロイ手順](#デプロイ手順)
5. [CI/CDパイプライン](#cicdパイプライン)
6. [環境変数管理](#環境変数管理)
7. [監視とログ](#監視とログ)
8. [バックアップとリカバリ](#バックアップとリカバリ)
9. [トラブルシューティング](#トラブルシューティング)

## 概要

このガイドでは、ゲーム開発用アセット管理・生成サービスを本番環境にデプロイする手順を説明します。Docker、Kubernetes、各種クラウドサービスを使用した実践的なデプロイメント方法を提供します。

## デプロイメント戦略

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────┐
│                   インターネット                      │
└───────────────────────┬─────────────────────────────┘
                        │
                   ┌────┴────┐
                   │  CDN    │
                   │CloudFlare│
                   └────┬────┘
                        │
              ┌─────────┴─────────┐
              │                   │
         ┌────┴────┐        ┌────┴────┐
         │Frontend │        │   API   │
         │ Vercel  │        │Gateway  │
         └─────────┘        └────┬────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
               ┌────┴────┐              ┌────┴────┐
               │Backend  │              │Backend  │
               │   K8s   │              │   K8s   │
               │  Pod 1  │              │  Pod N  │
               └────┬────┘              └────┬────┘
                    │                         │
         ┌──────────┴─────────────────────────┴──────────┐
         │                                               │
    ┌────┴────┐      ┌─────────┐      ┌─────────┐ ┌────┴────┐
    │PostgreSQL│     │  Redis  │      │   S3    │ │ AI APIs │
    │   RDS    │     │ElastiCache│    │  AWS    │ │External │
    └──────────┘     └─────────┘      └─────────┘ └─────────┘
```

### デプロイメントオプション

| コンポーネント | 推奨サービス | 代替オプション |
|---------------|-------------|---------------|
| フロントエンド | Vercel | Netlify, AWS CloudFront + S3 |
| バックエンド | AWS EKS | Google GKE, Azure AKS, Heroku |
| データベース | AWS RDS (PostgreSQL) | Google Cloud SQL, Azure Database |
| Redis | AWS ElastiCache | Redis Cloud, Google Memorystore |
| ストレージ | AWS S3 | Google Cloud Storage, Azure Blob |
| CDN | CloudFlare | AWS CloudFront, Fastly |

## 本番環境の要件

### ハードウェア要件（推奨）

**バックエンドサーバー（Kubernetes Node）**
- CPU: 4 vCPU以上
- メモリ: 8GB以上
- ストレージ: 50GB SSD
- ノード数: 最小2台（高可用性のため）

**データベース（PostgreSQL）**
- CPU: 2 vCPU以上
- メモリ: 4GB以上
- ストレージ: 100GB SSD（増分バックアップ込み）
- タイプ: db.t3.medium（AWS RDS）

**Redis キャッシュ**
- メモリ: 2GB以上
- タイプ: cache.t3.micro（AWS ElastiCache）

### ネットワーク要件

- 静的IPアドレスまたはロードバランサー
- SSL証明書（Let's Encrypt推奨）
- ファイアウォール設定
  - 80/443 (HTTP/HTTPS)
  - 22 (SSH - 管理用、IP制限推奨)

## デプロイ手順

### 1. Dockerイメージのビルド

#### バックエンド Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npm install -g prisma
RUN npx prisma generate

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 本番用イメージ
FROM node:18-alpine

WORKDIR /app

# 必要なパッケージのインストール
RUN apk add --no-cache tini

# ユーザー作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# ビルド成果物のコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# 権限設定
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
```

#### イメージのビルドとプッシュ

```bash
# Docker Hubまたは他のレジストリにログイン
docker login

# イメージのビルド
docker build -t your-registry/game-asset-backend:latest ./backend

# イメージのプッシュ
docker push your-registry/game-asset-backend:latest
```

### 2. Kubernetes デプロイメント

#### backend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: game-asset-backend
  labels:
    app: game-asset-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: game-asset-backend
  template:
    metadata:
      labels:
        app: game-asset-backend
    spec:
      containers:
      - name: backend
        image: your-registry/game-asset-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: jwt-secret
        - name: S3_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: s3-access-key
        - name: S3_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: s3-secret-key
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: backend-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: game-asset-backend-service
spec:
  selector:
    app: game-asset-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

#### シークレットの作成

```bash
# シークレットの作成
kubectl create secret generic backend-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/db' \
  --from-literal=jwt-secret='your-secure-jwt-secret' \
  --from-literal=s3-access-key='your-s3-access-key' \
  --from-literal=s3-secret-key='your-s3-secret-key' \
  --from-literal=redis-url='redis://host:6379'
```

#### デプロイの実行

```bash
# デプロイメントの適用
kubectl apply -f backend-deployment.yaml

# デプロイメントの確認
kubectl get deployments
kubectl get pods
kubectl get services

# ログの確認
kubectl logs -f deployment/game-asset-backend
```

### 3. データベースマイグレーション

```bash
# マイグレーション用のJobを実行
kubectl run prisma-migrate \
  --image=your-registry/game-asset-backend:latest \
  --rm -it --restart=Never \
  --env="DATABASE_URL=postgresql://..." \
  -- npx prisma migrate deploy
```

### 4. フロントエンドのデプロイ（Vercel）

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトディレクトリで
cd frontend

# Vercelにデプロイ
vercel --prod

# 環境変数の設定（Vercel Dashboard経由）
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## CI/CDパイプライン

### GitHub Actions ワークフロー

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm test
      
      - name: Run linter
        run: |
          cd backend
          npm run lint

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/backend-deployment.yaml
            k8s/backend-service.yaml
          images: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          kubectl-version: 'latest'

  deploy-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
          working-directory: ./frontend
```

## 環境変数管理

### 1. Kubernetes Secrets

```bash
# 本番環境の秘密情報を管理
kubectl create secret generic prod-secrets \
  --from-env-file=.env.production

# 秘密情報の更新
kubectl create secret generic prod-secrets \
  --from-env-file=.env.production \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 2. 環境変数の構成

```yaml
# config/production.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  ALLOWED_ORIGINS: "https://yourdomain.com,https://www.yourdomain.com"
  S3_BUCKET_NAME: "game-assets-production"
  S3_REGION: "us-east-1"
  MAX_FILE_SIZE_IMAGE: "10485760"
  MAX_FILE_SIZE_AUDIO: "52428800"
```

### 3. HashiCorp Vault（オプション）

```bash
# Vaultへのシークレット保存
vault kv put secret/game-asset-manager \
  database_url="postgresql://..." \
  jwt_secret="..." \
  openai_api_key="..."

# Kubernetes ServiceAccountとの統合
vault write auth/kubernetes/role/game-asset-manager \
  bound_service_account_names=game-asset-manager \
  bound_service_account_namespaces=default \
  policies=game-asset-manager \
  ttl=24h
```

## 監視とログ

### 1. Prometheus + Grafana

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'game-asset-backend'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            action: keep
            regex: game-asset-backend
```

### 2. アプリケーションメトリクス

```typescript
// backend/src/monitoring/metrics.ts
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

export const assetUploadCounter = new Counter({
  name: 'asset_uploads_total',
  help: 'Total number of asset uploads',
  labelNames: ['file_type', 'status'],
});

export const aiGenerationCounter = new Counter({
  name: 'ai_generations_total',
  help: 'Total number of AI generations',
  labelNames: ['type', 'status'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(assetUploadCounter);
register.registerMetric(aiGenerationCounter);
```

### 3. ログ収集（ELK Stack）

```yaml
# fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      <parse>
        @type json
        time_format %Y-%m-%dT%H:%M:%S.%NZ
      </parse>
    </source>
    
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.default.svc.cluster.local
      port 9200
      logstash_format true
      logstash_prefix game-asset-manager
      <buffer>
        @type file
        path /var/log/fluentd-buffers/kubernetes.system.buffer
        flush_mode interval
        flush_interval 5s
      </buffer>
    </match>
```

### 4. アラート設定

```yaml
# alerting-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: game-asset-alerts
spec:
  groups:
  - name: backend
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High error rate detected"
        
    - alert: DatabaseConnectionFailure
      expr: pg_up == 0
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "Database connection lost"
        
    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Container memory usage above 90%"
```

## バックアップとリカバリ

### 1. データベースバックアップ

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="game-asset-db-${DATE}.sql"

# PostgreSQLバックアップ
pg_dump $DATABASE_URL > /tmp/${BACKUP_NAME}

# S3へアップロード
aws s3 cp /tmp/${BACKUP_NAME} s3://your-backup-bucket/database/${BACKUP_NAME}

# 古いバックアップの削除（30日以上）
aws s3 ls s3://your-backup-bucket/database/ | \
  awk '{print $4}' | \
  grep -E "game-asset-db-.*\.sql" | \
  while read -r backup; do
    CREATE_DATE=$(echo $backup | grep -oE '[0-9]{8}')
    if [[ $(date -d "${CREATE_DATE}" +%s) -lt $(date -d '30 days ago' +%s) ]]; then
      aws s3 rm "s3://your-backup-bucket/database/${backup}"
    fi
  done
```

### 2. ファイルストレージ同期

```yaml
# s3-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: s3-backup
spec:
  schedule: "0 2 * * *"  # 毎日2時
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: s3-sync
            image: amazon/aws-cli
            command:
            - /bin/sh
            - -c
            - |
              aws s3 sync s3://game-assets-production \
                         s3://game-assets-backup \
                         --delete
          restartPolicy: OnFailure
```

### 3. ディザスタリカバリ計画

**RTO (Recovery Time Objective): 4時間**
**RPO (Recovery Point Objective): 1時間**

手順:
1. バックアップから新しいRDSインスタンスを起動
2. S3バケットをバックアップから復元
3. Kubernetesクラスタを別リージョンで起動
4. DNSを新しいエンドポイントに切り替え

## トラブルシューティング

### よくある問題と解決方法

#### 1. Podが起動しない

```bash
# Pod の状態確認
kubectl describe pod <pod-name>

# よくある原因:
# - ImagePullBackOff: レジストリ認証の確認
# - CrashLoopBackOff: アプリケーションログの確認
# - Pending: リソース不足の確認

# ログ確認
kubectl logs <pod-name> --previous
```

#### 2. データベース接続エラー

```bash
# 接続テスト
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql $DATABASE_URL -c "SELECT 1"

# セキュリティグループ/ファイアウォール確認
# RDSエンドポイントの確認
# 認証情報の確認
```

#### 3. メモリ不足

```bash
# リソース使用状況確認
kubectl top nodes
kubectl top pods

# 垂直スケーリング
kubectl set resources deployment game-asset-backend \
  --limits=memory=2Gi --requests=memory=1Gi

# 水平スケーリング
kubectl scale deployment game-asset-backend --replicas=5
```

#### 4. SSL証明書の問題

```bash
# cert-managerを使用した自動更新
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Certificate リソースの作成
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: game-asset-tls
spec:
  secretName: game-asset-tls-secret
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - api.yourdomain.com
EOF
```

### 緊急時の対応

1. **サービス停止時**
   ```bash
   # 前のバージョンにロールバック
   kubectl rollout undo deployment game-asset-backend
   
   # 特定のリビジョンにロールバック
   kubectl rollout undo deployment game-asset-backend --to-revision=2
   ```

2. **データ破損時**
   ```bash
   # Point-in-Time Recovery
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier game-asset-db \
     --target-db-instance-identifier game-asset-db-restored \
     --restore-time 2025-01-28T03:00:00.000Z
   ```

3. **セキュリティインシデント**
   - 影響を受けたPodの即座の停止
   - セキュリティグループの更新
   - 監査ログの確認
   - インシデントレポートの作成

---

最終更新: 2025-07-28