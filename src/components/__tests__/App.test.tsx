import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App Component', () => {
  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /payid address book/i })).toBeInTheDocument();
  });

  it('renders both tabs', () => {
    render(<App />);
    expect(screen.getByRole('tab', { name: /payee address book/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /add new payee/i })).toBeInTheDocument();
  });

  it('has Payee Address Book tab active by default', () => {
    render(<App />);
    const addressBookTab = screen.getByRole('tab', { name: /payee address book/i });
    expect(addressBookTab).toHaveAttribute('aria-selected', 'true');
    expect(addressBookTab).toHaveClass('active');
  });

  it('switches tabs when clicked', () => {
    render(<App />);
    
    const addressBookTab = screen.getByRole('tab', { name: /payee address book/i });
    const addPayeeTab = screen.getByRole('tab', { name: /add new payee/i });
    
    // Initially address book should be active
    expect(addressBookTab).toHaveAttribute('aria-selected', 'true');
    expect(addPayeeTab).toHaveAttribute('aria-selected', 'false');
    
    // Click add payee tab
    fireEvent.click(addPayeeTab);
    
    // Add payee should now be active
    expect(addPayeeTab).toHaveAttribute('aria-selected', 'true');
    expect(addressBookTab).toHaveAttribute('aria-selected', 'false');
  });

  it('displays correct content for each tab', () => {
    render(<App />);
    
    // Address book content should be visible initially
    expect(screen.getByText(/saved payees/i)).toBeInTheDocument();
    expect(screen.getByText(/your payid address book will be displayed here/i)).toBeInTheDocument();
    
    // Click add payee tab
    const addPayeeTab = screen.getByRole('tab', { name: /add new payee/i });
    fireEvent.click(addPayeeTab);
    
    // Add payee content should now be visible - use heading to be more specific
    expect(screen.getByRole('heading', { name: /add new payee/i })).toBeInTheDocument();
    expect(screen.getByText(/payid payee form will be implemented here/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<App />);
    
    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveAttribute('aria-label', 'PayID Address Book Navigation');
    
    const addressBookTab = screen.getByRole('tab', { name: /payee address book/i });
    expect(addressBookTab).toHaveAttribute('aria-controls', 'address-book-panel');
    expect(addressBookTab).toHaveAttribute('id', 'address-book-tab');
    
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'address-book-tab');
  });
});