import type { PayeeData, DisplayPayee } from '../types/payee';
import { demoPayees } from '../data/demoPayees';

// Check if demo mode is enabled
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Check if we're in a browser environment (for API calls)
// In test environment, window might be defined by jsdom but we still want to use mock data
const isBrowserEnvironment = typeof window !== 'undefined' && !import.meta.env.VITEST;

// Mock data storage for testing
let mockPayees: PayeeData[] = isDemoMode ? [...demoPayees] : [];

// Format mobile number as Australian format with spaces (0412 345 678)
function formatMobileNumber(mobile: string): string {
  // Remove any existing spaces or formatting
  const digits = mobile.replace(/\D/g, '');
  
  // Australian mobile format: 0XXX XXX XXX
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  
  // Return original if not standard Australian mobile format  
  return mobile;
}

// Convert PayeeData to DisplayPayee with proper formatting
function formatPayeeForDisplay(payee: PayeeData): DisplayPayee {
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

// Log demo mode status
if (isDemoMode) {
  console.log('🎭 Demo mode enabled - Using pre-seeded payee data');
}

// API service
export const payeeService = {
  // Get all payees, sorted alphabetically by name
  async getAllPayees(): Promise<DisplayPayee[]> {
    try {
      // In demo mode or non-browser environment (testing), use local mock data
      if (isDemoMode || !isBrowserEnvironment) {
        // Simulate API delay for realistic feel (shorter for tests)
        const delay = isDemoMode ? 800 : 100;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Sort by name alphabetically and format for display
        return mockPayees
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(formatPayeeForDisplay);
      }

      // Make actual API call in browser environment
      const response = await fetch('/api/payees');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const payees: PayeeData[] = data.payees || [];
      
      // Sort by name alphabetically and format for display
      return payees
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(formatPayeeForDisplay);
        
    } catch (error) {
      console.error('Error fetching payees:', error);
      throw new Error('Failed to load payees');
    }
  },

  // Set mock data (for testing - works in demo mode or test environment)
  setMockData(payees: PayeeData[]): void {
    if (isDemoMode || !isBrowserEnvironment) {
      mockPayees = [...payees];
    }
  },

  // Clear all payees (for testing empty state - works in demo mode or test environment)
  clearPayees(): void {
    if (isDemoMode || !isBrowserEnvironment) {
      mockPayees = [];
    }
  },

  // Check if demo mode is enabled
  isDemoMode(): boolean {
    return isDemoMode;
  },

  // Get count of loaded payees (demo mode only)
  getPayeeCount(): number {
    return isDemoMode ? mockPayees.length : 0;
  }
};