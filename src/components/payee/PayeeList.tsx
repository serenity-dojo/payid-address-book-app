import { useState, useEffect } from 'react';
import { payeeService } from '../../services/payeeService';
import type { DisplayPayee } from '../../types/payee';

interface PayeeListProps {
  filteredPayees?: DisplayPayee[];
}

interface PayeeListState {
  payees: DisplayPayee[];
  isLoading: boolean;
  error: string | null;
}

function PayeeList({ filteredPayees }: PayeeListProps) {
  const [state, setState] = useState<PayeeListState>({
    payees: [],
    isLoading: filteredPayees ? false : true,
    error: null
  });

  useEffect(() => {
    // Don't load from service if filtered payees are provided
    if (filteredPayees !== undefined) {
      return;
    }

    const loadPayees = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const payees = await payeeService.getAllPayees();
        setState({ payees, isLoading: false, error: null });
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Error loading payees. Please try again.' 
        }));
      }
    };

    loadPayees();
  }, [filteredPayees]);

  if (state.isLoading) {
    return (
      <div className="payee-list-loading">
        <p>Loading payees...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="payee-list-error">
        <p>{state.error}</p>
      </div>
    );
  }

  // Use filtered payees if provided, otherwise use state payees
  const payeesToDisplay = filteredPayees ?? state.payees;

  if (payeesToDisplay.length === 0) {
    return (
      <div className="payee-list-empty">
        <p>No payees found. Add your first PayID payee using the &ldquo;Add New Payee&rdquo; tab.</p>
      </div>
    );
  }

  return (
    <ul className="payee-list" role="list" aria-label="PayID payees">
      {payeesToDisplay.map((payee) => (
        <li key={payee.id} className="payee-item" role="listitem">
          <span className="payee-name">{payee.displayName}</span>
          <span className="payee-separator">•</span>
          <span className="payee-payid">{payee.formattedPayID}</span>
        </li>
      ))}
    </ul>
  );
}

export default PayeeList;