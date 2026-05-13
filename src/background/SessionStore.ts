import type { Session } from '../shared/types';
import { readSessions, writeSessions } from '../shared/storage';

export class SessionStore {
  async getAllSessions(): Promise<Session[]> {
    const sessions = await readSessions();
    return [...sessions].sort((a, b) => {
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
