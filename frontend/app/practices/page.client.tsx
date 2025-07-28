'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import SearchFilters, { FilterValues } from '@/components/ui/SearchFilters';
import PracticeCard from '@/components/ui/PracticeCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePractices } from '@/hooks/usePractices';

interface PracticesClientPageProps {
  initialData?: any;
}

export default function PracticesClientPage({ initialData }: PracticesClientPageProps) {
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1');

  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState<FilterValues>({
    subject: '',
    gradeLevel: '',
    learningLevel: '',
    specialNeeds: false,
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  const { practices, loading, error, total, totalPages } = usePractices({
    page,
    limit: 9,
    ...filters,
    keyword: searchKeyword,
    initialData: initialData?.data || [],
  });

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ページネーションコンポーネント
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          前へ
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-2 text-sm border rounded-md ${
              pageNum === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          次へ
        </button>
      </div>
    );
  };

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">授業実践を探す</h1>
          <p className="mt-2 text-gray-600">
            お子様に最適な授業実践を見つけてください
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* フィルタサイドバー */}
          <aside className="lg:col-span-1">
            <SearchFilters 
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
            />
          </aside>

          {/* メインコンテンツ */}
          <main className="lg:col-span-3">
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" message="授業実践を読み込んでいます..." />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">データの読み込みに失敗しました</p>
                <p className="mt-2 text-sm text-gray-600">
                  しばらく時間をおいてから再度お試しください
                </p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {total > 0 ? `${total}件の授業実践が見つかりました` : ''}
                  </p>
                  {total > 0 && (
                    <p className="text-sm text-gray-600">
                      {page} / {totalPages} ページ
                    </p>
                  )}
                </div>

                {practices.length > 0 ? (
                  <>
                    <div className="practice-grid">
                      {practices.map((practice) => (
                        <PracticeCard key={practice.id} practice={practice} />
                      ))}
                    </div>
                    <Pagination />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-600">
                      条件に合う授業実践が見つかりませんでした
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      フィルタ条件を変更してお試しください
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </ResponsiveLayout>
  );
}