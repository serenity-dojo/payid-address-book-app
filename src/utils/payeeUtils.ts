import { PAYEE_CONSTANTS } from '../constants/payeeConstants';
import type { PayeeData, DisplayPayee } from '../types/payee';

/**
 * Format mobile number as Australian format with spaces (0412 345 678)
 */
export function formatMobileNumber(mobile: string): string {
  // Remove any existing spaces or formatting
  const digits = mobile.replace(/\D/g, '');
  
  // Australian mobile format: 0XXX XXX XXX
  if (digits.length === PAYEE_CONSTANTS.MOBILE_NUMBER_LENGTH && 
      digits.startsWith(PAYEE_CONSTANTS.MOBILE_NUMBER_PREFIX)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  
  // Return original if not standard Australian mobile format  
  return mobile;
}

/**
 * Normalize mobile number for search matching (remove all non-digits)
 */
export function normalizeMobileNumber(mobile: string): string {
  return mobile.replace(/\D/g, '');
}

/**
 * Convert PayeeData to DisplayPayee with proper formatting
 */
export function formatPayeeForDisplay(payee: PayeeData): DisplayPayee {
  const displayName = payee.nickname 
    ? `${payee.name} (${payee.nickname})`
    : payee.name;
    
  const formattedPayID = payee.payidType === 'mobile' 
    ? formatMobileNumber(payee.payid)
    : payee.payid;

  return {
    id: payee.id,
    displayName,
    formattedPayID,
    rawPayID: payee.payid,
    payidType: payee.payidType
  };
}

/**
 * Sort payees alphabetically by name
 */
export function sortPayeesByName(payees: PayeeData[]): PayeeData[] {
  return payees.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sort and format payees for display - single function to eliminate duplication
 */
export function formatPayeesForDisplay(payees: PayeeData[]): DisplayPayee[] {
  return sortPayeesByName(payees).map(formatPayeeForDisplay);
}