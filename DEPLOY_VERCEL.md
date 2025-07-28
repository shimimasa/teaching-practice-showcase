# Teaching Practice Showcase - Vercelデプロイ手順

このドキュメントでは、Teaching Practice ShowcaseプロジェクトをVercelにデプロイする手順を説明します。

## 📋 前提条件

- Vercelアカウント（https://vercel.com で作成）
- GitHubアカウント
- PostgreSQLデータベース（Vercel Postgres、Supabase、Neon等）

## 🚀 デプロイオプション

### オプション1: フロントエンドのみVercelでデプロイ（推奨）

この方法では、フロントエンド（Next.js）をVercelで、バックエンド（Express）を別のサービス（Railway、Render等）でホスティングします。

#### 手順：

1. **GitHubリポジトリの準備**
   ```bash
   # プロジェクトをGitHubにプッシュ
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/teaching-practice-showcase.git
   git push -u origin main
   ```

2. **バックエンドのデプロイ（Railway推奨）**
   - Railway（https://railway.app）にログイン
   - 「New Project」→「Deploy from GitHub repo」を選択
   - リポジトリを選択し、`backend`ディレクトリを指定
   - PostgreSQLサービスを追加
   - 環境変数を設定：
     ```
     DATABASE_URL=（RailwayのPostgreSQL URL）
     JWT_SECRET=（安全なランダム文字列）
     PORT=5000
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - デプロイ完了後、URLをコピー（例：https://your-backend.railway.app）

3. **Vercelでフロントエンドをデプロイ**
   - Vercel（https://vercel.com）にログイン
   - 「New Project」をクリック
   - GitHubリポジトリをインポート
   - **Root Directory**を`frontend`に設定
   - **Environment Variables**を設定：
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app
     NEXTAUTH_URL=https://your-app.vercel.app
     NEXTAUTH_SECRET=（安全なランダム文字列）
     ```
   - 「Deploy」をクリック

### オプション2: モノレポとして全体をVercelでデプロイ

この方法では、バックエンドをVercel Functionsとして実行します。

#### 注意事項：
- Prismaの使用に制限があります
- ファイルアップロードは外部ストレージ（AWS S3等）が必要
- 実行時間制限があります（Hobbyプラン：10秒、Proプラン：60秒）

#### 手順：

1. **バックエンドの修正**
   ```typescript
   // backend/api/index.ts を作成
   import app from '../src/index';
   export default app;
   ```

2. **Vercelでデプロイ**
   - Vercel（https://vercel.com）にログイン
   - 「New Project」をクリック
   - GitHubリポジトリをインポート
   - **Root Directory**は空欄（プロジェクトルート）
   - **Environment Variables**を設定：
     ```
     DATABASE_URL=（PostgreSQL接続URL）
     JWT_SECRET=（安全なランダム文字列）
     NEXT_PUBLIC_API_URL=/api
     NEXTAUTH_URL=https://your-app.vercel.app
     NEXTAUTH_SECRET=（安全なランダム文字列）
     ```
   - 「Deploy」をクリック

## 🔧 デプロイ後の設定

### 1. カスタムドメインの設定（オプション）
- Vercelダッシュボード → Settings → Domains
- カスタムドメインを追加

### 2. 環境変数の確認
- Vercelダッシュボード → Settings → Environment Variables
- 本番環境の変数が正しく設定されているか確認

### 3. データベースのセットアップ
```bash
# ローカルから本番DBにマイグレーションを実行
cd backend
DATABASE_URL="本番DBのURL" npx prisma migrate deploy
```

## 🔍 トラブルシューティング

### ビルドエラーが発生する場合
1. Node.jsバージョンを確認（package.jsonに指定）
2. 依存関係の問題を確認
3. TypeScriptの型エラーを修正

### API接続エラーが発生する場合
1. NEXT_PUBLIC_API_URLが正しく設定されているか確認
2. CORSの設定を確認（backend/src/index.ts）
3. APIのヘルスチェックエンドポイントで確認

### データベース接続エラー
1. DATABASE_URLの形式を確認
2. SSL設定が必要な場合は`?sslmode=require`を追加
3. Prismaクライアントの再生成：`npx prisma generate`

## 📝 デプロイチェックリスト

- [ ] GitHubリポジトリにコードをプッシュ
- [ ] PostgreSQLデータベースを作成
- [ ] バックエンドをデプロイ（Railway等）
- [ ] バックエンドのURLを取得
- [ ] Vercelでフロントエンドプロジェクトを作成
- [ ] 環境変数を設定
- [ ] デプロイを実行
- [ ] 本番環境でアプリケーションをテスト
- [ ] データベースマイグレーションを実行

## 🚨 重要な注意事項

1. **環境変数のセキュリティ**
   - JWT_SECRETは強力なランダム文字列を使用
   - 環境変数は絶対にコードにハードコーディングしない

2. **CORS設定**
   - 本番環境では`FRONTEND_URL`を正確に設定
   - ワイルドカード（*）は使用しない

3. **データベース**
   - 本番環境では必ずSSL接続を使用
   - 定期的なバックアップを設定

## 📞 サポート

問題が発生した場合は、以下を確認してください：
- Vercelのビルドログ
- ブラウザの開発者ツールのNetworkタブ
- バックエンドのエラーログ

詳細なログを見るには：
```bash
vercel logs
```