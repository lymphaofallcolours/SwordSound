import { ipcMain, dialog, type BrowserWindow } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';

import { IPC_CHANNELS } from './ipc-channels';
import type { Session } from '@domain/models/session';
import type { SessionSummary } from '@application/ports/persistence-port';

function getSessionsDir(): string {
  return path.join(app.getPath('userData'), 'sessions');
}

function sessionFilePath(id: string): string {
  return path.join(getSessionsDir(), `${id}.json`);
}

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC_CHANNELS.SAVE_SESSION, async (_event, session: Session) => {
    const dir = getSessionsDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(sessionFilePath(session.id), JSON.stringify(session, null, 2), 'utf-8');
  });

  ipcMain.handle(IPC_CHANNELS.LOAD_SESSION, async (_event, id: string) => {
    try {
      const data = await fs.readFile(sessionFilePath(id), 'utf-8');
      return JSON.parse(data) as Session;
    } catch {
      return null;
    }
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_SESSION, async (_event, id: string) => {
    try {
      await fs.unlink(sessionFilePath(id));
    } catch {
      // File may not exist, that's fine
    }
  });

  ipcMain.handle(IPC_CHANNELS.LIST_SESSIONS, async () => {
    const dir = getSessionsDir();
    try {
      const files = await fs.readdir(dir);
      const summaries: SessionSummary[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const data = await fs.readFile(path.join(dir, file), 'utf-8');
          const session = JSON.parse(data) as Session;
          summaries.push({
            id: session.id,
            name: session.name,
            updatedAt: session.updatedAt,
          });
        } catch {
          // Skip corrupted files
        }
      }

      return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHOW_SAVE_DIALOG, async (_event, defaultName: string) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Session',
      defaultPath: `${defaultName}.swordsound.json`,
      filters: [{ name: 'SwordSound Session', extensions: ['swordsound.json'] }],
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle(IPC_CHANNELS.SHOW_OPEN_DIALOG, async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Session',
      filters: [{ name: 'SwordSound Session', extensions: ['swordsound.json', 'json'] }],
      properties: ['openFile'],
    });
    return result.canceled ? null : result.filePaths[0];
  });
}
