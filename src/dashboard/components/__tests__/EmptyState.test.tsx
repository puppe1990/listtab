import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render message and save button', () => {
    render(<EmptyState />);
    expect(screen.getByText(/no tabs saved yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save all tabs/i })).toBeInTheDocument();
  });

  it('should call onSaveAll when button clicked', () => {
    const handleSaveAll = vi.fn();
    render(<EmptyState onSaveAll={handleSaveAll} />);
    fireEvent.click(screen.getByRole('button', { name: /save all tabs/i }));
    expect(handleSaveAll).toHaveBeenCalledOnce();
  });

  it('should use default empty onSaveAll without throwing', () => {
    render(<EmptyState />);
    fireEvent.click(screen.getByRole('button', { name: /save all tabs/i }));
  });
});
