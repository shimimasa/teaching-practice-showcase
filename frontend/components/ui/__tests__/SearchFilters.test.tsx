import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters, { FilterValues } from '../SearchFilters';

describe('SearchFilters', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter controls', () => {
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    // 検索入力
    expect(screen.getByLabelText('キーワード検索')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('授業のタイトルやキーワードを入力')).toBeInTheDocument();

    // フィルタセレクト
    expect(screen.getByLabelText('科目')).toBeInTheDocument();
    expect(screen.getByLabelText('学年')).toBeInTheDocument();
    expect(screen.getByLabelText('学習レベル')).toBeInTheDocument();

    // 特別配慮チェックボックス
    expect(screen.getByLabelText('特別な配慮が必要な子ども向け')).toBeInTheDocument();

    // ボタン
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'フィルタをリセット' })).toBeInTheDocument();
  });

  it('calls onSearch when search form is submitted', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const searchInput = screen.getByPlaceholderText('授業のタイトルやキーワードを入力');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'テストキーワード');
    await user.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith('テストキーワード');
  });

  it('calls onFilterChange when subject is changed', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const subjectSelect = screen.getByLabelText('科目');
    
    await user.selectOptions(subjectSelect, '算数・数学');

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      subject: '算数・数学',
      gradeLevel: '',
      learningLevel: '',
      specialNeeds: false,
    });
  });

  it('calls onFilterChange when grade level is changed', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const gradeLevelSelect = screen.getByLabelText('学年');
    
    await user.selectOptions(gradeLevelSelect, '小5');

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      subject: '',
      gradeLevel: '小5',
      learningLevel: '',
      specialNeeds: false,
    });
  });

  it('calls onFilterChange when learning level is changed', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const learningLevelSelect = screen.getByLabelText('学習レベル');
    
    await user.selectOptions(learningLevelSelect, 'basic');

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      subject: '',
      gradeLevel: '',
      learningLevel: 'basic',
      specialNeeds: false,
    });
  });

  it('calls onFilterChange when special needs checkbox is toggled', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const specialNeedsCheckbox = screen.getByLabelText('特別な配慮が必要な子ども向け');
    
    await user.click(specialNeedsCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      subject: '',
      gradeLevel: '',
      learningLevel: '',
      specialNeeds: true,
    });
  });

  it('resets all filters when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    // まずいくつかのフィルタを設定
    const subjectSelect = screen.getByLabelText('科目');
    const specialNeedsCheckbox = screen.getByLabelText('特別な配慮が必要な子ども向け');
    const searchInput = screen.getByPlaceholderText('授業のタイトルやキーワードを入力');
    
    await user.selectOptions(subjectSelect, '国語');
    await user.click(specialNeedsCheckbox);
    await user.type(searchInput, 'テスト');

    // リセットボタンをクリック
    const resetButton = screen.getByRole('button', { name: 'フィルタをリセット' });
    await user.click(resetButton);

    // すべてリセットされる
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      subject: '',
      gradeLevel: '',
      learningLevel: '',
      specialNeeds: false,
    });
    expect(mockOnSearch).toHaveBeenLastCalledWith('');
    expect(searchInput).toHaveValue('');
  });

  it('displays all subject options', () => {
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const subjectSelect = screen.getByLabelText('科目');
    const options = subjectSelect.querySelectorAll('option');
    
    // デフォルトオプション + 12科目
    expect(options).toHaveLength(13);
    expect(options[0]).toHaveTextContent('すべての科目');
    expect(options[1]).toHaveTextContent('国語');
    expect(options[12]).toHaveTextContent('その他');
  });

  it('displays all grade level options', () => {
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const gradeLevelSelect = screen.getByLabelText('学年');
    const options = gradeLevelSelect.querySelectorAll('option');
    
    // デフォルトオプション + 9学年
    expect(options).toHaveLength(10);
    expect(options[0]).toHaveTextContent('すべての学年');
    expect(options[1]).toHaveTextContent('小学1年生');
    expect(options[9]).toHaveTextContent('中学3年生');
  });

  it('displays all learning level options', () => {
    render(
      <SearchFilters 
        onFilterChange={mockOnFilterChange} 
        onSearch={mockOnSearch} 
      />
    );

    const learningLevelSelect = screen.getByLabelText('学習レベル');
    const options = learningLevelSelect.querySelectorAll('option');
    
    // デフォルトオプション + 3レベル
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('すべてのレベル');
    expect(options[1]).toHaveTextContent('基礎');
    expect(options[2]).toHaveTextContent('標準');
    expect(options[3]).toHaveTextContent('発展');
  });
});