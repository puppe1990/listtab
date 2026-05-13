import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PopupApp } from '../PopupApp';

const mockSendMessage = vi.fn().mockImplementation((_msg, callback) => {
  if (callback) callback({ success: true, data: [] });
  return Promise.resolve({ success: true, data: [] });
});
const mockTabsCreate = vi.fn();
const mockGetURL = vi.fn((path: string) => `chrome-extension://id/${path}`);

(globalThis as Record<string, unknown>).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
    getURL: mockGetURL,
  },
  tabs: {
    create: mockTabsCreate,
  },
};

describe('PopupApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Save All Tabs button', () => {
    render(<PopupApp />);
    expect(screen.getByRole('button', { name: /save all tabs/i })).toBeInTheDocument();
  });

  it('should render Open Dashboard button', () => {
    render(<PopupApp />);
    expect(screen.getByText(/open full dashboard/i)).toBeInTheDocument();
  });

  it('should open dashboard when clicked', () => {
    render(<PopupApp />);
    fireEvent.click(screen.getByText(/open full dashboard/i));
    expect(mockTabsCreate).toHaveBeenCalled();
  });

  it('should show recent sessions count', async () => {
    const sessions = [
      { id: 's1', name: 'Session 1', tabs: [], createdAt: 1, tabCount: 0, isStarred: false },
      { id: 's2', name: 'Session 2', tabs: [], createdAt: 2, tabCount: 0, isStarred: false },
    ];
    mockSendMessage.mockImplementationOnce((_msg, callback) => {
      if (callback) callback({ success: true, data: sessions });
      return Promise.resolve({ success: true, data: sessions });
    });
    const { container } = render(<PopupApp />);
    await waitFor(() => {
      expect(container.textContent).toContain('2 session');
    });
  });

  it('should show total tabs count', async () => {
    const sessions = [
      { id: 's1', name: 'S1', tabs: [{ id: 't1', title: 'A', url: 'https://a.com', pinned: false, savedAt: 1 }], createdAt: 1, tabCount: 1, isStarred: false },
      { id: 's2', name: 'S2', tabs: [{ id: 't2', title: 'B', url: 'https://b.com', pinned: false, savedAt: 2 }, { id: 't3', title: 'C', url: 'https://c.com', pinned: false, savedAt: 3 }], createdAt: 2, tabCount: 2, isStarred: false },
    ];
    mockSendMessage.mockImplementationOnce((_msg, callback) => {
      if (callback) callback({ success: true, data: sessions });
      return Promise.resolve({ success: true, data: sessions });
    });
    const { container } = render(<PopupApp />);
    await waitFor(() => {
      expect(container.textContent).toContain('3 tabs saved');
    });
  });
});
