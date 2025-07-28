# アーキテクチャ設計書

## 目次

1. [システム概要](#システム概要)
2. [アーキテクチャ概観](#アーキテクチャ概観)
3. [コンポーネント設計](#コンポーネント設計)
4. [データフロー](#データフロー)
5. [技術選定](#技術選定)
6. [セキュリティ設計](#セキュリティ設計)
7. [スケーラビリティ設計](#スケーラビリティ設計)
8. [パフォーマンス最適化](#パフォーマンス最適化)

## システム概要

ゲーム開発用アセット管理・生成サービスは、マイクロサービス指向のモノリシックアーキテクチャを採用しています。将来的なマイクロサービス化を考慮しつつ、開発・運用の簡素化のため、現時点では単一のアプリケーションとして構築されています。

### 主要な設計原則

- **関心の分離**: 各層が明確な責任を持つ
- **疎結合**: コンポーネント間の依存を最小化
- **高凝集**: 関連する機能を論理的にグループ化
- **拡張性**: 新機能の追加が容易
- **テスト可能性**: 各コンポーネントが独立してテスト可能

## アーキテクチャ概観

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────┬───────────────────┬───────────────────────┤
│   Web Browser       │   Mobile App      │   API Client          │
│   (React SPA)       │   (Future)        │   (External)          │
└─────────────────────┴───────────────────┴───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer / CDN                         │
│                    (Nginx / CloudFlare)                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  • Authentication    • Rate Limiting     • Request Routing       │
│  • CORS             • Compression       • SSL Termination       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Server                            │
├─────────────────────┬───────────────────┬───────────────────────┤
│   Controllers       │   Services        │   Workers             │
│   • Auth           │   • Asset         │   • Image Gen         │
│   • Asset          │   • Auth          │   • Audio Gen         │
│   • Prompt         │   • Storage       │   • Export            │
│   • Project        │   • AI Gen        │   • Thumbnail         │
│   • Export         │   • Export        │                       │
└─────────────────────┴───────────────────┴───────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Data Layer     │ │   Cache Layer    │ │  Message Queue   │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│   PostgreSQL     │ │     Redis        │ │   Bull/Redis     │
│   • Users        │ │   • Session      │ │   • Jobs         │
│   • Assets       │ │   • API Cache    │ │   • Events       │
│   • Prompts      │ │   • File Cache   │ │                  │
│   • Projects     │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────┬───────────────────┬───────────────────────┤
│   Storage (S3)      │   AI APIs         │   Email Service       │
│   • AWS S3          │   • OpenAI        │   • SendGrid          │
│   • MinIO (Dev)     │   • Suno          │   • SMTP              │
└─────────────────────┴───────────────────┴───────────────────────┘
```

## コンポーネント設計

### 1. プレゼンテーション層（Frontend）

**React SPA (Single Page Application)**

```
frontend/
├── src/
│   ├── components/       # UIコンポーネント
│   │   ├── common/      # 共通コンポーネント
│   │   ├── assets/      # アセット管理UI
│   │   ├── prompts/     # プロンプト管理UI
│   │   ├── projects/    # プロジェクト管理UI
│   │   └── export/      # エクスポートUI
│   ├── contexts/        # React Context (状態管理)
│   ├── hooks/           # カスタムフック
│   ├── services/        # API通信層
│   ├── types/           # TypeScript型定義
│   └── utils/           # ユーティリティ関数
```

**主要な技術:**
- React 18 + TypeScript
- Material-UI (UIフレームワーク)
- React Query (サーバー状態管理)
- React Router (ルーティング)
- Axios (HTTP通信)

### 2. API層（Backend）

**Express.js アプリケーション**

```
backend/
├── src/
│   ├── controllers/     # HTTPリクエスト処理
│   ├── services/        # ビジネスロジック
│   ├── middleware/      # Express ミドルウェア
│   ├── routes/          # ルート定義
│   ├── models/          # データモデル
│   ├── workers/         # バックグラウンドジョブ
│   ├── config/          # 設定ファイル
│   ├── utils/           # ユーティリティ
│   └── types/           # TypeScript型定義
```

**レイヤード・アーキテクチャ:**

1. **Controller層**: HTTPリクエスト/レスポンスの処理
2. **Service層**: ビジネスロジックの実装
3. **Repository層**: データアクセスの抽象化
4. **Model層**: データ構造の定義

### 3. データ永続化層

**PostgreSQL + Prisma ORM**

- **Prisma**: 型安全なORMとマイグレーション管理
- **トランザクション管理**: 整合性の保証
- **インデックス最適化**: クエリパフォーマンス向上

### 4. キャッシュ層

**Redis**

用途:
- セッションストア
- APIレスポンスキャッシュ
- ジョブキュー（Bull）
- リアルタイムカウンター

キャッシュ戦略:
- **Cache-Aside Pattern**: 必要時にキャッシュを更新
- **TTL設定**: 5-10分のキャッシュ有効期限
- **キャッシュ無効化**: 更新時の自動削除

### 5. ファイルストレージ

**S3互換オブジェクトストレージ**

- **本番**: AWS S3
- **開発**: MinIO
- **CDN統合**: CloudFront（本番環境）

ストレージ構造:
```
bucket/
├── assets/
│   ├── images/
│   │   └── {userId}/{assetId}/original.{ext}
│   └── audio/
│       └── {userId}/{assetId}/original.{ext}
├── thumbnails/
│   └── {assetId}/thumb_{size}.jpg
└── exports/
    └── {jobId}/export.zip
```

### 6. バックグラウンド処理

**Bull Queue (Redis-based)**

ジョブタイプ:
- **画像生成**: OpenAI DALL-E API呼び出し
- **音声生成**: 音声生成API呼び出し
- **サムネイル生成**: Sharp による画像処理
- **エクスポート**: アーカイブ生成

## データフロー

### 1. アセットアップロードフロー

```
[Client] → Upload File
    ↓
[API Gateway] → Auth Check → Rate Limit
    ↓
[Controller] → Validate File
    ↓
[Service] → Generate Metadata
    ↓
[Storage] → Upload to S3
    ↓
[Database] → Save Record
    ↓
[Queue] → Create Thumbnail Job
    ↓
[Worker] → Process Thumbnail
    ↓
[Cache] → Invalidate Related Cache
    ↓
[Response] → Return Asset Data
```

### 2. AI生成フロー

```
[Client] → Submit Prompt
    ↓
[API] → Validate & Auth
    ↓
[Service] → Create Job
    ↓
[Queue] → Enqueue Generation
    ↓
[Worker] → Call AI API
    ↓
[Storage] → Save Generated File
    ↓
[Database] → Create Asset Record
    ↓
[WebSocket] → Notify Client (Future)
```

## 技術選定

### バックエンド技術選定理由

| 技術 | 選定理由 |
|------|----------|
| Node.js | JavaScriptエコシステムの統一、非同期処理の効率性 |
| Express | 軽量で柔軟、豊富なミドルウェア |
| TypeScript | 型安全性、開発効率の向上 |
| PostgreSQL | ACID準拠、JSON対応、高性能 |
| Prisma | 型安全なORM、マイグレーション管理 |
| Redis | 高速キャッシュ、Pub/Sub対応 |
| Bull | 信頼性の高いジョブキュー |

### フロントエンド技術選定理由

| 技術 | 選定理由 |
|------|----------|
| React | コンポーネント指向、大規模アプリ対応 |
| TypeScript | バックエンドとの型共有 |
| Material-UI | 高品質なUIコンポーネント |
| React Query | 効率的なサーバー状態管理 |

## セキュリティ設計

### 認証・認可

- **JWT認証**: ステートレスな認証
- **リフレッシュトークン**: セキュアなトークン更新
- **RBAC**: 将来的な権限管理（準備済み）

### API セキュリティ

- **Rate Limiting**: DDoS対策
- **CORS**: オリジン制限
- **Helmet.js**: セキュリティヘッダー
- **Input Validation**: SQLインジェクション対策
- **XSS Protection**: サニタイゼーション

### データ保護

- **暗号化**: パスワード（bcrypt）
- **HTTPS**: 通信の暗号化
- **環境変数**: 機密情報の管理

## スケーラビリティ設計

### 水平スケーリング

```
                    [Load Balancer]
                          |
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
   [App Server 1]    [App Server 2]    [App Server N]
        ↓                 ↓                 ↓
        └─────────────────┼─────────────────┘
                          ↓
                   [PostgreSQL]
                   (Read Replicas)
```

### スケーリング戦略

1. **ステートレス設計**: セッションをRedisに外部化
2. **キャッシング**: 頻繁なクエリの結果をキャッシュ
3. **CDN**: 静的アセットの配信
4. **データベース最適化**: インデックス、パーティショニング
5. **非同期処理**: 重い処理をキューに委譲

### ボトルネック対策

| ボトルネック | 対策 |
|--------------|------|
| データベース | Read Replica、接続プール |
| ファイルアップロード | 直接S3アップロード（Presigned URL） |
| AI API | レート制限、リトライ、キュー管理 |
| 画像処理 | ワーカースケーリング |

## パフォーマンス最適化

### フロントエンド最適化

1. **コード分割**: React.lazy() による動的インポート
2. **画像最適化**: 
   - 遅延読み込み
   - WebP形式のサポート
   - レスポンシブ画像
3. **バンドル最適化**:
   - Tree Shaking
   - Vendor分離
   - 圧縮（gzip/brotli）

### バックエンド最適化

1. **データベースクエリ**:
   - N+1問題の回避
   - 適切なインデックス
   - クエリ最適化
2. **キャッシング**:
   - Redis によるAPI応答キャッシュ
   - データベースクエリキャッシュ
3. **非同期処理**:
   - I/O処理の並列化
   - ストリーミング対応

### モニタリング

推奨ツール:
- **APM**: DataDog, New Relic
- **ログ**: ELK Stack
- **メトリクス**: Prometheus + Grafana
- **エラー追跡**: Sentry

## 開発環境と本番環境の違い

| 項目 | 開発環境 | 本番環境 |
|------|----------|----------|
| ストレージ | MinIO | AWS S3 |
| データベース | ローカルPostgreSQL | マネージドPostgreSQL |
| キャッシュ | ローカルRedis | ElastiCache/Redis Cloud |
| SSL | 自己署名証明書 | Let's Encrypt/有料証明書 |
| CDN | なし | CloudFront |
| モニタリング | 基本ログ | フルスタック監視 |

## 今後の拡張計画

1. **マイクロサービス化**:
   - AI生成サービスの分離
   - ファイル処理サービスの分離

2. **リアルタイム機能**:
   - WebSocketによる進行状況通知
   - コラボレーション機能

3. **機械学習統合**:
   - アセット推薦システム
   - 自動タグ付け

4. **国際化対応**:
   - 多言語サポート
   - リージョン別配信

---

最終更新: 2025-07-28