'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import PracticeEditor from '@/components/admin/PracticeEditor';

export default function EditPracticePage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">授業実践を編集</h2>
          <p className="mt-1 text-sm text-gray-600">
            授業実践の内容を更新してください
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <PracticeEditor practiceId={params.id} />
        </div>
      </div>
    </AdminLayout>
  );
}