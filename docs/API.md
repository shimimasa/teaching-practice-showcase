# API Documentation

Teaching Practice Showcase API仕様書

## 基本情報

- **ベースURL**: `http://localhost:5000/api` (開発環境)
- **認証方式**: JWT (JSON Web Token)
- **コンテンツタイプ**: `application/json`

## 共通レスポンス形式

### 成功レスポンス
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  }
}
```

### エラーレスポンス
```json
{
  "success": false,
  "error": {
    "message": "エラーメッセージ",
    "code": "ERROR_CODE"
  }
}
```

## 認証

### ユーザー登録

**エンドポイント**: `POST /auth/register`

**リクエストボディ**:
```json
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "password": "securePassword123"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "山田太郎",
      "email": "yamada@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### ログイン

**エンドポイント**: `POST /auth/login`

**リクエストボディ**:
```json
{
  "email": "yamada@example.com",
  "password": "securePassword123"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user123",
      "name": "山田太郎",
      "email": "yamada@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### ログアウト

**エンドポイント**: `POST /auth/logout`

**ヘッダー**:
```
Authorization: Bearer {token}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": "ログアウトしました"
  }
}
```

## 授業実践

### 実践一覧取得

**エンドポイント**: `GET /practices`

**クエリパラメータ**:
- `page`: ページ番号 (デフォルト: 1)
- `limit`: 1ページあたりの件数 (デフォルト: 10, 最大: 100)
- `subject`: 科目でフィルタ
- `gradeLevel`: 学年でフィルタ
- `learningLevel`: 学習レベルでフィルタ (basic, standard, advanced)
- `search`: キーワード検索

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "practices": [
      {
        "id": "practice123",
        "title": "分数の導入授業",
        "description": "視覚的な教材を使った分数の基本概念の説明",
        "subject": "算数",
        "gradeLevel": "小3",
        "learningLevel": "basic",
        "images": ["image1.jpg", "image2.jpg"],
        "documents": ["worksheet.pdf"],
        "userId": "user123",
        "user": {
          "name": "山田太郎"
        },
        "specialNeeds": false,
        "averageRating": 4.5,
        "ratingsCount": 10,
        "commentsCount": 5,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 実践詳細取得

**エンドポイント**: `GET /practices/:id`

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "practice": {
      "id": "practice123",
      "title": "分数の導入授業",
      "description": "視覚的な教材を使った分数の基本概念の説明",
      "subject": "算数",
      "gradeLevel": "小3",
      "learningLevel": "basic",
      "objectives": "分数の基本概念を理解する",
      "materials": "分数カード、ピザの模型",
      "procedure": "1. 導入: ピザを使った説明\n2. 展開: 分数カードでの練習\n3. まとめ: 理解度確認",
      "evaluation": "ワークシートでの確認問題",
      "images": ["image1.jpg", "image2.jpg"],
      "documents": ["worksheet.pdf"],
      "videoUrl": "https://example.com/video.mp4",
      "specialNeeds": true,
      "specialNeedsDetails": "視覚的支援が必要な生徒には、より大きな教材を使用",
      "userId": "user123",
      "user": {
        "id": "user123",
        "name": "山田太郎",
        "email": "yamada@example.com"
      },
      "averageRating": 4.5,
      "ratingsCount": 10,
      "comments": [
        {
          "id": "comment123",
          "content": "とても参考になりました",
          "userId": "user456",
          "user": {
            "name": "佐藤花子"
          },
          "createdAt": "2025-01-16T10:00:00Z"
        }
      ],
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### 実践作成

**エンドポイント**: `POST /practices`

**ヘッダー**:
```
Authorization: Bearer {token}
```

**リクエストボディ**:
```json
{
  "title": "分数の導入授業",
  "description": "視覚的な教材を使った分数の基本概念の説明",
  "subject": "算数",
  "gradeLevel": "小3",
  "learningLevel": "basic",
  "objectives": "分数の基本概念を理解する",
  "materials": "分数カード、ピザの模型",
  "procedure": "1. 導入: ピザを使った説明\n2. 展開: 分数カードでの練習\n3. まとめ: 理解度確認",
  "evaluation": "ワークシートでの確認問題",
  "images": ["image1.jpg", "image2.jpg"],
  "documents": ["worksheet.pdf"],
  "videoUrl": "https://example.com/video.mp4",
  "specialNeeds": true,
  "specialNeedsDetails": "視覚的支援が必要な生徒には、より大きな教材を使用"
}
```

### 実践更新

**エンドポイント**: `PUT /practices/:id`

**ヘッダー**:
```
Authorization: Bearer {token}
```

**リクエストボディ**: 作成時と同じ（更新したいフィールドのみ送信可）

### 実践削除

**エンドポイント**: `DELETE /practices/:id`

**ヘッダー**:
```
Authorization: Bearer {token}
```

## コメント

### コメント投稿

**エンドポイント**: `POST /comments`

**ヘッダー**:
```
Authorization: Bearer {token}
```

**リクエストボディ**:
```json
{
  "practiceId": "practice123",
  "content": "とても参考になりました。私も同じような方法で授業を行っています。"
}
```

### コメント削除

**エンドポイント**: `DELETE /comments/:id`

**ヘッダー**:
```
Authorization: Bearer {token}
```

## 評価

### 評価投稿

**エンドポイント**: `POST /ratings`

**ヘッダー**:
```
Authorization: Bearer {token}
```

**リクエストボディ**:
```json
{
  "practiceId": "practice123",
  "rating": 5
}
```

## 連絡

### 連絡送信

**エンドポイント**: `POST /contacts`

**リクエストボディ**:
```json
{
  "practiceId": "practice123",
  "name": "問い合わせ者名",
  "email": "contact@example.com",
  "subject": "教材について質問があります",
  "message": "この授業で使用されている分数カードについて詳しく教えていただけますか？"
}
```

## ファイルアップロード

### 画像アップロード

**エンドポイント**: `POST /admin/upload/image`

**ヘッダー**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**リクエストボディ**:
- `file`: 画像ファイル（最大5MB、jpg/jpeg/png/gif）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "filename": "uploaded-image-123456.jpg",
    "url": "/uploads/images/uploaded-image-123456.jpg"
  }
}
```

### ドキュメントアップロード

**エンドポイント**: `POST /admin/upload/document`

**ヘッダー**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**リクエストボディ**:
- `file`: ドキュメントファイル（最大10MB、pdf/doc/docx）

## レート制限

- 一般APIエンドポイント: 15分間に100リクエストまで
- 認証エンドポイント（login/register）: 15分間に5リクエストまで

レート制限に達した場合、以下のレスポンスが返されます：

```json
{
  "success": false,
  "error": {
    "message": "リクエストが多すぎます。しばらくしてから再度お試しください。",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

## エラーコード

| コード | 説明 |
|--------|------|
| `UNAUTHORIZED` | 認証が必要です |
| `FORBIDDEN` | アクセス権限がありません |
| `NOT_FOUND` | リソースが見つかりません |
| `VALIDATION_ERROR` | 入力値が不正です |
| `RATE_LIMIT_EXCEEDED` | レート制限を超えました |
| `INTERNAL_ERROR` | サーバーエラー |