# Renderへのバックエンドデプロイ手順（無料）

## 📋 前提条件
- GitHubアカウント
- GitHubリポジトリにコードがプッシュ済み

## 🚀 デプロイ手順

### 1. Renderアカウント作成
1. [Render](https://render.com)にアクセス
2. 「Get Started」をクリック
3. GitHubアカウントでサインアップ（推奨）

### 2. 新しいWeb Serviceを作成
1. ダッシュボードで「New +」→「Web Service」をクリック
2. GitHubリポジトリを連携（初回のみ）
3. `teaching-practice-showcase`リポジトリを選択
4. 「Connect」をクリック

### 3. サービス設定
以下の設定を入力：

- **Name**: `teaching-practice-backend`（任意の名前）
- **Region**: `Singapore (Southeast Asia)`（日本から近い）
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build && npx prisma generate`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 4. PostgreSQLデータベース作成
1. ダッシュボードで「New +」→「PostgreSQL」をクリック
2. 以下を設定：
   - **Name**: `teaching-practice-db`
   - **Database**: `teaching_practice_showcase`
   - **User**: `teaching_user`
   - **Region**: Web Serviceと同じリージョン
   - **Instance Type**: `Free`
3. 「Create Database」をクリック
4. データベース作成後、「Internal Database URL」をコピー

### 5. 環境変数設定
Web Serviceの「Environment」タブで以下を設定：

```
DATABASE_URL=（PostgreSQLのInternal Database URL）
JWT_SECRET=（ランダムな文字列を生成）
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

JWT_SECRETの生成：
```bash
openssl rand -base64 32
```

### 6. デプロイ
1. 「Manual Deploy」→「Deploy latest commit」をクリック
2. ビルドログを確認（5-10分程度かかります）
3. 成功すると「Live」ステータスになります

### 7. バックエンドURLの取得
- デプロイ完了後、サービスのURLが表示されます
- 例：`https://teaching-practice-backend.onrender.com`
- このURLをコピーしてVercelの環境変数に使用

## ⚠️ 無料プランの制限
- **スリープモード**: 15分間アクセスがないとスリープ
- **初回アクセス**: スリープからの復帰に30-60秒かかる
- **PostgreSQL**: 90日間無料（その後データ削除）
- **ビルド時間**: 月400分まで

## 🔍 トラブルシューティング

### ビルドエラー
- Node.jsバージョンを確認（package.jsonに追加）
- TypeScriptのビルドエラーを修正

### データベース接続エラー
- DATABASE_URLが正しく設定されているか確認
- Prismaのマイグレーションが実行されているか確認

### 次のステップ
1. バックエンドURLをコピー
2. Vercelでフロントエンドをデプロイ
3. `NEXT_PUBLIC_API_URL`にバックエンドURLを設定