import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AddNewPayee from '../AddNewPayee';

describe('AddNewPayee Component', () => {
  it('renders the component title', () => {
    render(<AddNewPayee />);
    expect(screen.getByRole('heading', { name: /add new payee/i })).toBeInTheDocument();
  });

  it('displays placeholder content for the form', () => {
    render(<AddNewPayee />);
    expect(screen.getByText(/add a new payid payee to your address book/i)).toBeInTheDocument();
    expect(screen.getByText(/payid payee form will be implemented here/i)).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', () => {
    render(<AddNewPayee />);
    const placeholder = screen.getByText(/payid payee form will be implemented here/i).closest('div');
    expect(placeholder).toHaveClass('placeholder-section');
    
    const description = screen.getByText(/add a new payid payee to your address book/i);
    expect(description).toHaveClass('component-description');
  });
});