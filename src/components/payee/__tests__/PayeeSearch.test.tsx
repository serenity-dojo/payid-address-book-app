import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PayeeSearch from '../PayeeSearch';
import { payeeService } from '../../../services/payeeService';
import type { DisplayPayee } from '../../../types/payee';

// Mock the payeeService
vi.mock('../../../services/payeeService', () => ({
  payeeService: {
    searchPayees: vi.fn(),
  },
}));

const mockPayeeService = vi.mocked(payeeService);

describe('PayeeSearch Component', () => {
  const mockPayees: DisplayPayee[] = [
    {
      id: '1',
      displayName: 'Alexandra Smith (Lexi)',
      formattedPayID: 'a.smith@example.com',
      rawPayID: 'a.smith@example.com',
      payidType: 'email'
    },
    {
      id: '2',
      displayName: 'Andy Bolton (AndyB)',
      formattedPayID: '0412 784 539',
      rawPayID: '0412784539',
      payidType: 'mobile'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input and button', () => {
    render(<PayeeSearch onSearch={() => {}} />);
    
    expect(screen.getByPlaceholderText(/search by name, nickname, email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should disable search button when input is empty', () => {
    render(<PayeeSearch onSearch={() => {}} />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });

  it('should enable search button when input has text', async () => {
    const user = userEvent.setup();
    render(<PayeeSearch onSearch={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(searchInput, 'Alex');
    
    expect(searchButton).not.toBeDisabled();
  });

  it('should call onSearch with search term when form is submitted', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    
    render(<PayeeSearch onSearch={onSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(searchInput, 'Alex');
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith('Alex');
  });

  it('should call onSearch with empty string when input is cleared', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    
    render(<PayeeSearch onSearch={onSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    
    // Type something first
    await user.type(searchInput, 'Alex');
    
    // Clear input
    await user.clear(searchInput);
    
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('should show suggestions after typing 3 or more characters', async () => {
    const user = userEvent.setup();
    mockPayeeService.searchPayees.mockResolvedValue(mockPayees);
    
    render(<PayeeSearch onSearch={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    
    // Type less than 3 characters - no suggestions
    await user.type(searchInput, 'Al');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    
    // Type 3 or more characters - suggestions appear
    await user.type(searchInput, 'e');
    await waitFor(() => {
      expect(screen.getByRole('listbox', { name: /search suggestions/i })).toBeInTheDocument();
      expect(screen.getByText('Alexandra Smith (Lexi)')).toBeInTheDocument();
    });
  });

  it('should limit suggestions to 10 results', async () => {
    const user = userEvent.setup();
    const manyPayees = Array.from({ length: 15 }, (_, i) => ({
      id: i.toString(),
      displayName: `Payee ${i}`,
      formattedPayID: `payee${i}@example.com`,
      rawPayID: `payee${i}@example.com`,
      payidType: 'email' as const
    }));
    
    mockPayeeService.searchPayees.mockResolvedValue(manyPayees);
    
    render(<PayeeSearch onSearch={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    await user.type(searchInput, 'Payee');
    
    await waitFor(() => {
      const suggestions = screen.getAllByRole('option');
      expect(suggestions).toHaveLength(10);
    });
  });

  it('should hide suggestions when input is cleared', async () => {
    const user = userEvent.setup();
    mockPayeeService.searchPayees.mockResolvedValue(mockPayees);
    
    render(<PayeeSearch onSearch={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    
    // Type to show suggestions
    await user.type(searchInput, 'Alex');
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Clear input
    await user.clear(searchInput);
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('should populate search input when suggestion is clicked', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    mockPayeeService.searchPayees.mockResolvedValue(mockPayees);
    
    render(<PayeeSearch onSearch={onSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    await user.type(searchInput, 'Alex');
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    const suggestion = screen.getByText('Alexandra Smith (Lexi)');
    await user.click(suggestion);
    
    expect(searchInput).toHaveValue('Alexandra Smith (Lexi)');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledWith('Alexandra Smith (Lexi)');
  });

  it('should show clear button when input has text', async () => {
    const user = userEvent.setup();
    render(<PayeeSearch onSearch={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    
    // No clear button initially
    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
    
    // Clear button appears after typing
    await user.type(searchInput, 'Alex');
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();
  });

  it('should clear input and call onSearch with empty string when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    
    render(<PayeeSearch onSearch={onSearch} />);
    
    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    
    // Type something
    await user.type(searchInput, 'Alex');
    
    // Click clear button
    const clearButton = screen.getByLabelText(/clear search/i);
    await user.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(onSearch).toHaveBeenCalledWith('');
  });
});