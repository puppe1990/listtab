import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const defaultProps = {
  onRestoreTab: () => {},
  onDeleteTab: () => {},
  onRestoreAll: () => {},
  onDeleteSession: () => {},
  onRename: () => {},
  onToggleStar: () => {},
  selectedTabIds: [] as string[],
  onToggleTabSelect: () => {},
  onSelectAllTabs: () => {},
  onRestoreSelected: () => {},
  onDeleteSelected: () => {},
  onCopySelected: () => {},
};

function renderSessionCard(
  overrides: Partial<React.ComponentProps<typeof SessionCard>> = {}
) {
  return render(
    <SessionCard session={mockSession} {...defaultProps} {...overrides} />
  );
}

describe('SessionCard', () => {
  it('should render session name and tab count', () => {
    renderSessionCard();
    expect(screen.getByText('Session - May 13, 2026')).toBeInTheDocument();
    expect(screen.getByText('3 tabs')).toBeInTheDocument();
  });

  it('should render all tab items', () => {
    renderSessionCard();
    expect(screen.getByText('Tab t1')).toBeInTheDocument();
    expect(screen.getByText('Tab t2')).toBeInTheDocument();
    expect(screen.getByText('Tab t3')).toBeInTheDocument();
  });

  it('should render a checkbox for each tab', () => {
    renderSessionCard();
    const checkboxes = screen.getAllByRole('checkbox');
    // 3 tab checkboxes + 1 select-all checkbox in header
    expect(checkboxes).toHaveLength(4);
  });

  it('should call onToggleTabSelect when a tab checkbox is clicked', () => {
    const handleToggle = vi.fn();
    renderSessionCard({ onToggleTabSelect: handleToggle });
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is the select-all checkbox in header
    fireEvent.click(checkboxes[1]);
    expect(handleToggle).toHaveBeenCalledWith('t1');
  });

  it('should render select-all checkbox in header', () => {
    renderSessionCard();
    expect(screen.getByTitle('Select all tabs')).toBeInTheDocument();
  });

  it('should call onSelectAllTabs when select-all checkbox clicked', () => {
    const handleSelectAll = vi.fn();
    renderSessionCard({ onSelectAllTabs: handleSelectAll });
    fireEvent.click(screen.getByTitle('Select all tabs'));
    expect(handleSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should show bulk action buttons when tabs are selected', () => {
    renderSessionCard({ selectedTabIds: ['t1'] });
    expect(
      screen.getByRole('button', { name: /open selected/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /delete selected/i })
    ).toBeInTheDocument();
  });

  it('should hide bulk action buttons when no tabs are selected', () => {
    renderSessionCard({ selectedTabIds: [] });
    expect(
      screen.queryByRole('button', { name: /open selected/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete selected/i })
    ).not.toBeInTheDocument();
  });

  it('should call onRestoreSelected when open selected button clicked', () => {
    const handleRestoreSelected = vi.fn();
    renderSessionCard({
      selectedTabIds: ['t1', 't2'],
      onRestoreSelected: handleRestoreSelected,
    });
    fireEvent.click(screen.getByRole('button', { name: /open selected/i }));
    expect(handleRestoreSelected).toHaveBeenCalledTimes(1);
  });

  it('should call onDeleteSelected when delete selected button clicked', () => {
    const handleDeleteSelected = vi.fn();
    renderSessionCard({
      selectedTabIds: ['t1'],
      onDeleteSelected: handleDeleteSelected,
    });
    fireEvent.click(screen.getByRole('button', { name: /delete selected/i }));
    expect(handleDeleteSelected).toHaveBeenCalledTimes(1);
  });

  it('should call onRestoreAll when restore all button clicked', () => {
    const handleRestoreAll = vi.fn();
    renderSessionCard({ onRestoreAll: handleRestoreAll });
    fireEvent.click(screen.getByRole('button', { name: /restore all/i }));
    expect(handleRestoreAll).toHaveBeenCalledWith(mockSession);
  });

  it('should call onDeleteSession when delete button clicked', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const handleDelete = vi.fn();
    renderSessionCard({ onDeleteSession: handleDelete });
    fireEvent.click(screen.getByTitle('Delete session'));
    expect(handleDelete).toHaveBeenCalledWith(mockSession);
    vi.restoreAllMocks();
  });

  it('should show star filled when session is starred', () => {
    const starred: Session = { ...mockSession, isStarred: true };
    renderSessionCard({ session: starred });
    expect(screen.getByTitle('Unstar session')).toBeInTheDocument();
  });

  it('should call onToggleStar when star clicked', () => {
    const handleToggle = vi.fn();
    renderSessionCard({ onToggleStar: handleToggle });
    fireEvent.click(screen.getByTitle('Star session'));
    expect(handleToggle).toHaveBeenCalledWith(mockSession);
  });

  it('should allow inline rename', () => {
    const handleRename = vi.fn();
    renderSessionCard({ onRename: handleRename });
    const name = screen.getByText('Session - May 13, 2026');
    fireEvent.click(name);

    const input = screen.getByDisplayValue('Session - May 13, 2026');
    fireEvent.change(input, { target: { value: 'My Custom Name' } });
    fireEvent.blur(input);

    expect(handleRename).toHaveBeenCalledWith(mockSession, 'My Custom Name');
  });

  it('should show copy selected button when tabs are selected', () => {
    renderSessionCard({ selectedTabIds: ['t1'] });
    expect(
      screen.getByRole('button', { name: /copy selected/i })
    ).toBeInTheDocument();
  });

  it('should hide copy selected button when no tabs are selected', () => {
    renderSessionCard({ selectedTabIds: [] });
    expect(
      screen.queryByRole('button', { name: /copy selected/i })
    ).not.toBeInTheDocument();
  });

  it('should copy selected tab urls to clipboard when copy selected clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    });

    renderSessionCard({ selectedTabIds: ['t1', 't3'] });
    fireEvent.click(screen.getByRole('button', { name: /copy selected/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'https://example.com/t1\nhttps://example.com/t3'
      );
    });

    vi.unstubAllGlobals();
  });

  it('should call onCopySelected when copy selected button clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const handleCopySelected = vi.fn();
    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    });

    renderSessionCard({
      selectedTabIds: ['t1'],
      onCopySelected: handleCopySelected,
    });
    fireEvent.click(screen.getByRole('button', { name: /copy selected/i }));

    await waitFor(() => {
      expect(handleCopySelected).toHaveBeenCalledTimes(1);
    });

    vi.unstubAllGlobals();
  });

  describe('delete tab propagation', () => {
    it('should propagate sessionId and tab to onDeleteTab when tab delete confirmed', () => {
      const handleDeleteTab = vi.fn();
      renderSessionCard({ onDeleteTab: handleDeleteTab });

      fireEvent.click(screen.getAllByTitle('Remove from list')[0]);
      fireEvent.click(screen.getByTestId('confirm-modal-button'));

      expect(handleDeleteTab).toHaveBeenCalledWith('s1', mockSession.tabs[0]);
    });
  });
});
