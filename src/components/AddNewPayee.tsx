
import React, { useState, useRef } from 'react';
import { payeeService } from '../services/payeeService';
import { PayidValidationService } from '../services/payidValidationService';
import { PayIDType } from '../types/payid';
import type { PayeeData } from '../types/payee';
import type { PayIDValidationResult } from '../types/payid';

interface Props {
  onSuccess: (payee: PayeeData) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  nickname: string;
  payidType: 'email' | 'mobile' | 'abn';
  payid: string;
}

interface FormErrors {
  name?: string;
  payid?: string;
  validation?: string;
  submission?: string;
}

function AddNewPayee({ onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nickname: '',
    payidType: 'email',
    payid: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<PayIDValidationResult | null>(null);
  const validationService = useRef(new PayidValidationService());

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Payee name is required';
    }
    
    if (!formData.payid.trim()) {
      newErrors.payid = 'PayID is required';
    } else {
      // Format validation based on type
      if (formData.payidType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.payid)) {
          newErrors.payid = 'Please enter a valid email address';
        }
      } else if (formData.payidType === 'mobile') {
        const mobileRegex = /^04\d{8}$/;
        const cleanMobile = formData.payid.replace(/[^0-9]/g, '');
        if (!mobileRegex.test(cleanMobile)) {
          newErrors.payid = 'Please enter a valid Australian mobile number';
        }
      } else if (formData.payidType === 'abn') {
        const abnRegex = /^\d{11}$/;
        if (!abnRegex.test(formData.payid)) {
          newErrors.payid = 'Please enter a valid 11-digit ABN';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation result when PayID or type changes
    if (field === 'payid' || field === 'payidType') {
      setValidationResult(null);
    }
    
    // Clear field-specific errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputBlur = (field: keyof FormData) => {
    // Validate individual fields on blur
    if (field === 'name' && !formData.name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Payee name is required' }));
    } else if (field === 'payid' && formData.payid.trim()) {
      // Validate format
      if (formData.payidType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.payid)) {
          setErrors(prev => ({ ...prev, payid: 'Please enter a valid email address' }));
        }
      } else if (formData.payidType === 'mobile') {
        const mobileRegex = /^04\d{8}$/;
        const cleanMobile = formData.payid.replace(/[^0-9]/g, '');
        if (!mobileRegex.test(cleanMobile)) {
          setErrors(prev => ({ ...prev, payid: 'Please enter a valid Australian mobile number' }));
        }
      } else if (formData.payidType === 'abn') {
        const abnRegex = /^\d{11}$/;
        if (!abnRegex.test(formData.payid)) {
          setErrors(prev => ({ ...prev, payid: 'Please enter a valid 11-digit ABN' }));
        }
      }
    }
  };

  const handleValidatePayID = async () => {
    if (!formData.payid.trim()) {
      setErrors(prev => ({ ...prev, payid: 'PayID is required' }));
      return;
    }

    setIsValidating(true);
    setErrors(prev => ({ ...prev, validation: undefined }));

    try {
      const payIdType = formData.payidType.toUpperCase() as PayIDType;
      const result = await validationService.current.validatePayID(formData.payid, payIdType);
      
      setValidationResult(result);
      
      if (!result.isValid) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!validationResult?.isValid) {
      setErrors(prev => ({ ...prev, submission: 'Please validate PayID first' }));
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submission: undefined }));

    try {
      const payeeData = {
        name: formData.name.trim(),
        payid: formData.payid.trim(),
        payidType: formData.payidType,
        ...(formData.nickname.trim() && { nickname: formData.nickname.trim() })
      };

      const addedPayee = await payeeService.addPayee(payeeData);
      onSuccess(addedPayee);
    } catch (error) {
      setErrors(prev => ({ ...prev, submission: 'Failed to add payee' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPayeeClick = (e: React.MouseEvent) => {
    // Always validate when button is clicked
    if (!validateForm() || !validationResult?.isValid) {
      e.preventDefault();
      return;
    }
  };

  const canSubmit = validationResult?.isValid && !isSubmitting && !isValidating;

  return (
    <div>
      <h2>Add New Payee</h2>
      <p className="component-description">Add a new PayID payee to your address book.</p>
      
      <form role="form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="payee-name">
            Payee Name *
          </label>
          <input
            id="payee-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleInputBlur('name')}
            required
            aria-describedby="name-help"
          />
          <div id="name-help">
            {errors.name && (
              <div role="alert" style={{ color: 'red' }}>
                {errors.name}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="nickname">
            Nickname (optional)
          </label>
          <input
            id="nickname"
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="payid-type">
            PayID Type *
          </label>
          <select
            id="payid-type"
            value={formData.payidType}
            onChange={(e) => handleInputChange('payidType', e.target.value as 'email' | 'mobile' | 'abn')}
          >
            <option value="email">EMAIL</option>
            <option value="mobile">MOBILE</option>
            <option value="abn">ABN</option>
          </select>
        </div>

        <div>
          <label htmlFor="payid">
            PayID *
          </label>
          <input
            id="payid"
            type="text"
            value={formData.payid}
            onChange={(e) => handleInputChange('payid', e.target.value)}
            onBlur={() => handleInputBlur('payid')}
            required
            aria-describedby={errors.payid ? 'payid-error' : undefined}
          />
          {errors.payid && (
            <div id="payid-error" role="alert" style={{ color: 'red' }}>
              {errors.payid}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={handleValidatePayID}
            disabled={isValidating || !formData.payid.trim()}
          >
            {isValidating ? 'Validating...' : 'Validate PayID'}
          </button>
        </div>

        {validationResult?.isValid && (
          <div style={{ color: 'green' }}>
            <p>PayID validated successfully</p>
            <p>Owner: {validationResult.payee?.payIdOwnerCommonName}</p>
          </div>
        )}

        {errors.validation && (
          <div role="alert" style={{ color: 'red' }}>
            {errors.validation}
          </div>
        )}

        {errors.submission && (
          <div role="alert" style={{ color: 'red' }}>
            {errors.submission}
          </div>
        )}

        <div>
          <button
            type="submit"
            onClick={handleAddPayeeClick}
          >
            {isSubmitting ? 'Adding...' : 'Add Payee'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewPayee;