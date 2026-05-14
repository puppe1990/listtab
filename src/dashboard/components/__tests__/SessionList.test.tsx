import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionList } from '../SessionList';
import type { Session, Tab } from '../../../shared/types';

const makeSession = (id: string, name: string, tabs: Tab[] = []): Session => ({
  id,
  name,
  tabs,
  createdAt: Date.now(),
  tabCount: tabs.length,
  isStarred: false,
});

const mockSessions: Session[] = [
  makeSession('s1', 'Session A', [
    {
      id: 't1',
      title: 'Tab 1',
      url: 'https://a.com',
      pinned: false,
      savedAt: 1,
    },
  ]),
  makeSession('s2', 'Session B', [
    {
      id: 't2',
      title: 'Tab 2',
      url: 'https://b.com',
      pinned: false,
      savedAt: 2,
    },
  ]),
];

describe('SessionList', () => {
  it('should render all sessions', () => {
    render(
      <SessionList
        sessions={mockSessions}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
        selectedTabIdsBySession={new Map()}
        onToggleTabSelect={() => {}}
        onSelectAllTabs={() => {}}
        onRestoreSelected={() => {}}
        onDeleteSelected={() => {}}
      />
    );
    expect(screen.getByText('Session A')).toBeInTheDocument();
    expect(screen.getByText('Session B')).toBeInTheDocument();
  });

  it('should render empty state when no sessions', () => {
    render(
      <SessionList
        sessions={[]}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
        selectedTabIdsBySession={new Map()}
        onToggleTabSelect={() => {}}
        onSelectAllTabs={() => {}}
        onRestoreSelected={() => {}}
        onDeleteSelected={() => {}}
      />
    );
    expect(screen.getByText(/no tabs saved yet/i)).toBeInTheDocument();
  });

  it('should render restore all button for each session', () => {
    render(
      <SessionList
        sessions={mockSessions}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
        selectedTabIdsBySession={new Map()}
        onToggleTabSelect={() => {}}
        onSelectAllTabs={() => {}}
        onRestoreSelected={() => {}}
        onDeleteSelected={() => {}}
      />
    );
    const buttons = screen.getAllByRole('button', { name: /restore all/i });
    expect(buttons).toHaveLength(2);
  });
});
