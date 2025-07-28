'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MediaUploader from './MediaUploader';

interface PracticeFormData {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  learningLevel: string;
  specialNeeds: boolean;
  specialNeedsDetails: string;
  implementationDate: string;
  tags: string[];
  isPublished: boolean;
}

interface PracticeEditorProps {
  practiceId?: string;
  onSave?: () => void;
}

export default function PracticeEditor({ practiceId, onSave }: PracticeEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<PracticeFormData>({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    learningLevel: '',
    specialNeeds: false,
    specialNeedsDetails: '',
    implementationDate: '',
    tags: [],
    isPublished: false,
  });

  const subjects = [
    '国語', '算数・数学', '理科', '社会', 
    '英語', '音楽', '美術', '体育', 
    '技術・家庭', '道徳', '総合学習', 'その他'
  ];

  const gradeLevels = [
    { value: '小1', label: '小学1年生' },
    { value: '小2', label: '小学2年生' },
    { value: '小3', label: '小学3年生' },
    { value: '小4', label: '小学4年生' },
    { value: '小5', label: '小学5年生' },
    { value: '小6', label: '小学6年生' },
    { value: '中1', label: '中学1年生' },
    { value: '中2', label: '中学2年生' },
    { value: '中3', label: '中学3年生' },
  ];

  const learningLevels = [
    { value: 'basic', label: '基礎' },
    { value: 'standard', label: '標準' },
    { value: 'advanced', label: '発展' },
  ];

  useEffect(() => {
    if (practiceId) {
      fetchPractice();
    }
  }, [practiceId]);

  const fetchPractice = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/practices/${practiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('授業実践の取得に失敗しました');

      const data = await response.json();
      setFormData({
        title: data.title,
        description: data.description,
        subject: data.subject,
        gradeLevel: data.gradeLevel,
        learningLevel: data.learningLevel,
        specialNeeds: data.specialNeeds,
        specialNeedsDetails: data.specialNeedsDetails || '',
        implementationDate: data.implementationDate.split('T')[0],
        tags: data.tags || [],
        isPublished: data.isPublished,
      });
      
      // 既存のファイルを設定
      if (data.materials && data.materials.length > 0) {
        setUploadedFiles(data.materials);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = practiceId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/practices/${practiceId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/practices`;
      
      const method = practiceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '保存に失敗しました');
      }

      if (onSave) {
        onSave();
      } else {
        router.push('/admin/practices');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" message="読み込み中..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          授業の説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            科目 <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-2">
            学年 <span className="text-red-500">*</span>
          </label>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            {gradeLevels.map(grade => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="learningLevel" className="block text-sm font-medium text-gray-700 mb-2">
            学習レベル <span className="text-red-500">*</span>
          </label>
          <select
            id="learningLevel"
            name="learningLevel"
            value={formData.learningLevel}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            {learningLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="implementationDate" className="block text-sm font-medium text-gray-700 mb-2">
            実施日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="implementationDate"
            name="implementationDate"
            value={formData.implementationDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="タグを入力してEnter"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="specialNeeds"
            checked={formData.specialNeeds}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            特別な配慮が必要な子ども向け
          </span>
        </label>

        {formData.specialNeeds && (
          <div>
            <label htmlFor="specialNeedsDetails" className="block text-sm font-medium text-gray-700 mb-2">
              特別配慮の詳細
            </label>
            <textarea
              id="specialNeedsDetails"
              name="specialNeedsDetails"
              value={formData.specialNeedsDetails}
              onChange={handleChange}
              rows={3}
              placeholder="どのような配慮が必要か、具体的に記述してください（例：視覚的な支援が必要、個別の声かけが必要など）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <label className="flex items-center">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            公開する
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          教材・資料
        </label>
        <MediaUploader
          practiceId={practiceId}
          existingFiles={uploadedFiles}
          onUpload={(files) => {
            setUploadedFiles([...uploadedFiles, ...files]);
          }}
          onRemove={(fileId) => {
            setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
          }}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">保存中...</span>
            </span>
          ) : (
            practiceId ? '更新する' : '作成する'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/practices')}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}