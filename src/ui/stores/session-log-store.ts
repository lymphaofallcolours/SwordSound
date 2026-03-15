import { createStore } from 'zustand/vanilla';

export type LogEntry = {
  timestamp: string;
  event: string;
  details: string;
};

export type SessionLogState = {
  entries: LogEntry[];
  addEntry: (event: string, details: string) => void;
  clear: () => void;
  exportLog: () => string;
};

export function createSessionLogStore() {
  return createStore<SessionLogState>((set, get) => ({
    entries: [],

    addEntry: (event, details) => {
      set((prev) => ({
        entries: [
          ...prev.entries,
          {
            timestamp: new Date().toLocaleTimeString(),
            event,
            details,
          },
        ],
      }));
    },

    clear: () => set({ entries: [] }),

    exportLog: () => {
      const { entries } = get();
      return entries
        .map((e) => `[${e.timestamp}] ${e.event}: ${e.details}`)
        .join('\n');
    },
  }));
}
