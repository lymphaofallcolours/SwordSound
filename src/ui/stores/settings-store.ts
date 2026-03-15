import { createStore } from 'zustand/vanilla';

export type UiScale = 'compact' | 'default' | 'large';

export type SettingsState = {
  uiScale: UiScale;
  fadeDurationMs: number;
  crossfadeDurationMs: number;
  showSettings: boolean;

  setUiScale: (scale: UiScale) => void;
  setFadeDuration: (ms: number) => void;
  setCrossfadeDuration: (ms: number) => void;
  toggleSettings: () => void;
};

const STORAGE_KEY = 'swordsound-settings';

function loadSettings(): Partial<SettingsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveSettings(state: Partial<SettingsState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      uiScale: state.uiScale,
      fadeDurationMs: state.fadeDurationMs,
      crossfadeDurationMs: state.crossfadeDurationMs,
    }));
  } catch { /* ignore */ }
}

export function createSettingsStore() {
  const saved = loadSettings();

  return createStore<SettingsState>((set) => ({
    uiScale: (saved.uiScale as UiScale) ?? 'default',
    fadeDurationMs: saved.fadeDurationMs ?? 3000,
    crossfadeDurationMs: saved.crossfadeDurationMs ?? 2000,
    showSettings: false,

    setUiScale: (scale) => {
      set({ uiScale: scale });
      saveSettings({ ...loadSettings(), uiScale: scale });
    },
    setFadeDuration: (ms) => {
      set({ fadeDurationMs: ms });
      saveSettings({ ...loadSettings(), fadeDurationMs: ms });
    },
    setCrossfadeDuration: (ms) => {
      set({ crossfadeDurationMs: ms });
      saveSettings({ ...loadSettings(), crossfadeDurationMs: ms });
    },
    toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
  }));
}
