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
  chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
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
        const { tab } = message.payload as { tab: import('../shared/types').Tab };
        tabManager.restoreTab(tab);
        return { success: true };
      }

      case 'restoreSession': {
        const { session } = message.payload as { session: import('../shared/types').Session };
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
          updates: Partial<Pick<import('../shared/types').Session, 'name' | 'isStarred'>>;
        };
        await sessionStore.updateSession(sessionId, updates);
        return { success: true };
      }

      case 'exportSessions': {
        const sessions = await sessionStore.getAllSessions();
        return { success: true, data: sessions };
      }

      case 'importSessions': {
        const { sessions } = message.payload as { sessions: import('../shared/types').Session[] };
        for (const session of sessions) {
          await sessionStore.saveSession(session);
        }
        return { success: true };
      }

      case 'removeTabFromSession': {
        const { sessionId, tabId } = message.payload as { sessionId: string; tabId: string };
        await sessionStore.removeTabFromSession(sessionId, tabId);
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown message type: ${(message as { type: string }).type}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
