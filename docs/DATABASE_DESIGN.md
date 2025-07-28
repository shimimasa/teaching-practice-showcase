# データベース設計書

## 目次

1. [概要](#概要)
2. [ER図](#er図)
3. [テーブル定義](#テーブル定義)
4. [インデックス設計](#インデックス設計)
5. [リレーションシップ](#リレーションシップ)
6. [パフォーマンス最適化](#パフォーマンス最適化)
7. [データ整合性](#データ整合性)
8. [セキュリティ](#セキュリティ)

## 概要

このドキュメントは、ゲーム開発用アセット管理・生成サービスのデータベース設計について詳述します。PostgreSQLを使用し、Prisma ORMを通じてデータアクセスを行います。

### 設計原則

- **正規化**: 第3正規形を基本とし、パフォーマンスのために一部非正規化
- **拡張性**: 将来の機能追加を考慮した柔軟な設計
- **パフォーマンス**: 適切なインデックスとクエリ最適化
- **整合性**: 外部キー制約とトランザクション管理

## ER図

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Asset       │       │    Project      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │   ┌───│ id (PK)         │
│ email           │   │   │ filename        │   │   │ name            │
│ username        │   │   │ originalName    │   │   │ description     │
│ passwordHash    │   │   │ fileType        │   │   │ userId (FK)     │──┐
│ createdAt       │   │   │ mimeType        │   │   │ createdAt       │  │
│ updatedAt       │   │   │ fileSize        │   │   │ updatedAt       │  │
└─────────────────┘   │   │ storageUrl      │   │   └─────────────────┘  │
                      │   │ thumbnailUrl    │   │                         │
                      │   │ metadata        │   │   ┌─────────────────┐  │
                      │   │ tags[]          │   └───│  ProjectAsset   │  │
                      │   │ category        │       ├─────────────────┤  │
                      └───│ userId (FK)     │       │ id (PK)         │  │
                          │ promptId (FK)   │───┐   │ projectId (FK)  │──┘
                          │ createdAt       │   │   │ assetId (FK)    │──┐
                          │ updatedAt       │   │   │ addedAt         │  │
                          └─────────────────┘   │   └─────────────────┘  │
                                               │                         │
┌─────────────────┐       ┌─────────────────┐ │                         │
│     Prompt      │       │PromptExecution │ │                         │
├─────────────────┤       ├─────────────────┤ │                         │
│ id (PK)         │───┐   │ id (PK)         │ │                         │
│ title           │   │   │ promptId (FK)   │─┘                         │
│ content         │   │   │ status          │                           │
│ type            │   │   │ startedAt       │                           │
│ parameters      │   │   │ completedAt     │                           │
│ category        │   │   │ error           │                           │
│ usageCount      │   │   │ resultData      │                           │
│ successRate     │   │   └─────────────────┘                           │
│ userId (FK)     │──┐                                                   │
│ createdAt       │  │    ┌─────────────────┐                           │
│ updatedAt       │  │    │    AuditLog     │                           │
└─────────────────┘  │    ├─────────────────┤                           │
                     │    │ id (PK)         │                           │
                     │    │ action          │                           │
                     │    │ userId          │                           │
                     │    │ resourceId      │                           │
                     │    │ resourceType    │                           │
                     │    │ ipAddress       │                           │
                     │    │ userAgent       │                           │
                     │    │ metadata        │                           │
                     │    │ success         │                           │
                     │    │ errorMessage    │                           │
                     │    │ timestamp       │                           │
                     │    └─────────────────┘                           │
                     │                                                   │
                     └───────────────────────────────────────────────────┘
```

## テーブル定義

### 1. User (ユーザー)

ユーザーアカウント情報を管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | ユーザーID |
| email | String | UNIQUE, NOT NULL | メールアドレス |
| username | String | UNIQUE, NOT NULL | ユーザー名 |
| passwordHash | String | NOT NULL | パスワードハッシュ |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | DateTime | NOT NULL | 更新日時 |

### 2. Asset (アセット)

アップロードされたファイルとAI生成されたアセットを管理。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | アセットID |
| filename | String | NOT NULL | システム内でのファイル名 |
| originalName | String | NOT NULL | オリジナルファイル名 |
| fileType | Enum | NOT NULL | ファイルタイプ (IMAGE/AUDIO) |
| mimeType | String | NOT NULL | MIMEタイプ |
| fileSize | Integer | NOT NULL | ファイルサイズ（バイト） |
| storageUrl | String | NOT NULL | ストレージURL |
| thumbnailUrl | String | NULLABLE | サムネイルURL |
| metadata | JSON | NULLABLE | メタデータ（幅、高さ、長さ等） |
| tags | String[] | NOT NULL, DEFAULT [] | タグの配列 |
| category | String | NULLABLE | カテゴリ |
| userId | String | FOREIGN KEY | 所有者のユーザーID |
| promptId | String | FOREIGN KEY, NULLABLE | 生成元プロンプトID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | DateTime | NOT NULL | 更新日時 |

**metadata JSONの構造例:**
```json
{
  "width": 1920,
  "height": 1080,
  "duration": 120,
  "bitrate": 320000,
  "format": "png",
  "colorSpace": "sRGB"
}
```

### 3. Prompt (プロンプト)

AI生成用のプロンプトテンプレートを管理。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | プロンプトID |
| title | String | NOT NULL | タイトル |
| content | Text | NOT NULL | プロンプト内容 |
| type | Enum | NOT NULL | タイプ (IMAGE/AUDIO) |
| parameters | JSON | NULLABLE | デフォルトパラメータ |
| category | String | NULLABLE | カテゴリ |
| usageCount | Integer | NOT NULL, DEFAULT 0 | 使用回数 |
| successRate | Float | NOT NULL, DEFAULT 0 | 成功率 |
| userId | String | FOREIGN KEY | 作成者のユーザーID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | DateTime | NOT NULL | 更新日時 |

### 4. PromptExecution (プロンプト実行履歴)

プロンプトの実行履歴と結果を記録。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | 実行ID |
| promptId | String | FOREIGN KEY | プロンプトID |
| status | Enum | NOT NULL | ステータス |
| startedAt | DateTime | NOT NULL, DEFAULT NOW() | 開始日時 |
| completedAt | DateTime | NULLABLE | 完了日時 |
| error | String | NULLABLE | エラーメッセージ |
| resultData | JSON | NULLABLE | 実行結果データ |

### 5. Project (プロジェクト)

アセットを整理するためのプロジェクト。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | プロジェクトID |
| name | String | NOT NULL | プロジェクト名 |
| description | Text | NULLABLE | 説明 |
| userId | String | FOREIGN KEY | 所有者のユーザーID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | DateTime | NOT NULL | 更新日時 |

### 6. ProjectAsset (プロジェクト-アセット関連)

プロジェクトとアセットの多対多関係を管理。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | 関連ID |
| projectId | String | FOREIGN KEY | プロジェクトID |
| assetId | String | FOREIGN KEY | アセットID |
| addedAt | DateTime | NOT NULL, DEFAULT NOW() | 追加日時 |

**複合ユニーク制約**: (projectId, assetId)

### 7. AuditLog (監査ログ)

システム内の重要な操作を記録。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|----|------|
| id | String (CUID) | PRIMARY KEY | ログID |
| action | String | NOT NULL | アクション名 |
| userId | String | NULLABLE | 実行ユーザーID |
| resourceId | String | NULLABLE | 対象リソースID |
| resourceType | String | NULLABLE | リソースタイプ |
| ipAddress | String | NOT NULL | IPアドレス |
| userAgent | String | NULLABLE | ユーザーエージェント |
| metadata | JSON | NOT NULL, DEFAULT {} | 追加情報 |
| success | Boolean | NOT NULL | 成功/失敗 |
| errorMessage | String | NULLABLE | エラーメッセージ |
| timestamp | DateTime | NOT NULL, DEFAULT NOW() | タイムスタンプ |

## インデックス設計

### 効率的なクエリのためのインデックス

#### User テーブル
- `idx_user_email`: email（ユニークインデックス）
- `idx_user_username`: username（ユニークインデックス）

#### Asset テーブル
- `idx_asset_userId`: userId
- `idx_asset_fileType`: fileType
- `idx_asset_category`: category
- `idx_asset_tags`: tags（GINインデックス）
- `idx_asset_createdAt`: createdAt DESC
- `idx_asset_userId_createdAt`: (userId, createdAt DESC) - 複合インデックス
- `idx_asset_fileType_userId`: (fileType, userId) - 複合インデックス
- `idx_asset_promptId`: promptId

#### Prompt テーブル
- `idx_prompt_userId`: userId
- `idx_prompt_type`: type
- `idx_prompt_category`: category
- `idx_prompt_userId_createdAt`: (userId, createdAt DESC)
- `idx_prompt_type_userId`: (type, userId)
- `idx_prompt_usageCount`: usageCount DESC

#### PromptExecution テーブル
- `idx_execution_promptId`: promptId
- `idx_execution_status`: status
- `idx_execution_promptId_startedAt`: (promptId, startedAt DESC)
- `idx_execution_status_startedAt`: (status, startedAt DESC)

#### Project テーブル
- `idx_project_userId`: userId
- `idx_project_name`: name
- `idx_project_userId_createdAt`: (userId, createdAt DESC)
- `idx_project_userId_name`: (userId, name)

#### ProjectAsset テーブル
- `idx_projectasset_projectId`: projectId
- `idx_projectasset_assetId`: assetId
- `unique_project_asset`: (projectId, assetId) - ユニーク制約

#### AuditLog テーブル
- `idx_audit_userId`: userId
- `idx_audit_action`: action
- `idx_audit_timestamp`: timestamp
- `idx_audit_ipAddress`: ipAddress

## リレーションシップ

### 1対多の関係
- User → Assets: 1人のユーザーが複数のアセットを所有
- User → Prompts: 1人のユーザーが複数のプロンプトを作成
- User → Projects: 1人のユーザーが複数のプロジェクトを所有
- Prompt → Assets: 1つのプロンプトから複数のアセットが生成可能
- Prompt → PromptExecutions: 1つのプロンプトが複数回実行される

### 多対多の関係
- Projects ↔ Assets: ProjectAssetテーブルを介した多対多関係

### カスケード削除
- User削除時: 関連するAssets、Prompts、Projectsも削除
- Project削除時: ProjectAssetの関連レコードのみ削除（Assetは残る）
- Prompt削除時: AssetのpromptIdがNULLになる

## パフォーマンス最適化

### 1. クエリ最適化

**頻繁に実行されるクエリ**

```sql
-- ユーザーのアセット一覧取得（ページネーション付き）
SELECT * FROM "Asset" 
WHERE "userId" = ? 
ORDER BY "createdAt" DESC 
LIMIT 20 OFFSET ?;
-- インデックス: idx_asset_userId_createdAt

-- タグによるアセット検索
SELECT * FROM "Asset" 
WHERE "tags" @> ARRAY[?]::text[] 
AND "fileType" = ?;
-- インデックス: idx_asset_tags, idx_asset_fileType

-- プロジェクトのアセット取得
SELECT a.* FROM "Asset" a
INNER JOIN "ProjectAsset" pa ON a.id = pa."assetId"
WHERE pa."projectId" = ?;
-- インデックス: idx_projectasset_projectId
```

### 2. パーティショニング戦略

将来的な拡張として、以下のパーティショニングを検討：

- **Asset テーブル**: createdAt による月次パーティション
- **AuditLog テーブル**: timestamp による月次パーティション

### 3. 統計情報の最適化

```sql
-- テーブル統計の定期更新
ANALYZE "Asset";
ANALYZE "Prompt";
ANALYZE "ProjectAsset";

-- 自動バキューム設定
ALTER TABLE "Asset" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "AuditLog" SET (autovacuum_vacuum_scale_factor = 0.05);
```

## データ整合性

### 1. 制約

- **外部キー制約**: 全ての関連テーブル間で設定
- **ユニーク制約**: email、username、(projectId, assetId)
- **NOT NULL制約**: 必須フィールドに適用
- **CHECK制約**: fileSize > 0、successRate BETWEEN 0 AND 1

### 2. トランザクション管理

```typescript
// Prismaでのトランザクション例
await prisma.$transaction(async (tx) => {
  // アセット作成
  const asset = await tx.asset.create({ data: assetData });
  
  // プロンプト使用回数更新
  await tx.prompt.update({
    where: { id: promptId },
    data: { usageCount: { increment: 1 } }
  });
  
  // 実行履歴作成
  await tx.promptExecution.create({
    data: { promptId, status: 'COMPLETED' }
  });
});
```

### 3. データ検証

- アプリケーション層での入力検証
- データベース層での制約による二重チェック
- トリガーによる自動検証（必要に応じて）

## セキュリティ

### 1. アクセス制御

- **Row Level Security (RLS)**: ユーザーは自分のデータのみアクセス可能
- **カラムレベルの暗号化**: 機密情報の暗号化（将来実装）

### 2. 監査

- 全ての重要操作をAuditLogに記録
- 定期的な監査ログのレビュー
- 異常なアクセスパターンの検知

### 3. バックアップとリカバリ

- **定期バックアップ**: 日次フルバックアップ、時間ごとの増分バックアップ
- **Point-in-Time Recovery**: 任意の時点への復元が可能
- **レプリケーション**: 読み取り専用レプリカの設定

## メンテナンス

### 1. 定期的なタスク

- インデックスの再構築（月次）
- 統計情報の更新（週次）
- 古い監査ログの削除（90日経過後）
- パフォーマンス分析とチューニング

### 2. モニタリング

監視すべきメトリクス：
- クエリ実行時間
- デッドロック発生率
- テーブルサイズの増加率
- インデックス使用率

### 3. スケーリング計画

- 垂直スケーリング: CPU、メモリの増強
- 水平スケーリング: 読み取りレプリカの追加
- シャーディング: userId によるシャーディング（将来検討）

---

最終更新: 2025-07-28