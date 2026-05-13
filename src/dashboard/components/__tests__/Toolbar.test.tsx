import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toolbar } from '../Toolbar';

describe('Toolbar', () => {
  it('should render Save All button', () => {
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={() => {}}
        onDeleteAll={() => {}}
        onExport={() => {}}
        onImport={() => {}}
        hasSessions={false}
      />
    );
    expect(screen.getByRole('button', { name: /save all tabs/i })).toBeInTheDocument();
  });

  it('should render restore all and delete all when has sessions', () => {
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={() => {}}
        onDeleteAll={() => {}}
        onExport={() => {}}
        onImport={() => {}}
        hasSessions={true}
      />
    );
    expect(screen.getByRole('button', { name: /restore everything/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete all/i })).toBeInTheDocument();
  });

  it('should hide restore/delete when no sessions', () => {
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={() => {}}
        onDeleteAll={() => {}}
        onExport={() => {}}
        onImport={() => {}}
        hasSessions={false}
      />
    );
    expect(screen.queryByRole('button', { name: /restore everything/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /delete all/i })).toBeNull();
  });

  it('should call onExport when export button clicked', () => {
    const handleExport = vi.fn();
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={() => {}}
        onDeleteAll={() => {}}
        onExport={handleExport}
        onImport={() => {}}
        hasSessions={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Export sessions' }));
    expect(handleExport).toHaveBeenCalledOnce();
  });

  it('should call onImport when file selected and parsed', async () => {
    const handleImport = vi.fn();
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={() => {}}
        onDeleteAll={() => {}}
        onExport={() => {}}
        onImport={handleImport}
        hasSessions={true}
      />
    );

    const file = new File(
      [JSON.stringify([{ id: 's1', name: 'Test', tabs: [], createdAt: 1, tabCount: 0, isStarred: false }])],
      'sessions.json',
      { type: 'application/json' }
    );

    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(handleImport).toHaveBeenCalledOnce();
    });
  });

  it('should call onSaveAll when button clicked', () => {
    const handleSaveAll = vi.fn();
    render(
      <Toolbar
        onSaveAll={handleSaveAll}
        onRestoreAll={() => {}}
        onDeleteAll={() => {}}
        onExport={() => {}}
        onImport={() => {}}
        hasSessions={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /save all tabs/i }));
    expect(handleSaveAll).toHaveBeenCalledOnce();
  });

  it('should call onRestoreAll when button clicked', () => {
    const handleRestoreAll = vi.fn();
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={handleRestoreAll}
        onDeleteAll={() => {}}
        onExport={() => {}}
        onImport={() => {}}
        hasSessions={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /restore everything/i }));
    expect(handleRestoreAll).toHaveBeenCalledOnce();
  });

  it('should call onDeleteAll when button clicked', () => {
    const handleDeleteAll = vi.fn();
    render(
      <Toolbar
        onSaveAll={() => {}}
        onRestoreAll={() => {}}
        onDeleteAll={handleDeleteAll}
        onExport={() => {}}
        onImport={() => {}}
        hasSessions={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /delete all/i }));
    expect(handleDeleteAll).toHaveBeenCalledOnce();
  });
});
