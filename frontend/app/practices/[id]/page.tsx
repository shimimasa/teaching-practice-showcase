import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PracticeDetailClient from './page.client';

interface PageProps {
  params: {
    id: string;
  };
}

// 動的メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/practices/${params.id}`);
    
    if (!res.ok) {
      return {
        title: '授業実践が見つかりません',
      };
    }
    
    const data = await res.json();
    const practice = data.data;
    
    return {
      title: `${practice.title} | Teaching Practice Showcase`,
      description: practice.description.substring(0, 160),
      openGraph: {
        title: practice.title,
        description: practice.description.substring(0, 160),
        type: 'article',
      },
    };
  } catch (error) {
    return {
      title: '授業実践詳細',
    };
  }
}

// 静的パラメータの生成（よくアクセスされるページを事前生成）
export async function generateStaticParams() {
  try {
    // 最新の10件を事前生成
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/practices?limit=10`);
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    
    return data.data.map((practice: any) => ({
      id: practice.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600;

async function getPractice(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/practices/${id}`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching practice:', error);
    return null;
  }
}

export default async function PracticeDetailPage({ params }: PageProps) {
  const practice = await getPractice(params.id);
  
  if (!practice) {
    notFound();
  }
  
  return <PracticeDetailClient practice={practice} />;
}