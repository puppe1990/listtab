import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabItem } from '../TabItem';
import type { Tab } from '../../../shared/types';

const mockTab: Tab = {
  id: 't1',
  title: 'GitHub',
  url: 'https://github.com',
  faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
  pinned: false,
  savedAt: Date.now(),
};

describe('TabItem', () => {
  it('should render tab title and url', () => {
    render(
      <TabItem tab={mockTab} onRestore={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('github.com')).toBeInTheDocument();
  });

  it('should render favicon', () => {
    render(
      <TabItem tab={mockTab} onRestore={() => {}} onDelete={() => {}} />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockTab.faviconUrl);
    expect(img).toHaveAttribute('alt', 'GitHub');
  });

  it('should show fallback icon when no faviconUrl', () => {
    const tabNoIcon: Tab = { ...mockTab, faviconUrl: undefined };
    render(
      <TabItem tab={tabNoIcon} onRestore={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  it('should call onRestore when restore button clicked', () => {
    const handleRestore = vi.fn();
    render(
      <TabItem tab={mockTab} onRestore={handleRestore} onDelete={() => {}} />
    );
    fireEvent.click(screen.getByTitle('Restore tab'));
    expect(handleRestore).toHaveBeenCalledWith(mockTab);
  });

  it('should call onDelete when delete button clicked', () => {
    const handleDelete = vi.fn();
    render(
      <TabItem tab={mockTab} onRestore={() => {}} onDelete={handleDelete} />
    );
    fireEvent.click(screen.getByTitle('Remove from list'));
    expect(handleDelete).toHaveBeenCalledWith(mockTab);
  });

  it('should truncate long titles', () => {
    const longTab: Tab = {
      ...mockTab,
      title: 'A'.repeat(200),
    };
    render(
      <TabItem tab={longTab} onRestore={() => {}} onDelete={() => {}} />
    );
    const title = screen.getByText('A'.repeat(200));
    expect(title.className).toContain('truncate');
  });
});
