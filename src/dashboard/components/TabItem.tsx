import { useState } from 'react';
import type { Tab } from '../../shared/types';

interface TabItemProps {
  tab: Tab;
  onRestore: (tab: Tab) => void;
  onDelete: (tab: Tab) => void;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function TabItem({ tab, onRestore, onDelete }: TabItemProps) {
  const [imgError, setImgError] = useState(false);

  const showFallbackIcon = !tab.faviconUrl || imgError;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {tab.faviconUrl && !imgError ? (
        <img
          src={tab.faviconUrl}
          alt={tab.title}
          className="h-5 w-5 flex-shrink-0 rounded"
          onError={() => setImgError(true)}
        />
      ) : null}
      {showFallbackIcon && <span className="flex-shrink-0 text-sm">🌐</span>}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {tab.title}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {getHostname(tab.url)}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onRestore(tab)}
          title="Restore tab"
          className="rounded p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(tab)}
          title="Remove from list"
          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
