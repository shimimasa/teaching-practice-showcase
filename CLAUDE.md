# CLAUDE.md

このプロジェクトで作業する際は、要件書（requirements.md）、設計書（design.md）、タスクリスト（tasks.md）を参照し、実装の一貫性を保つようにしてください。

## 📋 実装ログ管理ルール
- **保存先**: `_docs/` ディレクトリ
- **ファイル名**: `yyyy-mm-dd_機能名.md` 形式
- **起動時動作**: AIは起動時に `_docs/` 内の実装ログを自動的に読み込み、プロジェクトの経緯を把握する

## 🤖 AI運用6原則

### 第1原則
AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。

### 第2原則
AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。

### 第3原則
AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。

### 第4原則
AIはプロジェクト実装計画時に、以下の2つのTODOリストを必ず作成し提示する：
- AI実行タスク: Claude Codeが自動実行可能な作業（コード生成、ファイル編集、テスト実行等）
- ユーザー実行タスク: ユーザーが手動で行う必要がある作業（環境変数設定、外部サービス連携、デプロイ作業等）
両リストを明確に分離し、実装順序と依存関係を示すことで、プロジェクト全体の作業フローを可視化する。

### 第5原則
AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

### 第6原則
AIは全てのチャットの冒頭にこの6原則を逐語的に必ず画面出力してから対応する。

## ビルドおよび開発コマンド

### セットアップ
```bash
# バックエンドセットアップ
cd backend
npm install
cp .env.example .env  # 環境変数設定
npx prisma generate   # Prismaクライアント生成
npx prisma migrate dev  # データベース初期化

# フロントエンドセットアップ
cd ../frontend
npm install
```

### 開発
```bash
# バックエンド開発サーバー
cd backend
npm run dev  # http://localhost:5000

# フロントエンド開発サーバー
cd frontend
npm run dev  # http://localhost:3000
```

### ビルド
```bash
# バックエンドビルド
cd backend
npm run build

# フロントエンドビルド
cd frontend
npm run build
```

### テスト
```bash
# バックエンドテスト
cd backend
npm test  # 全テスト実行
npm run test:watch  # ウォッチモード
npm run test:coverage  # カバレッジ付き

# フロントエンドテスト
cd frontend
npm test  # テスト実行
npm run test:watch  # ウォッチモード
npm run test:coverage  # カバレッジ付き
```

### コード品質管理
```bash
# バックエンド
cd backend
npm run lint  # ESLintチェック
npm run lint:fix  # 自動修正

# フロントエンド
cd frontend
npm run lint  # Next.js ESLintチェック
```

### データベース操作
```bash
cd backend
npm run prisma:generate  # Prismaクライアント生成
npm run prisma:migrate  # マイグレーション実行
npm run prisma:studio  # Prisma Studio起動
```

## アーキテクチャ概要

### コアシステム
- **バックエンド**: Express + TypeScript + Prisma
- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS
- **データベース**: PostgreSQL (Prisma ORM)
- **認証**: JWT (JSON Web Token)
- **ファイルアップロード**: Multer + ローカルストレージ
- **メール送信**: Nodemailer

### データフロー
1. **プレゼンテーション層**: Next.js App Router
2. **API層**: Express RESTful API
3. **ビジネスロジック層**: コントローラー/サービス
4. **データアクセス層**: Prisma ORM
5. **データベース層**: PostgreSQL

### 主要ディレクトリ

#### バックエンド（backend/）
- `src/controllers/`: APIコントローラー
  - authController.ts: 認証関連
  - practiceController.ts: 授業実践管理
  - commentController.ts: コメント管理
  - ratingController.ts: 評価管理
  - contactController.ts: 連絡管理
  - uploadController.ts: ファイルアップロード
- `src/routes/`: APIルート定義
  - authRoutes.ts: 認証エンドポイント
  - practiceRoutes.ts: 授業実践エンドポイント
  - commentRoutes.ts: コメントエンドポイント
  - ratingRoutes.ts: 評価エンドポイント
  - contactRoutes.ts: 連絡エンドポイント
  - uploadRoutes.ts: アップロードエンドポイント
- `src/middlewares/`: Express ミドルウェア
  - auth.ts: JWT認証
  - validation.ts: リクエスト検証
  - errorHandler.ts: エラー処理
  - upload.ts: ファイルアップロード設定
  - contactValidation.ts: 連絡フォーム検証
- `src/utils/`: ユーティリティ
  - jwt.ts: JWT処理
  - password.ts: パスワードハッシュ
  - email.ts: メール送信
  - prisma.ts: Prismaクライアント
- `src/types/`: TypeScript型定義
- `prisma/`: データベーススキーマ
  - schema.prisma: データモデル定義

#### フロントエンド（frontend/）
- `app/`: Next.js App Router
  - `page.tsx`: ホームページ
  - `practices/`: 授業実践関連ページ
    - `page.tsx`: 一覧ページ
    - `[id]/page.tsx`: 詳細ページ
    - `[id]/contact/page.tsx`: 連絡ページ
  - `admin/`: 管理画面
    - `page.tsx`: ダッシュボード
    - `practices/`: 授業実践管理
    - `contacts/`: 連絡管理
  - `layout.tsx`: ルートレイアウト
  - `sitemap.ts`: サイトマップ生成
  - `robots.ts`: robots.txt生成
