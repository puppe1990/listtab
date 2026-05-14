import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start hidden with empty message', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.isVisible).toBe(false);
    expect(result.current.message).toBe('');
  });

  it('should show toast with message', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Links copied!');
    });
    expect(result.current.isVisible).toBe(true);
    expect(result.current.message).toBe('Links copied!');
  });

  it('should hide toast when hideToast is called', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Done!');
    });
    act(() => {
      result.current.hideToast();
    });
    expect(result.current.isVisible).toBe(false);
  });

  it('should auto-hide after 2.5 seconds', async () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Auto hide test');
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    await waitFor(() => {
      expect(result.current.isVisible).toBe(false);
    });
  });

  it('should reset timer when showToast is called again', async () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('First');
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    act(() => {
      result.current.showToast('Second');
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(result.current.isVisible).toBe(false);
    });
  });
});
