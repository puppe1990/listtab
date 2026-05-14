import { useState, useMemo, useCallback } from 'react';
import { useSessions } from './hooks/useSessions';
import { useToast } from './hooks/useToast';
import { SearchBar } from './components/SearchBar';
import { SessionList } from './components/SessionList';
import { Toolbar } from './components/Toolbar';
import { Toast } from './components/Toast';
import type { Session, Tab } from '../shared/types';

export function App() {
  const {
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
  } = useSessions();

  const {
    message: toastMessage,
    isVisible: toastVisible,
    showToast,
    hideToast,
  } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTabIdsBySession, setSelectedTabIdsBySession] = useState<
    Map<string, string[]>
  >(new Map());

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((session) => {
      if (session.name.toLowerCase().includes(q)) return true;
      return session.tabs.some(
        (tab) =>
          tab.title.toLowerCase().includes(q) ||
          tab.url.toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery]);

  const handleRestoreTab = useCallback(
    (tab: Tab) => {
      restoreTab(tab, '');
    },
    [restoreTab]
  );

  const handleDeleteTab = useCallback(
    (tab: Tab) => {
      deleteTab('', tab.id);
    },
    [deleteTab]
  );

  const handleDeleteSession = useCallback(
    (session: Session) => {
      deleteSession(session.id);
    },
    [deleteSession]
  );

  const handleRename = useCallback(
    (session: Session, newName: string) => {
      renameSession(session.id, newName);
    },
    [renameSession]
  );

  const handleToggleTabSelect = useCallback(
    (sessionId: string, tabId: string) => {
      setSelectedTabIdsBySession((prev) => {
        const next = new Map(prev);
        const current = next.get(sessionId) ?? [];
        if (current.includes(tabId)) {
          const filtered = current.filter((id) => id !== tabId);
          if (filtered.length === 0) {
            next.delete(sessionId);
          } else {
            next.set(sessionId, filtered);
          }
        } else {
          next.set(sessionId, [...current, tabId]);
        }
        return next;
      });
    },
    []
  );

  const handleSelectAllTabs = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      setSelectedTabIdsBySession((prev) => {
        const next = new Map(prev);
        const current = next.get(sessionId) ?? [];
        if (current.length === session.tabs.length) {
          next.delete(sessionId);
        } else {
          next.set(
            sessionId,
            session.tabs.map((t) => t.id)
          );
        }
        return next;
      });
    },
    [sessions]
  );

  const handleRestoreSelected = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      const selectedIds = selectedTabIdsBySession.get(sessionId) ?? [];
      const tabsToRestore = session.tabs.filter((t) =>
        selectedIds.includes(t.id)
      );
      for (const tab of tabsToRestore) {
        await restoreTab(tab, sessionId);
      }
      setSelectedTabIdsBySession((prev) => {
        const next = new Map(prev);
        next.delete(sessionId);
        return next;
      });
      showToast('Selected tabs opened!');
    },
    [sessions, selectedTabIdsBySession, restoreTab, showToast]
  );

  const handleDeleteSelected = useCallback(
    async (sessionId: string) => {
      const selectedIds = selectedTabIdsBySession.get(sessionId) ?? [];
      for (const tabId of selectedIds) {
        await deleteTab(sessionId, tabId);
      }
      setSelectedTabIdsBySession((prev) => {
        const next = new Map(prev);
        next.delete(sessionId);
        return next;
      });
      showToast('Selected tabs removed!');
    },
    [selectedTabIdsBySession, deleteTab, showToast]
  );

  const handleCopySelected = useCallback(() => {
    showToast('Links copied to clipboard!');
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading sessions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              ListTab
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3">
          <Toolbar
            onSaveAll={saveAllTabs}
            onRestoreAll={restoreAllSessions}
            onDeleteAll={deleteAllSessions}
            onExport={exportSessions}
            onImport={importSessions}
            hasSessions={sessions.length > 0}
          />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <SessionList
          sessions={filteredSessions}
          onRestoreTab={handleRestoreTab}
          onDeleteTab={handleDeleteTab}
          onRestoreAll={restoreSession}
          onDeleteSession={handleDeleteSession}
          onRename={handleRename}
          onToggleStar={toggleStar}
          onSaveAll={saveAllTabs}
          selectedTabIdsBySession={selectedTabIdsBySession}
          onToggleTabSelect={handleToggleTabSelect}
          onSelectAllTabs={handleSelectAllTabs}
          onRestoreSelected={handleRestoreSelected}
          onDeleteSelected={handleDeleteSelected}
          onCopySelected={handleCopySelected}
        />
      </main>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={hideToast}
      />
    </div>
  );
}
