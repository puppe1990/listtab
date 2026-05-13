import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionStore } from '../SessionStore';
import type { Session, Tab } from '../../shared/types';
import * as storage from '../../shared/storage';

vi.mock('../../shared/storage', () => ({
  readSessions: vi.fn(),
  writeSessions: vi.fn(),
}));

const makeTab = (overrides: Partial<Tab> = {}): Tab => ({
  id: `tab-${Math.random().toString(36).slice(2, 9)}`,
  title: 'Example',
  url: 'https://example.com',
  pinned: false,
  savedAt: Date.now(),
  ...overrides,
});

const makeSession = (tabs: Tab[] = [], overrides: Partial<Session> = {}): Session => ({
  id: `session-${Math.random().toString(36).slice(2, 9)}`,
  name: 'Session - May 13',
  tabs,
  createdAt: Date.now(),
  tabCount: tabs.length,
  isStarred: false,
  ...overrides,
});

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new SessionStore();
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions', async () => {
      vi.mocked(storage.readSessions).mockResolvedValue([]);
      const sessions = await store.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return sessions sorted by newest first', async () => {
      const s1 = makeSession([], { createdAt: 100 });
      const s2 = makeSession([], { createdAt: 200 });
      vi.mocked(storage.readSessions).mockResolvedValue([s1, s2]);
      const sessions = await store.getAllSessions();
      expect(sessions[0].createdAt).toBe(200);
      expect(sessions[1].createdAt).toBe(100);
    });

    it('should return starred sessions first, then by date', async () => {
      const s1 = makeSession([], { createdAt: 100, isStarred: false });
      const s2 = makeSession([], { createdAt: 50, isStarred: true });
      const s3 = makeSession([], { createdAt: 200, isStarred: false });
      vi.mocked(storage.readSessions).mockResolvedValue([s1, s2, s3]);
      const sessions = await store.getAllSessions();
      expect(sessions[0].isStarred).toBe(true);
    });
  });

  describe('getSession', () => {
    it('should return session by id', async () => {
      const s = makeSession([makeTab()]);
      vi.mocked(storage.readSessions).mockResolvedValue([s]);
      const found = await store.getSession(s.id);
      expect(found?.id).toBe(s.id);
    });

    it('should return undefined for unknown id', async () => {
      vi.mocked(storage.readSessions).mockResolvedValue([]);
      const found = await store.getSession('unknown');
      expect(found).toBeUndefined();
    });
  });

  describe('saveSession', () => {
    it('should prepend session to list', async () => {
      const existing = makeSession([], { createdAt: 100 });
      vi.mocked(storage.readSessions).mockResolvedValue([existing]);
      const newSession = makeSession([makeTab()], { createdAt: 200 });
      await store.saveSession(newSession);
      const writeArgs = vi.mocked(storage.writeSessions).mock.calls[0][0];
      expect(writeArgs).toHaveLength(2);
      expect(writeArgs[0].createdAt).toBe(200);
    });

    it('should enforce maxSessions limit', async () => {
      const sessions = Array.from({ length: 60 }, (_, i) =>
        makeSession([], { createdAt: i, id: `s${i}` })
      );
      vi.mocked(storage.readSessions).mockResolvedValue(sessions);
      const newSession = makeSession([], { createdAt: 999 });
      await store.saveSession(newSession, 50);
      const writeArgs = vi.mocked(storage.writeSessions).mock.calls[0][0];
      expect(writeArgs).toHaveLength(50);
    });
  });

  describe('deleteSession', () => {
    it('should remove session by id', async () => {
      const s1 = makeSession([], { id: 'keep' });
      const s2 = makeSession([], { id: 'remove' });
      vi.mocked(storage.readSessions).mockResolvedValue([s1, s2]);
      await store.deleteSession('remove');
      const writeArgs = vi.mocked(storage.writeSessions).mock.calls[0][0];
      expect(writeArgs).toHaveLength(1);
      expect(writeArgs[0].id).toBe('keep');
    });
  });

  describe('updateSession', () => {
    it('should update session name', async () => {
      const s = makeSession([], { id: 's1', name: 'Old' });
      vi.mocked(storage.readSessions).mockResolvedValue([s]);
      await store.updateSession('s1', { name: 'New' });
      const writeArgs = vi.mocked(storage.writeSessions).mock.calls[0][0];
      expect(writeArgs[0].name).toBe('New');
    });

    it('should update isStarred', async () => {
      const s = makeSession([], { id: 's1', isStarred: false });
      vi.mocked(storage.readSessions).mockResolvedValue([s]);
      await store.updateSession('s1', { isStarred: true });
      const writeArgs = vi.mocked(storage.writeSessions).mock.calls[0][0];
      expect(writeArgs[0].isStarred).toBe(true);
    });
  });

  describe('removeTabFromSession', () => {
    it('should remove a tab from session', async () => {
      const tab1 = makeTab({ id: 'tab1' });
      const tab2 = makeTab({ id: 'tab2' });
      const s = makeSession([tab1, tab2], { id: 's1', tabCount: 2 });
      vi.mocked(storage.readSessions).mockResolvedValue([s]);
      const result = await store.removeTabFromSession('s1', 'tab1');
      expect(result?.tabs).toHaveLength(1);
      expect(result?.tabCount).toBe(1);
      expect(result?.tabs[0].id).toBe('tab2');
    });

    it('should delete session when last tab removed', async () => {
      const tab = makeTab({ id: 'tab1' });
      const s = makeSession([tab], { id: 's1', tabCount: 1 });
      vi.mocked(storage.readSessions).mockResolvedValue([s]);
      const result = await store.removeTabFromSession('s1', 'tab1');
      expect(result).toBeNull();
    });
  });
});
