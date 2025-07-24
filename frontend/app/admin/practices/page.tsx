'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Practice {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  isPublished: boolean;
  createdAt: string;
  _count: {
    comments: number;
    ratings: number;
  };
}

export default function AdminPracticesPage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPractices();
  }, []);

  const fetchPractices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/practices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('授業実践の取得に失敗しました');
      }

      const data = await response.json();
      setPractices(data.practices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この授業実践を削除してもよろしいですか？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/practices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // リストから削除
      setPractices(practices.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">授業実践管理</h2>
            <p className="mt-1 text-sm text-gray-600">
              作成した授業実践を管理できます
            </p>
          </div>
          <Link
            href="/admin/practices/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            新規作成
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" message="読み込み中..." />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {practices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">まだ授業実践がありません</p>
                <Link
                  href="/admin/practices/new"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  最初の授業実践を作成する
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {practices.map(practice => (
                  <li key={practice.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {practice.title}
                            </h3>
                            {practice.isPublished ? (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                公開中
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                下書き
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{practice.subject}</span>
                            <span className="mx-2">•</span>
                            <span>{practice.gradeLevel}</span>
                            <span className="mx-2">•</span>
                            <span>作成日: {new Date(practice.createdAt).toLocaleDateString('ja-JP')}</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>コメント: {practice._count.comments}件</span>
                            <span className="mx-2">•</span>
                            <span>評価: {practice._count.ratings}件</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/practices/${practice.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            表示
                          </Link>
                          <Link
                            href={`/admin/practices/${practice.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            編集
                          </Link>
                          <button
                            onClick={() => handleDelete(practice.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}