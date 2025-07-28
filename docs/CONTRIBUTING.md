# 開発者ガイド (Contributing Guide)

## 目次

1. [はじめに](#はじめに)
2. [開発環境のセットアップ](#開発環境のセットアップ)
3. [開発ワークフロー](#開発ワークフロー)
4. [コーディング規約](#コーディング規約)
5. [テスト戦略](#テスト戦略)
6. [コミットガイドライン](#コミットガイドライン)
7. [プルリクエスト](#プルリクエスト)
8. [コードレビュー](#コードレビュー)
9. [リリースプロセス](#リリースプロセス)

## はじめに

ゲーム開発用アセット管理・生成サービスへの貢献をありがとうございます！このガイドは、プロジェクトに貢献する際の手順とベストプラクティスを説明します。

### 貢献の方法

- バグ報告
- 機能提案
- ドキュメントの改善
- コードの貢献
- テストの追加
- パフォーマンスの改善

## 開発環境のセットアップ

### 前提条件

- Node.js v18以上
- Docker Desktop
- Git
- VS Code（推奨）

### 初期セットアップ

1. **リポジトリのフォーク**
```bash
# GitHubでフォークを作成
# フォークしたリポジトリをクローン
git clone https://github.com/YOUR_USERNAME/game-asset-manager.git
cd game-asset-manager

# アップストリームの設定
git remote add upstream https://github.com/original-org/game-asset-manager.git
```

2. **開発環境の構築**
```bash
# Docker環境の起動
docker-compose up -d

# バックエンドセットアップ
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed

# フロントエンドセットアップ
cd ../frontend
npm install
```

3. **VS Code拡張機能のインストール**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "firsttris.vscode-jest-runner",
    "mikestead.dotenv",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### 開発用スクリプト

```bash
# 開発サーバーの起動
npm run dev:all        # バックエンド + フロントエンド同時起動

# テストの実行
npm run test:all       # 全テスト実行
npm run test:watch     # ウォッチモード

# コード品質チェック
npm run lint:all       # ESLint実行
npm run format:all     # Prettier実行
npm run type-check     # TypeScriptチェック
```

## 開発ワークフロー

### Git ブランチ戦略

```
main
 ├── develop
 │    ├── feature/add-new-export-format
 │    ├── feature/improve-search-performance
 │    ├── fix/upload-error-handling
 │    └── chore/update-dependencies
 └── hotfix/critical-security-fix
```

### ブランチ命名規則

- `feature/*` - 新機能
- `fix/*` - バグ修正
- `chore/*` - 雑務（依存関係更新など）
- `docs/*` - ドキュメント更新
- `refactor/*` - リファクタリング
- `test/*` - テスト追加・修正
- `perf/*` - パフォーマンス改善

### 開発フロー

1. **Issue の作成または選択**
```markdown
# Issue テンプレート
## 概要
機能/バグの簡潔な説明

## 期待される動作
どのように動作すべきか

## 現在の動作
現在どのように動作しているか

## 再現手順
1. 手順1
2. 手順2
3. ...

## 環境
- OS: 
- ブラウザ: 
- Node.js: 
```

2. **ブランチの作成**
```bash
# 最新のdevelopを取得
git checkout develop
git pull upstream develop

# 新しいブランチを作成
git checkout -b feature/your-feature-name
```

3. **開発とテスト**
```bash
# 開発中は定期的にコミット
git add .
git commit -m "feat: add asset tagging functionality"

# テストの実行
npm test

# developからの最新変更を取り込む
git fetch upstream
git rebase upstream/develop
```

## コーディング規約

### TypeScript スタイルガイド

```typescript
// ✅ Good: 明確な型定義
interface AssetData {
  id: string;
  filename: string;
  fileType: 'image' | 'audio';
  tags: string[];
  metadata: AssetMetadata;
}

// ❌ Bad: any型の使用
function processAsset(data: any) {
  // ...
}

// ✅ Good: 適切なエラーハンドリング
async function uploadAsset(file: File): Promise<Asset> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<Asset>('/assets', formData);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new UploadError(error.message, error.code);
    }
    throw new UnexpectedError('Failed to upload asset');
  }
}

// ✅ Good: 関数の単一責任原則
function validateFileType(file: File): void {
  const allowedTypes = ['image/png', 'image/jpeg', 'audio/mp3'];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(`File type ${file.type} is not allowed`);
  }
}

function validateFileSize(file: File, maxSize: number): void {
  if (file.size > maxSize) {
    throw new ValidationError(`File size exceeds ${maxSize} bytes`);
  }
}
```

### React コンポーネント規約

```tsx
// ✅ Good: 関数コンポーネントとTypeScript
interface AssetCardProps {
  asset: Asset;
  onDelete?: (id: string) => void;
  className?: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, 
  onDelete,
  className 
}) => {
  const handleDelete = useCallback(() => {
    onDelete?.(asset.id);
  }, [asset.id, onDelete]);

  return (
    <Card className={className}>
      {/* コンポーネント内容 */}
    </Card>
  );
};

// ✅ Good: カスタムフックの抽出
function useAssetUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const asset = await uploadAsset(file);
      return asset;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);
  
  return { upload, isUploading, error };
}
```

### API 設計規約

```typescript
// ✅ Good: RESTful なエンドポイント設計
router.get('/api/assets', authenticate, getAssets);
router.get('/api/assets/:id', authenticate, getAsset);
router.post('/api/assets', authenticate, upload.single('file'), createAsset);
router.put('/api/assets/:id', authenticate, updateAsset);
router.delete('/api/assets/:id', authenticate, deleteAsset);

// ✅ Good: 一貫したレスポンス形式
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// ✅ Good: 適切なHTTPステータスコード
export const createAsset = async (req: Request, res: Response) => {
  try {
    const asset = await assetService.create(req.file, req.body);
    res.status(201).json({
      success: true,
      data: asset
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  }
};
```

### ファイル・フォルダ構造

```
backend/src/
├── config/          # 設定ファイル
├── controllers/     # HTTPリクエストハンドラ
├── services/        # ビジネスロジック
├── repositories/    # データアクセス層
├── middleware/      # Express ミドルウェア
├── utils/          # ユーティリティ関数
├── types/          # TypeScript型定義
├── validators/     # 入力検証
└── workers/        # バックグラウンドジョブ

frontend/src/
├── components/     # UIコンポーネント
│   ├── common/    # 共通コンポーネント
│   └── features/  # 機能別コンポーネント
├── hooks/         # カスタムフック
├── services/      # API通信
├── contexts/      # React Context
├── types/         # TypeScript型定義
├── utils/         # ユーティリティ関数
└── styles/        # グローバルスタイル
```

## テスト戦略

### テストピラミッド

```
         /\
        /  \    E2Eテスト (10%)
       /    \   - 主要なユーザーフロー
      /──────\  - クリティカルパス
     /        \ 
    /          \ 統合テスト (30%)
   /            \- APIエンドポイント
  /              \- サービス層
 /────────────────\
/                  \ ユニットテスト (60%)
                     - ユーティリティ関数
                     - ビジネスロジック
                     - コンポーネント
```

### ユニットテスト

```typescript
// asset.service.test.ts
describe('AssetService', () => {
  let assetService: AssetService;
  let mockRepository: jest.Mocked<AssetRepository>;
  
  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    assetService = new AssetService(mockRepository);
  });
  
  describe('create', () => {
    it('should create a new asset with valid data', async () => {
      const fileData = {
        filename: 'test.png',
        mimeType: 'image/png',
        size: 1024
      };
      
      const expectedAsset = {
        id: '123',
        ...fileData,
        createdAt: new Date()
      };
      
      mockRepository.create.mockResolvedValue(expectedAsset);
      
      const result = await assetService.create(fileData);
      
      expect(result).toEqual(expectedAsset);
      expect(mockRepository.create).toHaveBeenCalledWith(fileData);
    });
    
    it('should throw ValidationError for invalid file type', async () => {
      const fileData = {
        filename: 'test.exe',
        mimeType: 'application/exe',
        size: 1024
      };
      
      await expect(assetService.create(fileData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### 統合テスト

```typescript
// assets.api.test.ts
describe('Assets API', () => {
  let app: Application;
  let authToken: string;
  
  beforeAll(async () => {
    app = createApp();
    await setupTestDatabase();
    authToken = await getTestAuthToken();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /api/assets', () => {
    it('should upload a new asset', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'test/fixtures/sample.png')
        .field('tags', 'test,sample')
        .expect(201);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          filename: expect.any(String),
          originalName: 'sample.png',
          fileType: 'image',
          tags: ['test', 'sample']
        }
      });
    });
  });
});
```

### E2Eテスト

```typescript
// asset-upload.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Asset Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page, 'test@example.com', 'password');
  });
  
  test('should upload an image asset', async ({ page }) => {
    await page.click('text=Assets');
    await page.click('text=Upload New');
    
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('test/fixtures/sample.png');
    
    await page.fill('input[name="tags"]', 'character, sprite');
    await page.selectOption('select[name="category"]', 'characters');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Upload successful')).toBeVisible();
    await expect(page.locator('img[alt="sample.png"]')).toBeVisible();
  });
});
```

## コミットガイドライン

### Conventional Commits

フォーマット: `<type>(<scope>): <subject>`

```bash
# ✅ Good examples
feat(assets): add bulk upload functionality
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
style(ui): improve responsive layout
refactor(services): extract file validation logic
perf(search): optimize database queries
test(e2e): add asset management tests
chore(deps): update dependencies

