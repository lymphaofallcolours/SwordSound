import type { Session } from '@domain/models/session';
import type { PersistencePort, SessionSummary } from '@application/ports/persistence-port';

export function createIpcPersistence(): PersistencePort {
  const api = window.swordsound.sessions;

  return {
    saveSession: (session: Session): Promise<void> => api.save(session),
    loadSession: (id: string): Promise<Session | null> => api.load(id),
    deleteSession: (id: string): Promise<void> => api.delete(id),
    listSessions: (): Promise<SessionSummary[]> => api.list(),
  };
}
