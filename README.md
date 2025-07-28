# Teaching Practice Showcase

教育実践共有プラットフォーム - 教師が授業実践を共有し、学び合うためのWebアプリケーション

## 概要

Teaching Practice Showcaseは、教師が自身の授業実践を共有し、他の教師と知見を交換できるプラットフォームです。授業の工夫や教材、指導方法などを投稿・閲覧でき、コメントや評価を通じて教育コミュニティの活性化を図ります。

### 主な機能

- 📝 **授業実践の投稿・管理** - 授業内容、教材、指導案を簡単に共有
- 🔍 **検索・フィルタリング** - 科目、学年、学習レベル別に実践を検索
- 💬 **コメント機能** - 実践への質問やフィードバック
- ⭐ **評価システム** - 5段階評価で有用な実践を見つけやすく
- 📧 **連絡機能** - 投稿者への直接連絡
- 🎯 **特別配慮対応** - 特別な支援が必要な生徒への対応方法の共有
- 📱 **レスポンシブデザイン** - PC、タブレット、スマートフォンに対応

## 技術スタック

### フロントエンド
- **Next.js 14** - App Router、Server Components
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - モダンなUIデザイン
- **React Hook Form** - フォーム管理
- **Axios** - API通信

### バックエンド
- **Express.js** - Node.js Webフレームワーク
- **TypeScript** - 型安全なサーバーサイド開発
- **Prisma ORM** - データベース管理
- **PostgreSQL** - リレーショナルデータベース
- **JWT** - 認証システム
- **Multer** - ファイルアップロード

### 開発ツール
- **Jest** - テストフレームワーク
- **ESLint** - コード品質管理
- **GitHub Actions** - CI/CD
- **Docker** - コンテナ化（オプション）

## セットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL 14以上
- npm または yarn

### インストール手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-username/teaching-practice-showcase.git
cd teaching-practice-showcase
```

2. **バックエンドのセットアップ**
```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集して環境変数を設定
npx prisma generate
npx prisma migrate dev
```

3. **フロントエンドのセットアップ**
```bash
cd ../frontend
npm install
cp .env.example .env.local
# .env.localファイルを編集
```

### 環境変数の設定

#### バックエンド (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/teaching_showcase"
JWT_SECRET=your-secure-secret-key
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

#### フロントエンド (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 開発

### 開発サーバーの起動

**バックエンド:**
```bash
cd backend
npm run dev
```

**フロントエンド:**
```bash
cd frontend
npm run dev
```

アプリケーションは以下のURLでアクセスできます：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5000

### テストの実行

```bash
# バックエンド
cd backend
npm test

# フロントエンド
cd frontend
npm test
```

### ビルド

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd frontend
npm run build
```

## API仕様

### 認証エンドポイント
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト

### 授業実践エンドポイント
- `GET /api/practices` - 実践一覧取得
- `GET /api/practices/:id` - 実践詳細取得
- `POST /api/practices` - 実践作成（認証必須）
- `PUT /api/practices/:id` - 実践更新（認証必須）
- `DELETE /api/practices/:id` - 実践削除（認証必須）

### その他のエンドポイント
- `POST /api/comments` - コメント投稿
- `POST /api/ratings` - 評価投稿
- `POST /api/contacts` - 連絡送信
- `POST /api/admin/upload` - ファイルアップロード（管理者のみ）

詳細なAPI仕様は[API Documentation](./docs/API.md)を参照してください。

## デプロイ

### Vercel（フロントエンド）

1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定
4. デプロイ実行

### Railway/Render（バックエンド）

1. サービスアカウントを作成
2. PostgreSQLデータベースを作成
3. 環境変数を設定
4. GitHubリポジトリと連携
5. デプロイ実行

## セキュリティ

- JWT認証による安全なユーザー管理
- bcryptによるパスワードハッシュ化
- CORS設定による不正アクセス防止
- レート制限による過剰なリクエスト防止
- 入力値のサニタイゼーション（XSS対策）
- SQLインジェクション対策

## ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## 貢献

プロジェクトへの貢献を歓迎します！詳細は[CONTRIBUTING.md](./CONTRIBUTING.md)を参照してください。

## サポート

問題や質問がある場合は、[Issues](https://github.com/your-username/teaching-practice-showcase/issues)でお知らせください。