import type { PayIDType, PayIDValidationResult, PayIDValidationPayee } from '../types/payid';
import { PayIDTypeApiMapping } from '../types/payid';

/**
 * Service for validating PayIDs through external PayID API
 * Handles format validation, existence checks, and status verification
 */
export class PayidValidationService {
  /**
   * Validate a PayID through the external PayID API
   */
  async validatePayID(payId: string, payIdType: PayIDType): Promise<PayIDValidationResult> {
    try {
      // Map UI type to API type for external validation
      const apiType = PayIDTypeApiMapping[payIdType];
      
      const response = await fetch('/api/payids/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payId: payId.trim(),
          payIdType: apiType
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert API response back to UI types
        const payee: PayIDValidationPayee = {
          payId: data.payId,
          payIdType: this.mapApiTypeToUiType(data.payIdType),
          payIdOwnerCommonName: data.payIdOwnerCommonName,
          status: data.status,
          nppReachable: data.nppReachable
        };

        // Check if PayID is active and reachable
        if (data.status !== 'ACTIVE') {
          return {
            isValid: false,
            error: 'PAYID_INACTIVE',
            payee
          };
        }

        if (!data.nppReachable) {
          return {
            isValid: false,
            error: 'PAYID_UNREACHABLE',
            payee
          };
        }

        return {
          isValid: true,
          payee
        };
      }

      // Handle error responses
      if (response.status === 400) {
        const errorData = await response.json();
        return {
          isValid: false,
          error: 'INVALID_PAYID_FORMAT',
          expectedFormat: errorData.expectedFormat
        };
      }

      if (response.status === 404) {
        return {
          isValid: false,
          error: 'PAYID_NOT_FOUND'
        };
      }

      // Other API errors
      return {
        isValid: false,
        error: 'API_ERROR'
      };

    } catch (error) {
      console.error('PayID validation network error:', error);
      return {
        isValid: false,
        error: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Map API PayID type back to UI type
   */
  private mapApiTypeToUiType(apiType: string): PayIDType {
    switch (apiType) {
      case 'EMAIL':
        return 'EMAIL';
      case 'TELEPHONE':
        return 'MOBILE';
      case 'INDIVIDUAL_AUSTRALIAN':
        return 'ABN';
      default:
        return 'EMAIL'; // fallback
    }
  }
}