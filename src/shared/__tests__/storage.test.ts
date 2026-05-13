import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Session } from '../types';
import { readSessions, writeSessions, readSettings, writeSettings } from '../storage';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants';

const mockStorage: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[] | null, callback: (result: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {};
        if (keys === null || keys === undefined) {
          Object.assign(result, mockStorage);
        } else if (typeof keys === 'string') {
          result[keys] = mockStorage[keys];
        } else if (Array.isArray(keys)) {
          for (const key of keys) {
            result[key] = mockStorage[key];
          }
        }
        callback(result);
      }),
      set: vi.fn((items: Record<string, unknown>, callback: () => void) => {
        Object.assign(mockStorage, items);
        callback();
      }),
    },
  },
};

(globalThis as Record<string, unknown>).chrome = mockChrome;

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.clearAllMocks();
});

describe('storage', () => {
  const makeSession = (id: string): Session => ({
    id,
    name: 'Test Session',
    tabs: [],
    createdAt: Date.now(),
    tabCount: 0,
    isStarred: false,
  });

  describe('readSessions', () => {
    it('should return empty array when no sessions stored', async () => {
      const sessions = await readSessions();
      expect(sessions).toEqual([]);
    });

    it('should return stored sessions', async () => {
      const session = makeSession('s1');
      mockStorage[STORAGE_KEY] = [session];
      const sessions = await readSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s1');
    });
  });

  describe('writeSessions', () => {
    it('should store sessions', async () => {
      const session = makeSession('s1');
      await writeSessions([session]);
      const sessions = await readSessions();
      expect(sessions).toHaveLength(1);
    });

    it('should overwrite existing sessions', async () => {
      await writeSessions([makeSession('s1')]);
      await writeSessions([makeSession('s2')]);
      const sessions = await readSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s2');
    });
  });

  describe('readSettings', () => {
    it('should return default settings when none stored', async () => {
      const settings = await readSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should return stored settings', async () => {
      mockStorage['listtab_settings'] = {
        maxSessions: 100,
        confirmBeforeRestore: true,
        darkMode: 'dark',
      };
      const settings = await readSettings();
      expect(settings.maxSessions).toBe(100);
      expect(settings.darkMode).toBe('dark');
    });
  });

  describe('writeSettings', () => {
    it('should store settings', async () => {
      await writeSettings({ ...DEFAULT_SETTINGS, darkMode: 'light' });
      const settings = await readSettings();
      expect(settings.darkMode).toBe('light');
    });
  });
});
