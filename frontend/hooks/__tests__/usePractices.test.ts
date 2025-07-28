import { renderHook, waitFor } from '@testing-library/react';
import { usePractices } from '../usePractices';
import { practiceAPI } from '@/lib/api';

// APIモック
jest.mock('@/lib/api', () => ({
  practiceAPI: {
    getAll: jest.fn(),
  },
}));

const mockPracticeAPI = practiceAPI as jest.Mocked<typeof practiceAPI>;

describe('usePractices', () => {
  const mockPracticesResponse = {
    data: {
      success: true,
      data: [
        {
          id: '1',
          title: 'テスト授業1',
          description: 'テスト説明1',
          subject: '算数・数学',
          gradeLevel: '小5',
          learningLevel: 'standard',
          specialNeeds: false,
          implementationDate: '2024-01-15T00:00:00Z',
          tags: ['テスト'],
          isPublished: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          educatorId: 'educator1',
        },
        {
          id: '2',
          title: 'テスト授業2',
          description: 'テスト説明2',
          subject: '国語',
          gradeLevel: '小4',
          learningLevel: 'basic',
          specialNeeds: true,
          implementationDate: '2024-01-20T00:00:00Z',
          tags: ['テスト2'],
          isPublished: true,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          educatorId: 'educator2',
        },
      ],
      pagination: {
        page: 1,
        limit: 9,
        total: 2,
        totalPages: 1,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches practices on mount', async () => {
    mockPracticeAPI.getAll.mockResolvedValueOnce(mockPracticesResponse);

    const { result } = renderHook(() => usePractices());

    // 初期状態
    expect(result.current.loading).toBe(true);
    expect(result.current.practices).toEqual([]);
    expect(result.current.error).toBeNull();

    // データ取得後
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.practices).toEqual(mockPracticesResponse.data.data);
    expect(result.current.total).toBe(2);
    expect(result.current.totalPages).toBe(1);
    expect(mockPracticeAPI.getAll).toHaveBeenCalledWith({
      page: 1,
      limit: 9,
      subject: undefined,
      gradeLevel: undefined,
      learningLevel: undefined,
      specialNeeds: undefined,
      keyword: undefined,
    });
  });

  it('uses initial data when provided', () => {
    const initialData = mockPracticesResponse.data.data;
    
    const { result } = renderHook(() => usePractices({ initialData }));

    // 初期データが設定され、ローディングはfalse
    expect(result.current.loading).toBe(false);
    expect(result.current.practices).toEqual(initialData);
  });

  it('fetches practices with filters', async () => {
    mockPracticeAPI.getAll.mockResolvedValueOnce(mockPracticesResponse);

    const filters = {
      page: 2,
      limit: 12,
      subject: '算数・数学',
      gradeLevel: '小5',
      learningLevel: 'standard',
      specialNeeds: false,
      keyword: 'テスト',
    };

    const { result } = renderHook(() => usePractices(filters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPracticeAPI.getAll).toHaveBeenCalledWith(filters);
  });

  it('handles errors gracefully', async () => {
    const error = new Error('API Error');
    mockPracticeAPI.getAll.mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePractices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.practices).toEqual([]);
  });

  it('refetches data when refetch is called', async () => {
    mockPracticeAPI.getAll.mockResolvedValue(mockPracticesResponse);

    const { result } = renderHook(() => usePractices());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPracticeAPI.getAll).toHaveBeenCalledTimes(1);

    // refetchを呼び出す
    result.current.refetch();

    await waitFor(() => {
      expect(mockPracticeAPI.getAll).toHaveBeenCalledTimes(2);
    });
  });

  it('refetches when options change', async () => {
    mockPracticeAPI.getAll.mockResolvedValue(mockPracticesResponse);

    const { result, rerender } = renderHook(
      ({ options }) => usePractices(options),
      {
        initialProps: { options: { page: 1 } },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPracticeAPI.getAll).toHaveBeenCalledTimes(1);

    // オプションを変更
    rerender({ options: { page: 2 } });

    await waitFor(() => {
      expect(mockPracticeAPI.getAll).toHaveBeenCalledTimes(2);
    });

    expect(mockPracticeAPI.getAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });
});