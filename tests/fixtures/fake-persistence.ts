import type { Session } from '@domain/models/session';
import type { PersistencePort, SessionSummary } from '@application/ports/persistence-port';

export function createFakePersistence(): PersistencePort & { sessions: Map<string, Session> } {
  const sessions = new Map<string, Session>();

  return {
    sessions,

    async saveSession(session: Session): Promise<void> {
      sessions.set(session.id, session);
    },

    async loadSession(id: string): Promise<Session | null> {
      return sessions.get(id) ?? null;
    },

    async deleteSession(id: string): Promise<void> {
      sessions.delete(id);
    },

    async listSessions(): Promise<SessionSummary[]> {
      return Array.from(sessions.values()).map((s) => ({
        id: s.id,
        name: s.name,
        updatedAt: s.updatedAt,
      }));
    },
  };
}
