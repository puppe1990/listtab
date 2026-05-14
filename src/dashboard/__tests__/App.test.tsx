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
    {
      id: 't1',
      title: 'Test',
      url: 'https://test.com',
      pinned: false,
      savedAt: 1,
    },
  ],
  createdAt: Date.now(),
  tabCount: 1,
  isStarred: false,
});

const makeSessionWithTabs = (id: string, tabIds: string[]): Session => ({
  id,
  name: `Session ${id}`,
  tabs: tabIds.map((tid) => ({
    id: tid,
    title: `Tab ${tid}`,
    url: `https://example.com/${tid}`,
    pinned: false,
    savedAt: 1,
  })),
  createdAt: Date.now(),
  tabCount: tabIds.length,
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
      expect(
        screen.getByRole('button', { name: /save all tabs/i })
      ).toBeInTheDocument();
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
      sessions: [makeSession('github'), makeSession('google')],
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

  it('should select a tab when its checkbox is clicked', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSessionWithTabs('s1', ['t1', 't2'])],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is select-all, checkboxes[1] is tab t1
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
  });

  it('should select all tabs when select-all is clicked', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSessionWithTabs('s1', ['t1', 't2'])],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is select-all, checkboxes[1] is t1, checkboxes[2] is t2
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('should deselect all tabs when select-all is clicked again', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSessionWithTabs('s1', ['t1', 't2'])],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('should call restoreTab for each selected tab when open selected is clicked', async () => {
    const mockRestoreTab = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      restoreTab: mockRestoreTab,
      sessions: [makeSessionWithTabs('s1', ['t1', 't2'])],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // select t1
    fireEvent.click(checkboxes[2]); // select t2

    fireEvent.click(screen.getByRole('button', { name: /open selected/i }));

    await waitFor(() => {
      expect(mockRestoreTab).toHaveBeenCalledTimes(2);
    });
  });

  it('should call deleteTab for each selected tab when delete selected is clicked', async () => {
    const mockDeleteTab = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      deleteTab: mockDeleteTab,
      sessions: [makeSessionWithTabs('s1', ['t1', 't2'])],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // select t1

    fireEvent.click(screen.getByRole('button', { name: /delete selected/i }));

    await waitFor(() => {
      expect(mockDeleteTab).toHaveBeenCalledWith('s1', 't1');
    });
  });
});
