# API 使用例

このドキュメントでは、Game Asset Manager APIの具体的な使用例を示します。

## 目次

1. [認証フロー](#認証フロー)
2. [アセット管理](#アセット管理)
3. [AI生成](#ai生成)
4. [プロンプト管理](#プロンプト管理)
5. [プロジェクト管理](#プロジェクト管理)
6. [エクスポート](#エクスポート)
7. [エラーハンドリング](#エラーハンドリング)

## 基本設定

すべての例で以下の基本設定を使用します：

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
let accessToken = '';
let refreshToken = '';
```

## 認証フロー

### ユーザー登録

```bash
curl -X POST ${API_BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "username": "gamedev"
  }'
```

**JavaScript (Axios):**
```javascript
const register = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'user@example.com',
      password: 'SecurePass123!',
      username: 'gamedev'
    });
    
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    console.log('Registration successful:', response.data.user);
  } catch (error) {
    console.error('Registration failed:', error.response.data);
  }
};
```

**レスポンス例:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "gamedev",
    "createdAt": "2025-01-28T10:00:00Z",
    "updatedAt": "2025-01-28T10:00:00Z"
  }
}
```

### ログイン

```bash
curl -X POST ${API_BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### トークンリフレッシュ

```javascript
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    accessToken = response.data.accessToken;
    // 新しいリフレッシュトークンも返される場合がある
    if (response.data.refreshToken) {
      refreshToken = response.data.refreshToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    // ログイン画面にリダイレクト
  }
};
```

## アセット管理

### アセットのアップロード

**HTML フォーム:**
```html
<form id="uploadForm" enctype="multipart/form-data">
  <input type="file" name="file" accept="image/*,audio/*" required>
  <input type="text" name="tags" placeholder="タグ（カンマ区切り）">
  <select name="category">
    <option value="characters">キャラクター</option>
    <option value="backgrounds">背景</option>
    <option value="ui">UI</option>
    <option value="sfx">効果音</option>
    <option value="bgm">BGM</option>
  </select>
  <button type="submit">アップロード</button>
</form>
```

**JavaScript:**
```javascript
const uploadAsset = async (formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/assets`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );
    
    console.log('Asset uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response.data);
  }
};

// フォーム送信処理
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  // タグを配列に変換
  const tags = formData.get('tags').split(',').map(tag => tag.trim());
  formData.delete('tags');
  tags.forEach(tag => formData.append('tags', tag));
  
  await uploadAsset(formData);
});
```

### アセット一覧の取得（ページネーション付き）

```javascript
const getAssets = async (page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...filters
    });
    
    const response = await axios.get(
      `${API_BASE_URL}/assets?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    console.log(`Found ${response.data.pagination.total} assets`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch assets:', error);
  }
};

// 使用例
const assets = await getAssets(1, {
  fileType: 'image',
  category: 'characters',
  tags: ['hero', 'sprite']
});
```

### アセットの検索

```javascript
const searchAssets = async (query) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/assets/search`,
      {
        params: {
          q: query,
          fileType: 'image'
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return response.data.results;
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### アセットの更新

```javascript
const updateAsset = async (assetId, updates) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/assets/${assetId}`,
      updates,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Asset updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update failed:', error);
  }
};

// 使用例
await updateAsset('asset-id-123', {
  tags: ['hero', 'warrior', 'player'],
  category: 'characters'
});
```

## AI生成

### 画像生成

```javascript
const generateImage = async (prompt, parameters = {}) => {
  try {
    // 生成開始
    const response = await axios.post(
      `${API_BASE_URL}/generate/image`,
      {
        prompt: prompt,
        type: 'image',
        parameters: {
          style: 'digital art',
          quality: 'high',
          ...parameters
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const jobId = response.data.jobId;
    console.log('Generation started, job ID:', jobId);
    
    // 進行状況を監視
    return await pollGenerationStatus(jobId);
  } catch (error) {
    console.error('Generation failed:', error);
  }
};

// 生成状況のポーリング
const pollGenerationStatus = async (jobId) => {
  const maxAttempts = 60; // 最大5分待機
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/generate/status/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const status = response.data;
      console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
      
      if (status.status === 'completed') {
        console.log('Generation completed:', status.result);
        return status.result;
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'Generation failed');
      }
      
      // 5秒待機して再試行
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }
  
  throw new Error('Generation timeout');
};

// 使用例
const result = await generateImage(
  'A brave knight in shining armor standing in a mystical forest',
  {
    style: 'fantasy art',
    quality: 'high'
  }
);
```

### 音声生成

```javascript
const generateAudio = async (prompt, duration = 60) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/generate/audio`,
      {
        prompt: prompt,
        type: 'audio',
        parameters: {
          duration: duration
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await pollGenerationStatus(response.data.jobId);
  } catch (error) {
    console.error('Audio generation failed:', error);
  }
};
```

## プロンプト管理

### プロンプトの保存

```javascript
const savePrompt = async (promptData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/prompts`,
      {
        title: promptData.title,
        content: promptData.content,
        type: promptData.type,
        parameters: promptData.parameters,
        category: promptData.category
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Prompt saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to save prompt:', error);
  }
};

// 使用例
const savedPrompt = await savePrompt({
  title: 'ファンタジーヒーロー',
  content: 'A heroic fantasy character with magical powers',
  type: 'image',
  parameters: {
    style: 'digital art',
    quality: 'high'
  },
  category: 'character'
});
```

### プロンプトの実行

```javascript
const executePrompt = async (promptId, overrideParams = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/prompts/${promptId}/execute`,
      {
        parameters: overrideParams
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return await pollGenerationStatus(response.data.jobId);
  } catch (error) {
    console.error('Prompt execution failed:', error);
  }
};
```

## プロジェクト管理

### プロジェクトの作成と管理

```javascript
// プロジェクト作成
const createProject = async (name, description) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects`,
      {
        name: name,
        description: description
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Project created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create project:', error);
  }
};

// アセットをプロジェクトに追加
const addAssetsToProject = async (projectId, assetIds) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${projectId}/assets`,
      {
        assetIds: assetIds
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Assets added to project');
    return response.data;
  } catch (error) {
    console.error('Failed to add assets:', error);
  }
};

// プロジェクトの詳細取得（アセット含む）
const getProjectWithAssets = async (projectId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to get project:', error);
  }
};
```

## エクスポート

### 選択したアセットのエクスポート

```javascript
const exportAssets = async (assetIds, options = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/export`,
      {
        assetIds: assetIds,
        format: 'zip',
        options: {
          imageFormat: 'webp',
          imageQuality: 85,
          audioFormat: 'mp3',
          audioBitrate: 192,
          includeMetadata: true,
          ...options
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Export ready:', response.data.downloadUrl);
    
    // ダウンロードを開始
    window.open(response.data.downloadUrl, '_blank');
    
    return response.data;
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

### プロジェクト全体のエクスポート

```javascript
const exportProject = async (projectId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/export/project/${projectId}`,
      {
        format: 'zip',
        options: {
          includeMetadata: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Project export failed:', error);
  }
};
```

## エラーハンドリング

### 統一的なエラーハンドリング

```javascript
// Axios インターセプターの設定
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 401エラー（認証エラー）の場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // トークンをリフレッシュ
        await refreshAccessToken();
        
        // 新しいトークンでリトライ
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // リフレッシュも失敗したらログイン画面へ
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // 429エラー（レート制限）の場合
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      console.error(`Rate limited. Retry after ${retryAfter} seconds`);
      
      // UIにエラーメッセージを表示
      showErrorMessage(`リクエストが多すぎます。${retryAfter}秒後に再試行してください。`);
    }
    
    // その他のエラー
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      console.error(`API Error [${errorData.code}]: ${errorData.message}`);
      
      // エラーコードに応じた処理
      switch (errorData.code) {
        case 'FILE_TOO_LARGE':
          showErrorMessage('ファイルサイズが大きすぎます');
          break;
        case 'INVALID_FILE_TYPE':
          showErrorMessage('サポートされていないファイル形式です');
          break;
        case 'INSUFFICIENT_CREDITS':
          showErrorMessage('AI生成クレジットが不足しています');
          break;
        default:
          showErrorMessage(errorData.message || 'エラーが発生しました');
      }
    }
    
    return Promise.reject(error);
  }
);
```

### リトライロジック

```javascript
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // エクスポネンシャルバックオフ
      const waitTime = delay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// 使用例
const result = await retryWithBackoff(
  () => generateImage('A fantasy landscape'),
  3,
  2000
);
```

## 完全な実装例

### React コンポーネントでの使用

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssetManager = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchAssets();
  }, [page]);
  
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets`,
        {
          params: {
            page: page,
            limit: 20
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      setAssets(response.data.assets);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/assets`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${progress}%`);
          }
        }
      );
      
      // 新しいアセットをリストに追加
      setAssets([response.data, ...assets]);
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Upload failed');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Asset Manager</h1>
      
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        accept="image/*,audio/*"
      />
      
      <div className="asset-grid">
        {assets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
      
      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

最終更新: 2025-07-28