import { useState, useEffect, useCallback } from 'react';
import type { Session, Tab } from '../../shared/types';

function sendMessage<T = unknown>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve) => {
    const result = chrome.runtime.sendMessage({ type, payload }, resolve);
    const maybePromise = result as Promise<T> | undefined;
    if (maybePromise && typeof maybePromise.then === 'function') {
      maybePromise.then(resolve);
    }
  });
}

interface UseSessionsReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  saveAllTabs: () => Promise<void>;
  restoreTab: (tab: Tab, sessionId: string) => Promise<void>;
  restoreSession: (session: Session) => Promise<void>;
  restoreAllSessions: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  deleteAllSessions: () => Promise<void>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  toggleStar: (session: Session) => Promise<void>;
  exportSessions: () => Promise<void>;
  importSessions: (sessions: Session[]) => Promise<void>;
  deleteTab: (sessionId: string, tabId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const response = await sendMessage<{ success: boolean; data?: Session[] }>('getSessions');
      if (response.success && response.data) {
        setSessions(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveAllTabs = useCallback(async () => {
    try {
      setError(null);
      await sendMessage('saveAllTabs');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tabs');
    }
  }, [refresh]);

  const restoreTab = useCallback(async (tab: Tab, sessionId: string) => {
    try {
      await sendMessage('restoreTab', { tab });
      await sendMessage('removeTabFromSession', { sessionId, tabId: tab.id });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore tab');
    }
  }, [refresh]);

  const restoreSession = useCallback(async (session: Session) => {
    try {
      await sendMessage('restoreSession', { session });
      await sendMessage('deleteSession', { sessionId: session.id });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore session');
    }
  }, [refresh]);

  const restoreAllSessions = useCallback(async () => {
    try {
      const response = await sendMessage<{ success: boolean; data?: Session[] }>('getSessions');
      if (response.success && response.data) {
        for (const session of response.data) {
          await sendMessage('restoreSession', { session });
        }
        for (const { id } of response.data) {
          await sendMessage('deleteSession', { sessionId: id });
        }
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore all');
    }
  }, [refresh]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await sendMessage('deleteSession', { sessionId });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  }, [refresh]);

  const deleteAllSessions = useCallback(async () => {
    try {
      const response = await sendMessage<{ success: boolean; data?: Session[] }>('getSessions');
      if (response.success && response.data) {
        for (const { id } of response.data) {
          await sendMessage('deleteSession', { sessionId: id });
        }
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all');
    }
  }, [refresh]);

  const renameSession = useCallback(async (sessionId: string, name: string) => {
    try {
      await sendMessage('updateSession', { sessionId, updates: { name } });
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, name } : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename');
    }
  }, []);

  const toggleStar = useCallback(async (session: Session) => {
    try {
      await sendMessage('updateSession', {
        sessionId: session.id,
        updates: { isStarred: !session.isStarred },
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, isStarred: !session.isStarred } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  }, []);

  const exportSessions = useCallback(async () => {
    try {
      const response = await sendMessage<{ success: boolean; data?: Session[] }>('exportSessions');
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `listtab-sessions-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    }
  }, []);

  const importSessions = useCallback(async (importedSessions: Session[]) => {
    try {
      await sendMessage('importSessions', { sessions: importedSessions });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import');
    }
  }, [refresh]);

  const deleteTab = useCallback(async (sessionId: string, tabId: string) => {
    try {
      await sendMessage('removeTabFromSession', { sessionId, tabId });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tab');
    }
  }, [refresh]);

  return {
    sessions,
    loading,
    error,
    saveAllTabs,
    restoreTab,
    restoreSession,
    restoreAllSessions,
    deleteSession,
    deleteAllSessions,
    renameSession,
    toggleStar,
    exportSessions,
    importSessions,
    deleteTab,
    refresh,
  };
}
