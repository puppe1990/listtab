# ListTab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chrome extension that saves open tabs into sessions and restores them individually or in bulk, with modern Tailwind CSS design.

**Architecture:** Background service worker handles Chrome APIs (tabs, storage). React dashboard + popup communicate via `chrome.runtime.sendMessage`. Shared types and storage utilities are consumed by both layers.

**Tech Stack:** TypeScript 5, React 18, Tailwind CSS v4, Vite 6, @crxjs/vite-plugin, Vitest 3, @testing-library/react, jsdom

---

### Task 1: Project Scaffold

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/shared/types.ts`
- Create: `src/shared/constants.ts`
- Create: `src/shared/storage.ts`
- Create: `public/icons/icon16.png`
- Create: `public/icons/icon48.png`
- Create: `public/icons/icon128.png`

- [ ] **Step 1: Create package.json**

```bash
mkdir -p src/shared src/background src/dashboard/components src/dashboard/hooks src/popup public/icons
```

```json
{
  "name": "listtab",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.33",
    "@tailwindcss/vite": "^4.1.7",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/chrome": "^0.0.315",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "jsdom": "^26.0.0",
    "tailwindcss": "^4.1.7",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.1.2"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["chrome"],
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: [
      'src/**/__tests__/**/*.test.ts',
      'src/**/__tests__/**/*.test.tsx',
    ],
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
```

- [ ] **Step 4: Create placeholder vite.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({});
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
```

- [ ] **Step 6: Verify**

```bash
npx vitest run
```

Expected: "No test files found, exiting with code 1" (exit code 1 is acceptable, means Vitest is working but found no tests)

- [ ] **Step 7: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold project with deps and configs"
```

---

### Task 2: Shared Types

**Files:**

- Create: `src/shared/types.ts`
- Create: `src/shared/__tests__/types.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';

describe('types', () => {
  it('should define Tab, Session, and Settings types that compile', () => {
    const tab = {
      id: 't1',
      title: 'Google',
      url: 'https://google.com',
      faviconUrl: 'https://google.com/favicon.ico',
      pinned: false,
      savedAt: Date.now(),
    };
    expect(tab.id).toBe('t1');
    expect(tab.url).toBe('https://google.com');

    const session = {
      id: 's1',
      name: 'Session - May 13',
      tabs: [tab],
      createdAt: Date.now(),
      tabCount: 1,
      isStarred: false,
    };
    expect(session.tabCount).toBe(1);
    expect(session.isStarred).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/__tests__/types.test.ts
```

Expected: FAIL (file not found yet — wait, actually this test will compile but we need to create the types.ts first for it to work with TypeScript)

Actually, for this test to work, we need the types.ts file to exist. Let me adjust — write types.ts first (it's a pure type definition, TDD doesn't apply cleanly to types), then write the validation test.

- [ ] **Step 2 (adjusted): Write types.ts**

```typescript
export interface Tab {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  pinned: boolean;
  savedAt: number;
}

export interface Session {
  id: string;
  name: string;
  tabs: Tab[];
  createdAt: number;
  tabCount: number;
  isStarred: boolean;
}

export interface Settings {
  maxSessions: number;
  confirmBeforeRestore: boolean;
  darkMode: 'light' | 'dark' | 'system';
}

export interface AppState {
  sessions: Session[];
  settings: Settings;
}

export type MessageType =
  | 'saveAllTabs'
  | 'restoreTab'
  | 'restoreSession'
  | 'getSessions'
  | 'deleteSession'
  | 'updateSession'
  | 'exportSessions'
  | 'importSessions'
  | 'getSettings'
  | 'updateSettings';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface SaveAllTabsResponse {
  session: Session;
}

export interface RestoreTabPayload {
  tab: Tab;
  sessionId: string;
}

export interface RestoreSessionPayload {
  sessionId: string;
}

export interface UpdateSessionPayload {
  sessionId: string;
  updates: Partial<Pick<Session, 'name' | 'isStarred'>>;
}

export interface ImportSessionsPayload {
  sessions: Session[];
}
```

- [ ] **Step 3: Run the validation test**

> Since this is pure types, the test validates at compile-time. Write the test file:

```typescript
import { describe, it, expect } from 'vitest';
import type { Tab, Session, Settings, AppState, MessageType } from '../types';

describe('types', () => {
  it('Tab should accept valid object with required fields', () => {
    const tab: Tab = {
      id: 't1',
      title: 'Google',
      url: 'https://google.com',
      pinned: false,
      savedAt: Date.now(),
    };
    expect(tab.title).toBe('Google');
  });

  it('Tab should accept optional faviconUrl', () => {
    const tab: Tab = {
      id: 't2',
      title: 'No Icon',
      url: 'https://noicon.com',
      pinned: true,
      savedAt: Date.now(),
      faviconUrl: 'https://icons.com/fav.png',
    };
    expect(tab.faviconUrl).toBe('https://icons.com/fav.png');
  });

  it('Session should contain tabs array', () => {
    const tab: Tab = {
      id: 't1',
      title: 'Test',
      url: 'https://test.com',
      pinned: false,
      savedAt: 123,
    };
    const session: Session = {
      id: 's1',
      name: 'My Session',
      tabs: [tab],
      createdAt: 456,
      tabCount: 1,
      isStarred: false,
    };
    expect(session.tabs).toHaveLength(1);
  });

  it('MessageType should include all message types', () => {
    const types: MessageType[] = [
      'saveAllTabs',
      'restoreTab',
      'restoreSession',
      'getSessions',
      'deleteSession',
      'updateSession',
      'exportSessions',
      'importSessions',
      'getSettings',
      'updateSettings',
    ];
    expect(types).toHaveLength(10);
  });

  it('Settings darkMode should accept only valid values', () => {
    const settings: Settings = {
      maxSessions: 50,
      confirmBeforeRestore: true,
      darkMode: 'system',
    };
    expect(settings.darkMode).toBe('system');
  });
});
```

```bash
npx vitest run src/shared/__tests__/types.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 4: Commit**

```bash
git add src/shared/types.ts src/shared/__tests__/types.test.ts
git commit -m "feat: add shared types (Tab, Session, Settings, Messages)"
```

---

### Task 3: Shared Constants

**Files:**

- Create: `src/shared/constants.ts`
- Create: `src/shared/__tests__/constants.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { formatSessionName, generateId } from '../constants';

describe('constants', () => {
  describe('formatSessionName', () => {
    it('should format a date into session name', () => {
      const date = new Date('2026-05-13T15:30:00');
      const name = formatSessionName(date);
      expect(name).toContain('2026');
      expect(name).toContain('May');
      expect(name).toContain('13');
    });

    it('should produce unique names for different dates', () => {
      const name1 = formatSessionName(new Date('2026-05-13T10:00:00'));
      const name2 = formatSessionName(new Date('2026-05-14T10:00:00'));
      expect(name1).not.toBe(name2);
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/__tests__/constants.test.ts
```

Expected: FAIL (module not found or functions not exported)

- [ ] **Step 3: Write implementation**

```typescript
export const DEFAULT_SETTINGS = {
  maxSessions: 50,
  confirmBeforeRestore: false,
  darkMode: 'system' as const,
};

export const STORAGE_KEY = 'listtab_sessions';

export const FAVICON_BASE_URL = 'https://www.google.com/s2/favicons';

export function formatSessionName(date: Date = new Date()): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function generateId(): string {
  return crypto.randomUUID();
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/__tests__/constants.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/shared/constants.ts src/shared/__tests__/constants.test.ts
git commit -m "feat: add shared constants (formatSessionName, generateId, defaults)"
```

---

### Task 4: Shared Storage Helpers

**Files:**

- Create: `src/shared/__tests__/storage.test.ts`
- Modify: `src/shared/storage.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Session } from '../types';
import {
  readSessions,
  writeSessions,
  readSettings,
  writeSettings,
} from '../storage';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants';

const mockStorage: Record<string, unknown> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(
        (
          keys: string | string[] | null,
          callback: (result: Record<string, unknown>) => void
        ) => {
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
        }
      ),
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/shared/__tests__/storage.test.ts
```

Expected: FAIL (functions not implemented)

- [ ] **Step 3: Write implementation**

```typescript
import type { Session, Settings } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY } from './constants';

function chromeStorageGet(
  keys: string | string[] | null
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

function chromeStorageSet(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

export async function readSessions(): Promise<Session[]> {
  const result = await chromeStorageGet(STORAGE_KEY);
  const sessions = result[STORAGE_KEY];
  return Array.isArray(sessions) ? (sessions as Session[]) : [];
}

export async function writeSessions(sessions: Session[]): Promise<void> {
  await chromeStorageSet({ [STORAGE_KEY]: sessions });
}

export async function readSettings(): Promise<Settings> {
  const result = await chromeStorageGet('listtab_settings');
  const stored = result['listtab_settings'];
  if (stored && typeof stored === 'object') {
    return { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings>) };
  }
  return { ...DEFAULT_SETTINGS };
}

export async function writeSettings(settings: Settings): Promise<void> {
  await chromeStorageSet({ listtab_settings: settings });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/shared/__tests__/storage.test.ts
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/shared/storage.ts src/shared/__tests__/storage.test.ts
git commit -m "feat: add storage helpers (read/write sessions and settings)"
```

---

### Task 5: SessionStore (Background)

**Files:**

- Create: `src/background/__tests__/SessionStore.test.ts`
- Create: `src/background/SessionStore.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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

const makeSession = (
  tabs: Tab[] = [],
  overrides: Partial<Session> = {}
): Session => ({
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
      const tab = makeTab({ id: 'tab1' });
      const s = makeSession([tab], { id: 's1', tabCount: 1 });
      vi.mocked(storage.readSessions).mockResolvedValue([s]);
      const result = await store.removeTabFromSession('s1', 'tab1');
      expect(result?.tabs).toHaveLength(0);
      expect(result?.tabCount).toBe(0);
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/background/__tests__/SessionStore.test.ts
```

Expected: FAIL (SessionStore not implemented)

- [ ] **Step 3: Write implementation**

```typescript
import type { Session } from '../shared/types';
import { readSessions, writeSessions } from '../shared/storage';

export class SessionStore {
  async getAllSessions(): Promise<Session[]> {
    const sessions = await readSessions();
    return sessions.sort((a, b) => {
      if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }

  async getSession(id: string): Promise<Session | undefined> {
    const sessions = await readSessions();
    return sessions.find((s) => s.id === id);
  }

  async saveSession(session: Session, maxSessions = 50): Promise<void> {
    const sessions = await readSessions();
    const updated = [session, ...sessions].slice(0, maxSessions);
    await writeSessions(updated);
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = await readSessions();
    await writeSessions(sessions.filter((s) => s.id !== id));
  }

  async updateSession(
    id: string,
    updates: Partial<Pick<Session, 'name' | 'isStarred'>>
  ): Promise<void> {
    const sessions = await readSessions();
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    await writeSessions(updated);
  }

  async removeTabFromSession(
    sessionId: string,
    tabId: string
  ): Promise<Session | null> {
    const sessions = await readSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;
    const remainingTabs = session.tabs.filter((t) => t.id !== tabId);
    if (remainingTabs.length === 0) {
      await this.deleteSession(sessionId);
      return null;
    }
    const updatedSession: Session = {
      ...session,
      tabs: remainingTabs,
      tabCount: remainingTabs.length,
    };
    const updatedSessions = sessions.map((s) =>
      s.id === sessionId ? updatedSession : s
    );
    await writeSessions(updatedSessions);
    return updatedSession;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/background/__tests__/SessionStore.test.ts
```

Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/background/SessionStore.ts src/background/__tests__/SessionStore.test.ts
git commit -m "feat: add SessionStore with CRUD, sorting, and tab removal"
```

---

### Task 6: TabManager (Background)

**Files:**

- Create: `src/background/__tests__/TabManager.test.ts`
- Create: `src/background/TabManager.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabManager } from '../TabManager';
import type { Tab, Session } from '../../shared/types';

function createMockChrome() {
  const tabs: chrome.tabs.Tab[] = [];
  const createdTabs: number[] = [];

  return {
    tabs: {
      query: vi.fn(
        (
          _info: chrome.tabs.QueryInfo,
          cb: (tabs: chrome.tabs.Tab[]) => void
        ) => {
          cb([...tabs]);
        }
      ),
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
    _addTab(tab: chrome.tabs.Tab) {
      tabs.push(tab);
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
    manager = new TabManager(
      mockStore as unknown as Parameters<TabManager['constructor']>[0]
    );
  });

  describe('saveAllTabs', () => {
    it('should capture all tabs and create a session', async () => {
      mock._addTab({
        id: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: true,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'https://google.com',
        title: 'Google',
      });
      mock._addTab({
        id: 2,
        index: 1,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: false,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'https://github.com',
        title: 'GitHub',
      });

      const session = await manager.saveAllTabs();

      expect(session.tabs).toHaveLength(2);
      expect(session.tabs[0].url).toBe('https://google.com');
      expect(session.tabs[1].title).toBe('GitHub');
      expect(mockStore.saveSession).toHaveBeenCalledWith(session, 50);
    });

    it('should close captured tabs after saving', async () => {
      mock._addTab({
        id: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: true,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'https://example.com',
        title: 'Example',
      });

      await manager.saveAllTabs();
      expect(mock.tabs.remove).toHaveBeenCalledWith([1], expect.any(Function));
    });

    it('should not capture pinned tabs', async () => {
      mock._addTab({
        id: 1,
        index: 0,
        pinned: true,
        highlighted: false,
        windowId: 1,
        active: true,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'chrome://newtab',
        title: 'New Tab',
      });

      const session = await manager.saveAllTabs();
      expect(session.tabs).toHaveLength(0);
    });

    it('should skip chrome:// and chrome-extension:// URLs', async () => {
      mock._addTab({
        id: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: true,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'chrome://settings',
        title: 'Settings',
      });
      mock._addTab({
        id: 2,
        index: 1,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: false,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
        url: 'https://valid.com',
        title: 'Valid',
      });

      const session = await manager.saveAllTabs();
      expect(session.tabs).toHaveLength(1);
      expect(session.tabs[0].url).toBe('https://valid.com');
    });

    it('should generate faviconUrl from Google S2', async () => {
      mock._addTab({
        id: 1,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 1,
        active: true,
        incognito: false,
        selected: false,
        discarded: false,
        autoDiscardable: true,
        groupId: -1,
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
        expect.any(Function)
      );
    });
  });

  describe('restoreSession', () => {
    it('should restore all tabs from a session', () => {
      const session: Session = {
        id: 's1',
        name: 'Test',
        tabs: [
          {
            id: 't1',
            title: 'A',
            url: 'https://a.com',
            pinned: false,
            savedAt: 1,
          },
          {
            id: 't2',
            title: 'B',
            url: 'https://b.com',
            pinned: false,
            savedAt: 2,
          },
        ],
        createdAt: 100,
        tabCount: 2,
        isStarred: false,
      };

      manager.restoreSession(session);
      expect(mock.tabs.create).toHaveBeenCalledTimes(2);
      expect(mock.tabs.create).toHaveBeenCalledWith(
        { url: 'https://a.com', active: false },
        expect.any(Function)
      );
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/background/__tests__/TabManager.test.ts
```

Expected: FAIL (TabManager not implemented)

- [ ] **Step 3: Write implementation**

```typescript
import type { Tab, Session } from '../shared/types';
import {
  generateId,
  formatSessionName,
  FAVICON_BASE_URL,
} from '../shared/constants';
import { readSettings } from '../shared/storage';

interface SessionStoreLike {
  saveSession(session: Session, maxSessions?: number): Promise<void>;
}

const SKIP_URL_PREFIXES = ['chrome://', 'chrome-extension://', 'about:'];

function parseHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export class TabManager {
  constructor(private sessionStore: SessionStoreLike) {}

  async saveAllTabs(): Promise<Session> {
    const chromeTabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({ currentWindow: true }, resolve);
    });

    const tabs: Tab[] = chromeTabs
      .filter((t) => {
        if (t.pinned) return false;
        if (!t.url) return false;
        return !SKIP_URL_PREFIXES.some((prefix) => t.url!.startsWith(prefix));
      })
      .map((t) => ({
        id: generateId(),
        title: t.title || t.url || '',
        url: t.url!,
        faviconUrl: `${FAVICON_BASE_URL}?domain=${parseHostname(t.url!)}&sz=32`,
        pinned: false,
        savedAt: Date.now(),
      }));

    const session: Session = {
      id: generateId(),
      name: formatSessionName(),
      tabs,
      createdAt: Date.now(),
      tabCount: tabs.length,
      isStarred: false,
    };

    const tabIds = chromeTabs
      .filter((t) => t.id !== undefined && !t.pinned)
      .map((t) => t.id!);

    const settings = await readSettings();
    await this.sessionStore.saveSession(session, settings.maxSessions);

    if (tabIds.length > 0) {
      await new Promise<void>((resolve) => {
        chrome.tabs.remove(tabIds, () => resolve());
      });
    }

    return session;
  }

  restoreTab(tab: Tab): void {
    chrome.tabs.create({ url: tab.url, active: false });
  }

  restoreSession(session: Session): void {
    for (const tab of session.tabs) {
      chrome.tabs.create({ url: tab.url, active: false });
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/background/__tests__/TabManager.test.ts
```

Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/background/TabManager.ts src/background/__tests__/TabManager.test.ts
git commit -m "feat: add TabManager (save, restore, filter tabs)"
```

---

### Task 7: Background SW Entry Point

**Files:**

- Create: `src/background/__tests__/index.test.ts`
- Create: `src/background/index.ts`

- [ ] **Step 1: Context / approach**

The background index.ts initializes the SW, sets up `onInstalled` listener, adds `onClicked` action handler to trigger save+open dashboard, and registers `runtime.onMessage` listeners routing to SessionStore and TabManager.

We'll test message routing without MockServiceWorkers, since chrome APIs are mocked manually.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Session, ExtensionMessage } from '../../shared/types';

vi.mock('../SessionStore', () => ({
  SessionStore: vi.fn().mockImplementation(() => ({
    getAllSessions: vi.fn().mockResolvedValue([]),
    deleteSession: vi.fn(),
    updateSession: vi.fn(),
    removeTabFromSession: vi.fn(),
  })),
}));

vi.mock('../TabManager', () => ({
  TabManager: vi.fn().mockImplementation(() => ({
    saveAllTabs: vi.fn().mockResolvedValue({
      id: 'new-session',
      name: 'New',
      tabs: [],
      createdAt: Date.now(),
      tabCount: 0,
      isStarred: false,
    }),
    restoreTab: vi.fn(),
    restoreSession: vi.fn(),
  })),
}));

const mockOnInstalled = { addListener: vi.fn() };
const mockOnClicked = { addListener: vi.fn() };
const mockOnMessage = { addListener: vi.fn() };
const mockTabsCreate = vi.fn();

(globalThis as Record<string, unknown>).chrome = {
  runtime: {
    onInstalled: mockOnInstalled,
    onMessage: mockOnMessage,
    onStartup: { addListener: vi.fn() },
  },
  action: {
    onClicked: mockOnClicked,
  },
  tabs: {
    create: mockTabsCreate,
  },
};

let messageHandler:
  | ((
      message: ExtensionMessage,
      _sender: unknown,
      sendResponse: (r: unknown) => void
    ) => void)
  | null = null;

beforeEach(() => {
  vi.clearAllMocks();
  messageHandler = null;
  mockOnMessage.addListener.mockImplementation(
    (
      handler: (
        message: ExtensionMessage,
        _sender: unknown,
        sendResponse: (r: unknown) => void
      ) => void
    ) => {
      messageHandler = handler;
    }
  );
});

describe('background/index', () => {
  it('should register onInstalled listener', async () => {
    await import('../index');
    expect(mockOnInstalled.addListener).toHaveBeenCalled();
  });

  it('should register action onClicked listener', async () => {
    await import('../index');
    expect(mockOnClicked.addListener).toHaveBeenCalled();
  });

  it('should register onMessage listener', async () => {
    await import('../index');
    expect(mockOnMessage.addListener).toHaveBeenCalled();
  });

  it('should handle saveAllTabs message', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    await messageHandler!({ type: 'saveAllTabs' }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should handle getSessions message', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    await messageHandler!({ type: 'getSessions' }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [] })
    );
  });

  it('should handle deleteSession message', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    await messageHandler!(
      { type: 'deleteSession', payload: { sessionId: 's1' } },
      {},
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should return error for unknown message type', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    await messageHandler!(
      { type: 'unknown' as unknown as ExtensionMessage['type'] },
      {},
      sendResponse
    );

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/background/__tests__/index.test.ts
```

Expected: FAIL (file not found or no listeners registered)

- [ ] **Step 3: Write implementation**

```typescript
import { SessionStore } from './SessionStore';
import { TabManager } from './TabManager';
import type { ExtensionMessage } from '../shared/types';

const sessionStore = new SessionStore();
const tabManager = new TabManager(sessionStore);

chrome.runtime.onInstalled.addListener(() => {
  console.log('ListTab installed');
});

chrome.action.onClicked.addListener(async () => {
  const session = await tabManager.saveAllTabs();
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
});

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true;
  }
);

async function handleMessage(message: ExtensionMessage) {
  try {
    switch (message.type) {
      case 'saveAllTabs': {
        const session = await tabManager.saveAllTabs();
        return { success: true, data: session };
      }

      case 'restoreTab': {
        const { tab } = message.payload as {
          tab: import('../shared/types').Tab;
        };
        tabManager.restoreTab(tab);
        return { success: true };
      }

      case 'restoreSession': {
        const { session } = message.payload as {
          session: import('../shared/types').Session;
        };
        tabManager.restoreSession(session);
        return { success: true };
      }

      case 'getSessions': {
        const sessions = await sessionStore.getAllSessions();
        return { success: true, data: sessions };
      }

      case 'deleteSession': {
        const { sessionId } = message.payload as { sessionId: string };
        await sessionStore.deleteSession(sessionId);
        return { success: true };
      }

      case 'updateSession': {
        const { sessionId, updates } = message.payload as {
          sessionId: string;
          updates: Partial<
            Pick<import('../shared/types').Session, 'name' | 'isStarred'>
          >;
        };
        await sessionStore.updateSession(sessionId, updates);
        return { success: true };
      }

      case 'exportSessions': {
        const sessions = await sessionStore.getAllSessions();
        return { success: true, data: sessions };
      }

      case 'importSessions': {
        const { sessions } = message.payload as {
          sessions: import('../shared/types').Session[];
        };
        for (const session of sessions) {
          await sessionStore.saveSession(session);
        }
        return { success: true };
      }

      case 'removeTabFromSession': {
        const { sessionId, tabId } = message.payload as {
          sessionId: string;
          tabId: string;
        };
        await sessionStore.removeTabFromSession(sessionId, tabId);
        return { success: true };
      }

      default:
        return {
          success: false,
          error: `Unknown message type: ${(message as { type: string }).type}`,
        };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/background/__tests__/index.test.ts
```

Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/background/index.ts src/background/__tests__/index.test.ts
git commit -m "feat: add background SW entry with message routing and action handler"
```

---

### Task 8: EmptyState Component

**Files:**

- Create: `src/dashboard/components/__tests__/EmptyState.test.tsx`
- Create: `src/dashboard/components/EmptyState.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render message and save button', () => {
    render(<EmptyState />);
    expect(screen.getByText(/no tabs saved/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save all tabs/i })
    ).toBeInTheDocument();
  });

  it('should call onSaveAll when button clicked', async () => {
    const handleSaveAll = vi.fn();
    const { user } = await renderWithUser(
      <EmptyState onSaveAll={handleSaveAll} />
    );
    await user.click(screen.getByRole('button', { name: /save all tabs/i }));
    expect(handleSaveAll).toHaveBeenCalledOnce();
  });
});

async function renderWithUser(ui: React.ReactElement) {
  const user = userEvent.setup();
  return { user, ...render(ui) };
}
```

Wait, this approach won't work without importing userEvent. Let me adjust:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render message and save button', () => {
    render(<EmptyState />);
    expect(screen.getByText(/no tabs saved yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save all tabs/i })
    ).toBeInTheDocument();
  });

  it('should call onSaveAll when button clicked', () => {
    const handleSaveAll = vi.fn();
    render(<EmptyState onSaveAll={handleSaveAll} />);
    fireEvent.click(screen.getByRole('button', { name: /save all tabs/i }));
    expect(handleSaveAll).toHaveBeenCalledOnce();
  });

  it('should use default empty onSaveAll without throwing', () => {
    render(<EmptyState />);
    fireEvent.click(screen.getByRole('button', { name: /save all tabs/i }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/components/__tests__/EmptyState.test.tsx
```

Expected: FAIL (EmptyState not found)

- [ ] **Step 3: Write implementation**

```tsx
interface EmptyStateProps {
  onSaveAll?: () => void;
}

export function EmptyState({ onSaveAll }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">📋</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
        No tabs saved yet
      </h2>
      <p className="mb-6 max-w-sm text-gray-500 dark:text-gray-400">
        Click the button below or the extension icon in your toolbar to save all
        open tabs into a session.
      </p>
      <button
        onClick={onSaveAll}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors font-medium"
      >
        Save All Tabs
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/components/__tests__/EmptyState.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/components/EmptyState.tsx src/dashboard/components/__tests__/EmptyState.test.tsx
git commit -m "feat: add EmptyState component with save all CTA"
```

---

### Task 9: TabItem Component

**Files:**

- Create: `src/dashboard/components/__tests__/TabItem.test.tsx`
- Create: `src/dashboard/components/TabItem.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    render(<TabItem tab={mockTab} onRestore={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('github.com')).toBeInTheDocument();
  });

  it('should render favicon', () => {
    render(<TabItem tab={mockTab} onRestore={() => {}} onDelete={() => {}} />);
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
    render(<TabItem tab={longTab} onRestore={() => {}} onDelete={() => {}} />);
    const title = screen.getByText('A'.repeat(200));
    expect(title.className).toContain('truncate');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/components/__tests__/TabItem.test.tsx
```

Expected: FAIL (TabItem component not found)

- [ ] **Step 3: Write implementation**

```tsx
import type React from 'react';
import type { Tab } from '../../shared/types';

interface TabItemProps {
  tab: Tab;
  onRestore: (tab: Tab) => void;
  onDelete: (tab: Tab) => void;
}

export function TabItem({ tab, onRestore, onDelete }: TabItemProps) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {tab.faviconUrl ? (
        <img
          src={tab.faviconUrl}
          alt={tab.title}
          className="h-5 w-5 flex-shrink-0 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove(
              'hidden'
            );
          }}
        />
      ) : null}
      <span
        className={`${tab.faviconUrl ? 'hidden' : ''} flex-shrink-0 text-sm`}
      >
        🌐
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {tab.title}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {new URL(tab.url).hostname}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onRestore(tab)}
          title="Restore tab"
          className="rounded p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(tab)}
          title="Remove from list"
          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/components/__tests__/TabItem.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/components/TabItem.tsx src/dashboard/components/__tests__/TabItem.test.tsx
git commit -m "feat: add TabItem component with restore and delete actions"
```

---

### Task 10: SessionCard Component

**Files:**

- Create: `src/dashboard/components/__tests__/SessionCard.test.tsx`
- Create: `src/dashboard/components/SessionCard.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/components/__tests__/SessionCard.test.tsx
```

Expected: FAIL (SessionCard not found)

- [ ] **Step 3: Write implementation**

```tsx
import { useState } from 'react';
import type { Session, Tab } from '../../shared/types';
import { TabItem } from './TabItem';

interface SessionCardProps {
  session: Session;
  onRestoreTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
  onRestoreAll: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onRename: (session: Session, newName: string) => void;
  onToggleStar: (session: Session) => void;
}

export function SessionCard({
  session,
  onRestoreTab,
  onDeleteTab,
  onRestoreAll,
  onDeleteSession,
  onRename,
  onToggleStar,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);

  const handleBlur = () => {
    setIsEditing(false);
    if (editName.trim() && editName !== session.name) {
      onRename(session, editName.trim());
    } else {
      setEditName(session.name);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 px-5 py-4">
        <button
          onClick={() => onToggleStar(session)}
          title={session.isStarred ? 'Unstar session' : 'Star session'}
          className="flex-shrink-0 text-lg"
        >
          {session.isStarred ? '⭐' : '☆'}
        </button>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBlur();
                if (e.key === 'Escape') {
                  setEditName(session.name);
                  setIsEditing(false);
                }
              }}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-0.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="truncate text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {session.name}
            </h2>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {session.tabCount} tab{session.tabCount !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => onRestoreAll(session)}
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Restore All
        </button>

        <button
          onClick={() => onDeleteSession(session)}
          title="Delete session"
          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-1 p-3">
        {session.tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            onRestore={onRestoreTab}
            onDelete={onDeleteTab}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/components/__tests__/SessionCard.test.tsx
```

Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/components/SessionCard.tsx src/dashboard/components/__tests__/SessionCard.test.tsx
git commit -m "feat: add SessionCard component with inline rename, star, and actions"
```

---

### Task 11: SearchBar Component

**Files:**

- Create: `src/dashboard/components/__tests__/SearchBar.test.tsx`
- Create: `src/dashboard/components/SearchBar.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search tabs/i);
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchBar value="github" onChange={() => {}} />);
    const input = screen.getByDisplayValue('github');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText(/search tabs/i), {
      target: { value: 'hello' },
    });
    expect(handleChange).toHaveBeenCalledWith('hello');
  });

  it('should render search icon', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search tabs/i);
    const parent = input.parentElement!;
    expect(parent.querySelector('svg')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/components/__tests__/SearchBar.test.tsx
```

Expected: FAIL (SearchBar not found)

- [ ] **Step 3: Write implementation**

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tabs by title or URL..."
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/components/__tests__/SearchBar.test.tsx
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/components/SearchBar.tsx src/dashboard/components/__tests__/SearchBar.test.tsx
git commit -m "feat: add SearchBar component"
```

---

### Task 12: SessionList Component

**Files:**

- Create: `src/dashboard/components/__tests__/SessionList.test.tsx`
- Create: `src/dashboard/components/SessionList.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      />
    );
    const buttons = screen.getAllByRole('button', { name: /restore all/i });
    expect(buttons).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/components/__tests__/SessionList.test.tsx
```

Expected: FAIL (SessionList not found)

- [ ] **Step 3: Write implementation**

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/components/__tests__/SessionList.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/components/SessionList.tsx src/dashboard/components/__tests__/SessionList.test.tsx
git commit -m "feat: add SessionList component with empty state handling"
```

---

### Task 13: Toolbar Component

**Files:**

- Create: `src/dashboard/components/__tests__/Toolbar.test.tsx`
- Create: `src/dashboard/components/Toolbar.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(
      screen.getByRole('button', { name: /save all tabs/i })
    ).toBeInTheDocument();
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
    expect(
      screen.getByRole('button', { name: /restore everything/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /delete all/i })
    ).toBeInTheDocument();
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
    expect(
      screen.queryByRole('button', { name: /restore everything/i })
    ).toBeNull();
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
    fireEvent.click(screen.getByTitle('Export sessions'));
    expect(handleExport).toHaveBeenCalledOnce();
  });

  it('should call onImport when file selected and parsed', () => {
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
      [
        JSON.stringify([
          {
            id: 's1',
            name: 'Test',
            tabs: [],
            createdAt: 1,
            tabCount: 0,
            isStarred: false,
          },
        ]),
      ],
      'sessions.json',
      { type: 'application/json' }
    );

    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    expect(handleImport).toHaveBeenCalledOnce();
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
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/components/__tests__/Toolbar.test.tsx
```

Expected: FAIL (Toolbar not found)

- [ ] **Step 3: Write implementation**

```tsx
import { useRef } from 'react';
import type { Session } from '../../shared/types';

interface ToolbarProps {
  onSaveAll: () => void;
  onRestoreAll: () => void;
  onDeleteAll: () => void;
  onExport: () => void;
  onImport: (sessions: Session[]) => void;
  hasSessions: boolean;
}

export function Toolbar({
  onSaveAll,
  onRestoreAll,
  onDeleteAll,
  onExport,
  onImport,
  hasSessions,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const sessions = JSON.parse(event.target?.result as string);
        if (Array.isArray(sessions)) {
          onImport(sessions);
        }
      } catch {
        alert('Invalid JSON file. Please select a valid sessions export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onSaveAll}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Save All Tabs
      </button>

      {hasSessions && (
        <>
          <button
            onClick={onRestoreAll}
            className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            Restore Everything
          </button>

          <button
            onClick={onDeleteAll}
            className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            Delete All
          </button>
        </>
      )}

      <div className="ml-auto flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import sessions"
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </button>

        <button
          onClick={onExport}
          title="Export sessions"
          disabled={!hasSessions}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/components/__tests__/Toolbar.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/components/Toolbar.tsx src/dashboard/components/__tests__/Toolbar.test.tsx
git commit -m "feat: add Toolbar component with save, restore, delete, export, import"
```

---

### Task 14: useSessions Hook

**Files:**

- Create: `src/dashboard/hooks/__tests__/useSessions.test.ts`
- Create: `src/dashboard/hooks/useSessions.ts`

- [ ] **Step 1: Context**

useSessions communicates with the background SW via `chrome.runtime.sendMessage`. It manages the sessions state, loading flag, and error state. For tests, we mock `chrome.runtime.sendMessage`.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessions } from '../useSessions';
import type { Session, Tab } from '../../../shared/types';

const mockSendMessage = vi.fn();
(globalThis as Record<string, unknown>).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
  },
};

const makeSession = (id: string): Session => ({
  id,
  name: `Session ${id}`,
  tabs: [
    {
      id: 't1',
      title: 'Tab',
      url: 'https://example.com',
      pinned: false,
      savedAt: 1,
    },
  ],
  createdAt: Date.now(),
  tabCount: 1,
  isStarred: false,
});

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMessage.mockResolvedValue({ success: true, data: [] });
  });

  it('should load sessions on mount', async () => {
    const sessions = [makeSession('s1'), makeSession('s2')];
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });

    const { result } = renderHook(() => useSessions());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sessions).toHaveLength(2);
  });

  it('should handle saveAllTabs', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: makeSession('new') })
      .mockResolvedValueOnce({ success: true, data: [makeSession('new')] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.saveAllTabs();
    });

    expect(mockSendMessage).toHaveBeenCalledWith({ type: 'saveAllTabs' });
  });

  it('should handle restoreTab', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [makeSession('s1')] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const tab = makeSession('s1').tabs[0];
    await act(async () => {
      await result.current.restoreTab(tab, 's1');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'restoreTab',
      payload: { tab, sessionId: 's1' },
    });
  });

  it('should handle restoreSession', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [makeSession('s1')] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const session = makeSession('s1');
    await act(async () => {
      await result.current.restoreSession(session);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'restoreSession',
      payload: { session },
    });
  });

  it('should handle deleteSession', async () => {
    const sessions = [makeSession('s1'), makeSession('s2')];
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: sessions })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [makeSession('s2')] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteSession('s1');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'deleteSession',
      payload: { sessionId: 's1' },
    });
  });

  it('should handle rename', async () => {
    mockSendMessage.mockResolvedValueOnce({
      success: true,
      data: [makeSession('s1')],
    });
    mockSendMessage.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.renameSession('s1', 'New Name');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'updateSession',
      payload: { sessionId: 's1', updates: { name: 'New Name' } },
    });
  });

  it('should handle toggleStar', async () => {
    const s1 = makeSession('s1');
    mockSendMessage.mockResolvedValueOnce({ success: true, data: [s1] });
    mockSendMessage.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleStar(s1);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'updateSession',
      payload: { sessionId: 's1', updates: { isStarred: true } },
    });
  });

  it('should handle export', async () => {
    const sessions = [makeSession('s1')];
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.exportSessions();
    });

    expect(mockSendMessage).toHaveBeenCalledWith({ type: 'exportSessions' });
  });

  it('should handle import', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({
        success: true,
        data: [makeSession('imported')],
      });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.importSessions([makeSession('imported')]);
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'importSessions',
      payload: { sessions: [makeSession('imported')] },
    });
  });

  it('should handle deleteTab', async () => {
    mockSendMessage
      .mockResolvedValueOnce({ success: true, data: [makeSession('s1')] })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTab('s1', 't1');
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: 'removeTabFromSession',
      payload: { sessionId: 's1', tabId: 't1' },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/hooks/__tests__/useSessions.test.ts
```

Expected: FAIL (useSessions not found)

- [ ] **Step 3: Write implementation**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { Session, Tab } from '../../shared/types';

function sendMessage<T = unknown>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, resolve);
  });
}

interface UseSessionsReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  saveAllTabs: () => Promise<void>;
  restoreTab: (tab: Tab, sessionId: string) => Promise<void>;
  restoreSession: (session: Session) => Promise<void>;
  restoreAllSessions: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  deleteAllSessions: () => Promise<void>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  toggleStar: (session: Session) => Promise<void>;
  exportSessions: () => Promise<void>;
  importSessions: (sessions: Session[]) => Promise<void>;
  deleteTab: (sessionId: string, tabId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const response = await sendMessage<{
        success: boolean;
        data?: Session[];
      }>('getSessions');
      if (response.success && response.data) {
        setSessions(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveAllTabs = useCallback(async () => {
    try {
      setError(null);
      await sendMessage('saveAllTabs');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tabs');
    }
  }, [refresh]);

  const restoreTab = useCallback(
    async (tab: Tab, sessionId: string) => {
      try {
        await sendMessage('restoreTab', { tab });
        await sendMessage('removeTabFromSession', { sessionId, tabId: tab.id });
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to restore tab');
      }
    },
    [refresh]
  );

  const restoreSession = useCallback(
    async (session: Session) => {
      try {
        await sendMessage('restoreSession', { session });
        await sendMessage('deleteSession', { sessionId: session.id });
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to restore session'
        );
      }
    },
    [refresh]
  );

  const restoreAllSessions = useCallback(async () => {
    try {
      const response = await sendMessage<{
        success: boolean;
        data?: Session[];
      }>('getSessions');
      if (response.success && response.data) {
        for (const session of response.data) {
          await sendMessage('restoreSession', { session });
        }
        await sendMessage('exportSessions').then(() => {});
        for (const { id } of response.data) {
          await sendMessage('deleteSession', { sessionId: id });
        }
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore all');
    }
  }, [refresh]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await sendMessage('deleteSession', { sessionId });
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete session'
        );
      }
    },
    [refresh]
  );

  const deleteAllSessions = useCallback(async () => {
    try {
      const response = await sendMessage<{
        success: boolean;
        data?: Session[];
      }>('getSessions');
      if (response.success && response.data) {
        for (const { id } of response.data) {
          await sendMessage('deleteSession', { sessionId: id });
        }
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all');
    }
  }, [refresh]);

  const renameSession = useCallback(async (sessionId: string, name: string) => {
    try {
      await sendMessage('updateSession', { sessionId, updates: { name } });
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, name } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename');
    }
  }, []);

  const toggleStar = useCallback(async (session: Session) => {
    try {
      await sendMessage('updateSession', {
        sessionId: session.id,
        updates: { isStarred: !session.isStarred },
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, isStarred: !session.isStarred } : s
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  }, []);

  const exportSessions = useCallback(async () => {
    try {
      const response = await sendMessage<{
        success: boolean;
        data?: Session[];
      }>('exportSessions');
      if (response.success && response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `listtab-sessions-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    }
  }, []);

  const importSessions = useCallback(
    async (importedSessions: Session[]) => {
      try {
        await sendMessage('importSessions', { sessions: importedSessions });
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import');
      }
    },
    [refresh]
  );

  const deleteTab = useCallback(
    async (sessionId: string, tabId: string) => {
      try {
        await sendMessage('removeTabFromSession', { sessionId, tabId });
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete tab');
      }
    },
    [refresh]
  );

  return {
    sessions,
    loading,
    error,
    saveAllTabs,
    restoreTab,
    restoreSession,
    restoreAllSessions,
    deleteSession,
    deleteAllSessions,
    renameSession,
    toggleStar,
    exportSessions,
    importSessions,
    deleteTab,
    refresh,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/hooks/__tests__/useSessions.test.ts
```

Expected: PASS (all tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/hooks/useSessions.ts src/dashboard/hooks/__tests__/useSessions.test.ts
git commit -m "feat: add useSessions hook with full message-based API"
```

---

### Task 15: Dashboard App + Entry Point

**Files:**

- Create: `src/dashboard/__tests__/App.test.tsx`
- Create: `src/dashboard/App.tsx`
- Create: `src/dashboard/main.tsx`
- Create: `src/dashboard/index.html`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../App';

vi.mock('../hooks/useSessions', () => ({
  useSessions: vi.fn(),
}));

import { useSessions } from '../hooks/useSessions';
import type { Session } from '../../shared/types';

const makeSession = (id: string): Session => ({
  id,
  name: `Session ${id}`,
  tabs: [
    {
      id: 't1',
      title: 'Test',
      url: 'https://test.com',
      pinned: false,
      savedAt: 1,
    },
  ],
  createdAt: Date.now(),
  tabCount: 1,
  isStarred: false,
});

const createMockUseSessions = () => ({
  sessions: [] as Session[],
  loading: false,
  error: null as string | null,
  saveAllTabs: vi.fn(),
  restoreTab: vi.fn(),
  restoreSession: vi.fn(),
  restoreAllSessions: vi.fn(),
  deleteSession: vi.fn(),
  deleteAllSessions: vi.fn(),
  renameSession: vi.fn(),
  toggleStar: vi.fn(),
  exportSessions: vi.fn(),
  importSessions: vi.fn(),
  deleteTab: vi.fn(),
  refresh: vi.fn(),
});

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: true,
    });
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render empty state when no sessions', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/no tabs saved yet/i)).toBeInTheDocument();
    });
  });

  it('should render sessions when present', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSession('s1'), makeSession('s2')],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Session s1')).toBeInTheDocument();
      expect(screen.getByText('Session s2')).toBeInTheDocument();
    });
  });

  it('should render toolbar', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [makeSession('s1')],
    });
    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /save all tabs/i })
      ).toBeInTheDocument();
    });
  });

  it('should render error message when error', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      error: 'Something went wrong',
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should render search bar', async () => {
    vi.mocked(useSessions).mockReturnValue({
      ...createMockUseSessions(),
      loading: false,
      sessions: [],
    });
    render(<App />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search tabs/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/dashboard/__tests__/App.test.tsx
```

Expected: FAIL (App not found)

- [ ] **Step 3: Write implementation**

```tsx
import { useState, useMemo } from 'react';
import { useSessions } from './hooks/useSessions';
import { SearchBar } from './components/SearchBar';
import { SessionList } from './components/SessionList';
import { Toolbar } from './components/Toolbar';
import type { Session, Tab } from '../shared/types';

export function App() {
  const {
    sessions,
    loading,
    error,
    saveAllTabs,
    restoreTab,
    restoreSession,
    restoreAllSessions,
    deleteSession,
    deleteAllSessions,
    renameSession,
    toggleStar,
    exportSessions,
    importSessions,
    deleteTab,
  } = useSessions();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((session) => {
      if (session.name.toLowerCase().includes(q)) return true;
      return session.tabs.some(
        (tab) =>
          tab.title.toLowerCase().includes(q) ||
          tab.url.toLowerCase().includes(q)
      );
    });
  }, [sessions, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading sessions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              📋 ListTab
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 space-y-3">
          <Toolbar
            onSaveAll={saveAllTabs}
            onRestoreAll={restoreAllSessions}
            onDeleteAll={deleteAllSessions}
            onExport={exportSessions}
            onImport={importSessions}
            hasSessions={sessions.length > 0}
          />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <SessionList
          sessions={filteredSessions}
          onRestoreTab={restoreTab}
          onDeleteTab={deleteTab}
          onRestoreAll={restoreSession}
          onDeleteSession={deleteSession}
          onRename={renameSession}
          onToggleStar={toggleStar}
          onSaveAll={saveAllTabs}
        />
      </main>
    </div>
  );
}
```

**Write `src/dashboard/main.tsx`:**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
```

**Write `src/dashboard/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ListTab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/dashboard/__tests__/App.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/App.tsx src/dashboard/main.tsx src/dashboard/index.html src/dashboard/__tests__/App.test.tsx
git commit -m "feat: add dashboard App, entry point, and HTML shell"
```

---

### Task 16: Tailwind CSS Entry

**Files:**

- Create: `src/dashboard/index.css`

- [ ] **Step 1: Write the CSS file**

```css
@import 'tailwindcss';
```

Alternatively for Tailwind v4 via Vite plugin, this is all we need. No separate config file required unless customizing the theme.

- [ ] **Step 2: Commit**

```bash
git add src/dashboard/index.css
git commit -m "feat: add tailwindcss entry point"
```

---

### Task 17: Popup

**Files:**

- Create: `src/popup/__tests__/PopupApp.test.tsx`
- Create: `src/popup/PopupApp.tsx`
- Create: `src/popup/main.tsx`
- Create: `src/popup/index.html`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PopupApp } from '../PopupApp';

