import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddNewPayee from '../AddNewPayee';
import { payeeService } from '../../services/payeeService';
import { PayidValidationService } from '../../services/payidValidationService';
import { PayIDType } from '../../types/payid';

// Mock the services
vi.mock('../../services/payeeService');
vi.mock('../../services/payidValidationService');

const mockPayeeService = vi.mocked(payeeService);
const mockPayidValidationService = vi.mocked(PayidValidationService);

describe('AddNewPayee', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the form with all required fields', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      expect(screen.getByRole('heading', { name: /add new payee/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/payee name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payid type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^payid \*/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /validate payid/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add payee/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should have PayID type dropdown with EMAIL, MOBILE, and ABN options', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const payidTypeSelect = screen.getByLabelText(/payid type/i);
      expect(payidTypeSelect).toBeInTheDocument();
      
      // Check options exist (they might be in a select or custom dropdown)
      expect(screen.getByText('EMAIL')).toBeInTheDocument();
      expect(screen.getByText('MOBILE')).toBeInTheDocument();
      expect(screen.getByText('ABN')).toBeInTheDocument();
    });

    it('should start with Add Payee button enabled', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const addButton = screen.getByRole('button', { name: /add payee/i });
      expect(addButton).toBeEnabled();
    });
  });

  describe('form validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const addButton = screen.getByRole('button', { name: /add payee/i });
      
      // Try to submit with empty fields
      await user.click(addButton);
      
      expect(screen.getByText(/payee name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/^payid is required$/i)).toBeInTheDocument();
    });

    it('should validate PayID format based on selected type', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const payidTypeSelect = screen.getByLabelText(/payid type/i);
      
      // Select EMAIL type and enter invalid email
      await user.selectOptions(payidTypeSelect, 'EMAIL');
      await user.type(payidInput, 'invalid-email');
      await user.tab(); // Trigger blur validation
      
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('should validate mobile number format', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const payidTypeSelect = screen.getByLabelText(/payid type/i);
      
      // Select MOBILE type and enter invalid mobile
      await user.selectOptions(payidTypeSelect, 'MOBILE');
      await user.type(payidInput, '123');
      await user.tab();
      
      expect(screen.getByText(/please enter a valid australian mobile number/i)).toBeInTheDocument();
    });

    it('should validate ABN format', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const payidTypeSelect = screen.getByLabelText(/payid type/i);
      
      // Select ABN type and enter invalid ABN
      await user.selectOptions(payidTypeSelect, 'ABN');
      await user.type(payidInput, '123');
      await user.tab();
      
      expect(screen.getByText(/please enter a valid 11-digit abn/i)).toBeInTheDocument();
    });
  });

  describe('PayID validation', () => {
    it('should validate PayID when Validate PayID button is clicked', async () => {
      // Mock the PayidValidationService constructor to return a mock instance
      const mockValidatePayID = vi.fn().mockResolvedValue({
        isValid: true,
        payee: {
          payId: 'john@example.com',
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'John Smith',
          status: 'ACTIVE',
          nppReachable: true
        }
      });
      
      mockPayidValidationService.mockImplementation(() => ({
        validatePayID: mockValidatePayID
      }));
      
      const user = userEvent.setup();
      
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText(/payee name/i);
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const payidTypeSelect = screen.getByLabelText(/payid type/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });
      
      await user.type(nameInput, 'John Smith');
      await user.selectOptions(payidTypeSelect, 'EMAIL');
      await user.type(payidInput, 'john@example.com');
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payid validated successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/owner: john smith/i)).toBeInTheDocument();
      });
    });

    it('should show error when PayID validation fails', async () => {
      const mockValidatePayID = vi.fn().mockResolvedValue({
        isValid: false,
        error: 'PAYID_NOT_FOUND'
      });
      
      mockPayidValidationService.mockImplementation(() => ({
        validatePayID: mockValidatePayID
      }));
      
      const user = userEvent.setup();
      
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText(/payee name/i);
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });
      
      await user.type(nameInput, 'John Smith');
      await user.type(payidInput, 'notfound@example.com');
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payid not found/i)).toBeInTheDocument();
      });
    });

    it('should only allow form submission after successful PayID validation', async () => {
      const mockValidatePayID = vi.fn().mockResolvedValue({
        isValid: true,
        payee: {
          payId: 'john@example.com',
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'John Smith',
          status: 'ACTIVE',
          nppReachable: true
        }
      });
      
      mockPayidValidationService.mockImplementation(() => ({
        validatePayID: mockValidatePayID
      }));
      
      mockPayeeService.addPayee = vi.fn().mockResolvedValue({
        id: 'payee_123',
        name: 'John Smith',
        payid: 'john@example.com',
        payidType: 'email'
      });
      
      const user = userEvent.setup();
      
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText(/payee name/i);
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });
      const addButton = screen.getByRole('button', { name: /add payee/i });
      
      // Button is always enabled, but form submission should be prevented
      expect(addButton).toBeEnabled();
      
      await user.type(nameInput, 'John Smith');
      await user.type(payidInput, 'john@example.com');
      
      // Try to submit before validation - should not work
      await user.click(addButton);
      expect(mockPayeeService.addPayee).not.toHaveBeenCalled();
      
      // Now validate PayID
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payid validated successfully/i)).toBeInTheDocument();
      });
      
      // Now submission should work
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockPayeeService.addPayee).toHaveBeenCalled();
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('form submission', () => {
    it('should add payee and call onSuccess when form is submitted', async () => {
      const mockValidatePayID = vi.fn().mockResolvedValue({
        isValid: true,
        payee: {
          payId: 'john@example.com',
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'John Smith',
          status: 'ACTIVE',
          nppReachable: true
        }
      });
      
      mockPayidValidationService.mockImplementation(() => ({
        validatePayID: mockValidatePayID
      }));
      
      mockPayeeService.addPayee = vi.fn().mockResolvedValue({
        id: 'payee_123',
        name: 'John Smith',
        payid: 'john@example.com',
        payidType: 'email',
        nickname: 'Johnny'
      });
      
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText(/payee name/i);
      const nicknameInput = screen.getByLabelText(/nickname/i);
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const payidTypeSelect = screen.getByLabelText(/payid type/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });
      const addButton = screen.getByRole('button', { name: /add payee/i });
      
      await user.type(nameInput, 'John Smith');
      await user.type(nicknameInput, 'Johnny');
      await user.selectOptions(payidTypeSelect, 'EMAIL');
      await user.type(payidInput, 'john@example.com');
      await user.click(validateButton);
      
      await waitFor(() => expect(addButton).toBeEnabled());
      
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockPayeeService.addPayee).toHaveBeenCalledWith({
          name: 'John Smith',
          nickname: 'Johnny',
          payid: 'john@example.com',
          payidType: 'email'
        });
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: 'payee_123',
          name: 'John Smith',
          payid: 'john@example.com',
          payidType: 'email',
          nickname: 'Johnny'
        });
      });
    });

    it('should handle errors during payee creation', async () => {
      const mockValidatePayID = vi.fn().mockResolvedValue({
        isValid: true,
        payee: {
          payId: 'john@example.com',
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'John Smith',
          status: 'ACTIVE',
          nppReachable: true
        }
      });
      
      mockPayidValidationService.mockImplementation(() => ({
        validatePayID: mockValidatePayID
      }));
      
      mockPayeeService.addPayee = vi.fn().mockRejectedValue(new Error('Failed to add payee'));
      
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const nameInput = screen.getByLabelText(/payee name/i);
      const payidInput = screen.getByLabelText(/^payid \*/i);
      const validateButton = screen.getByRole('button', { name: /validate payid/i });
      const addButton = screen.getByRole('button', { name: /add payee/i });
      
      await user.type(nameInput, 'John Smith');
      await user.type(payidInput, 'john@example.com');
      await user.click(validateButton);
      
      await waitFor(() => expect(addButton).toBeEnabled());
      
      await user.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to add payee/i)).toBeInTheDocument();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('cancel functionality', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels and form structure', () => {
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByLabelText(/payee name/i)).toHaveAttribute('required');
      expect(screen.getByLabelText(/^payid \*/i)).toHaveAttribute('required');
      
      // Check for proper labeling
      const nameInput = screen.getByLabelText(/payee name/i);
      expect(nameInput).toHaveAttribute('aria-describedby');
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<AddNewPayee onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
      
      const addButton = screen.getByRole('button', { name: /add payee/i });
      await user.click(addButton);
      
      const errorMessage = screen.getByText(/payee name is required/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});