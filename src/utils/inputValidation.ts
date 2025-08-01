import { PAYEE_CONSTANTS } from '../constants/payeeConstants';

/**
 * Sanitize search input to prevent XSS and normalize whitespace
 */
export function sanitizeSearchTerm(term: string): string {
  if (typeof term !== 'string') {
    return '';
  }
  
  return term
    .trim()
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .substring(0, 100); // Limit length to prevent abuse
}

/**
 * Validate search term length and content
 */
export function validateSearchTerm(term: string): { isValid: boolean; error?: string } {
  const sanitized = sanitizeSearchTerm(term);
  
  if (sanitized.length === 0) {
    return { isValid: true }; // Empty is valid (clears search)
  }
  
  if (sanitized.length < PAYEE_CONSTANTS.MIN_SEARCH_LENGTH && sanitized.length > 0) {
    return { 
      isValid: false, 
      error: `Search term must be at least ${PAYEE_CONSTANTS.MIN_SEARCH_LENGTH} characters` 
    };
  }
  
  // Check for suspicious patterns
  if (/[<>{}()[\]]/.test(sanitized)) {
    return { 
      isValid: false, 
      error: 'Search term contains invalid characters' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate API response data structure
 */
export function validatePayeeData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const required = ['id', 'name', 'payid', 'payidType'];
  return required.every(field => data.hasOwnProperty(field) && data[field] !== null);
}

/**
 * Validate API response array
 */
export function validateApiResponse(data: any): { isValid: boolean; error?: string } {
  if (!Array.isArray(data)) {
    return { 
      isValid: false, 
      error: PAYEE_CONSTANTS.ERRORS.INVALID_RESPONSE 
    };
  }
  
  const invalidItems = data.filter(item => !validatePayeeData(item));
  if (invalidItems.length > 0) {
    return { 
      isValid: false, 
      error: `Invalid payee data found: ${invalidItems.length} items` 
    };
  }
  
  return { isValid: true };
}