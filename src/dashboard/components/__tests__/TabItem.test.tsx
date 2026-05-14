import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
      <TabItem
        tab={mockTab}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('github.com')).toBeInTheDocument();
  });

  it('should render favicon', () => {
    render(
      <TabItem
        tab={mockTab}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockTab.faviconUrl);
    expect(img).toHaveAttribute('alt', 'GitHub');
  });

  it('should show fallback icon when no faviconUrl', () => {
    const tabNoIcon: Tab = { ...mockTab, faviconUrl: undefined };
    render(
      <TabItem
        tab={tabNoIcon}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  it('should call onRestore when restore button clicked', () => {
    const handleRestore = vi.fn();
    render(
      <TabItem
        tab={mockTab}
        onRestore={handleRestore}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    fireEvent.click(screen.getByTitle('Restore tab'));
    expect(handleRestore).toHaveBeenCalledWith(mockTab);
  });

  it('should call onDelete when delete button clicked', () => {
    const handleDelete = vi.fn();
    render(
      <TabItem
        tab={mockTab}
        onRestore={() => {}}
        onDelete={handleDelete}
        onToggleSelect={() => {}}
        isSelected={false}
      />
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
      <TabItem
        tab={longTab}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    const title = screen.getByText('A'.repeat(200));
    expect(title.className).toContain('truncate');
  });

  it('should render a checkbox', () => {
    render(
      <TabItem
        tab={mockTab}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should check checkbox when isSelected is true', () => {
    render(
      <TabItem
        tab={mockTab}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={() => {}}
        isSelected={true}
      />
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should call onToggleSelect when checkbox clicked', () => {
    const handleToggle = vi.fn();
    render(
      <TabItem
        tab={mockTab}
        onRestore={() => {}}
        onDelete={() => {}}
        onToggleSelect={handleToggle}
        isSelected={false}
      />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('should not call onRestore or onDelete when checkbox clicked', () => {
    const handleRestore = vi.fn();
    const handleDelete = vi.fn();
    render(
      <TabItem
        tab={mockTab}
        onRestore={handleRestore}
        onDelete={handleDelete}
        onToggleSelect={() => {}}
        isSelected={false}
      />
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleRestore).not.toHaveBeenCalled();
    expect(handleDelete).not.toHaveBeenCalled();
  });

  describe('link', () => {
    let windowOpenSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
      windowOpenSpy.mockRestore();
    });

    it('should render title and hostname inside a link with correct href', () => {
      render(
        <TabItem
          tab={mockTab}
          onRestore={() => {}}
          onDelete={() => {}}
          onToggleSelect={() => {}}
          isSelected={false}
        />
      );
      const link = screen.getByText('GitHub').closest('a');
      expect(link).toHaveAttribute('href', 'https://github.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should open url in new tab on click', () => {
      render(
        <TabItem
          tab={mockTab}
          onRestore={() => {}}
          onDelete={() => {}}
          onToggleSelect={() => {}}
          isSelected={false}
        />
      );
      fireEvent.click(screen.getByText('GitHub'));
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://github.com',
        '_blank'
      );
    });

    it('should open url in new tab on middle click (auxClick button 1)', () => {
      render(
        <TabItem
          tab={mockTab}
          onRestore={() => {}}
          onDelete={() => {}}
          onToggleSelect={() => {}}
          isSelected={false}
        />
      );
      const title = screen.getByText('GitHub');
      fireEvent(
        title,
        new MouseEvent('auxclick', {
          bubbles: true,
          cancelable: true,
          button: 1,
        })
      );
      expect(windowOpenSpy).toHaveBeenCalledWith(
        'https://github.com',
        '_blank'
      );
    });
  });
});
