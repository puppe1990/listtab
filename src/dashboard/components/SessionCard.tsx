import { useState, useEffect } from 'react';
import type { Session, Tab } from '../../shared/types';
import { TabItem } from './TabItem';

interface SessionCardProps {
  session: Session;
  onRestoreTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
  onRestoreAll: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onRename: (session: Session, newName: string) => void;
  onToggleStar: (session: Session) => void;
}

export function SessionCard({
  session,
  onRestoreTab,
  onDeleteTab,
  onRestoreAll,
  onDeleteSession,
  onRename,
  onToggleStar,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);

  useEffect(() => {
    setEditName(session.name);
  }, [session.name]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editName.trim() && editName !== session.name) {
      onRename(session, editName.trim());
    } else {
      setEditName(session.name);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${session.name}" and all its tabs?`)) {
      onDeleteSession(session);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-5 py-4">
        <button
          onClick={() => onToggleStar(session)}
          title={session.isStarred ? 'Unstar session' : 'Star session'}
          className="flex-shrink-0 text-lg"
        >
          {session.isStarred ? '⭐' : '☆'}
        </button>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBlur();
                if (e.key === 'Escape') {
                  setEditName(session.name);
                  setIsEditing(false);
                }
              }}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-0.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="truncate text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {session.name}
            </h2>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session.tabCount} tab{session.tabCount !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => onRestoreAll(session)}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Restore All
        </button>

        <button
          onClick={handleDelete}
          title="Delete session"
          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-1 p-3">
        {session.tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            onRestore={onRestoreTab}
            onDelete={onDeleteTab}
          />
        ))}
      </div>
    </div>
  );
}