# ❌ Bad examples
Fixed bug
Update code
WIP
```

### コミットタイプ

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマットなど）
- `refactor`: バグ修正や機能追加を伴わないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加や修正
- `chore`: ビルドプロセスやツールの変更

### コミットメッセージの書き方

```bash
# 詳細な説明が必要な場合
git commit -m "feat(assets): add bulk upload functionality

- Add drag-and-drop support for multiple files
- Implement progress tracking for each file
- Add validation for file types and sizes
- Update UI to show upload queue

Closes #123"
```

## プルリクエスト

### PRテンプレート

```markdown
## 概要
このPRで実装した内容の簡潔な説明

## 変更内容
- [ ] 機能A の実装
- [ ] バグB の修正
- [ ] テストの追加

## 変更の種類
- [ ] Bug fix (非破壊的変更)
- [ ] New feature (非破壊的変更)
- [ ] Breaking change (既存機能に影響)
- [ ] Documentation update

## テスト
- [ ] ユニットテストを追加/更新
- [ ] 統合テストを追加/更新
- [ ] E2Eテストを追加/更新
- [ ] 手動テストを実施

## チェックリスト
- [ ] コードが自己文書化されている
- [ ] 必要なドキュメントを更新した
- [ ] 変更がlintルールに準拠している
- [ ] 依存関係の変更がある場合、その理由を説明した

