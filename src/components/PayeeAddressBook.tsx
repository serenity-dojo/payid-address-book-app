
import { useState } from 'react';
import PayeeList from './payee/PayeeList';
import PayeeSearch from './payee/PayeeSearch';
import { payeeService } from '../services/payeeService';
import type { DisplayPayee } from '../types/payee';

function PayeeAddressBook() {
  const [searchResults, setSearchResults] = useState<DisplayPayee[] | undefined>(undefined);
  const isDemoMode = payeeService.isDemoMode();

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults(undefined);
      return;
    }

    try {
      const results = await payeeService.searchPayees(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching payees:', error);
      setSearchResults([]);
    }
  };
  
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
      <PayeeSearch onSearch={handleSearch} />
      <PayeeList filteredPayees={searchResults} />
    </div>
  );
}

export default PayeeAddressBook;