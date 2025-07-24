# 授業実践紹介プラットフォーム

学校に通えない小学生から中学生の子どもたちとその保護者が、適切な学習機会を見つけられるWebプラットフォームです。

## 🎯 プロジェクト概要

教育者が自分の授業実践を詳細に紹介し、保護者が子どもに適した学習機会を探して直接アプローチできるプラットフォームを提供します。

### 主な機能

- 📚 **授業実践の詳細紹介**: 写真、動画、資料を含む包括的な授業実践の紹介
- 🔍 **高度な検索・フィルタ機能**: 学年、科目、学習レベル、特別配慮対応での絞り込み
- 💬 **コメント・評価機能**: 授業実践へのフィードバック
- 📧 **連絡機能**: 保護者から教育者への直接連絡
- 👨‍🏫 **管理画面**: 教育者による授業実践の管理
- 📱 **レスポンシブデザイン**: モバイル・タブレット対応

## 🚀 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **API Client**: Fetch API

### バックエンド
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer

### インフラ・デプロイ
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **File Storage**: Local/AWS S3
- **CI/CD**: GitHub Actions

## 📁 プロジェクト構造

```
teaching-practice-showcase/
├── frontend/                 # Next.jsフロントエンド
│   ├── app/                 # App Router
│   ├── components/          # Reactコンポーネント
│   ├── hooks/              # カスタムフック
│   └── public/             # 静的ファイル
├── backend/                 # Express.jsバックエンド
│   ├── src/
│   │   ├── controllers/    # APIコントローラー
│   │   ├── routes/         # ルーティング
│   │   ├── middlewares/    # ミドルウェア
│   │   ├── utils/          # ユーティリティ
│   │   └── types/          # TypeScript型定義
│   └── prisma/             # Prismaスキーマ
├── _docs/                   # 実装ログ
└── .github/workflows/       # CI/CD設定
```

## 🔧 セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL 15以上
- npm または yarn

### インストール手順

1. リポジトリのクローン
```bash
git clone https://github.com/your-username/teaching-practice-showcase.git
cd teaching-practice-showcase
```

2. バックエンドのセットアップ
```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集して環境変数を設定
npm run prisma:migrate
npm run dev
```

3. フロントエンドのセットアップ
```bash
cd frontend
npm install
cp .env.example .env.local
# .env.localファイルを編集して環境変数を設定
npm run dev
```

## 🔐 環境変数

### バックエンド (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

### フロントエンド (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📝 API仕様

主要なAPIエンドポイント：

- `GET /api/practices` - 授業実践一覧
- `GET /api/practices/:id` - 授業実践詳細
- `POST /api/auth/login` - ログイン
- `POST /api/contacts` - 連絡送信
- `POST /api/comments` - コメント投稿
- `POST /api/ratings` - 評価投稿

## 🧪 テスト

```bash
# バックエンド
cd backend
npm test

# フロントエンド
cd frontend
npm test
```

## 🚢 デプロイ

GitHub Actionsによる自動デプロイが設定されています。
`main`ブランチへのプッシュで本番環境にデプロイされます。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを作成して変更内容を議論してください。

## 📞 サポート

質問や問題がある場合は、GitHubのissueを作成してください。