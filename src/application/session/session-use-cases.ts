import type { Session } from '@domain/models/session';
import { createSession as createDomainSession } from '@domain/models/session';
import type { PersistencePort, SessionSummary } from '@application/ports/persistence-port';

export async function createNewSession(
  persistence: PersistencePort,
  name: string,
): Promise<Session> {
  const session = createDomainSession({ name });
  await persistence.saveSession(session);
  return session;
}

export async function saveSession(
  persistence: PersistencePort,
  session: Session,
): Promise<void> {
  await persistence.saveSession(session);
}

export async function loadSession(
  persistence: PersistencePort,
  id: string,
): Promise<Session | null> {
  return persistence.loadSession(id);
}

export async function deleteSession(
  persistence: PersistencePort,
  id: string,
): Promise<void> {
  await persistence.deleteSession(id);
}

export async function listSessions(
  persistence: PersistencePort,
): Promise<SessionSummary[]> {
  return persistence.listSessions();
}

export function exportSession(session: Session): string {
  return JSON.stringify(session, null, 2);
}

export function importSession(json: string): Session {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error('Invalid session data');
  }

  if (
    !data ||
    typeof data !== 'object' ||
    !('id' in data) ||
    !('name' in data) ||
    !('scenes' in data)
  ) {
    throw new Error('Invalid session data');
  }

  return data as Session;
}
