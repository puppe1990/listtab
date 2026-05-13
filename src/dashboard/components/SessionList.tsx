import type { Session, Tab } from '../../shared/types';
import { SessionCard } from './SessionCard';
import { EmptyState } from './EmptyState';

interface SessionListProps {
  sessions: Session[];
  onRestoreTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
  onRestoreAll: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onRename: (session: Session, newName: string) => void;
  onToggleStar: (session: Session) => void;
  onSaveAll?: () => void;
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
        />
      ))}
    </div>
  );
}
