# デプロイメントチェックリスト

このチェックリストは、Teaching Practice Showcaseを本番環境にデプロイする際の確認事項をまとめたものです。

## 🔍 事前確認

### 1. コードの品質確認
- [ ] すべてのテストが合格している
  ```bash
  cd backend && npm test
  cd ../frontend && npm test
  ```
- [ ] ESLintエラーがない
  ```bash
  cd backend && npm run lint
  cd ../frontend && npm run lint
  ```
- [ ] TypeScriptのビルドエラーがない
  ```bash
  cd backend && npm run build
  cd ../frontend && npm run build
  ```

### 2. セキュリティ確認
- [ ] 環境変数に本番用の値が設定されている
- [ ] JWT_SECRETが強力なランダム文字列に変更されている
- [ ] NEXTAUTH_SECRETが強力なランダム文字列に変更されている
- [ ] データベースのパスワードが安全である
- [ ] APIキーや秘密情報がコードにハードコードされていない

### 3. データベース準備
- [ ] 本番用PostgreSQLデータベースが作成されている
- [ ] SSL接続が有効になっている
- [ ] バックアップ設定が完了している
- [ ] 接続文字列が正しく設定されている

## 🚀 デプロイ手順

### バックエンド（Railway/Render）

#### 1. サービスのセットアップ
- [ ] Railway/Renderアカウントが作成されている
- [ ] 新しいプロジェクトが作成されている
- [ ] GitHubリポジトリが連携されている

#### 2. 環境変数の設定
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=<生成した強力なランダム文字列>
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
TRUST_PROXY=true
SSL_MODE=require
```

#### 3. デプロイ設定
- [ ] ルートディレクトリが`backend`に設定されている
- [ ] ビルドコマンド: `npm run vercel-build`
- [ ] スタートコマンド: `npm start`
- [ ] Node.jsバージョンが18以上に設定されている

#### 4. データベースマイグレーション
- [ ] デプロイ後に以下のコマンドを実行
  ```bash
  npm run prisma:migrate:deploy
  ```

### フロントエンド（Vercel）

#### 1. Vercelプロジェクトセットアップ
- [ ] Vercelアカウントが作成されている
- [ ] GitHubリポジトリがインポートされている
- [ ] ルートディレクトリが`frontend`に設定されている

#### 2. 環境変数の設定
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<生成した強力なランダム文字列>
NEXT_PUBLIC_SITE_NAME=授業実践紹介プラットフォーム
NEXT_PUBLIC_SITE_DESCRIPTION=学校に通えない子どもたちのための学習機会プラットフォーム
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ENABLE_COMMENTS=true
NEXT_PUBLIC_ENABLE_RATINGS=true
NEXT_PUBLIC_ENABLE_CONTACT=true
```

#### 3. ビルド設定
- [ ] フレームワークプリセット: Next.js
- [ ] ビルドコマンド: `npm run build`
- [ ] 出力ディレクトリ: `.next`
- [ ] Node.jsバージョン: 18.x

## ✅ デプロイ後の確認

### 1. 機能テスト
- [ ] ホームページが正しく表示される
- [ ] 授業実践一覧が表示される
- [ ] 検索・フィルタ機能が動作する
- [ ] 授業実践詳細ページが表示される
- [ ] 管理者ログインができる
- [ ] 授業実践の作成・編集・削除ができる
- [ ] ファイルアップロードが動作する
- [ ] コメント投稿ができる
- [ ] 評価投稿ができる
- [ ] 連絡フォームが送信できる

### 2. パフォーマンステスト
- [ ] Lighthouse スコアが70以上
  - Performance
  - Accessibility
  - Best Practices
  - SEO
- [ ] ページ読み込み時間が3秒以内
- [ ] APIレスポンス時間が適切

### 3. セキュリティテスト
- [ ] HTTPS接続が有効
- [ ] CORSが正しく設定されている
- [ ] レート制限が動作している
- [ ] 認証が正しく動作している
- [ ] SQLインジェクション対策が有効
- [ ] XSS対策が有効

### 4. SEO確認
- [ ] サイトマップが生成されている（/sitemap.xml）
- [ ] robots.txtが適切に設定されている（/robots.txt）
- [ ] メタタグが正しく設定されている
- [ ] Open Graphタグが設定されている

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. データベース接続エラー
- DATABASE_URLが正しいか確認
- SSL設定（`?sslmode=require`）が含まれているか確認
- ファイアウォール設定を確認

#### 2. CORS エラー
- FRONTEND_URLが正しく設定されているか確認
- ALLOWED_ORIGINSに本番URLが含まれているか確認

#### 3. 認証エラー
- JWT_SECRETとNEXTAUTH_SECRETが設定されているか確認
- NEXTAUTH_URLが正しいか確認

#### 4. ファイルアップロードエラー
- ファイルサイズ制限を確認
- ストレージの設定を確認（本番環境ではAWS S3推奨）

## 📊 監視設定

### 推奨される監視ツール
- [ ] エラー監視: Sentry
- [ ] パフォーマンス監視: New Relic / DataDog
- [ ] アップタイム監視: UptimeRobot / Pingdom
- [ ] ログ管理: LogRocket / Papertrail

### アラート設定
- [ ] サーバーダウン時の通知
- [ ] エラー率上昇時の通知
- [ ] レスポンス時間遅延時の通知

## 📝 最終確認

- [ ] すべての環境変数が正しく設定されている
- [ ] データベースのバックアップが設定されている
- [ ] ドメインが正しく設定されている（カスタムドメインの場合）
- [ ] SSL証明書が有効である
- [ ] 管理者アカウントが作成されている
- [ ] テストデータが削除されている
- [ ] ドキュメントが最新化されている

## 🎉 デプロイ完了

すべてのチェック項目が完了したら、Teaching Practice Showcaseの本番環境デプロイは完了です！

継続的な監視とメンテナンスを忘れずに行ってください。