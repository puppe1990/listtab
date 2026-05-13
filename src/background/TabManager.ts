import type { Tab, Session } from '../shared/types';
import { generateId, formatSessionName, FAVICON_BASE_URL } from '../shared/constants';
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
    chrome.tabs.create({ url: tab.url, active: false }, () => {});
  }

  restoreSession(session: Session): void {
    for (const tab of session.tabs) {
      chrome.tabs.create({ url: tab.url, active: false }, () => {});
    }
  }
}
