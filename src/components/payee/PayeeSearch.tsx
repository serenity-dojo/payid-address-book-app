import { useState, useRef, useEffect } from 'react';
import { payeeService } from '../../services/payeeService';
import { PAYEE_CONSTANTS } from '../../constants/payeeConstants';
import type { DisplayPayee } from '../../types/payee';

interface PayeeSearchProps {
  onSearch: (searchTerm: string) => void;
}

function PayeeSearch({ onSearch }: PayeeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<DisplayPayee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes for suggestions with debouncing
  useEffect(() => {
    const handleSearchAndSuggestions = async () => {
      if (searchTerm.length >= PAYEE_CONSTANTS.MIN_SEARCH_LENGTH) {
        try {
          setIsLoading(true);
          const results = await payeeService.searchPayees(searchTerm);
          
          // Show suggestions dropdown
          setSuggestions(results.slice(0, PAYEE_CONSTANTS.MAX_SUGGESTIONS));
          setShowSuggestions(true);
          
          // Also trigger the main search (debounced)
          onSearch(searchTerm);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        // Don't trigger search for short terms, unless it's empty (handled in handleInputChange)
      }
    };

    const debounceTimer = setTimeout(handleSearchAndSuggestions, PAYEE_CONSTANTS.SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, onSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(searchTerm);
  };

  const handleSuggestionClick = (payee: DisplayPayee) => {
    // Use the exact payee name or a unique identifier to get exact match
    const exactSearchTerm = payee.displayName;
    setSearchTerm(exactSearchTerm);
    setShowSuggestions(false);
    
    // For exact search, we'll pass the specific payee directly to avoid partial matches
    // Call the parent's onSearch with the exact term, but we'll need to update
    // PayeeAddressBook to handle exact matches
    onSearch(exactSearchTerm);
    searchInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Only trigger search immediately if clearing the input
    if (!value.trim()) {
      onSearch('');
    }
    // For non-empty values, search will be triggered by the debounced suggestions effect
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    onSearch('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="payee-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search by name, nickname, email, mobile, or ABN..."
            className="search-input"
            aria-label="Search payees"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="clear-search-button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="search-button"
          disabled={!searchTerm.trim() || isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown" role="listbox" aria-label="Search suggestions">
          {suggestions.map((payee) => (
            <button
              key={payee.id}
              type="button"
              className="suggestion-item"
              onClick={() => handleSuggestionClick(payee)}
              role="option"
              aria-selected="false"
            >
              {payee.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PayeeSearch;