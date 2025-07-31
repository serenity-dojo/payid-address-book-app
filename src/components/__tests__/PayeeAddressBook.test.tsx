import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PayeeAddressBook from '../PayeeAddressBook';

describe('PayeeAddressBook Component', () => {
  it('renders the component title', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByRole('heading', { name: /saved payees/i })).toBeInTheDocument();
  });

  it('displays placeholder content when no payees exist', () => {
    render(<PayeeAddressBook />);
    expect(screen.getByText(/your payid address book will be displayed here/i)).toBeInTheDocument();
    expect(screen.getByText(/no payees found/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first payid payee/i)).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', () => {
    render(<PayeeAddressBook />);
    const placeholder = screen.getByText(/no payees found/i).closest('div');
    expect(placeholder).toHaveClass('placeholder-section');
    
    const description = screen.getByText(/your payid address book will be displayed here/i);
    expect(description).toHaveClass('component-description');
  });
});