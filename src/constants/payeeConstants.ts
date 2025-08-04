/**
 * Constants for PayID payee functionality
 */

export const PAYEE_CONSTANTS = {
  // Search configuration
  MAX_SUGGESTIONS: 10,
  MIN_SEARCH_LENGTH: 3,
  SEARCH_DEBOUNCE_MS: 300,
  
  // API delays (in milliseconds)
  DEMO_DELAY_MS: 800,
  TEST_DELAY_MS: 100,
  SUGGESTIONS_DELAY_MS: 50,
  
  // Mobile number formatting
  MOBILE_NUMBER_LENGTH: 10,
  MOBILE_NUMBER_PREFIX: '0',
  
  // Display formatting
  PAYEE_SEPARATOR: '•',
  
  // Error messages
  ERRORS: {
    SEARCH_FAILED: 'Failed to search payees',
    LOAD_FAILED: 'Failed to load payees',
    ADD_FAILED: 'Failed to add payee',
    INVALID_RESPONSE: 'Invalid API response format',
    INVALID_SEARCH_TERM: 'Invalid search term provided',
    NETWORK_ERROR: 'Network error occurred'
  }
} as const;

export type PayeeConstants = typeof PAYEE_CONSTANTS;