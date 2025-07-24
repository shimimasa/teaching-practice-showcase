'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ContactFormData {
  parentName: string;
  parentEmail: string;
  childAge: string;
  message: string;
}

export default function ContactPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ContactFormData>({
    parentName: '',
    parentEmail: '',
    childAge: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practiceId: params.id,
          parentName: formData.parentName,
          parentEmail: formData.parentEmail,
          childAge: parseInt(formData.childAge),
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '送信に失敗しました');
      }

      setSuccess(true);
      // 3秒後に授業実践詳細ページに戻る
      setTimeout(() => {
        router.push(`/practices/${params.id}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-green-800 mb-2">
            送信が完了しました
          </h2>
          <p className="text-green-700">
            教育者に連絡内容が送信されました。<br />
            3秒後に自動的に戻ります...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/practices/${params.id}`}
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← 授業実践詳細に戻る
      </Link>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">教育者への連絡</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
              保護者のお名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-2">
              お子様の年齢 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="childAge"
              name="childAge"
              value={formData.childAge}
              onChange={handleChange}
              required
              min="6"
              max="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
            <p className="mt-1 text-sm text-gray-500">6歳から15歳まで</p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              maxLength={2000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="お子様の学習状況や、興味のある内容についてお聞かせください..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.message.length}/2000文字
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">送信中...</span>
                </span>
              ) : (
                '送信する'
              )}
            </button>
            <Link
              href={`/practices/${params.id}`}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}