
import React, { useState, useRef } from 'react';
import { payeeService } from '../services/payeeService';
import { PayidValidationService } from '../services/payidValidationService';
import { PayIDType } from '../types/payid';
import type { PayeeData } from '../types/payee';
import type { PayIDValidationResult } from '../types/payid';
import './AddNewPayee.css';

interface Props {
  onSuccess: (payee: PayeeData) => void;
  onCancel: () => void;
}

type Step = 'enter-payid' | 'confirm-payee';

interface FormData {
  payidType: 'email' | 'mobile' | 'abn';
  payid: string;
}

interface FormErrors {
  payid?: string;
  validation?: string;
  submission?: string;
}

function AddNewPayee({ onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<Step>('enter-payid');
  const [formData, setFormData] = useState<FormData>({
    payidType: 'email',
    payid: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<PayIDValidationResult | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const validationService = useRef(new PayidValidationService());

  const validatePayIDFormat = (payid: string, type: string): boolean => {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(payid);
    } else if (type === 'mobile') {
      const mobileRegex = /^04\d{8}$/;
      const cleanMobile = payid.replace(/[^0-9]/g, '');
      return mobileRegex.test(cleanMobile);
    } else if (type === 'abn') {
      const abnRegex = /^\d{11}$/;
      return abnRegex.test(payid);
    }
    return false;
  };

  // Demo mode validation - accept most valid formats except special test cases
  const getDemoValidationResult = (payid: string, type: string): PayIDValidationResult => {
    // Special test cases for error conditions
    if (payid === 'disabled@example.com') {
      return {
        isValid: false,
        error: 'PAYID_INACTIVE',
        payee: {
          payId: payid,
          payIdType: PayIDType.EMAIL,
          payIdOwnerCommonName: 'Disabled User',
          status: 'DISABLED',
          nppReachable: false
        }
      };
    }
    
    if (payid === 'notfound@example.com') {
      return { isValid: false, error: 'PAYID_NOT_FOUND' };
    }
    
    if (payid === 'invalid@format') {
      return { 
        isValid: false, 
        error: 'INVALID_PAYID_FORMAT',
        expectedFormat: 'user@domain.com (maximum 256 characters, lowercase)'
      };
    }

    // For valid formats, generate a demo response
    if (validatePayIDFormat(payid, type)) {
      const name = type === 'email' 
        ? payid.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : type === 'mobile'
        ? `Mobile User ${payid.slice(-4)}`
        : `Business ${payid.slice(-4)} Pty Ltd`;
        
      return {
        isValid: true,
        payee: {
          payId: payid,
          payIdType: type.toUpperCase() as PayIDType,
          payIdOwnerCommonName: name,
          status: 'ACTIVE',
          nppReachable: true
        }
      };
    }
    
    return { isValid: false, error: 'INVALID_PAYID_FORMAT' };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation result when PayID or type changes
    if (field === 'payid' || field === 'payidType') {
      setValidationResult(null);
      setStep('enter-payid');
      setIsConfirmed(false);
    }
    
    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePayIDTypeSelect = (type: 'email' | 'mobile' | 'abn') => {
    handleInputChange('payidType', type);
  };

  const handleInputBlur = () => {
    // Validate PayID format on blur
    if (formData.payid.trim() && !validatePayIDFormat(formData.payid, formData.payidType)) {
      const errorMessage = formData.payidType === 'email' 
        ? 'Please enter a valid email address'
        : formData.payidType === 'mobile'
        ? 'Please enter a valid Australian mobile number'
        : 'Please enter a valid 11-digit ABN';
      setErrors(prev => ({ ...prev, payid: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, payid: undefined }));
    }
  };

  const handleValidatePayID = async () => {
    if (!formData.payid.trim()) {
      setErrors(prev => ({ ...prev, payid: 'PayID is required' }));
      return;
    }

    if (!validatePayIDFormat(formData.payid, formData.payidType)) {
      return; // Error already shown from blur validation
    }

    setIsValidating(true);
    setErrors(prev => ({ ...prev, validation: undefined }));

    try {
      // Check if we're in demo mode
      const isDemoMode = payeeService.isDemoMode();
      let result: PayIDValidationResult;
      
      if (isDemoMode) {
        // Use demo validation
        result = getDemoValidationResult(formData.payid, formData.payidType);
      } else {
        // Use real API validation
        const payIdType = formData.payidType.toUpperCase() as PayIDType;
        result = await validationService.current.validatePayID(formData.payid, payIdType);
      }
      
      setValidationResult(result);
      
      if (result.isValid) {
        setStep('confirm-payee');
      } else {
        let errorMessage = 'PayID validation failed';
        switch (result.error) {
          case 'PAYID_NOT_FOUND':
            errorMessage = 'PayID not found';
            break;
          case 'INVALID_PAYID_FORMAT':
            errorMessage = `Invalid format. ${result.expectedFormat || ''}`;
            break;
          case 'PAYID_INACTIVE':
            errorMessage = 'PayID is inactive';
            break;
          case 'PAYID_UNREACHABLE':
            errorMessage = 'PayID is unreachable';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network error occurred';
            break;
          case 'API_ERROR':
            errorMessage = 'API error occurred';
            break;
        }
        setErrors(prev => ({ ...prev, validation: errorMessage }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, validation: 'Failed to validate PayID' }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmationChange = (confirmed: boolean) => {
    setIsConfirmed(confirmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validationResult?.isValid || !isConfirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submission: undefined }));

    try {
      const payeeData = {
        name: validationResult.payee!.payIdOwnerCommonName,
        payid: formData.payid.trim(),
        payidType: formData.payidType
      };

      const addedPayee = await payeeService.addPayee(payeeData);
      onSuccess(addedPayee);
    } catch (error) {
      setErrors(prev => ({ ...prev, submission: 'Failed to add payee' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToPayIDEntry = () => {
    setStep('enter-payid');
    setValidationResult(null);
    setIsConfirmed(false);
    setErrors({});
  };

  const handleCancel = () => {
    // Reset everything to initial state
    setStep('enter-payid');
    setFormData({
      payidType: 'email',
      payid: ''
    });
    setValidationResult(null);
    setIsConfirmed(false);
    setErrors({});
  };

  const canValidate = formData.payid.trim() !== '' && !isValidating;
  const canSubmit = validationResult?.isValid && isConfirmed && !isSubmitting;

  return (
    <div>
      <h2>Add New Payee</h2>
      
      <form role="form" onSubmit={handleSubmit}>
        {step === 'enter-payid' && (
          <>
            <div className="payid-type-selector">
              <div className="payid-type-buttons">
                <button
                  type="button"
                  className={`payid-type-button ${formData.payidType === 'email' ? 'active' : ''}`}
                  onClick={() => handlePayIDTypeSelect('email')}
                  aria-pressed={formData.payidType === 'email'}
                >
                  <span className="icon">📧</span>
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  className={`payid-type-button ${formData.payidType === 'mobile' ? 'active' : ''}`}
                  onClick={() => handlePayIDTypeSelect('mobile')}
                  aria-pressed={formData.payidType === 'mobile'}
                >
                  <span className="icon">📱</span>
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  className={`payid-type-button ${formData.payidType === 'abn' ? 'active' : ''}`}
                  onClick={() => handlePayIDTypeSelect('abn')}
                  aria-pressed={formData.payidType === 'abn'}
                >
                  <span className="icon">🏢</span>
                  <span>ABN</span>
                </button>
              </div>
            </div>

            <div className="payid-input-group">
              <input
                id="payid"
                type="text"
                className="payid-input"
                value={formData.payid}
                onChange={(e) => handleInputChange('payid', e.target.value)}
                onBlur={handleInputBlur}
                placeholder={
                  formData.payidType === 'email' ? 'user@example.com' :
                  formData.payidType === 'mobile' ? '0412 345 678' : '12345678901'
                }
                aria-describedby={errors.payid ? 'payid-error' : undefined}
              />
              {errors.payid && (
                <div id="payid-error" role="alert" className="error-message">
                  {errors.payid}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleValidatePayID}
                disabled={!canValidate}
                className="validate-button"
              >
                {isValidating ? 'Validating...' : 'Validate PayID'}
              </button>
            </div>
          </>
        )}

        {step === 'confirm-payee' && validationResult?.isValid && (
          <>
            <div className="validation-result">
              <div className="success-message">
                <h3>PayID Found</h3>
                <p><strong>Name:</strong> {validationResult.payee?.payIdOwnerCommonName}</p>
                <p><strong>PayID:</strong> {formData.payid}</p>
                <p><strong>Type:</strong> {formData.payidType.toUpperCase()}</p>
              </div>
              
              <div className="confirmation-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => handleConfirmationChange(e.target.checked)}
                  />
                  <span>I confirm this is the correct payee</span>
                </label>
              </div>
            </div>

            <div className="form-actions confirmation-actions">
              <button
                type="submit"
                disabled={!canSubmit}
                className="add-payee-button"
              >
                {isSubmitting ? 'Adding...' : 'Add Payee'}
              </button>
              <button
                type="button"
                onClick={handleBackToPayIDEntry}
                className="back-button"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {errors.validation && (
          <div role="alert" className="error-message">
            {errors.validation}
          </div>
        )}

        {errors.submission && (
          <div role="alert" className="error-message">
            {errors.submission}
          </div>
        )}
      </form>
    </div>
  );
}

export default AddNewPayee;