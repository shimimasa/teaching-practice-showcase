# Render手動デプロイ手順（修正版）

## 🔧 Renderでの設定手順

### 1. Web Serviceの設定を更新

Renderのダッシュボードで以下の設定を**正確に**入力してください：

#### Build Command（重要！）
```
npm run render-build
```

#### Start Command
```
npm start
```

#### Root Directory
**空欄のまま**（backendと入力しない）

### 2. 環境変数の再確認

Environment Variablesタブで以下が設定されているか確認：

```
DATABASE_URL = （PostgreSQLのInternal Database URL）
JWT_SECRET = （ランダムな文字列）
PORT = 5000
NODE_ENV = production
FRONTEND_URL = （後でVercelのURLを設定）
```

### 3. 再デプロイ

1. 設定を保存
2. 「Manual Deploy」→「Clear build cache & deploy」をクリック
3. ビルドログを確認

### 4. よくあるエラーと対処法

#### "Cannot find module" エラーの場合
- Build Commandが正しく設定されているか確認
- Root Directoryが空欄になっているか確認

#### ビルドは成功するが起動しない場合
- Start Commandが`npm start`になっているか確認
- 環境変数が全て設定されているか確認

### 5. 成功の確認方法

デプロイが成功すると：
- ステータスが「Live」になる
- URLにアクセスすると「Cannot GET /」と表示される（これは正常）
- `/api/health`にアクセスすると`{"status":"OK"}`が表示される

## 📝 重要な注意点

- **Root Directoryは空欄**にする（backendフォルダは自動で認識されます）
- **Build Commandは`npm run render-build`**を使用
- キャッシュクリアが必要な場合があります