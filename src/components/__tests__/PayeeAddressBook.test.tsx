import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayeeAddressBook from '../PayeeAddressBook';
import { payeeService } from '../../services/payeeService';
import type { DisplayPayee } from '../../types/payee';

// Mock the services
vi.mock('../../services/payeeService', () => ({
  payeeService: {
    searchPayees: vi.fn(),
    isDemoMode: vi.fn().mockReturnValue(false)
  }
}));

// Mock the PayeeList component to capture props
vi.mock('../payee/PayeeList', () => ({
  default: vi.fn(({ filteredPayees }) => (
    <div data-testid="payee-list" data-filtered-count={filteredPayees?.length || 0}>
      PayeeList Component
      {filteredPayees && filteredPayees.length > 0 && (
        <div data-testid="filtered-results">
          {filteredPayees.map((payee: DisplayPayee) => (
            <div key={payee.id}>{payee.displayName}</div>
          ))}
        </div>
      )}
    </div>
  ))
}));

const mockPayeeService = vi.mocked(payeeService);

describe('PayeeAddressBook Component', () => {
  const mockSearchResults: DisplayPayee[] = [
    {
      id: '1',
      displayName: 'Alexandra Smith (Lexi)',
      formattedPayID: 'a.smith@example.com',
      rawPayID: 'a.smith@example.com',
      payidType: 'email'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component title', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByRole('heading', { name: /saved payees/i })).toBeInTheDocument();
  });

  it('renders the PayeeSearch component', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByPlaceholderText(/search by name, nickname, email/i)).toBeInTheDocument();
  });

  it('renders the PayeeList component', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByTestId('payee-list')).toBeInTheDocument();
  });

  it('passes filtered payees to PayeeList when search is performed', async () => {
    const user = userEvent.setup();
    mockPayeeService.searchPayees.mockResolvedValue(mockSearchResults);

    render(<PayeeAddressBook />);

    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'Alex');
    await user.click(searchButton);

    await waitFor(() => {
      const payeeList = screen.getByTestId('payee-list');
      expect(payeeList).toHaveAttribute('data-filtered-count', '1');
      expect(screen.getByTestId('filtered-results')).toBeInTheDocument();
      expect(screen.getByText('Alexandra Smith (Lexi)')).toBeInTheDocument();
    });
  });

  it('clears filtered results when search is cleared', async () => {
    const user = userEvent.setup();
    mockPayeeService.searchPayees.mockResolvedValue(mockSearchResults);

    render(<PayeeAddressBook />);

    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);

    // First search
    await user.type(searchInput, 'Alex');
    await waitFor(() => {
      const payeeList = screen.getByTestId('payee-list');
      expect(payeeList).toHaveAttribute('data-filtered-count', '1');
    });

    // Clear search
    await user.clear(searchInput);
    await waitFor(() => {
      const payeeList = screen.getByTestId('payee-list');
      expect(payeeList).toHaveAttribute('data-filtered-count', '0');
    });
  });

  it('handles empty search results', async () => {
    const user = userEvent.setup();
    mockPayeeService.searchPayees.mockResolvedValue([]);

    render(<PayeeAddressBook />);

    const searchInput = screen.getByPlaceholderText(/search by name, nickname, email/i);
    await user.type(searchInput, 'XYZ');

    await waitFor(() => {
      const payeeList = screen.getByTestId('payee-list');
      expect(payeeList).toHaveAttribute('data-filtered-count', '0');
    });
  });
});