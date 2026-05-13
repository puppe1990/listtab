import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search tabs/i);
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchBar value="github" onChange={() => {}} />);
    const input = screen.getByDisplayValue('github');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText(/search tabs/i), {
      target: { value: 'hello' },
    });
    expect(handleChange).toHaveBeenCalledWith('hello');
  });

  it('should render search icon', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search tabs/i);
    const parent = input.parentElement!;
    expect(parent.querySelector('svg')).toBeInTheDocument();
  });
});
