# インストールガイド

このガイドでは、ゲーム開発用アセット管理・生成サービスの詳細なセットアップ手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [開発環境のセットアップ](#開発環境のセットアップ)
3. [本番環境のセットアップ](#本番環境のセットアップ)
4. [トラブルシューティング](#トラブルシューティング)

## 前提条件

### 必須ソフトウェア

- **Node.js**: v16.0.0以上（推奨: v18 LTS）
- **npm**: v8.0.0以上
- **Docker Desktop**: 最新版
- **Git**: 最新版

### 推奨ソフトウェア

- **VS Code**: 最新版（推奨エディタ）
- **PostgreSQL クライアント**: pgAdmin4 または TablePlus
- **API テストツール**: Postman または Insomnia

### ハードウェア要件

- **CPU**: 2コア以上
- **メモリ**: 8GB以上（推奨: 16GB）
- **ストレージ**: 20GB以上の空き容量

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
# HTTPSを使用する場合
git clone https://github.com/your-org/game-asset-manager.git

# SSHを使用する場合
git clone git@github.com:your-org/game-asset-manager.git

cd game-asset-manager
```

### 2. Docker環境の準備

#### 2.1 Docker Composeファイルの確認

`docker-compose.yml`ファイルが以下のサービスを含んでいることを確認：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: game_asset_manager
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### 2.2 Dockerコンテナの起動

```bash
# コンテナをバックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 全てのコンテナが正常に起動していることを確認
docker-compose ps
```

### 3. MinIOの初期設定

1. ブラウザで http://localhost:9001 にアクセス
2. ログイン（Username: minioadmin, Password: minioadmin）
3. 「Buckets」→「Create Bucket」をクリック
4. バケット名: `game-assets` を入力して作成
5. バケットのアクセスポリシーを「Public」に設定（開発環境のみ）

### 4. バックエンドのセットアップ

#### 4.1 依存関係のインストール

```bash
cd backend
npm install
```

#### 4.2 環境変数の設定

```bash
# 環境変数ファイルをコピー
cp .env.example .env

# .envファイルを編集
# 以下の変数を適切に設定してください
```

`.env`ファイルの内容:

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/game_asset_manager"

# JWT
JWT_SECRET="your-very-secure-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# S3（開発環境はMinIO）
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="game-assets"
S3_REGION="us-east-1"
S3_USE_PATH_STYLE=true

# Redis
REDIS_URL="redis://localhost:6379"

# AI API（取得方法は後述）
OPENAI_API_KEY=""
CLAUDE_API_KEY=""

# サーバー設定
PORT=3000
NODE_ENV=development

# CORS設定
ALLOWED_ORIGINS="http://localhost:3001"

# ログレベル
LOG_LEVEL="debug"
```

#### 4.3 データベースの初期化

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev --name init

# シードデータの投入（オプション）
npx prisma db seed
```

#### 4.4 開発サーバーの起動

```bash
npm run dev
```

サーバーが http://localhost:3000 で起動します。

### 5. フロントエンドのセットアップ

#### 5.1 依存関係のインストール

```bash
cd ../frontend
npm install
```

#### 5.2 環境変数の設定（オプション）

開発環境では`package.json`の`proxy`設定により自動的にAPIにプロキシされますが、必要に応じて`.env`ファイルを作成：

```env
# .env（オプション）
REACT_APP_API_URL=http://localhost:3000
```

#### 5.3 開発サーバーの起動

```bash
npm start
```

アプリケーションが http://localhost:3001 で起動します。

### 6. 動作確認

#### 6.1 API ドキュメントの確認

ブラウザで http://localhost:3000/api-docs にアクセスし、Swagger UIが表示されることを確認。

#### 6.2 ヘルスチェック

```bash
curl http://localhost:3000/api/health
```

#### 6.3 テストユーザーの作成

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "username": "testuser"
  }'
```

## 外部APIキーの取得

### OpenAI API キー

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成またはログイン
3. 「API Keys」セクションで新しいキーを作成
4. 使用制限を設定（推奨: 月額$50以下）
5. キーを`.env`ファイルの`OPENAI_API_KEY`に設定

### 音声生成API（任意）

使用するサービスに応じて以下から選択：

- **Suno API**: [Suno.ai](https://suno.ai/)でアカウント作成
- **ElevenLabs**: [ElevenLabs](https://elevenlabs.io/)でアカウント作成
- **Mubert**: [Mubert API](https://mubert.com/api)でアカウント作成

## VS Code 推奨設定

### 推奨拡張機能

`.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "christian-kohler.npm-intellisense",
    "eg2.vscode-npm-script",
    "mikestead.dotenv"
  ]
}
```

### ワークスペース設定

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 本番環境のセットアップ

### 1. 環境変数の設定

本番環境用の環境変数を設定：

```env
# 本番環境の.env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@your-db-host:5432/game_asset_manager"
JWT_SECRET="production-secret-key-minimum-32-characters"
S3_ENDPOINT="" # AWS S3を使用する場合は空
S3_ACCESS_KEY="your-aws-access-key"
S3_SECRET_KEY="your-aws-secret-key"
S3_BUCKET_NAME="your-production-bucket"
S3_REGION="ap-northeast-1"
REDIS_URL="redis://your-redis-host:6379"
ALLOWED_ORIGINS="https://your-domain.com"
```

### 2. データベースマイグレーション

```bash
# 本番環境でのマイグレーション
npx prisma migrate deploy
```

### 3. ビルド

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd ../frontend
npm run build
```

### 4. プロセスマネージャー（PM2）の使用

```bash
# PM2のインストール
npm install -g pm2

# バックエンドの起動
cd backend
pm2 start dist/index.js --name game-asset-api

# PM2の設定を保存
pm2 save
pm2 startup
```

## トラブルシューティング

### Docker関連の問題

#### ポート競合エラー

```bash
# 使用中のポートを確認
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9000  # MinIO

# 競合するプロセスを停止するか、docker-compose.ymlでポートを変更
```

#### コンテナが起動しない

```bash
# コンテナを完全にリセット
docker-compose down -v
docker-compose up -d --force-recreate
```

### データベース関連の問題

#### 接続エラー

```bash
# PostgreSQLコンテナのログを確認
docker-compose logs postgres

# 接続テスト
psql -h localhost -U user -d game_asset_manager
```

#### マイグレーションエラー

```bash
# データベースをリセット
npx prisma migrate reset

# スキーマを再生成
npx prisma generate
```

### ファイルアップロードの問題

#### MinIOアクセスエラー

1. MinIOコンソール（http://localhost:9001）にアクセス
2. バケットが作成されているか確認
3. アクセスポリシーが正しく設定されているか確認

#### ファイルサイズエラー

`.env`ファイルで以下を調整：

```env
MAX_FILE_SIZE_IMAGE=10485760  # 10MB
MAX_FILE_SIZE_AUDIO=52428800  # 50MB
```

### パフォーマンスの問題

#### Redisキャッシュが効かない

```bash
# Redisの動作確認
redis-cli ping

# キャッシュをクリア
redis-cli FLUSHALL
```

## 次のステップ

インストールが完了したら、以下のドキュメントを参照してください：

- [使用ガイド](./USER_GUIDE.md) - 基本的な使い方
- [API ドキュメント](http://localhost:3000/api-docs) - API仕様
- [開発者ガイド](./ARCHITECTURE.md) - アーキテクチャ詳細

## サポート

問題が発生した場合は：

1. このトラブルシューティングセクションを確認
2. [既知の問題](https://github.com/your-org/game-asset-manager/issues)を確認
3. 新しいIssueを作成

---

最終更新: 2025-07-28