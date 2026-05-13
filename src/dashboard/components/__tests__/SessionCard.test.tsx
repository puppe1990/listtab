import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionCard } from '../SessionCard';
import type { Session, Tab } from '../../../shared/types';

const makeTab = (id: string): Tab => ({
  id,
  title: `Tab ${id}`,
  url: `https://example.com/${id}`,
  faviconUrl: `https://icons.com/${id}.png`,
  pinned: false,
  savedAt: Date.now(),
});

const mockSession: Session = {
  id: 's1',
  name: 'Session - May 13, 2026',
  tabs: [makeTab('t1'), makeTab('t2'), makeTab('t3')],
  createdAt: Date.now(),
  tabCount: 3,
  isStarred: false,
};

describe('SessionCard', () => {
  it('should render session name and tab count', () => {
    render(
      <SessionCard
        session={mockSession}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
      />
    );
    expect(screen.getByText('Session - May 13, 2026')).toBeInTheDocument();
    expect(screen.getByText('3 tabs')).toBeInTheDocument();
  });

  it('should render all tab items', () => {
    render(
      <SessionCard
        session={mockSession}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
      />
    );
    expect(screen.getByText('Tab t1')).toBeInTheDocument();
    expect(screen.getByText('Tab t2')).toBeInTheDocument();
    expect(screen.getByText('Tab t3')).toBeInTheDocument();
  });

  it('should call onRestoreAll when button clicked', () => {
    const handleRestoreAll = vi.fn();
    render(
      <SessionCard
        session={mockSession}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={handleRestoreAll}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /restore all/i }));
    expect(handleRestoreAll).toHaveBeenCalledWith(mockSession);
  });

  it('should call onDeleteSession when delete button clicked', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const handleDelete = vi.fn();
    render(
      <SessionCard
        session={mockSession}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={handleDelete}
        onRename={() => {}}
        onToggleStar={() => {}}
      />
    );
    fireEvent.click(screen.getByTitle('Delete session'));
    expect(handleDelete).toHaveBeenCalledWith(mockSession);
    vi.restoreAllMocks();
  });

  it('should show star filled when session is starred', () => {
    const starred: Session = { ...mockSession, isStarred: true };
    render(
      <SessionCard
        session={starred}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={() => {}}
      />
    );
    expect(screen.getByTitle('Unstar session')).toBeInTheDocument();
  });

  it('should call onToggleStar when star clicked', () => {
    const handleToggle = vi.fn();
    render(
      <SessionCard
        session={mockSession}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={() => {}}
        onToggleStar={handleToggle}
      />
    );
    fireEvent.click(screen.getByTitle('Star session'));
    expect(handleToggle).toHaveBeenCalledWith(mockSession);
  });

  it('should allow inline rename', () => {
    const handleRename = vi.fn();
    render(
      <SessionCard
        session={mockSession}
        onRestoreTab={() => {}}
        onDeleteTab={() => {}}
        onRestoreAll={() => {}}
        onDeleteSession={() => {}}
        onRename={handleRename}
        onToggleStar={() => {}}
      />
    );
    const name = screen.getByText('Session - May 13, 2026');
    fireEvent.click(name);

    const input = screen.getByDisplayValue('Session - May 13, 2026');
    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.blur(input);

    expect(handleRename).toHaveBeenCalledWith(mockSession, 'My Custom Name');
  });
});