const mockSendMessage = vi.fn().mockResolvedValue({ success: true, data: [] });
(globalThis as Record<string, unknown>).chrome = {
  runtime: {
    sendMessage: mockSendMessage,
    getURL: vi.fn((path: string) => `chrome-extension://id/${path}`),
  },
  tabs: {
    create: vi.fn(),
  },
};

describe('PopupApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Save All Tabs button', () => {
    mockSendMessage.mockResolvedValueOnce({ success: true, data: [] });
    render(<PopupApp />);
    expect(
      screen.getByRole('button', { name: /save all tabs/i })
    ).toBeInTheDocument();
  });

  it('should render Open Dashboard button', () => {
    mockSendMessage.mockResolvedValueOnce({ success: true, data: [] });
    render(<PopupApp />);
    expect(screen.getByText(/open full dashboard/i)).toBeInTheDocument();
  });

  it('should open dashboard when clicked', () => {
    mockSendMessage.mockResolvedValueOnce({ success: true, data: [] });
    render(<PopupApp />);
    fireEvent.click(screen.getByText(/open full dashboard/i));
    expect(
      (globalThis as Record<string, unknown>).chrome.tabs.create
    ).toHaveBeenCalled();
  });

  it('should show recent sessions count', async () => {
    const sessions = [
      {
        id: 's1',
        name: 'Session 1',
        tabs: [],
        createdAt: 1,
        tabCount: 0,
        isStarred: false,
      },
      {
        id: 's2',
        name: 'Session 2',
        tabs: [],
        createdAt: 2,
        tabCount: 0,
        isStarred: false,
      },
    ];
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });
    render(<PopupApp />);
    await waitFor(() => {
      expect(screen.getByText(/2 session/)).toBeInTheDocument();
    });
  });

  it('should show total tabs count', async () => {
    const sessions = [
      {
        id: 's1',
        name: 'S1',
        tabs: [
          {
            id: 't1',
            title: 'A',
            url: 'https://a.com',
            pinned: false,
            savedAt: 1,
          },
        ],
        createdAt: 1,
        tabCount: 1,
        isStarred: false,
      },
      {
        id: 's2',
        name: 'S2',
        tabs: [
          {
            id: 't2',
            title: 'B',
            url: 'https://b.com',
            pinned: false,
            savedAt: 2,
          },
          {
            id: 't3',
            title: 'C',
            url: 'https://c.com',
            pinned: false,
            savedAt: 3,
          },
        ],
        createdAt: 2,
        tabCount: 2,
        isStarred: false,
      },
    ];
    mockSendMessage.mockResolvedValueOnce({ success: true, data: sessions });
    render(<PopupApp />);
    await waitFor(() => {
      expect(screen.getByText('3 tabs saved')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/popup/__tests__/PopupApp.test.tsx
```

Expected: FAIL (PopupApp not found)

- [ ] **Step 3: Write implementation**

```tsx
import { useState, useEffect } from 'react';
import type { Session } from '../shared/types';

export function PopupApp() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [saving, setSaving] = useState(false);

  const totalTabs = sessions.reduce((sum, s) => sum + s.tabCount, 0);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getSessions' }, (response) => {
      if (response?.success && response.data) {
        setSessions(response.data);
      }
    });
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    chrome.runtime.sendMessage({ type: 'saveAllTabs' }, () => {
      setSaving(false);
      window.close();
    });
  };

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 p-4 font-sans">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">📋</span>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          ListTab
        </h1>
      </div>

      <button
        onClick={handleSaveAll}
        disabled={saving}
        className="mb-3 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save All Tabs'}
      </button>

      <div className="mb-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {sessions.length}
          </span>{' '}
          session{sessions.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {totalTabs}
          </span>{' '}
          tabs saved
        </p>
      </div>

      {sessions.slice(0, 3).map((session) => (
        <div
          key={session.id}
          className="mb-2 rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
        >
          <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {session.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {session.tabCount} tab{session.tabCount !== 1 ? 's' : ''}
          </p>
        </div>
      ))}

      <button
        onClick={handleOpenDashboard}
        className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Open Full Dashboard →
      </button>
    </div>
  );
}
```

**Write `src/popup/main.tsx`:**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PopupApp } from './PopupApp';
import '../dashboard/index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <PopupApp />
    </StrictMode>
  );
}
```

**Write `src/popup/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ListTab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/popup/__tests__/PopupApp.test.tsx
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/popup/PopupApp.tsx src/popup/main.tsx src/popup/index.html src/popup/__tests__/PopupApp.test.tsx
git commit -m "feat: add popup with save all, stats, recent sessions, and dashboard link"
```

---

### Task 18: Vite Configuration for CRXJS

**Files:**

- Modify: `vite.config.ts`

- [ ] **Step 1: Update vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
```

Note: the `manifest.json` needs to exist at the root or be generated. We'll use a manifest.json as source for @crxjs.

- [ ] **Step 2: Commit**

```bash
git add vite.config.ts
git commit -m "feat: configure Vite with CRXJS, React, and Tailwind plugins"
```

---

### Task 19: Manifest and Icons

**Files:**

- Create: `manifest.json` (root)
- Create placeholder icons in `public/icons/`

- [ ] **Step 1: Create manifest.json**

```json
{
  "manifest_version": 3,
  "name": "ListTab",
  "version": "1.0.0",
  "description": "Save all open tabs into a list. Restore them individually or all at once.",
  "permissions": ["tabs", "storage"],
  "action": {
    "default_title": "ListTab",
    "default_popup": "src/popup/index.html"
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "icons": {
    "16": "public/icons/icon16.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  }
}
```

- [ ] **Step 2: Create placeholder icons**

Since we can't generate actual PNGs inline, create simple SVG-to-PNG via a small script or just use colored placeholder PNGs. The simplest approach: create a minimal 1x1 PNG placeholder:

```bash
# Create minimal PNG placeholders (1x1 pixel will work for dev)
python3 -c "
import struct, zlib
def create_png(width, height, r, g, b, a=255):
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    raw = b''
    for y in range(height):
        raw += b'\x00' + bytes([r, g, b, a]) * width
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')
for size, name in [(16, 'icon16'), (48, 'icon48'), (128, 'icon128')]:
    with open(f'public/icons/{name}.png', 'wb') as f:
        f.write(create_png(size, size, 79, 70, 229))
"
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Extension built to `dist/` with manifest, background SW, dashboard, popup, and icons.

- [ ] **Step 4: Commit**

```bash
git add manifest.json public/icons/
git commit -m "feat: add manifest.json and extension icons"
```

---

### Task 20: Final Integration Verification

**Files:**

- None new — verification only

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: ALL tests pass

- [ ] **Step 2: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: `dist/` directory created with all extension files, no errors

- [ ] **Step 4: Commit if any fixes**

```bash
git add -A && git diff --cached --exit-code || git commit -m "chore: final fixes after integration verification"
```

---

## Summary

**20 tasks** covering the full Chrome extension:

| Task | Component                | TDD?  |
| ---- | ------------------------ | ----- |
| 1    | Project scaffold         | Setup |
| 2    | Shared types             | Yes   |
| 3    | Shared constants         | Yes   |
| 4    | Storage helpers          | Yes   |
| 5    | SessionStore             | Yes   |
| 6    | TabManager               | Yes   |
| 7    | Background SW entry      | Yes   |
| 8    | EmptyState               | Yes   |
| 9    | TabItem                  | Yes   |
| 10   | SessionCard              | Yes   |
| 11   | SearchBar                | Yes   |
| 12   | SessionList              | Yes   |
| 13   | Toolbar                  | Yes   |
| 14   | useSessions hook         | Yes   |
| 15   | App + entry point        | Yes   |
| 16   | Tailwind CSS             | Setup |
| 17   | Popup                    | Yes   |
| 18   | Vite + CRXJS config      | Setup |
| 19   | Manifest + icons         | Setup |
| 20   | Integration verification | QA    |
