# ユーザー実行タスク一覧

このドキュメントは、授業実践ショーケースサイトの開発において、Claude Codeでは自動化できず、ユーザーが手動で実行する必要がある作業をまとめたものです。

## 📋 タスク概要

ユーザーが手動で行う必要がある作業は、主に以下の9つのカテゴリに分類されます：

1. 開発環境構築・初期設定
2. GitHub設定とリポジトリ管理
3. データベース設定（PostgreSQL）
4. 環境変数設定
5. メール送信設定
6. ファイルストレージ設定
7. 認証設定（NextAuth.js）
8. テスト・検証作業
9. デプロイメント・運用設定

---

## 1. 開発環境構築・初期設定

### 1.1 Node.jsとnpmのインストール
- **作業内容**: Node.js（v18以上推奨）とnpmのインストール
- **確認コマンド**:
  ```bash
  node --version
  npm --version
  ```
- **理由**: Next.js/Express.jsプロジェクトの実行に必要

### 1.2 PostgreSQLのインストール
- **作業内容**: PostgreSQLデータベースのインストール
- **インストール方法**:
  - Mac: `brew install postgresql`
  - Windows: 公式インストーラー使用
  - Linux: `sudo apt-get install postgresql`
- **確認コマンド**:
  ```bash
  psql --version
  ```

### 1.3 プロジェクト構造の作成
- **作業内容**: フロントエンドとバックエンドのディレクトリ構造作成
- **構造**:
  ```
  teaching-practice-showcase/
  ├── frontend/     # Next.jsプロジェクト
  ├── backend/      # Express.jsプロジェクト
  └── README.md
  ```

---

## 2. GitHub設定とリポジトリ管理

### 2.1 GitHubリポジトリの作成
- **作業内容**: GitHubで新規リポジトリを作成
- **手順**:
  1. GitHubにログイン
  2. 「New repository」をクリック
  3. リポジトリ名：`teaching-practice-showcase`
  4. Public/Privateを選択
  5. READMEを追加しない（後で作成）

### 2.2 リポジトリの初期設定
- **実行コマンド**:
  ```bash
  git init
  git remote add origin https://github.com/[username]/teaching-practice-showcase.git
  git branch -M main
  ```

### 2.3 ブランチ保護ルールの設定
- **作業内容**: mainブランチの保護設定
- **設定項目**:
  - プルリクエストレビュー必須
  - ステータスチェック必須
  - 直接プッシュの禁止

### 2.4 GitHub Secretsの設定
- **作業内容**: 環境変数をSecretsに登録
- **必要なSecrets**:
  ```
  DATABASE_URL
  JWT_SECRET
  SMTP_USER
  SMTP_PASS
  AWS_ACCESS_KEY_ID (本番環境)
  AWS_SECRET_ACCESS_KEY (本番環境)
  ```

### 2.5 Issue/PRテンプレートの作成
- **作業内容**: `.github/`ディレクトリにテンプレート作成
- **テンプレート**:
  - ISSUE_TEMPLATE/bug_report.md
  - ISSUE_TEMPLATE/feature_request.md
  - pull_request_template.md

---

## 3. データベース設定（PostgreSQL）

### 3.1 データベースの作成
- **実行コマンド**:
  ```bash
  createdb teaching_showcase
  ```
- **確認コマンド**:
  ```bash
  psql -l
  ```

### 3.2 データベースユーザーの作成
- **実行コマンド**:
  ```sql
  CREATE USER showcase_user WITH PASSWORD 'your_password';
  GRANT ALL PRIVILEGES ON DATABASE teaching_showcase TO showcase_user;
  ```

### 3.3 Prismaのセットアップ
- **実行コマンド**:
  ```bash
  cd backend
  npm install prisma @prisma/client
  npx prisma init
  ```

### 3.4 初期データの準備
- **作業内容**: テスト用の教育者データと授業実践データの準備
- **データ例**:
  - 教育者プロフィール
  - サンプル授業実践（各学年・科目）
  - テスト用画像・PDF

---

## 4. 環境変数設定

### 4.1 バックエンド環境変数（.env）
- **作業内容**: `backend/.env.example`をコピーして設定
- **実行コマンド**:
  ```bash
  cd backend
  cp .env.example .env
  ```
- **設定内容**:
  ```env
  # データベース
  DATABASE_URL="postgresql://showcase_user:your_password@localhost:5432/teaching_showcase"
  
  # JWT設定
  JWT_SECRET=your-super-secret-jwt-key-here
  
  # サーバー設定
  PORT=5000
  
  # メール設定
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  EMAIL_FROM=noreply@your-domain.com
  
  # ファイルアップロード
  UPLOAD_DIR=./uploads
  MAX_FILE_SIZE=10485760  # 10MB
  
  # CORS設定（本番環境）
  CLIENT_URL=http://localhost:3000
  ```

