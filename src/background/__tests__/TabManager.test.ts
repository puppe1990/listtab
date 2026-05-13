import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabManager } from '../TabManager';
import type { Tab, Session } from '../../shared/types';

function createMockChrome() {
  const tabs: chrome.tabs.Tab[] = [];
  const createdTabs: number[] = [];

  return {
    tabs: {
      query: vi.fn((_info: chrome.tabs.QueryInfo, cb: (tabs: chrome.tabs.Tab[]) => void) => {
        cb([...tabs]);
      }),
      create: vi.fn((_props: unknown, cb?: (tab: chrome.tabs.Tab) => void) => {
        const newTab = {
          id: createdTabs.length + 1,
          index: 0,
          pinned: false,
          highlighted: false,
          windowId: 1,
          active: true,
          incognito: false,
          selected: true,
          discarded: false,
          autoDiscardable: true,
          groupId: -1,
          url: 'about:blank',
          title: '',
        } as chrome.tabs.Tab;
        createdTabs.push(newTab.id!);
        cb?.(newTab);
      }),
      remove: vi.fn((_ids: number | number[], cb?: () => void) => {
        const ids = Array.isArray(_ids) ? _ids : [_ids];
        ids.forEach((id) => {
          const idx = tabs.findIndex((t) => t.id === id);
          if (idx !== -1) tabs.splice(idx, 1);
        });
        cb?.();
      }),
    },
    _addTab(tab: Partial<chrome.tabs.Tab>) {
      tabs.push({
        id: 0,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: false,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        frozen: false,
        url: '',
        title: '',
        ...tab,
      } as chrome.tabs.Tab);
    },
    _getCreatedCount() {
      return createdTabs.length;
    },
  };
}

(globalThis as Record<string, unknown>).chrome = {
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  },
};

vi.mock('../SessionStore', () => ({
  SessionStore: vi.fn().mockImplementation(() => ({
    saveSession: vi.fn(),
  })),
}));

vi.mock('../../shared/storage', () => ({
  readSettings: vi.fn().mockResolvedValue({ maxSessions: 50 }),
}));

describe('TabManager', () => {
  let manager: TabManager;
  let mockStore: { saveSession: ReturnType<typeof vi.fn> };
  let mock: ReturnType<typeof createMockChrome>;

  beforeEach(() => {
    mock = createMockChrome();
    (globalThis as Record<string, unknown>).chrome = {
      tabs: mock.tabs,
    };
    mockStore = { saveSession: vi.fn() };
    manager = new TabManager(mockStore as any);
  });

  describe('saveAllTabs', () => {
    it('should capture all tabs and create a session', async () => {
      mock._addTab({
        id: 1, index: 0, pinned: false, highlighted: false,
        windowId: 1, active: true, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'https://google.com', title: 'Google',
      });
      mock._addTab({
        id: 2, index: 1, pinned: false, highlighted: false,
        windowId: 1, active: false, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'https://github.com', title: 'GitHub',
      });

      const session = await manager.saveAllTabs();

      expect(session.tabs).toHaveLength(2);
      expect(session.tabs[0].url).toBe('https://google.com');
      expect(session.tabs[1].title).toBe('GitHub');
      expect(mockStore.saveSession).toHaveBeenCalledWith(session, 50);
    });

    it('should close captured tabs after saving', async () => {
      mock._addTab({
        id: 1, index: 0, pinned: false, highlighted: false,
        windowId: 1, active: true, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'https://example.com', title: 'Example',
      });

      await manager.saveAllTabs();
      expect(mock.tabs.remove).toHaveBeenCalledWith([1], expect.anything());
    });

    it('should not capture pinned tabs', async () => {
      mock._addTab({
        id: 1, index: 0, pinned: true, highlighted: false,
        windowId: 1, active: true, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'chrome://newtab', title: 'New Tab',
      });

      const session = await manager.saveAllTabs();
      expect(session.tabs).toHaveLength(0);
    });

    it('should skip chrome:// and chrome-extension:// URLs', async () => {
      mock._addTab({
        id: 1, index: 0, pinned: false, highlighted: false,
        windowId: 1, active: true, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'chrome://settings', title: 'Settings',
      });
      mock._addTab({
        id: 2, index: 1, pinned: false, highlighted: false,
        windowId: 1, active: false, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'https://valid.com', title: 'Valid',
      });

      const session = await manager.saveAllTabs();
      expect(session.tabs).toHaveLength(1);
      expect(session.tabs[0].url).toBe('https://valid.com');
    });

    it('should generate faviconUrl from Google S2', async () => {
      mock._addTab({
        id: 1, index: 0, pinned: false, highlighted: false,
        windowId: 1, active: true, incognito: false, selected: false,
        discarded: false, autoDiscardable: true, groupId: -1,
        url: 'https://github.com/matheuspuppe',
        title: 'matheuspuppe',
      });

      const session = await manager.saveAllTabs();
      expect(session.tabs[0].faviconUrl).toBe(
        'https://www.google.com/s2/favicons?domain=github.com&sz=32'
      );
    });
  });

  describe('restoreTab', () => {
    it('should create a new tab from tab data', () => {
      const tab: Tab = {
        id: 't1',
        title: 'Google',
        url: 'https://google.com',
        pinned: false,
        savedAt: Date.now(),
        faviconUrl: 'https://icons.com/g.png',
      };

      manager.restoreTab(tab);
      expect(mock.tabs.create).toHaveBeenCalledWith(
        { url: 'https://google.com', active: false },
        expect.anything()
      );
    });
  });

  describe('restoreSession', () => {
    it('should restore all tabs from a session', () => {
      const session: Session = {
        id: 's1',
        name: 'Test',
        tabs: [
          { id: 't1', title: 'A', url: 'https://a.com', pinned: false, savedAt: 1 },
          { id: 't2', title: 'B', url: 'https://b.com', pinned: false, savedAt: 2 },
        ],
        createdAt: 100,
        tabCount: 2,
        isStarred: false,
      };

      manager.restoreSession(session);
      expect(mock.tabs.create).toHaveBeenCalledTimes(2);
      expect(mock.tabs.create).toHaveBeenCalledWith(
        { url: 'https://a.com', active: false },
        expect.anything()
      );
    });
  });
});
