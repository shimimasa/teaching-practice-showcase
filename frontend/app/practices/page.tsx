import { Metadata } from 'next';
import PracticesClientPage from './page.client';

export const metadata: Metadata = {
  title: '授業実践を探す | Teaching Practice Showcase',
  description: 'お子様に最適な授業実践を見つけてください。学年、科目、学習レベルで検索可能です。',
  openGraph: {
    title: '授業実践を探す',
    description: 'お子様に最適な授業実践を見つけてください',
    type: 'website',
  },
};

// ISR（Incremental Static Regeneration）の設定
// 1時間ごとに再生成
export const revalidate = 3600;

async function getPractices() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/practices?limit=9`, {
      cache: 'no-store', // 初回ロード時は最新データを取得
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch practices');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching practices:', error);
    return null;
  }
}

export default async function PracticesPage() {
  const initialData = await getPractices();

  return (
    <PracticesClientPage initialData={initialData} />
  );
}