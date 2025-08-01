// PayID Type enum based on API specification
export type PayIDType = 'email' | 'mobile' | 'abn';

// Raw payee data as returned by API
export interface PayeeData {
  id: string;
  name: string;
  payid: string;
  payidType: PayIDType;
  nickname?: string;
}

// Formatted payee for display purposes
export interface DisplayPayee {
  id: string;
  displayName: string; // "Name" or "Name (Nickname)"
  formattedPayID: string; // Mobile numbers formatted with spaces
  rawPayID: string; // Original PayID value
  payidType: PayIDType;
}