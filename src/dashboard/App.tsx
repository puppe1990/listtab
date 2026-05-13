import { useState, useMemo, useCallback } from 'react';
import { useSessions } from './hooks/useSessions';
import { SearchBar } from './components/SearchBar';
import { SessionList } from './components/SessionList';
import { Toolbar } from './components/Toolbar';
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

  const [searchQuery, setSearchQuery] = useState('');

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
        />
      </main>
    </div>
  );
}
