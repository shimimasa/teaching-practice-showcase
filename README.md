# 授業実践紹介プラットフォーム

学校に通えない小学生から中学生の子どもたちとその保護者が、適切な学習機会を見つけられるWebプラットフォームです。

## 概要

このプラットフォームは、教育者が自分の授業実践を詳細に紹介し、保護者が興味のある授業に直接アプローチできる環境を提供します。

### 主な機能

- 教育者による授業実践の投稿（写真、動画、資料付き）
- 学年別・科目別・レベル別の検索とフィルタリング
- 保護者から教育者への直接連絡
- コメントと評価システム
- レスポンシブデザイン対応

## 技術スタック

- **フロントエンド**: Next.js 14, React 18, Tailwind CSS
- **バックエンド**: Node.js, Express.js
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js (JWT)
- **ファイルストレージ**: AWS S3 (本番) / Local Storage (開発)
- **デプロイ**: Vercel (フロントエンド) + Railway/Heroku (バックエンド)

## プロジェクト構造

```
teaching-practice-showcase/
├── frontend/          # Next.js フロントエンドアプリケーション
├── backend/           # Express.js バックエンドAPI
├── docs/             # プロジェクトドキュメント
├── _docs/            # 実装ログ
├── design.md         # 設計書
├── requirements.md   # 要件書
└── tasks.md          # タスクリスト
```

## セットアップ

### 前提条件

- Node.js 18.x 以上
- PostgreSQL 14.x 以上
- npm または yarn

### インストール手順

```bash
# リポジトリのクローン
git clone [repository-url]
cd teaching-practice-showcase

# フロントエンドの依存関係インストール
cd frontend
npm install

# バックエンドの依存関係インストール
cd ../backend
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集して必要な値を設定

# データベースのセットアップ
npx prisma migrate dev
```

### 開発サーバーの起動

```bash
# フロントエンド（別ターミナル）
cd frontend
npm run dev

# バックエンド（別ターミナル）
cd backend
npm run dev
```

フロントエンド: http://localhost:3000
バックエンドAPI: http://localhost:5000

## ライセンス

[ライセンスを指定してください]