import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PayeeAddressBook from '../PayeeAddressBook';

// Mock the PayeeList component
vi.mock('../payee/PayeeList', () => ({
  default: () => <div data-testid="payee-list">PayeeList Component</div>
}));

describe('PayeeAddressBook Component', () => {
  it('renders the component title', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByRole('heading', { name: /saved payees/i })).toBeInTheDocument();
  });

  it('displays description text', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByText(/your payid address book will be displayed here/i)).toBeInTheDocument();
  });

  it('renders the PayeeList component', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByTestId('payee-list')).toBeInTheDocument();
  });

  it('has proper CSS classes', () => {
    render(<PayeeAddressBook />);
    const description = screen.getByText(/your payid address book will be displayed here/i);
    expect(description).toHaveClass('component-description');
  });
});