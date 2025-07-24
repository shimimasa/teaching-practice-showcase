import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

async function getPracticeMetadata(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/practices/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const practice = await getPracticeMetadata(params.id);

  if (!practice) {
    return {
      title: '授業実践が見つかりません',
    };
  }

  const description = practice.description.length > 160 
    ? practice.description.substring(0, 157) + '...' 
    : practice.description;

  return {
    title: practice.title,
    description: description,
    keywords: [
      practice.subject,
      practice.gradeLevel,
      '授業実践',
      'オンライン学習',
      ...(practice.tags || [])
    ],
    openGraph: {
      title: practice.title,
      description: description,
      type: 'article',
      publishedTime: practice.createdAt,
      modifiedTime: practice.updatedAt,
      authors: [practice.educator.name],
      tags: practice.tags,
    },
    twitter: {
      card: 'summary',
      title: practice.title,
      description: description,
    },
  };
}