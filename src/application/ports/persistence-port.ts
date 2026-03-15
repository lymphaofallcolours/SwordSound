import type { Session } from '@domain/models/session';

export type SessionSummary = {
  readonly id: string;
  readonly name: string;
  readonly updatedAt: string;
};

export type PersistencePort = {
  saveSession(session: Session): Promise<void>;
  loadSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
  listSessions(): Promise<SessionSummary[]>;
};
