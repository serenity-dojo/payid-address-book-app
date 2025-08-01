import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayeeList from '../PayeeList';
import { payeeService } from '../../../services/payeeService';
import type { DisplayPayee } from '../../../types/payee';

// Mock the payeeService
vi.mock('../../../services/payeeService', () => ({
  payeeService: {
    getAllPayees: vi.fn()
  }
}));

const mockPayeeService = vi.mocked(payeeService);

describe('PayeeList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockPayeeService.getAllPayees.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<PayeeList />);
    
    expect(screen.getByText(/loading payees/i)).toBeInTheDocument();
  });

  it('should display empty state when no payees exist', async () => {
    mockPayeeService.getAllPayees.mockResolvedValue([]);
    
    render(<PayeeList />);
    
    await waitFor(() => {
      expect(screen.getByText(/no payees found/i)).toBeInTheDocument();
    });
  });

  it('should display list of payees when data is loaded', async () => {
    const mockPayees: DisplayPayee[] = [
      {
        id: '1',
        displayName: 'Alice Brown',
        formattedPayID: 'alice@example.com',
        rawPayID: 'alice@example.com',
        payidType: 'email'
      },
      {
        id: '2',
        displayName: 'Bob Charlie (Bobby)',
        formattedPayID: '0412 345 678',
        rawPayID: '0412345678',
        payidType: 'mobile'
      }
    ];

    mockPayeeService.getAllPayees.mockResolvedValue(mockPayees);
    
    render(<PayeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      expect(screen.getByText('Bob Charlie (Bobby)')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('0412 345 678')).toBeInTheDocument();
    });
  });

  it('should display error state when API call fails', async () => {
    mockPayeeService.getAllPayees.mockRejectedValue(new Error('API Error'));
    
    render(<PayeeList />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading payees/i)).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', async () => {
    const mockPayees: DisplayPayee[] = [
      {
        id: '1',
        displayName: 'Test User',
        formattedPayID: 'test@example.com',
        rawPayID: 'test@example.com',
        payidType: 'email'
      }
    ];

    mockPayeeService.getAllPayees.mockResolvedValue(mockPayees);
    
    render(<PayeeList />);
    
    await waitFor(() => {
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'PayID payees');
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });
  });

  it('should call payeeService.getAllPayees on mount', () => {
    mockPayeeService.getAllPayees.mockResolvedValue([]);
    
    render(<PayeeList />);
    
    expect(mockPayeeService.getAllPayees).toHaveBeenCalledTimes(1);
  });

  it('should display payees in the order returned by service (already sorted)', async () => {
    const mockPayees: DisplayPayee[] = [
      {
        id: '1',
        displayName: 'Alice Brown',
        formattedPayID: 'alice@example.com',
        rawPayID: 'alice@example.com',
        payidType: 'email'
      },
      {
        id: '2',
        displayName: 'Bob Charlie (Bobby)',
        formattedPayID: '0412 345 678',
        rawPayID: '0412345678',
        payidType: 'mobile'
      },
      {
        id: '3',
        displayName: 'Zoe Adams (Z)',
        formattedPayID: 'zoe@example.com',
        rawPayID: 'zoe@example.com',
        payidType: 'email'
      }
    ];

    mockPayeeService.getAllPayees.mockResolvedValue(mockPayees);
    
    render(<PayeeList />);
    
    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem');
      expect(listItems[0]).toHaveTextContent('Alice Brown');
      expect(listItems[1]).toHaveTextContent('Bob Charlie (Bobby)');
      expect(listItems[2]).toHaveTextContent('Zoe Adams (Z)');
    });
  });

  it('should display filtered payees when filteredPayees prop is provided', async () => {
    const filteredPayees: DisplayPayee[] = [
      {
        id: '1',
        displayName: 'Alice Brown',
        formattedPayID: 'alice@example.com',
        rawPayID: 'alice@example.com',
        payidType: 'email'
      }
    ];

    render(<PayeeList filteredPayees={filteredPayees} />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });

    // Should not call getAllPayees when filteredPayees is provided
    expect(mockPayeeService.getAllPayees).not.toHaveBeenCalled();
  });

  it('should display empty state for filtered results when no matches', async () => {
    render(<PayeeList filteredPayees={[]} />);
    
    await waitFor(() => {
      expect(screen.getByText(/no payees found/i)).toBeInTheDocument();
    });

    // Should not call getAllPayees when filteredPayees is provided
    expect(mockPayeeService.getAllPayees).not.toHaveBeenCalled();
  });

  it('should prefer filteredPayees over service data when both are available', async () => {
    const servicePayees: DisplayPayee[] = [
      {
        id: '1',
        displayName: 'Service Payee',
        formattedPayID: 'service@example.com',
        rawPayID: 'service@example.com',
        payidType: 'email'
      }
    ];

    const filteredPayees: DisplayPayee[] = [
      {
        id: '2',
        displayName: 'Filtered Payee',
        formattedPayID: 'filtered@example.com',
        rawPayID: 'filtered@example.com',
        payidType: 'email'
      }
    ];

    mockPayeeService.getAllPayees.mockResolvedValue(servicePayees);

    render(<PayeeList filteredPayees={filteredPayees} />);
    
    await waitFor(() => {
      expect(screen.getByText('Filtered Payee')).toBeInTheDocument();
      expect(screen.queryByText('Service Payee')).not.toBeInTheDocument();
    });

    // Should not call getAllPayees when filteredPayees is provided
    expect(mockPayeeService.getAllPayees).not.toHaveBeenCalled();
  });
});