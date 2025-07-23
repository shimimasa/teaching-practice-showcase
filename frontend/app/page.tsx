'use client';

import Link from 'next/link';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import PracticeCard from '@/components/ui/PracticeCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePractices } from '@/hooks/usePractices';

export default function HomePage() {
  const { practices, loading, error } = usePractices({ limit: 6 });

  return (
    <ResponsiveLayout>
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              学校に通えない子どもたちのための
              <br />
              授業実践紹介プラットフォーム
            </h1>
            <p className="text-xl sm:text-2xl mb-8 opacity-90">
              経験豊富な教育者による質の高い授業実践を見つけて、
              <br />
              お子様に最適な学習機会を提供しましょう
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/practices" className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                授業実践を探す
              </Link>
              <Link href="/about" className="btn-secondary text-white border-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                詳しく見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">サイトの特徴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">豊富な授業実践</h3>
              <p className="text-gray-600">
                小学1年生から中学3年生まで、各学年・科目に対応した授業実践を掲載
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">詳細な検索機能</h3>
              <p className="text-gray-600">
                学年、科目、学習レベル、特別配慮の有無など、細かな条件で検索可能
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">直接連絡</h3>
              <p className="text-gray-600">
                気になる授業を見つけたら、教育者に直接連絡を取ることができます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 注目の授業実践 */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">注目の授業実践</h2>
            <p className="text-gray-600">最近投稿された授業実践をご紹介します</p>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" message="授業実践を読み込んでいます..." />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">データの読み込みに失敗しました</p>
            </div>
          )}

          {!loading && !error && practices.length > 0 && (
            <>
              <div className="practice-grid">
                {practices.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/practices" className="btn-primary">
                  すべての授業実践を見る
                </Link>
              </div>
            </>
          )}

          {!loading && !error && practices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">現在、公開されている授業実践はありません</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">教育者の方へ</h2>
          <p className="text-xl mb-8 opacity-90">
            あなたの授業実践を必要としている子どもたちがいます
          </p>
          <Link href="/register" className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
            教育者として登録する
          </Link>
        </div>
      </section>
    </ResponsiveLayout>
  );
}