# デプロイメントガイド（初学者向け）

このガイドでは、Teaching Practice Showcaseを本番環境にデプロイするための手順を、初めての方でも分かるように詳しく説明します。

## 目次
1. [環境変数の本番設定](#1-環境変数の本番設定)
2. [Vercelアカウントの作成とフロントエンドデプロイ](#2-vercelアカウントの作成とフロントエンドデプロイ)
3. [バックエンドホスティングサービスの設定](#3-バックエンドホスティングサービスの設定)
4. [PostgreSQLデータベースの本番環境セットアップ](#4-postgresqlデータベースの本番環境セットアップ)
5. [GitHubリポジトリの保護設定](#5-githubリポジトリの保護設定)

---

## 1. 環境変数の本番設定

環境変数とは、アプリケーションの動作に必要な設定値のことです。開発環境と本番環境で異なる値を使います。

### なぜ必要？
- **セキュリティ**: パスワードやAPIキーを直接コードに書かない
- **柔軟性**: 環境ごとに異なる設定を簡単に切り替えられる

### 設定が必要な環境変数

#### バックエンド用（.env）
```env
# データベース接続情報（後で設定）
DATABASE_URL="postgresql://username:password@host:port/database_name"

# JWT秘密鍵（必ず変更してください！）
JWT_SECRET="your-super-secret-key-minimum-32-characters-long"

# サーバー設定
PORT=5000
NODE_ENV=production

# CORS許可オリジン（フロントエンドのURL）
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# メール設定（任意）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@your-domain.com
```

#### フロントエンド用（.env.production）
```env
# バックエンドAPIのURL（後で設定）
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 重要なポイント
- `JWT_SECRET`は必ず32文字以上のランダムな文字列に変更
- パスワード生成サイト（例：[パスワード生成器](https://passwordsgenerator.net/)）を使用
- 環境変数は絶対にGitHubにアップロードしない

---

## 2. Vercelアカウントの作成とフロントエンドデプロイ

Vercelは、Next.jsアプリケーションを簡単にデプロイできる無料のホスティングサービスです。

### ステップ1: Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでサインアップ（推奨）
   - 「Continue with GitHub」をクリック
   - GitHubの認証画面で承認

### ステップ2: プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
   - 「Import Git Repository」から対象のリポジトリを選択
3. プロジェクト設定
   - **Framework Preset**: Next.js（自動検出される）
   - **Root Directory**: `frontend`（重要！）
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`（デフォルトのまま）

### ステップ3: 環境変数の設定

1. 「Environment Variables」セクションを開く
2. 以下を追加：
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-api.com`（後で更新）
   - **Environment**: Production

### ステップ4: デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待つ（約2-3分）
3. 完了したらURLが表示される
   - 例：`https://your-project-name.vercel.app`

### デプロイ後の確認
- 表示されたURLにアクセスして動作確認
- この時点ではバックエンドがないためAPIエラーが出るのは正常

---

## 3. バックエンドホスティングサービスの設定

バックエンドは**Railway**または**Render**を使用します。ここではRailwayの手順を説明します。

### Railway を使う場合

#### ステップ1: Railwayアカウントの作成

1. [Railway](https://railway.app)にアクセス
2. 「Login」→「Login with GitHub」
3. GitHubアカウントで認証

#### ステップ2: 新しいプロジェクトの作成

1. ダッシュボードで「New Project」をクリック
2. 「Deploy from GitHub repo」を選択
3. リポジトリを選択して承認

#### ステップ3: サービスの設定

1. **Service Settings**で以下を設定：
   - **Root Directory**: `/backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

2. **Environment Variables**を設定：
   ```
   DATABASE_URL=（後で設定）
   JWT_SECRET=your-super-secret-key-minimum-32-characters-long
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-project-name.vercel.app
   ```

#### ステップ4: PostgreSQLの追加

1. プロジェクト内で「New」→「Database」→「Add PostgreSQL」
2. PostgreSQLが自動的にプロビジョニングされる
3. `DATABASE_URL`が自動的に設定される

### Render を使う場合（代替案）

1. [Render](https://render.com)でアカウント作成
2. 「New」→「Web Service」
3. GitHubリポジトリを接続
4. 同様の設定を行う

---

## 4. PostgreSQLデータベースの本番環境セットアップ

### Railway使用時（推奨）

Railwayでは自動的にPostgreSQLがセットアップされますが、初期設定が必要です。

#### ステップ1: データベースへの接続

1. Railwayダッシュボードで PostgreSQL サービスをクリック
2. 「Connect」タブから接続情報を確認
3. `DATABASE_URL`をコピー

#### ステップ2: Prismaマイグレーションの実行

ローカル環境で以下のコマンドを実行：

```bash
cd backend

# 本番環境のDATABASE_URLを一時的に設定
export DATABASE_URL="コピーしたDATABASE_URL"

# マイグレーション実行
npx prisma migrate deploy

# 初期データが必要な場合
npx prisma db seed
```

### 外部PostgreSQLサービスを使う場合

#### 無料のオプション
1. **Supabase**
   - [Supabase](https://supabase.com)でアカウント作成
   - 新しいプロジェクトを作成
   - 接続情報からDATABASE_URLを取得

2. **Neon**
   - [Neon](https://neon.tech)でアカウント作成
   - データベースを作成
   - 接続文字列を取得

---

## 5. GitHubリポジトリの保護設定

コードの品質を保つため、GitHubでブランチ保護ルールを設定します。

### ステップ1: リポジトリ設定へのアクセス

1. GitHubでリポジトリを開く
2. 「Settings」タブをクリック
3. 左メニューから「Branches」を選択

### ステップ2: ブランチ保護ルールの追加

1. 「Add rule」をクリック
2. **Branch name pattern**: `main`と入力

### ステップ3: 保護ルールの設定

以下にチェックを入れる：

- ✅ **Require a pull request before merging**
  - ✅ Require approvals（承認が必要）
  - Number of required approvals: 1

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging

- ✅ **Require conversation resolution before merging**
  （コメントの解決が必要）

- ✅ **Include administrators**
  （管理者も規則に従う）

### ステップ4: 保存

「Create」または「Save changes」をクリック

---

## デプロイ完了後の確認事項

### 1. 動作確認チェックリスト

- [ ] フロントエンドのURLにアクセスできる
- [ ] ユーザー登録ができる
- [ ] ログインができる
- [ ] 授業実践の作成・閲覧ができる
- [ ] 画像のアップロードができる

### 2. 環境変数の最終更新

1. **Vercelで**：
   - `NEXT_PUBLIC_API_URL`をRailwayのバックエンドURLに更新
   - 例：`https://your-app.up.railway.app`

2. **Railwayで**：
   - `ALLOWED_ORIGINS`にVercelのURLを設定
   - 例：`https://your-project.vercel.app`

### 3. トラブルシューティング

#### よくある問題と解決方法

**問題**: CORSエラーが発生する
- **解決**: `ALLOWED_ORIGINS`が正しく設定されているか確認

**問題**: データベース接続エラー
- **解決**: `DATABASE_URL`が正しいか確認、マイグレーションを実行

**問題**: 画像アップロードが失敗する
- **解決**: ファイルサイズ制限を確認、サーバーのストレージ容量を確認

---

## セキュリティチェックリスト

本番環境にデプロイする前に必ず確認：

- [ ] `JWT_SECRET`をランダムな文字列に変更した
- [ ] 環境変数に本番用の値を設定した
- [ ] HTTPSが有効になっている（Vercel/Railwayは自動）
- [ ] 不要なconsole.logを削除した
- [ ] エラーメッセージに機密情報が含まれていない

---

## 次のステップ

1. **カスタムドメインの設定**
   - Vercelでカスタムドメインを追加
   - DNSレコードを設定

2. **モニタリングの設定**
   - エラー監視ツール（Sentry等）の導入
   - アナリティクスの設定

3. **バックアップの設定**
   - データベースの定期バックアップ
   - 重要データのエクスポート

---

## サポート

問題が発生した場合：

1. 各サービスのドキュメントを確認
   - [Vercel Docs](https://vercel.com/docs)
   - [Railway Docs](https://docs.railway.app)
   - [Render Docs](https://render.com/docs)

2. エラーメッセージをGoogle検索
3. GitHubのIssuesで質問

頑張ってください！ 🚀