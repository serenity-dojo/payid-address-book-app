import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayidValidationService } from '../payidValidationService';
import { PayIDType } from '../../types/payid';

// Mock fetch globally
global.fetch = vi.fn();

describe('PayidValidationService', () => {
  let service: PayidValidationService;

  beforeEach(() => {
    service = new PayidValidationService();
    vi.clearAllMocks();
  });

  describe('validatePayID', () => {
    describe('when PayID is valid and active', () => {
      it('should return valid result for active email PayID', async () => {
        const mockResponse = {
          payId: 'john@example.com',
          payIdType: 'EMAIL',
          payIdOwnerCommonName: 'John Smith',
          status: 'ACTIVE',
          nppReachable: true
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await service.validatePayID('john@example.com', PayIDType.EMAIL);

        expect(result.isValid).toBe(true);
        expect(result.payee).toEqual({
          payId: 'john@example.com',
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'John Smith',
          status: 'ACTIVE',
          nppReachable: true
        });
        expect(result.error).toBeUndefined();
      });

      it('should return valid result for active mobile PayID', async () => {
        const mockResponse = {
          payId: '+61-412345678',
          payIdType: 'TELEPHONE',
          payIdOwnerCommonName: 'Jane Doe',
          status: 'ACTIVE',
          nppReachable: true
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await service.validatePayID('0412345678', PayIDType.MOBILE);

        expect(result.isValid).toBe(true);
        expect(result.payee?.payIdType).toBe(PayIDType.MOBILE);
        expect(result.payee?.payIdOwnerCommonName).toBe('Jane Doe');
      });

      it('should return valid result for active ABN PayID', async () => {
        const mockResponse = {
          payId: '12345678901',
          payIdType: 'INDIVIDUAL_AUSTRALIAN',
          payIdOwnerCommonName: 'Test Business Pty Ltd',
          status: 'ACTIVE',
          nppReachable: true
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await service.validatePayID('12345678901', PayIDType.ABN);

        expect(result.isValid).toBe(true);
        expect(result.payee?.payIdType).toBe(PayIDType.ABN);
        expect(result.payee?.payIdOwnerCommonName).toBe('Test Business Pty Ltd');
      });
    });

    describe('when PayID format is invalid', () => {
      it('should return format error for invalid email', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            error: 'INVALID_PAYID_FORMAT',
            expectedFormat: 'user@domain.com (maximum 256 characters, lowercase)'
          })
        });

        const result = await service.validatePayID('invalid-email', PayIDType.EMAIL);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('INVALID_PAYID_FORMAT');
        expect(result.expectedFormat).toBe('user@domain.com (maximum 256 characters, lowercase)');
      });

      it('should return format error for invalid mobile', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            error: 'INVALID_PAYID_FORMAT',
            expectedFormat: '+XX-XXXXXXXXX (country code + phone number)'
          })
        });

        const result = await service.validatePayID('123', PayIDType.MOBILE);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('INVALID_PAYID_FORMAT');
        expect(result.expectedFormat).toBe('+XX-XXXXXXXXX (country code + phone number)');
      });

      it('should return format error for invalid ABN', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            error: 'INVALID_PAYID_FORMAT',
            expectedFormat: '9-11 digit Australian Business Number'
          })
        });

        const result = await service.validatePayID('123', PayIDType.ABN);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('INVALID_PAYID_FORMAT');
      });
    });

    describe('when PayID is not found', () => {
      it('should return not found error', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({
            error: { code: 'PAYID_NOT_FOUND' }
          })
        });

        const result = await service.validatePayID('notfound@example.com', PayIDType.EMAIL);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('PAYID_NOT_FOUND');
      });
    });

    describe('when PayID is inactive', () => {
      it('should return inactive error for disabled PayID', async () => {
        const mockResponse = {
          payId: 'disabled@example.com',
          payIdType: 'EMAIL',
          payIdOwnerCommonName: 'Disabled User',
          status: 'DISABLED',
          nppReachable: false
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await service.validatePayID('disabled@example.com', PayIDType.EMAIL);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('PAYID_INACTIVE');
        expect(result.payee).toEqual({
          payId: 'disabled@example.com',
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'Disabled User',
          status: 'DISABLED',
          nppReachable: false
        });
      });
    });

    describe('when PayID is unreachable', () => {
      it('should return unreachable error when nppReachable is false', async () => {
        const mockResponse = {
          payId: 'unreachable@example.com',
          payIdType: 'EMAIL',
          payIdOwnerCommonName: 'Unreachable User',
          status: 'ACTIVE',
          nppReachable: false
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const result = await service.validatePayID('unreachable@example.com', PayIDType.EMAIL);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('PAYID_UNREACHABLE');
        expect(result.payee?.nppReachable).toBe(false);
      });
    });

    describe('when network error occurs', () => {
      it('should return network error when fetch fails', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

        const result = await service.validatePayID('test@example.com', PayIDType.EMAIL);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('NETWORK_ERROR');
      });
    });

    describe('when API returns unexpected error', () => {
      it('should return API error for 500 status', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

        const result = await service.validatePayID('test@example.com', PayIDType.EMAIL);

        expect(result.isValid).toBe(false);
        expect(result.error).toBe('API_ERROR');
      });
    });
  });
});