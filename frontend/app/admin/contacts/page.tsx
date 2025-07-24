'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Contact {
  id: string;
  practiceId: string;
  parentName: string;
  parentEmail: string;
  childAge: number;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
  practice: {
    id: string;
    title: string;
  };
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('連絡の取得に失敗しました');
      }

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${contactId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('ステータスの更新に失敗しました');
      }

      // ローカルの状態を更新
      setContacts(contacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, status: newStatus as 'new' | 'replied' | 'closed' }
          : contact
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">新着</span>;
      case 'replied':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">返信済み</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">対応完了</span>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">連絡管理</h2>
            <p className="mt-1 text-sm text-gray-600">
              保護者からの連絡を管理できます
            </p>
          </div>
          
          {/* ステータスフィルタ */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">すべて</option>
            <option value="new">新着</option>
            <option value="replied">返信済み</option>
            <option value="closed">対応完了</option>
          </select>
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
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? 'まだ連絡がありません' 
                    : `${statusFilter === 'new' ? '新着' : statusFilter === 'replied' ? '返信済み' : '対応完了'}の連絡はありません`}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {contacts.map(contact => (
                  <li key={contact.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {contact.practice.title}
                            </h3>
                            <div className="ml-2">
                              {getStatusBadge(contact.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">保護者名:</span> {contact.parentName}
                            </div>
                            <div>
                              <span className="font-medium">メール:</span> {contact.parentEmail}
                            </div>
                            <div>
                              <span className="font-medium">子どもの年齢:</span> {contact.childAge}歳
                            </div>
                            <div>
                              <span className="font-medium">受信日時:</span> {new Date(contact.createdAt).toLocaleString('ja-JP')}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {contact.message}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="mt-4 flex items-center space-x-3">
                        <a
                          href={`mailto:${contact.parentEmail}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          メールで返信
                        </a>
                        
                        {contact.status !== 'closed' && (
                          <select
                            value={contact.status}
                            onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-3 py-1"
                          >
                            <option value="new">新着</option>
                            <option value="replied">返信済み</option>
                            <option value="closed">対応完了</option>
                          </select>
                        )}
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