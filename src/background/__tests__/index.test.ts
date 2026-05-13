import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ExtensionMessage } from '../../shared/types';

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
  vi.resetModules();
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
    messageHandler!({ type: 'saveAllTabs' }, {}, sendResponse);
    await flushPromises();

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should handle getSessions message', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    messageHandler!({ type: 'getSessions' }, {}, sendResponse);
    await flushPromises();

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: [] })
    );
  });

  it('should handle deleteSession message', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    messageHandler!(
      { type: 'deleteSession', payload: { sessionId: 's1' } },
      {},
      sendResponse
    );
    await flushPromises();

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('should return error for unknown message type', async () => {
    await import('../index');
    expect(messageHandler).not.toBeNull();

    const sendResponse = vi.fn();
    messageHandler!(
      { type: 'unknown' as unknown as ExtensionMessage['type'] },
      {},
      sendResponse
    );
    await flushPromises();

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
