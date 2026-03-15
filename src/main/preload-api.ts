import type { Session } from '@domain/models/session';
import type { SessionSummary } from '@application/ports/persistence-port';

export type PreloadApi = {
  platform: string;
  sessions: {
    save(session: Session): Promise<void>;
    load(id: string): Promise<Session | null>;
    delete(id: string): Promise<void>;
    list(): Promise<SessionSummary[]>;
  };
  dialog: {
    showSave(defaultName: string): Promise<string | null>;
    showOpen(): Promise<string | null>;
  };
};

declare global {
  interface Window {
    swordsound: PreloadApi;
  }
}
