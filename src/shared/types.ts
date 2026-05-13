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
  | 'updateSettings'
  | 'removeTabFromSession';

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
