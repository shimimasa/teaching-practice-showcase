import Link from 'next/link';
import { Practice } from '@/types';

interface PracticeCardProps {
  practice: Practice;
}

export default function PracticeCard({ practice }: PracticeCardProps) {
  const gradeLevelLabels: { [key: string]: string } = {
    '小1': '小学1年生',
    '小2': '小学2年生',
    '小3': '小学3年生',
    '小4': '小学4年生',
    '小5': '小学5年生',
    '小6': '小学6年生',
    '中1': '中学1年生',
    '中2': '中学2年生',
    '中3': '中学3年生',
  };

  const learningLevelLabels = {
    basic: '基礎',
    standard: '標準',
    advanced: '発展',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link 
            href={`/practices/${practice.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {practice.title}
          </Link>
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {practice.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">科目:</span>
            <span className="text-gray-900">{practice.subject}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">学年:</span>
            <span className="text-gray-900">
              {gradeLevelLabels[practice.gradeLevel] || practice.gradeLevel}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">レベル:</span>
            <span className="text-gray-900">
              {learningLevelLabels[practice.learningLevel]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {practice.specialNeeds && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              特別配慮対応
            </span>
          )}
          {practice.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {practice._count && (
              <>
                <span>💬 {practice._count.comments}</span>
                <span>⭐ {practice._count.ratings}</span>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(practice.implementationDate)}
          </div>
        </div>
        
        {practice.educator && (
          <div className="mt-2 text-sm text-gray-600">
            教育者: {practice.educator.name}
          </div>
        )}
      </div>
    </div>
  );
}