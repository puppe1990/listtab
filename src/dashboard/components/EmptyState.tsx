interface EmptyStateProps {
  onSaveAll?: () => void;
}

export function EmptyState({ onSaveAll }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">📋</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
        No tabs saved yet
      </h2>
      <p className="mb-6 max-w-sm text-gray-500 dark:text-gray-400">
        Click the button below or the extension icon in your toolbar to save
        all open tabs into a session.
      </p>
      <button
        onClick={onSaveAll}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors font-medium"
      >
        Save All Tabs
      </button>
    </div>
  );
}