### 4.2 フロントエンド環境変数
- **作業内容**: `frontend/.env.local`を作成
- **設定内容**:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your-nextauth-secret-here
  ```

### 4.3 環境変数の管理
- **重要**: 
  - `.env`ファイルは`.gitignore`に追加
  - 本番環境では環境変数管理サービスを使用
  - シークレットキーは強力なランダム文字列を使用

---

## 5. メール送信設定

### 5.1 Gmail設定（開発環境）
- **作業内容**: Gmailアプリパスワードの取得
- **手順**:
  1. Googleアカウントの2段階認証を有効化
  2. アプリパスワードを生成
  3. 生成されたパスワードを.envに設定

### 5.2 本番環境メールサービス
- **選択肢**:
  - SendGrid
  - AWS SES
  - Mailgun
- **設定項目**:
  - APIキーの取得
  - ドメイン認証
  - 送信元メールアドレスの設定

### 5.3 メールテンプレートの作成
- **必要なテンプレート**:
  - 連絡受信通知（教育者向け）
  - 連絡確認メール（保護者向け）
- **保存場所**: `backend/templates/emails/`

---

## 6. ファイルストレージ設定

### 6.1 開発環境（ローカルストレージ）
- **作業内容**: アップロードディレクトリの作成
- **実行コマンド**:
  ```bash
  cd backend
  mkdir -p uploads/{images,pdfs,videos}
  chmod 755 uploads
  ```

### 6.2 本番環境（AWS S3）
- **作業内容**: S3バケットの作成と設定
- **手順**:
  1. AWSコンソールでS3バケット作成
  2. バケット名: `teaching-showcase-assets`
  3. パブリックアクセス設定
  4. CORS設定
  5. IAMユーザー作成とアクセスキー取得

### 6.3 S3 CORS設定
- **設定内容**:
  ```json
  [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
  ```

---

## 7. 認証設定（NextAuth.js）

### 7.1 NextAuth.js設定
- **作業内容**: NextAuth.jsの基本設定
- **設定場所**: `frontend/pages/api/auth/[...nextauth].js`
- **設定項目**:
  - JWT設定
  - セッション設定
  - コールバックURL

### 7.2 認証プロバイダー設定
- **Credentials Provider**:
  - メールアドレスとパスワード認証
  - カスタムログインページ

### 7.3 セキュリティ設定
- **設定項目**:
  - NEXTAUTH_SECRET（32文字以上）
  - セッション有効期限（24時間）
  - CSRF保護

---

## 8. テスト・検証作業

### 8.1 ローカル環境での動作確認
- **起動手順**:
  ```bash
  # ターミナル1: バックエンド
  cd backend
  npm run dev
  
  # ターミナル2: フロントエンド
  cd frontend
  npm run dev
  ```
- **アクセスURL**: 
  - フロントエンド: http://localhost:3000
  - バックエンドAPI: http://localhost:5000

### 8.2 機能テスト
- **確認項目**:
  - 授業実践の表示（一覧・詳細）
  - 検索・フィルタ機能
  - 連絡フォーム送信
  - 管理画面ログイン
  - ファイルアップロード

### 8.3 レスポンシブテスト
- **テストデバイス**:
  - スマートフォン（iPhone/Android）
  - タブレット（iPad）
  - デスクトップ
- **確認項目**:
  - レイアウトの崩れ
  - タッチ操作
  - 画像・動画の表示

### 8.4 アクセシビリティテスト
- **テスト項目**:
  - キーボードナビゲーション
  - スクリーンリーダー対応
  - 色覚多様性への配慮
- **ツール**: axe DevTools、WAVE

### 8.5 パフォーマンステスト
- **測定項目**:
  - ページ読み込み時間
  - Core Web Vitals
  - APIレスポンス時間
- **ツール**: Lighthouse、PageSpeed Insights

---

## 9. デプロイメント・運用設定

### 9.1 フロントエンドデプロイ（Vercel）
- **作業内容**: Vercelへのデプロイ設定
- **手順**:
  1. Vercelアカウント作成
  2. GitHubリポジトリ連携
  3. 環境変数設定
  4. ビルド設定確認

### 9.2 バックエンドデプロイ
- **選択肢**:
  - Railway
  - Heroku
  - AWS EC2
- **設定項目**:
  - Node.js環境
  - PostgreSQL接続
  - 環境変数

### 9.3 本番データベース
- **選択肢**:
  - Railway PostgreSQL
  - Heroku Postgres
  - AWS RDS
  - Supabase
- **設定項目**:
  - 自動バックアップ
  - SSL接続
  - 接続プール

### 9.4 ドメイン設定
- **作業内容**:
  - カスタムドメインの設定
  - SSL証明書の設定
  - DNSレコードの設定

### 9.5 監視・ログ設定
- **監視項目**:
  - サーバー稼働率
  - エラー率
  - APIレスポンス時間
- **推奨ツール**:
  - Sentry（エラー監視）
  - LogRocket（セッション記録）
  - Google Analytics

### 9.6 CI/CDパイプライン
- **GitHub Actions設定**:
  - 自動テスト実行
  - コード品質チェック
  - 自動デプロイ
- **設定ファイル**: `.github/workflows/`

---

## 📝 実行順序の推奨

### Phase 1: 基盤構築（1-2日）
1. 開発環境構築（セクション1）
2. GitHub設定（セクション2）
3. データベース設定（セクション3）
4. 環境変数設定（セクション4）

### Phase 2: 機能設定（2-3日）
1. 認証設定（セクション7）
2. メール送信設定（セクション5）
3. ファイルストレージ設定（セクション6）

### Phase 3: 開発・テスト（2-3週間）
1. 開発作業（Claude Codeと並行）
2. 各種テスト実施（セクション8）

### Phase 4: リリース準備（3-5日）
1. 本番環境設定（セクション9）
2. CI/CD設定
3. 最終確認とリリース

---

## 🔄 継続的な作業

- セキュリティアップデート
- データベースバックアップ
- ユーザーフィードバックの収集
- パフォーマンス監視
- コンテンツの更新管理

---

## 📌 重要な注意事項

1. **環境変数管理**: 本番環境の秘密情報は必ずSecrets管理
2. **個人情報保護**: 保護者・子どもの情報は適切に管理
3. **ファイルサイズ制限**: 適切な制限設定（画像5MB、PDF10MB）
4. **アクセシビリティ**: 小中学生でも使いやすいUI設計
5. **SEO対策**: 教育関連キーワードでの検索最適化

---

このドキュメントは、プロジェクトの進行に応じて更新される可能性があります。
最終更新日: 2025-07-25