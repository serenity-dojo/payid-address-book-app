import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddNewPayee from '../AddNewPayee';
import { payeeService } from '../../services/payeeService';

// Mock the services
vi.mock('../../services/payeeService');
vi.mock('../../services/payidValidationService');

const mockPayeeService = vi.mocked(payeeService);

describe('AddNewPayee', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the initial PayID entry form', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByRole('heading', { name: /add new payee/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📧 email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📱 mobile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🏢 abn/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/user@example.com/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /validate payid/i })).toBeInTheDocument();
    });

    it('should have PayID type buttons with EMAIL selected by default', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const emailButton = screen.getByRole('button', { name: /📧 email/i });
      const mobileButton = screen.getByRole('button', { name: /📱 mobile/i });
      const abnButton = screen.getByRole('button', { name: /🏢 abn/i });

      expect(emailButton).toHaveAttribute('aria-pressed', 'true');
      expect(mobileButton).toHaveAttribute('aria-pressed', 'false');
      expect(abnButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should start with Validate PayID button disabled when no PayID entered', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const validateButton = screen.getByRole('button', { name: /validate payid/i });
      expect(validateButton).toBeDisabled();
    });

    it('should not show Add Payee button in initial state', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.queryByRole('button', { name: /add payee/i })).not.toBeInTheDocument();
    });
  });

  describe('PayID type selection', () => {
    it('should switch PayID types when buttons are clicked', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const emailButton = screen.getByRole('button', { name: /📧 email/i });
      const mobileButton = screen.getByRole('button', { name: /📱 mobile/i });
      const payidInput = screen.getByPlaceholderText(/user@example.com/i);

      // Initially email is selected
      expect(emailButton).toHaveAttribute('aria-pressed', 'true');
      expect(payidInput).toHaveAttribute('placeholder', 'user@example.com');

      // Click mobile button
      await user.click(mobileButton);

      expect(mobileButton).toHaveAttribute('aria-pressed', 'true');
      expect(emailButton).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByPlaceholderText(/0412 345 678/i)).toBeInTheDocument();
    });

    it('should enable Validate PayID button when PayID is entered', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      expect(validateButton).toBeDisabled();

      await user.type(payidInput, 'test@example.com');

      expect(validateButton).toBeEnabled();
    });
  });

  describe('form validation', () => {
    it('should validate email format on blur', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);

      await user.type(payidInput, 'invalid-email');
      await user.tab(); // Trigger blur validation

      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('should validate mobile number format on blur', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const mobileButton = screen.getByRole('button', { name: /📱 mobile/i });
      await user.click(mobileButton);

      const payidInput = screen.getByPlaceholderText(/0412 345 678/i);

      await user.type(payidInput, '123');
      await user.tab();

      expect(screen.getByText(/please enter a valid australian mobile number/i)).toBeInTheDocument();
    });

    it('should validate ABN format on blur', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const abnButton = screen.getByRole('button', { name: /🏢 abn/i });
      await user.click(abnButton);

      const payidInput = screen.getByPlaceholderText(/12345678901/i);

      await user.type(payidInput, '123');
      await user.tab();

      expect(screen.getByText(/please enter a valid 11-digit abn/i)).toBeInTheDocument();
    });
  });

  describe('PayID validation', () => {
    it('should show confirmation screen when PayID validation succeeds', async () => {
      // Mock demo mode to return true
      mockPayeeService.isDemoMode = vi.fn().mockReturnValue(true);

      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      await user.type(payidInput, 'john.smith@example.com');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/payid found/i)).toBeInTheDocument();
        expect(screen.getByText(/john smith/i)).toBeInTheDocument();
        expect(screen.getByText(/john.smith@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/i confirm this is the correct payee/i)).toBeInTheDocument();
      });
    });

    it('should show error when PayID validation fails', async () => {
      mockPayeeService.isDemoMode = vi.fn().mockReturnValue(true);

      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      await user.type(payidInput, 'notfound@example.com');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/payid not found/i)).toBeInTheDocument();
      });
    });

    it('should show error for special test case disabled@example.com', async () => {
      mockPayeeService.isDemoMode = vi.fn().mockReturnValue(true);

      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      await user.type(payidInput, 'disabled@example.com');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/payid is inactive/i)).toBeInTheDocument();
      });
    });

    it('should enable Add Payee button only after confirmation checkbox is checked', async () => {
      mockPayeeService.isDemoMode = vi.fn().mockReturnValue(true);

      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      await user.type(payidInput, 'test@example.com');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/payid found/i)).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add payee/i });
      const confirmCheckbox = screen.getByRole('checkbox');

      expect(addButton).toBeDisabled();

      await user.click(confirmCheckbox);

      expect(addButton).toBeEnabled();
    });
  });

  describe('form submission', () => {
    it('should add payee and call onSuccess when form is submitted', async () => {
      mockPayeeService.isDemoMode = vi.fn().mockReturnValue(true);
      mockPayeeService.addPayee = vi.fn().mockResolvedValue({
        id: 'payee_123',
        name: 'John Smith',
        payid: 'john@example.com',
        payidType: 'email'
      });

      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      await user.type(payidInput, 'john@example.com');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/payid found/i)).toBeInTheDocument();
      });

      const confirmCheckbox = screen.getByRole('checkbox');
      const addButton = screen.getByRole('button', { name: /add payee/i });

      await user.click(confirmCheckbox);
      await user.click(addButton);

      await waitFor(() => {
        expect(mockPayeeService.addPayee).toHaveBeenCalledWith({
          name: 'John',
          payid: 'john@example.com',
          payidType: 'email'
        });
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: 'payee_123',
          name: 'John Smith',
          payid: 'john@example.com',
          payidType: 'email'
        });
      });
    });

    it('should handle errors during payee creation', async () => {
      mockPayeeService.isDemoMode = vi.fn().mockReturnValue(true);
      mockPayeeService.addPayee = vi.fn().mockRejectedValue(new Error('Failed to add payee'));

      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const payidInput = screen.getByPlaceholderText(/user@example.com/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });

      await user.type(payidInput, 'test@example.com');
      await user.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/payid found/i)).toBeInTheDocument();
      });

      const confirmCheckbox = screen.getByRole('checkbox');
      const addButton = screen.getByRole('button', { name: /add payee/i });

      await user.click(confirmCheckbox);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to add payee/i)).toBeInTheDocument();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });
});