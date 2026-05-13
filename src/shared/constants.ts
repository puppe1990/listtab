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
