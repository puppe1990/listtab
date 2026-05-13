import { describe, it, expect } from 'vitest';
import type { Tab, Session, Settings, MessageType } from '../types';

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
