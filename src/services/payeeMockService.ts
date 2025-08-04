import { demoPayees } from '../data/demoPayees';
import { PAYEE_CONSTANTS } from '../constants/payeeConstants';
import { payeeMatchesSearch } from '../utils/payeeMatchers';
import type { PayeeData } from '../types/payee';

/**
 * Service for handling mock/demo payee data
 * Focused only on in-memory data operations
 */
export class PayeeMockService {
  private mockPayees: PayeeData[];
  private readonly isDemoMode: boolean;

  constructor() {
    this.isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    this.mockPayees = this.isDemoMode ? [...demoPayees] : [];
    
    if (this.isDemoMode) {
      console.log('🎭 Demo mode enabled - Using pre-seeded payee data');
    }
  }

  /**
   * Get all mock payees
   */
  async getAllPayees(): Promise<PayeeData[]> {
    const delay = this.isDemoMode ? PAYEE_CONSTANTS.DEMO_DELAY_MS : PAYEE_CONSTANTS.TEST_DELAY_MS;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return [...this.mockPayees];
  }

  /**
   * Search mock payees
   */
  async searchPayees(query: string): Promise<PayeeData[]> {
    const delay = this.isDemoMode ? PAYEE_CONSTANTS.SUGGESTIONS_DELAY_MS * 6 : PAYEE_CONSTANTS.SUGGESTIONS_DELAY_MS;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.mockPayees.filter(payee => payeeMatchesSearch(payee, query));
  }

  /**
   * Set mock data (for testing)
   */
  setMockData(payees: PayeeData[]): void {
    this.mockPayees = [...payees];
  }

  /**
   * Clear all payees (for testing)
   */
  clearPayees(): void {
    this.mockPayees = [];
  }

  /**
   * Add a new payee
   */
  async addPayee(payee: PayeeData): Promise<PayeeData> {
    const delay = this.isDemoMode ? PAYEE_CONSTANTS.DEMO_DELAY_MS : PAYEE_CONSTANTS.TEST_DELAY_MS;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.mockPayees.push(payee);
    return { ...payee };
  }

  /**
   * Get count of loaded payees
   */
  getPayeeCount(): number {
    return this.mockPayees.length;
  }

  /**
   * Check if demo mode is enabled
   */
  isDemoModeEnabled(): boolean {
    return this.isDemoMode;
  }
}