import type { Session, Tab } from '../../shared/types';
import { SessionCard } from './SessionCard';
import { EmptyState } from './EmptyState';

interface SessionListProps {
  sessions: Session[];
  onRestoreTab: (tab: Tab) => void;
  onDeleteTab: (sessionId: string, tab: Tab) => void;
  onRestoreAll: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onRename: (session: Session, newName: string) => void;
  onToggleStar: (session: Session) => void;
  onSaveAll?: () => void;
  selectedTabIdsBySession: Map<string, string[]>;
  onToggleTabSelect: (sessionId: string, tabId: string) => void;
  onSelectAllTabs: (sessionId: string) => void;
  onRestoreSelected: (sessionId: string) => void;
  onDeleteSelected: (sessionId: string) => void;
  onCopySelected?: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  onRestoreTab,
  onDeleteTab,
  onRestoreAll,
  onDeleteSession,
  onRename,
  onToggleStar,
  onSaveAll,
  selectedTabIdsBySession,
  onToggleTabSelect,
  onSelectAllTabs,
  onRestoreSelected,
  onDeleteSelected,
  onCopySelected,
}: SessionListProps) {
  if (sessions.length === 0) {
    return <EmptyState onSaveAll={onSaveAll} />;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onRestoreTab={onRestoreTab}
          onDeleteTab={onDeleteTab}
          onRestoreAll={onRestoreAll}
          onDeleteSession={onDeleteSession}
          onRename={onRename}
          onToggleStar={onToggleStar}
          selectedTabIds={selectedTabIdsBySession.get(session.id) ?? []}
          onToggleTabSelect={(tabId) => onToggleTabSelect(session.id, tabId)}
          onSelectAllTabs={() => onSelectAllTabs(session.id)}
          onRestoreSelected={() => onRestoreSelected(session.id)}
          onDeleteSelected={() => onDeleteSelected(session.id)}
          onCopySelected={() => onCopySelected?.(session.id)}
        />
      ))}
    </div>
  );
}
