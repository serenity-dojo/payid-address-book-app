/**
 * PayID types and interfaces for validation and payee management
 */

export const PayIDType = {
  EMAIL: 'EMAIL',
  MOBILE: 'MOBILE', 
  ABN: 'ABN'
} as const;

export type PayIDType = typeof PayIDType[keyof typeof PayIDType];

// Map UI types to API types for external PayID validation
export const PayIDTypeApiMapping = {
  EMAIL: 'EMAIL',
  MOBILE: 'TELEPHONE',
  ABN: 'INDIVIDUAL_AUSTRALIAN'
} as const;

export interface PayIDValidationPayee {
  payId: string;
  payIdType: PayIDType;
  payIdOwnerCommonName: string;
  status: 'ACTIVE' | 'DISABLED';
  nppReachable: boolean;
}

export interface PayIDValidationResult {
  isValid: boolean;
  payee?: PayIDValidationPayee;
  error?: 'INVALID_PAYID_FORMAT' | 'PAYID_NOT_FOUND' | 'PAYID_INACTIVE' | 'PAYID_UNREACHABLE' | 'NETWORK_ERROR' | 'API_ERROR';
  expectedFormat?: string;
}