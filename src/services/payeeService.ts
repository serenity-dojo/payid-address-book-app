import type { DisplayPayee, PayeeData } from '../types/payee';
import { PAYEE_CONSTANTS } from '../constants/payeeConstants';
import { formatPayeesForDisplay } from '../utils/payeeUtils';
import { validateSearchTerm, sanitizeSearchTerm } from '../utils/inputValidation';
import { PayeeApiService } from './payeeApiService';
import { PayeeMockService } from './payeeMockService';

/**
 * Main payee service - orchestrates between API and mock services
 * Handles environment detection and delegates to appropriate service
 */
class PayeeService {
  private readonly apiService: PayeeApiService;
  private readonly mockService: PayeeMockService;
  private readonly isBrowserEnvironment: boolean;

  constructor() {
    this.apiService = new PayeeApiService();
    this.mockService = new PayeeMockService();
    
    // Check if we're in a browser environment (for API calls)
    // In test environment, window might be defined by jsdom but we still want to use mock data
    // Also detect headless browser test environment (Playwright uses HeadlessChrome)
    const isHeadlessTest = typeof window !== 'undefined' && 
      window.navigator?.userAgent?.includes('HeadlessChrome');
    
    this.isBrowserEnvironment = typeof window !== 'undefined' && 
      !import.meta.env.VITEST && 
      !isHeadlessTest;
  }

  /**
   * Get all payees, sorted alphabetically by name
   */
  async getAllPayees(): Promise<DisplayPayee[]> {
    try {
      const payees = await this.getPayeeData();
      return formatPayeesForDisplay(payees);
    } catch (error) {
      console.error('Error fetching payees:', error);
      throw new Error(PAYEE_CONSTANTS.ERRORS.LOAD_FAILED);
    }
  }

  /**
   * Search payees by query term
   */
  async searchPayees(query: string): Promise<DisplayPayee[]> {
    // Validate and sanitize input
    const validation = validateSearchTerm(query);
    if (!validation.isValid) {
      throw new Error(validation.error || PAYEE_CONSTANTS.ERRORS.INVALID_SEARCH_TERM);
    }

    const sanitizedQuery = sanitizeSearchTerm(query);
    if (!sanitizedQuery || sanitizedQuery.length === 0) {
      return [];
    }

    try {
      const payees = await this.searchPayeeData(sanitizedQuery);
      return formatPayeesForDisplay(payees);
    } catch (error) {
      console.error('Error searching payees:', error);
      throw new Error(PAYEE_CONSTANTS.ERRORS.SEARCH_FAILED);
    }
  }

  /**
   * Set mock data (for testing - works in demo mode or test environment)
   */
  setMockData(payees: any[]): void {
    if (!this.shouldUseApi()) {
      this.mockService.setMockData(payees);
    }
  }

  /**
   * Clear all payees (for testing empty state - works in demo mode or test environment)
   */
  clearPayees(): void {
    if (!this.shouldUseApi()) {
      this.mockService.clearPayees();
    }
  }

  /**
   * Check if demo mode is enabled
   */
  isDemoMode(): boolean {
    return this.mockService.isDemoModeEnabled();
  }

  /**
   * Get count of loaded payees (demo mode only)
   */
  getPayeeCount(): number {
    return this.mockService.getPayeeCount();
  }

  /**
   * Add a new payee
   */
  async addPayee(payeeData: Omit<PayeeData, 'id'>): Promise<PayeeData> {
    try {
      // Generate unique ID
      const id = this.generateUniqueId();
      
      const newPayee: PayeeData = {
        id,
        ...payeeData
      };

      if (this.shouldUseApi()) {
        return await this.apiService.addPayee(newPayee);
      } else {
        return await this.mockService.addPayee(newPayee);
      }
    } catch (error) {
      console.error('Error adding payee:', error);
      throw new Error(PAYEE_CONSTANTS.ERRORS.ADD_FAILED || 'Failed to add payee');
    }
  }

  /**
   * Generate a unique ID for new payees
   */
  private generateUniqueId(): string {
    return `payee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine if we should use API or mock service
   */
  private shouldUseApi(): boolean {
    return this.isBrowserEnvironment && !this.isDemoMode();
  }

  /**
   * Get payee data from appropriate service
   */
  private async getPayeeData() {
    return this.shouldUseApi() 
      ? await this.apiService.getAllPayees()
      : await this.mockService.getAllPayees();
  }

  /**
   * Search payee data from appropriate service
   */
  private async searchPayeeData(query: string) {
    return this.shouldUseApi()
      ? await this.apiService.searchPayees(query)
      : await this.mockService.searchPayees(query);
  }
}

// Export singleton instance
export const payeeService = new PayeeService();