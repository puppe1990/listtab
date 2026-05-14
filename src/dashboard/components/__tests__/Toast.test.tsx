import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toast } from '../Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when isVisible is false', () => {
    render(<Toast message="Hello" isVisible={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should render message when isVisible is true', () => {
    render(
      <Toast message="Links copied!" isVisible={true} onClose={vi.fn()} />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Links copied!');
  });

  it('should call onClose after auto-hide duration', async () => {
    const handleClose = vi.fn();
    render(<Toast message="Auto" isVisible={true} onClose={handleClose} />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose when dismiss button clicked', () => {
    const handleClose = vi.fn();
    render(
      <Toast message="Dismiss me" isVisible={true} onClose={handleClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
