import type { Session, Settings } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY } from './constants';

function chromeStorageGet(keys: string | string[] | null): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const normalized = typeof keys === 'string' ? [keys] : keys;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chrome.storage.local.get(normalized as any, resolve);
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
  return Array.isArray(sessions) ? sessions as Session[] : [];
}

export async function writeSessions(sessions: Session[]): Promise<void> {
  await chromeStorageSet({ [STORAGE_KEY]: sessions });
}

const SETTINGS_KEY = 'listtab_settings';

export async function readSettings(): Promise<Settings> {
  const result = await chromeStorageGet(SETTINGS_KEY);
  const stored = result[SETTINGS_KEY];
  if (stored && typeof stored === 'object') {
    return { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings>) };
  }
  return { ...DEFAULT_SETTINGS };
}

export async function writeSettings(settings: Settings): Promise<void> {
  await chromeStorageSet({ [SETTINGS_KEY]: settings });
}
