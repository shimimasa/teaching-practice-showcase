'use client';

import { useState, useEffect } from 'react';

interface RatingWidgetProps {
  practiceId: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
}

export default function RatingWidget({ practiceId, initialRating = 0, onRatingChange }: RatingWidgetProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchRatingStats();
    fetchUserRating();
  }, [practiceId]);

  const fetchRatingStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ratings/practice/${practiceId}/stats`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
    }
  };

  const fetchUserRating = async () => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || generateSessionId();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ratings/practice/${practiceId}/user?sessionId=${sessionId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.rating) {
          setRating(data.rating);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user rating:', error);
    }
  };

  const generateSessionId = () => {
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('sessionId', sessionId);
    return sessionId;
  };

  const handleRating = async (value: number) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const sessionId = sessionStorage.getItem('sessionId') || generateSessionId();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          practiceId,
          value,
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '評価の送信に失敗しました');
      }

      setRating(value);
      await fetchRatingStats(); // 統計を更新

      if (onRatingChange) {
        onRatingChange(value);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 評価統計 */}
      {stats && stats.total > 0 && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">{stats.average}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-500">({stats.total}件)</span>
          </div>
          
          {/* 評価分布 */}
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-2">{star}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${(stats.distribution[star] / stats.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {stats.distribution[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 評価入力 */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {rating > 0 ? 'あなたの評価' : 'この授業実践を評価'}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={isSubmitting}
              className="p-1 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-8 h-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } ${!isSubmitting && 'hover:scale-110'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}