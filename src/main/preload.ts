import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from './ipc-channels';
import type { PreloadApi } from './preload-api';

const api: PreloadApi = {
  platform: process.platform,
  sessions: {
    save: (session) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_SESSION, session),
    load: (id) => ipcRenderer.invoke(IPC_CHANNELS.LOAD_SESSION, id),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_SESSION, id),
    list: () => ipcRenderer.invoke(IPC_CHANNELS.LIST_SESSIONS),
  },
  dialog: {
    showSave: (defaultName) => ipcRenderer.invoke(IPC_CHANNELS.SHOW_SAVE_DIALOG, defaultName),
    showOpen: () => ipcRenderer.invoke(IPC_CHANNELS.SHOW_OPEN_DIALOG),
  },
};

contextBridge.exposeInMainWorld('swordsound', api);
