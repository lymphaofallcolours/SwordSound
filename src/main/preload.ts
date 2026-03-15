import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('swordsound', {
  platform: process.platform,
});
