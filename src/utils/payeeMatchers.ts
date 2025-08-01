import { normalizeMobileNumber } from './payeeUtils';
import type { PayeeData } from '../types/payee';

/**
 * Check if payee matches by exact display name (for suggestion clicks)
 */
export function matchByDisplayName(payee: PayeeData, query: string): boolean {
  const displayName = payee.nickname ? `${payee.name} (${payee.nickname})` : payee.name;
  return displayName.toLowerCase() === query.toLowerCase();
}

/**
 * Check if payee matches by name (partial, case-insensitive)
 */
export function matchByName(payee: PayeeData, query: string): boolean {
  return payee.name.toLowerCase().includes(query.toLowerCase());
}

/**
 * Check if payee matches by nickname (partial, case-insensitive)
 */
export function matchByNickname(payee: PayeeData, query: string): boolean {
  return payee.nickname?.toLowerCase().includes(query.toLowerCase()) ?? false;
}

/**
 * Check if mobile PayID matches normalized search query
 */
export function matchMobilePayID(payid: string, query: string): boolean {
  const normalizedStored = normalizeMobileNumber(payid);
  const normalizedQuery = normalizeMobileNumber(query);
  // Only match if the normalized query has digits and matches
  return normalizedQuery.length > 0 && normalizedStored.includes(normalizedQuery);
}

/**
 * Check if PayID matches (handles mobile, email, ABN)
 */
export function matchByPayID(payee: PayeeData, query: string): boolean {
  if (payee.payidType === 'mobile') {
    return matchMobilePayID(payee.payid, query);
  }
  
  // For email and ABN, do case-insensitive match
  return payee.payid.toLowerCase().includes(query.toLowerCase());
}

/**
 * Main search matcher - checks all criteria with proper priority
 */
export function payeeMatchesSearch(payee: PayeeData, query: string): boolean {
  // First check for exact display name match (from suggestion clicks)
  if (matchByDisplayName(payee, query)) {
    return true;
  }
  
  // Then check partial matches
  return matchByName(payee, query) || 
         matchByNickname(payee, query) || 
         matchByPayID(payee, query);
}