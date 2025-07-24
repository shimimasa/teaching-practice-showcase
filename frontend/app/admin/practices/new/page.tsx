'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import PracticeEditor from '@/components/admin/PracticeEditor';

export default function NewPracticePage() {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">新しい授業実践を作成</h2>
          <p className="mt-1 text-sm text-gray-600">
            授業実践の詳細を入力してください
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <PracticeEditor />
        </div>
      </div>
    </AdminLayout>
  );
}