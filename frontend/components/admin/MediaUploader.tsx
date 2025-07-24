'use client';

import { useState, useRef } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

interface MediaUploaderProps {
  practiceId?: string;
  onUpload?: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  onRemove?: (fileId: string) => void;
}

export default function MediaUploader({ 
  practiceId, 
  onUpload, 
  existingFiles = [],
  onRemove 
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 許可されるファイルタイプ
  const acceptedTypes = {
    'image/*': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'application/pdf': ['application/pdf'],
    'video/*': ['video/mp4', 'video/webm', 'video/quicktime'],
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    // ファイルタイプチェック
    const acceptedMimeTypes = Object.values(acceptedTypes).flat();
    if (!acceptedMimeTypes.includes(file.type)) {
      return 'サポートされていないファイル形式です';
    }

    // ファイルサイズチェック
    if (file.size > maxFileSize) {
      return 'ファイルサイズは50MB以下にしてください';
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // ファイルバリデーション
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    if (validFiles.length === 0) return;

    // アップロード処理
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: UploadedFile[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        if (practiceId) {
          formData.append('practiceId', practiceId);
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'アップロードに失敗しました');
        }

        const uploadedFile = await response.json();
        uploadedFiles.push(uploadedFile);

        // プログレス更新
        setUploadProgress(((i + 1) / validFiles.length) * 100);
      }

      if (onUpload) {
        onUpload(uploadedFiles);
      }

      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async (fileId: string) => {
    if (!confirm('このファイルを削除してもよろしいですか？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/media/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      if (onRemove) {
        onRemove(fileId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.startsWith('video/')) return '🎥';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* アップロードエリア */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.keys(acceptedTypes).join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}
        >
          {uploading ? (
            <div>
              <LoadingSpinner size="md" />
              <p className="mt-2 text-sm text-gray-600">
                アップロード中... {uploadProgress.toFixed(0)}%
              </p>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                クリックしてファイルを選択
              </p>
              <p className="text-xs text-gray-500 mt-1">
                画像、PDF、動画（最大50MB）
              </p>
            </div>
          )}
        </label>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* アップロード済みファイル一覧 */}
      {existingFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            アップロード済みファイル
          </h4>
          <div className="space-y-2">
            {existingFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center flex-1">
                  <span className="text-2xl mr-3">{getFileIcon(file.mimeType)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    表示
                  </a>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => handleRemove(file.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}