'use client';

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface CommentFormProps {
  practiceId: string;
  onCommentAdded?: () => void;
}

export default function CommentForm({ practiceId, onCommentAdded }: CommentFormProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practiceId,
          name,
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'コメントの投稿に失敗しました');
      }

      // フォームをリセット
      setName('');
      setContent('');
      setSuccess(true);

      // 3秒後に成功メッセージを消す
      setTimeout(() => setSuccess(false), 3000);

      // 親コンポーネントに通知
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">コメントを投稿</h3>
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-700 text-sm">コメントを投稿しました</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            コメント <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            maxLength={1000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="授業実践についてのご感想やご質問をお書きください..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {content.length}/1000文字
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">投稿中...</span>
            </span>
          ) : (
            'コメントを投稿'
          )}
        </button>
      </form>
    </div>
  );
}