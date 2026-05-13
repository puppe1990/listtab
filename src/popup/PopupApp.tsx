import { useState, useEffect } from 'react';
import type { Session } from '../shared/types';

export function PopupApp() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalTabs = sessions.reduce((sum, s) => sum + s.tabCount, 0);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getSessions' }, (response) => {
      setLoading(false);
      if (response?.success && response.data) {
        setSessions(response.data);
      }
    });
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    chrome.runtime.sendMessage({ type: 'saveAllTabs' }, () => {
      setSaving(false);
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
      window.close();
    });
  };

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  };

  if (loading) {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 p-4 font-sans">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ListTab
          </h1>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-900 p-4 font-sans">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">📋</span>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          ListTab
        </h1>
      </div>

      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="mb-3 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save All Tabs'}
      </button>

      <div className="mb-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {sessions.length}
          </span>{' '}
          session{sessions.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {totalTabs}
          </span>{' '}
          tabs saved
        </p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          No saved sessions yet
        </p>
      ) : (
        sessions.slice(0, 3).map((session) => (
          <div
            key={session.id}
            className="mb-2 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
          >
            <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {session.tabCount} tab{session.tabCount !== 1 ? 's' : ''}
            </p>
          </div>
        ))
      )}

      <button
        onClick={handleOpenDashboard}
        className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Open Full Dashboard →
      </button>
    </div>
  );
}