## スクリーンショット（UIの変更がある場合）
変更前:
変更後:

## 関連Issue
Closes #(issue番号)
```

### PRのサイズ

- 小さく保つ（理想: 200-400行以内）
- 1つのPRで1つの機能/修正
- 大きな機能は複数のPRに分割

## コードレビュー

### レビュアーのガイドライン

1. **建設的なフィードバック**
```markdown
// ✅ Good
"このロジックを別関数に抽出すると、テストが書きやすくなり再利用性も向上します。
例: `validateAndTransformInput` のような関数を作成してはどうでしょうか？"

// ❌ Bad
"このコードは読みにくい"
```

2. **セキュリティチェック**
- 入力検証
- 認証・認可
- SQLインジェクション対策
- XSS対策

3. **パフォーマンスチェック**
- N+1クエリ問題
- 不要な再レンダリング
- メモリリーク

### レビューを受ける側のガイドライン

1. **自己レビュー**: PR作成前に自分でレビュー
2. **コンテキストの提供**: 変更の背景を説明
3. **フィードバックへの対応**: 建設的に議論

## リリースプロセス

### バージョニング

セマンティックバージョニング（SemVer）を使用:
- `MAJOR.MINOR.PATCH` (例: 1.2.3)
- MAJOR: 破壊的変更
- MINOR: 後方互換性のある機能追加
- PATCH: 後方互換性のあるバグ修正

### リリースフロー

1. **リリースブランチの作成**
```bash
git checkout -b release/v1.2.0 develop
```

2. **バージョン更新**
```bash
# package.jsonのバージョン更新
npm version minor

# CHANGELOGの更新
npm run changelog
```

3. **テストとビルド**
```bash
npm run test:all
npm run build:all
```

4. **マージとタグ付け**
```bash
# developへマージ
git checkout develop
git merge --no-ff release/v1.2.0

# mainへマージ
git checkout main
git merge --no-ff release/v1.2.0

# タグ付け
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags
```

### CHANGELOG の管理

```markdown
# Changelog

## [1.2.0] - 2025-01-28

### Added
- Bulk asset upload functionality (#123)
- AI prompt templates (#124)

### Changed
- Improved search performance by 50% (#125)
- Updated UI for better mobile experience (#126)

### Fixed
- Fixed memory leak in image processing (#127)
- Resolved authentication timeout issue (#128)

### Security
- Updated dependencies to patch vulnerabilities (#129)
```

## その他のリソース

- [プロジェクトのWiki](https://github.com/your-org/game-asset-manager/wiki)
- [API ドキュメント](http://localhost:3000/api-docs)
- [アーキテクチャ設計書](./ARCHITECTURE.md)
- [トラブルシューティングガイド](./TROUBLESHOOTING.md)

質問がある場合は、GitHubのDiscussionsまたはSlackチャンネルでお気軽にお問い合わせください。

Happy Coding! 🚀

---

最終更新: 2025-07-28