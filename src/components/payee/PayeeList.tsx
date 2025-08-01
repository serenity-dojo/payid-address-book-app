import { useState, useEffect } from 'react';
import { payeeService } from '../../services/payeeService';
import type { DisplayPayee } from '../../types/payee';

interface PayeeListState {
  payees: DisplayPayee[];
  isLoading: boolean;
  error: string | null;
}

function PayeeList() {
  const [state, setState] = useState<PayeeListState>({
    payees: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
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
  }, []);

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

  if (state.payees.length === 0) {
    return (
      <div className="payee-list-empty">
        <p>No payees found. Add your first PayID payee using the &ldquo;Add New Payee&rdquo; tab.</p>
      </div>
    );
  }

  return (
    <ul className="payee-list" role="list" aria-label="PayID payees">
      {state.payees.map((payee) => (
        <li key={payee.id} className="payee-item" role="listitem">
          <div className="payee-name">{payee.displayName}</div>
          <div className="payee-payid">{payee.formattedPayID}</div>
        </li>
      ))}
    </ul>
  );
}

export default PayeeList;