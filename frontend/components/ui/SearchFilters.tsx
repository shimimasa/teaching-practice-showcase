'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  onSearch: (keyword: string) => void;
}

export interface FilterValues {
  subject: string;
  gradeLevel: string;
  learningLevel: string;
  specialNeeds: boolean;
}

export default function SearchFilters({ onFilterChange, onSearch }: SearchFiltersProps) {
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<FilterValues>({
    subject: '',
    gradeLevel: '',
    learningLevel: '',
    specialNeeds: false,
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

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword);
  };

  const resetFilters = () => {
    const resetValues = {
      subject: '',
      gradeLevel: '',
      learningLevel: '',
      specialNeeds: false,
    };
    setFilters(resetValues);
    setKeyword('');
    onFilterChange(resetValues);
    onSearch('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* 検索バー */}
      <form onSubmit={handleSearch} className="mb-6">
        <label htmlFor="search" className="form-label">
          キーワード検索
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="授業のタイトルやキーワードを入力"
            className="form-input flex-1"
          />
          <button type="submit" className="btn-primary">
            検索
          </button>
        </div>
      </form>

      {/* フィルタ */}
      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="form-label">
            科目
          </label>
          <select
            id="subject"
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="form-select"
          >
            <option value="">すべての科目</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="gradeLevel" className="form-label">
            学年
          </label>
          <select
            id="gradeLevel"
            value={filters.gradeLevel}
            onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
            className="form-select"
          >
            <option value="">すべての学年</option>
            {gradeLevels.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="learningLevel" className="form-label">
            学習レベル
          </label>
          <select
            id="learningLevel"
            value={filters.learningLevel}
            onChange={(e) => handleFilterChange('learningLevel', e.target.value)}
            className="form-select"
          >
            <option value="">すべてのレベル</option>
            {learningLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.specialNeeds}
              onChange={(e) => handleFilterChange('specialNeeds', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              特別な配慮が必要な子ども向け
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="w-full btn-secondary"
        >
          フィルタをリセット
        </button>
      </div>
    </div>
  );
}