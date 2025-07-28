# ゲーム開発用アセット管理・生成サービス

## 概要

このサービスは、JavaScript学習ゲーム開発において必要な画像・音声アセットの管理、AI生成、プロジェクト単位での整理、エクスポート機能を提供するWebアプリケーションです。

## 主な機能

- 🎨 **アセット管理**: 画像・音声ファイルの一元管理
- 🤖 **AI生成**: プロンプトを使用した画像・音声の自動生成
- 📁 **プロジェクト管理**: アセットをプロジェクト単位で整理
- 📤 **エクスポート**: 必要なアセットを様々な形式でエクスポート
- 🔍 **検索・フィルタリング**: タグやカテゴリによる高度な検索
- 🔐 **セキュリティ**: JWT認証、レート制限、監査ログ

## 技術スタック

### バックエンド
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis（キャッシュ）
- AWS S3互換ストレージ（開発: MinIO）
- Bull（ジョブキュー）
- JWT認証

### フロントエンド
- React 18 + TypeScript
- Material-UI
- React Query
- React Router

### AI統合
- OpenAI DALL-E（画像生成）
- 音声生成API（Suno等）

## クイックスタート

### 前提条件

- Node.js v16以上
- Docker Desktop
- Git

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-org/game-asset-manager.git
cd game-asset-manager
```

2. **Docker環境の起動**
```bash
docker-compose up -d
```

3. **バックエンドのセットアップ**
```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集し、必要な環境変数を設定
npx prisma migrate dev
npx prisma db seed
```

4. **フロントエンドのセットアップ**
```bash
cd ../frontend
npm install
```

5. **開発サーバーの起動**

バックエンド:
```bash
cd backend
npm run dev
# http://localhost:3000
```

フロントエンド:
```bash
cd frontend
npm start
# http://localhost:3001
```

## API ドキュメント

開発環境では、Swagger UIでAPIドキュメントを確認できます：
http://localhost:3000/api-docs

## 環境変数

### バックエンド（.env）

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/game_asset_manager"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# S3（開発: MinIO）
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET_NAME="game-assets"
S3_REGION="us-east-1"

# Redis
REDIS_URL="redis://localhost:6379"

# AI API
OPENAI_API_KEY="sk-..."
CLAUDE_API_KEY="sk-ant-..."

# サーバー設定
PORT=3000
NODE_ENV=development
```

## 基本的な使い方

### 1. ユーザー登録・ログイン

新規ユーザー登録:
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe"
}
```

### 2. アセットのアップロード

```bash
POST /api/assets
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [ファイル]
tags: ["character", "sprite"]
category: "characters"
```

### 3. AI画像生成

```bash
POST /api/generate/image
Authorization: Bearer {token}
{
  "prompt": "A heroic fantasy warrior",
  "type": "image",
  "parameters": {
    "style": "digital art",
    "quality": "high"
  }
}
```

### 4. プロジェクト作成

```bash
POST /api/projects
Authorization: Bearer {token}
{
  "name": "RPGゲームプロジェクト",
  "description": "ファンタジーRPGのアセット管理"
}
```

## セキュリティ

- **認証**: JWT（アクセストークン15分、リフレッシュトークン7日）
- **レート制限**: 
  - 認証API: 5回/15分
  - 一般API: 100回/分
  - AI生成: 10回/時間
- **ファイルサイズ制限**:
  - 画像: 最大10MB
  - 音声: 最大50MB
- **パスワード**: bcrypt（saltラウンド12）

## テスト

### バックエンドテスト
```bash
cd backend
npm test              # 全テスト実行
npm run test:coverage # カバレッジ付き
```

### フロントエンドE2Eテスト
```bash
cd frontend
npm run test:e2e      # E2Eテスト
npm run test:e2e:ui   # UI付きで実行
```

## トラブルシューティング

### よくある問題

1. **Docker関連のエラー**
   - `docker-compose down -v`で完全リセット
   - ポート競合を確認（5432, 6379, 9000）

2. **データベース接続エラー**
   - PostgreSQLコンテナが起動しているか確認
   - DATABASE_URLが正しいか確認

3. **ファイルアップロードエラー**
   - MinIOコンテナが起動しているか確認
   - バケットが作成されているか確認

4. **AI API エラー**
   - APIキーが正しく設定されているか確認
   - レート制限に達していないか確認

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHubのIssueを作成してください。