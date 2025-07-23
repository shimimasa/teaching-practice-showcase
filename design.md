# 設計書

## 概要

学校に通えない小学生から中学生をターゲットにした授業実践紹介サイトは、教育者が授業実践を紹介し、保護者が適切な学習機会を見つけて直接アプローチできるWebプラットフォームです。モダンなWeb技術を使用し、アクセシビリティとユーザビリティを重視した設計とします。

## アーキテクチャ

### システム構成
```
[フロントエンド (Next.js)] ←→ [API層 (Express.js)] ←→ [データベース (PostgreSQL)]
                                        ↓
                              [ファイルストレージ (AWS S3/Local)]
                                        ↓
                              [メール通知サービス (Nodemailer)]
```

### 技術スタック
- **フロントエンド**: Next.js 14, React 18, JavaScript, Tailwind CSS
- **バックエンド**: Node.js, Express.js, JavaScript
- **データベース**: PostgreSQL with Prisma ORM
- **ファイルストレージ**: AWS S3 (本番) / Local Storage (開発)
- **認証**: NextAuth.js with JWT
- **メール**: Nodemailer
- **デプロイ**: Vercel (フロントエンド) + Railway/Heroku (バックエンド)

## コンポーネントとインターフェース

### フロントエンドコンポーネント

#### 1. 公開サイトコンポーネント
- **HomePage**: サイトトップページ、注目の授業実践を表示
- **PracticeListPage**: 授業実践一覧、検索・フィルタ機能
- **PracticeDetailPage**: 個別授業実践の詳細表示
- **ContactForm**: 教育者への連絡フォーム
- **SearchFilters**: 学年・科目・レベル別フィルタ

#### 2. 管理画面コンポーネント
- **AdminDashboard**: 管理画面ダッシュボード
- **PracticeEditor**: 授業実践の作成・編集フォーム
- **MediaUploader**: ファイルアップロード機能
- **ContactManager**: 受信した連絡の管理

#### 3. 共通コンポーネント
- **Header/Footer**: サイト共通ヘッダー・フッター
- **LoadingSpinner**: ローディング表示
- **ErrorBoundary**: エラーハンドリング
- **ResponsiveLayout**: レスポンシブレイアウト

### APIエンドポイント

#### 公開API
```
GET /api/practices - 授業実践一覧取得
GET /api/practices/:id - 個別授業実践取得
POST /api/contact - 連絡フォーム送信
GET /api/search - 検索・フィルタ機能
```

#### 管理API（認証必要）
```
POST /api/admin/practices - 授業実践作成
PUT /api/admin/practices/:id - 授業実践更新
DELETE /api/admin/practices/:id - 授業実践削除
POST /api/admin/upload - ファイルアップロード
GET /api/admin/contacts - 連絡一覧取得
```

## データモデル

### Practice（授業実践）
```javascript
const Practice = {
  id: String,
  title: String,
  description: String,
  subject: String, // 科目
  gradeLevel: String, // 学年（小1-中3）
  learningLevel: String, // 'basic' | 'standard' | 'advanced' 学習レベル
  specialNeeds: Boolean, // 特別な配慮が必要
  implementationDate: Date,
  materials: Array, // 関連資料（Media配列）
  tags: Array, // String配列
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date,
  educator: Object, // Educator
  comments: Array, // Comment配列
  ratings: Array // Rating配列
}
```

### Educator（教育者）
```javascript
const Educator = {
  id: String,
  name: String,
  email: String,
  bio: String,
  specialties: Array, // 専門分野（String配列）
  contactEnabled: Boolean, // 連絡受付可否
  practices: Array // Practice配列
}
```

### Contact（連絡）
```javascript
const Contact = {
  id: String,
  practiceId: String,
  parentName: String,
  parentEmail: String,
  childAge: Number,
  message: String,
  status: String, // 'new' | 'replied' | 'closed'
  createdAt: Date
}
```

### Media（メディア）
```javascript
const Media = {
  id: String,
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  practiceId: String
}
```

## エラーハンドリング

### フロントエンドエラー処理
- **Network Errors**: 接続エラー時の再試行機能
- **Validation Errors**: フォーム入力エラーの表示
- **404 Errors**: 存在しないページへのアクセス処理
- **Permission Errors**: 認証エラーの適切な処理

### バックエンドエラー処理
- **Database Errors**: データベース接続エラーの処理
- **File Upload Errors**: ファイルアップロード失敗の処理
- **Email Errors**: メール送信失敗時の処理
- **Rate Limiting**: API呼び出し制限の実装

### エラーログ
- Winston を使用したログ管理
- エラーレベル別の分類（error, warn, info）
- 本番環境でのエラー監視

## テスト戦略

### 単体テスト
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **Database**: テスト用データベースでの分離テスト

### 統合テスト
- API エンドポイントの統合テスト
- データベース操作の統合テスト
- ファイルアップロード機能のテスト

### E2Eテスト
- Playwright を使用したブラウザテスト
- 主要ユーザーフローのテスト
  - 授業実践の閲覧
  - 検索・フィルタ機能
  - 連絡フォームの送信
  - 管理画面での授業実践作成

### アクセシビリティテスト
- axe-core を使用した自動テスト
- キーボードナビゲーションテスト
- スクリーンリーダー対応テスト

## セキュリティ考慮事項

### 認証・認可
- JWT トークンベースの認証
- パスワードのハッシュ化（bcrypt）
- セッション管理の適切な実装

### データ保護
- 個人情報の暗号化
- HTTPS 通信の強制
- CORS 設定の適切な実装

### ファイルアップロード
- ファイルタイプの制限
- ファイルサイズの制限
- ウイルススキャン（本番環境）

## パフォーマンス最適化

### フロントエンド最適化
- Next.js の Image Optimization
- 静的サイト生成（SSG）の活用
- コードスプリッティング
- CDN の活用

### バックエンド最適化
- データベースインデックスの最適化
- API レスポンスのキャッシュ
- ファイル配信の最適化

### SEO対策
- メタタグの適切な設定
- 構造化データの実装
- サイトマップの生成
- ページ読み込み速度の最適化