import { render, screen } from '@testing-library/react';
import PracticeCard from '../PracticeCard';
import { Practice } from '@/types';

// モックデータ
const mockPractice: Practice = {
  id: '1',
  title: 'テスト授業実践',
  description: 'これはテスト用の授業実践です。分数の概念を楽しく学びます。',
  subject: '算数・数学',
  gradeLevel: '小5',
  learningLevel: 'standard',
  specialNeeds: false,
  implementationDate: '2024-01-15T00:00:00Z',
  tags: ['分数', '楽しい学習', '体験型'],
  isPublished: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  educatorId: 'educator1',
  educator: {
    id: 'educator1',
    name: 'テスト先生',
    email: 'test@example.com',
    specialties: ['算数'],
    contactEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  _count: {
    comments: 5,
    ratings: 10,
  },
};

describe('PracticeCard', () => {
  it('renders practice information correctly', () => {
    render(<PracticeCard practice={mockPractice} />);

    // タイトルが表示されている
    expect(screen.getByText('テスト授業実践')).toBeInTheDocument();

    // 説明が表示されている（省略されている）
    expect(screen.getByText(/これはテスト用の授業実践です/)).toBeInTheDocument();

    // 科目が表示されている
    expect(screen.getByText('算数・数学')).toBeInTheDocument();

    // 学年が表示されている
    expect(screen.getByText('小学5年生')).toBeInTheDocument();

    // レベルが表示されている
    expect(screen.getByText('標準')).toBeInTheDocument();

    // 教育者名が表示されている
    expect(screen.getByText('教育者: テスト先生')).toBeInTheDocument();

    // コメント数と評価数が表示されている
    expect(screen.getByText('💬 5')).toBeInTheDocument();
    expect(screen.getByText('⭐ 10')).toBeInTheDocument();
  });

  it('displays special needs tag when applicable', () => {
    const practiceWithSpecialNeeds = {
      ...mockPractice,
      specialNeeds: true,
    };

    render(<PracticeCard practice={practiceWithSpecialNeeds} />);

    expect(screen.getByText('特別配慮対応')).toBeInTheDocument();
  });

  it('displays up to 3 tags', () => {
    render(<PracticeCard practice={mockPractice} />);

    // 3つのタグすべてが表示されている
    expect(screen.getByText('分数')).toBeInTheDocument();
    expect(screen.getByText('楽しい学習')).toBeInTheDocument();
    expect(screen.getByText('体験型')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<PracticeCard practice={mockPractice} />);

    // 日本語形式の日付が表示されている
    expect(screen.getByText('2024年1月15日')).toBeInTheDocument();
  });

  it('links to practice detail page', () => {
    render(<PracticeCard practice={mockPractice} />);

    const link = screen.getByRole('link', { name: /テスト授業実践/ });
    expect(link).toHaveAttribute('href', '/practices/1');
  });

  it('handles practices without educator gracefully', () => {
    const practiceWithoutEducator = {
      ...mockPractice,
      educator: undefined,
    };

    render(<PracticeCard practice={practiceWithoutEducator} />);

    // エラーなくレンダリングされる
    expect(screen.getByText('テスト授業実践')).toBeInTheDocument();
  });

  it('handles practices without counts gracefully', () => {
    const practiceWithoutCounts = {
      ...mockPractice,
      _count: undefined,
    };

    render(<PracticeCard practice={practiceWithoutCounts} />);

    // カウントセクションが表示されない
    expect(screen.queryByText('💬')).not.toBeInTheDocument();
    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
  });
});