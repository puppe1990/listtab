import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App';

vi.mock('../hooks/useSessions', () => ({
  useSessions: vi.fn(),
}));

import { useSessions } from '../hooks/useSessions';
import type { Session } from '../../shared/types';

const makeSession = (id: string): Session => ({
  id,
  name: `Session ${id}`,
  tabs: [
    { id: 't1', title: 'Test', url: 'https://test.com', pinned: false, savedAt: 1 },
  ],
  createdAt: Date.now(),
  tabCount: 1,
  isStarred: false,
});

const createMockUseSessions = () => ({
  sessions: [] as Session[],
  loading: false,
  error: null as string | null,
  saveAllTabs: vi.fn(),
  restoreTab: vi.fn(),
  restoreSession: vi.fn(),
  restoreAllSessions: vi.fn(),
  deleteSession: vi.fn(),
  deleteAllSessions: vi.fn(),
  renameSession: vi.fn(),
  toggleStar: vi.fn(),
  exportSessions: vi.fn(),
  importSessions: vi.fn(),
  deleteTab: vi.fn(),
  refresh: vi.fn(),
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: true,
    });
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render empty state when no sessions', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/no tabs saved yet/i)).toBeInTheDocument();
    });
  });

  it('should render sessions when present', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSession('s1'), makeSession('s2')],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
      expect(screen.getByText('Session s2')).toBeInTheDocument();
    });
  });

  it('should render toolbar', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSession('s1')],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save all tabs/i })).toBeInTheDocument();
    });
  });

  it('should render error message when error', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      error: 'Something went wrong',
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should render search bar', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search tabs/i)).toBeInTheDocument();
    });
  });

  it('should filter sessions by search query', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [
        makeSession('github'),
        makeSession('google'),
      ],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session github')).toBeInTheDocument();
      expect(screen.getByText('Session google')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search tabs/i);
    fireEvent.change(searchInput, { target: { value: 'github' } });

    await waitFor(() => {
      expect(screen.getByText('Session github')).toBeInTheDocument();
      expect(screen.queryByText('Session google')).not.toBeInTheDocument();
    });
  });
});
