import { PAYEE_CONSTANTS } from '../constants/payeeConstants';
import { validateApiResponse, sanitizeSearchTerm } from '../utils/inputValidation';
import type { PayeeData } from '../types/payee';

/**
 * Service for making API calls to fetch payee data
 * Focused only on HTTP communication
 */
export class PayeeApiService {
  
  /**
   * Fetch all payees from the API
   */
  async getAllPayees(): Promise<PayeeData[]> {
    const response = await fetch('/api/payees');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.payees || [];
  }

  /**
   * Search payees via API
   */
  async searchPayees(query: string): Promise<PayeeData[]> {
    const sanitizedQuery = sanitizeSearchTerm(query);
    
    const response = await fetch(`/api/payees/search?q=${encodeURIComponent(sanitizedQuery)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    // Validate API response
    const validation = validateApiResponse(results);
    if (!validation.isValid) {
      throw new Error(validation.error || PAYEE_CONSTANTS.ERRORS.INVALID_RESPONSE);
    }
    
    // Convert API response format to our PayeeData format
    return results.map(this.normalizeApiResponse);
  }

  /**
   * Normalize API response to consistent PayeeData format
   */
  private normalizeApiResponse(result: any): PayeeData {
    return {
      id: result.id || Math.random().toString(),
      name: result.payeeName || result.name || '',
      payid: result.payID || result.payid || '',
      payidType: result.payIDType || result.payidType || 'email',
      nickname: result.nickname
    };
  }
}