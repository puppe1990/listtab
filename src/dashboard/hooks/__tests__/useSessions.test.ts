import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessions } from '../useSessions';
import type { Session } from '../../../shared/types';

const mockSendMessage = vi.fn();
(globalThis as Record<string, unknown>).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
  },
};

const makeSession = (id: string): Session => ({
  id,
  name: `Session ${id}`,
  tabs: [
    {
      id: 't1',
      title: 'Tab',
      url: 'https://example.com',
      pinned: false,
      savedAt: 1,
    },
  ],
  createdAt: Date.now(),
  tabCount: 1,
  isStarred: false,
});

function calledWith(type: string, payload?: unknown) {
  return mockSendMessage.mock.calls.some((call: unknown[]) => {
    const msg = call[0] as { type: string; payload?: unknown };
    return (
      msg.type === type &&
      (payload === undefined ||
        JSON.stringify(msg.payload) === JSON.stringify(payload))
    );
  });
}

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMessage.mockResolvedValue({ success: true, data: [] });
  });

  it('should load sessions on mount', async () => {
    const sessions = [makeSession('s1'), makeSession('s2')];
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });

    const { result } = renderHook(() => useSessions());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toHaveLength(2);
  });

  it('should handle saveAllTabs', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: makeSession('new') })
      .mockResolvedValueOnce({ success: true, data: [makeSession('new')] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveAllTabs();
    });

    expect(calledWith('saveAllTabs')).toBe(true);
  });

  it('should handle restoreTab', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [makeSession('s1')] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const tab = makeSession('s1').tabs[0];
    await act(async () => {
      await result.current.restoreTab(tab, 's1');
    });

    expect(calledWith('restoreTab', { tab })).toBe(true);
  });

  it('should handle restoreSession', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [makeSession('s1')] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const session = makeSession('s1');
    await act(async () => {
      await result.current.restoreSession(session);
    });

    expect(calledWith('restoreSession', { session })).toBe(true);
  });

  it('should handle deleteSession', async () => {
    const sessions = [makeSession('s1'), makeSession('s2')];
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: sessions })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [makeSession('s2')] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteSession('s1');
    });

    expect(calledWith('deleteSession', { sessionId: 's1' })).toBe(true);
  });

  it('should handle rename', async () => {
    mockSendMessage.mockResolvedValueOnce({
      success: true,
      data: [makeSession('s1')],
    });
    mockSendMessage.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.renameSession('s1', 'New Name');
    });

    expect(
      calledWith('updateSession', {
        sessionId: 's1',
        updates: { name: 'New Name' },
      })
    ).toBe(true);
  });

  it('should handle toggleStar', async () => {
    const s1 = makeSession('s1');
    mockSendMessage.mockResolvedValueOnce({ success: true, data: [s1] });
    mockSendMessage.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleStar(s1);
    });

    expect(
      calledWith('updateSession', {
        sessionId: 's1',
        updates: { isStarred: true },
      })
    ).toBe(true);
  });

  it('should handle export', async () => {
    const sessions = [makeSession('s1')];
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportSessions();
    });

    expect(calledWith('exportSessions')).toBe(true);
  });

  it('should handle import', async () => {
    const imported = makeSession('imported');
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [imported] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.importSessions([imported]);
    });

    expect(calledWith('importSessions', { sessions: [imported] })).toBe(true);
  });

  it('should handle deleteTab', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [makeSession('s1')] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTab('s1', 't1');
    });

    expect(
      calledWith('removeTabFromSession', { sessionId: 's1', tabId: 't1' })
    ).toBe(true);
  });
});