- `components/`: UIコンポーネント
  - `common/`: 共通コンポーネント
    - ErrorBoundary.tsx: エラー境界
    - LoadingSpinner.tsx: ローディング表示
    - OptimizedImage.tsx: 画像最適化
  - `layout/`: レイアウトコンポーネント
    - Header.tsx: ヘッダー
    - Footer.tsx: フッター
    - ResponsiveLayout.tsx: レスポンシブ対応
  - `ui/`: UIコンポーネント
    - PracticeCard.tsx: 授業実践カード
    - SearchFilters.tsx: 検索フィルター
    - CommentForm.tsx: コメントフォーム
    - RatingWidget.tsx: 評価ウィジェット
  - `admin/`: 管理画面コンポーネント
    - AdminLayout.tsx: 管理画面レイアウト
    - PracticeEditor.tsx: 授業実践エディタ
    - MediaUploader.tsx: メディアアップロード
- `lib/`: ライブラリ設定
  - api.ts: API通信設定
- `hooks/`: カスタムフック
  - usePractices.ts: 授業実践データ取得
- `types/`: TypeScript型定義
- `middleware.ts`: Next.jsミドルウェア（認証保護）

## 重要な開発上の注意点

### 環境変数

#### バックエンド（.env）
```
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/teaching_showcase"

# JWT設定
JWT_SECRET=your-jwt-secret-key

# サーバー設定
PORT=5000

# メール設定（任意）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@example.com
```

#### フロントエンド
- 環境変数は`NEXT_PUBLIC_`プレフィックスが必要
- `NEXT_PUBLIC_API_URL=http://localhost:5000`

### セキュリティ
- JWT認証（有効期限24時間）
- パスワードはbcryptでハッシュ化（10ラウンド）
- CORS設定（本番環境で要調整）
- ファイルアップロード制限（画像5MB、PDF10MB）
- 入力検証とサニタイゼーション
- XSS対策（React標準機能）

### パフォーマンス最適化
- Next.js Image Componentによる画像最適化
- 動的インポート（React.lazy相当）
- ISR（Incremental Static Regeneration）対応
- メタデータの自動生成
- サイトマップ自動生成

### SEO対策
- メタデータの動的生成
- Open Graph対応
- 構造化データ（JSON-LD）
- サイトマップ自動生成
- robots.txt設定

## 一般的な開発タスク

### 新しいAPIエンドポイントの追加
1. `backend/src/controllers/`に新しいコントローラーを作成
2. `backend/src/routes/`にルート定義を追加
3. `backend/src/index.ts`でルートを登録
4. 必要に応じてミドルウェアを適用
5. フロントエンドのAPI通信関数を更新

### 新しいページの追加
1. `frontend/app/`に新しいページディレクトリ/ファイルを作成
2. 必要なコンポーネントを`components/`に作成
3. データ取得が必要な場合はサーバーコンポーネントで実装
4. メタデータを適切に設定
5. 必要に応じて認証保護を適用

### データベーススキーマの変更
1. `backend/prisma/schema.prisma`を編集
2. `npx prisma migrate dev`でマイグレーション作成
3. `npx prisma generate`でクライアント更新
4. 関連するコントローラーとAPIを更新
5. フロントエンドの型定義を更新

### ファイルアップロード機能の追加
1. `backend/src/middlewares/upload.ts`で設定追加
2. 新しいアップロードエンドポイントを作成
3. ファイル検証ロジックを実装
4. フロントエンドにアップロードUIを追加
5. プログレス表示とエラーハンドリング実装

## 実装済み機能
- ✅ ユーザー認証（登録、ログイン、ログアウト）
- ✅ 授業実践管理（CRUD操作）
- ✅ 公開サイト（一覧、詳細、検索）
- ✅ コメント機能（作成、削除）
- ✅ 評価機能（5段階評価）
- ✅ 連絡フォーム（メール送信対応）
- ✅ ファイルアップロード（画像、PDF）
- ✅ 管理画面基本機能
- ✅ レスポンシブデザイン
- ✅ SEO最適化（メタデータ、サイトマップ）
- ✅ エラーハンドリング

## 次の実装予定
- タグ管理機能
- 高度な検索機能
- お気に入り機能
- 通知機能
- アナリティクス機能
- バックアップ機能

## トラブルシューティング

### よくある問題
1. **データベース接続エラー**
   - PostgreSQLが起動しているか確認
   - DATABASE_URLが正しく設定されているか確認

2. **Prismaエラー**
   - `npx prisma generate`を実行
   - `npx prisma migrate dev`でスキーマを同期

3. **ファイルアップロードエラー**
   - uploadsディレクトリが存在するか確認
   - ファイルサイズ制限を確認

4. **認証エラー**
   - JWT_SECRETが設定されているか確認
   - トークンの有効期限を確認

5. **ビルドエラー**
   - TypeScriptの型エラーを確認
   - 依存関係を`npm install`で更新