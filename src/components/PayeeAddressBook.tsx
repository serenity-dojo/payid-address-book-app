
import PayeeList from './payee/PayeeList';
import { payeeService } from '../services/payeeService';

function PayeeAddressBook() {
  const isDemoMode = payeeService.isDemoMode();
  
  return (
    <div>
      <h2>Saved Payees</h2>
      {isDemoMode && (
        <div className="demo-mode-banner" style={{ 
          backgroundColor: '#FFF9CC', 
          border: '1px solid #FFCC00', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          🎭 <strong>Demo Mode:</strong> Showing sample PayID data for demonstration purposes
        </div>
      )}
      <PayeeList />
    </div>
  );
}

export default PayeeAddressBook;