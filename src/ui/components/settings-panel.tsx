import type { UiScale } from '@ui/stores/settings-store';

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  uiScale: UiScale;
  fadeDurationMs: number;
  crossfadeDurationMs: number;
  onScaleChange: (scale: UiScale) => void;
  onFadeDurationChange: (ms: number) => void;
  onCrossfadeDurationChange: (ms: number) => void;
};

const SCALE_OPTIONS: { value: UiScale; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'Smaller icons and tighter spacing' },
  { value: 'default', label: 'Default', description: 'Balanced size for most screens' },
  { value: 'large', label: 'Large', description: 'Bigger icons and controls' },
];

export function SettingsPanel({
  open,
  onClose,
  uiScale,
  fadeDurationMs,
  crossfadeDurationMs,
  onScaleChange,
  onFadeDurationChange,
  onCrossfadeDurationChange,
}: SettingsPanelProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--color-base-900)] border border-[var(--color-base-700)] rounded-sm shadow-2xl w-full max-w-md mx-4">
        <div className="px-5 py-3 border-b border-[var(--color-base-700)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-base-100)]">Settings</h3>
          <button onClick={onClose} className="text-[var(--color-base-500)] hover:text-[var(--color-base-100)] text-lg">×</button>
        </div>

        <div className="p-5 space-y-6">
          {/* UI Scale */}
          <div>
            <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-3">
              Interface Size
            </label>
            <div className="flex gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onScaleChange(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-sm border text-xs transition-all ${
                    uiScale === opt.value
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-base-100)]'
                      : 'border-[var(--color-base-700)] text-[var(--color-base-400)] hover:border-[var(--color-base-600)] hover:text-[var(--color-base-200)]'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fade Duration */}
          <div>
            <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-2">
              Fade Duration: {(fadeDurationMs / 1000).toFixed(1)}s
            </label>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={fadeDurationMs}
              onChange={(e) => onFadeDurationChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-base-500)] mt-1">
              <span>0.5s</span>
              <span>10s</span>
            </div>
          </div>

          {/* Crossfade Duration */}
          <div>
            <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-2">
              Scene Crossfade: {(crossfadeDurationMs / 1000).toFixed(1)}s
            </label>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={crossfadeDurationMs}
              onChange={(e) => onCrossfadeDurationChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-base-500)] mt-1">
              <span>0.5s</span>
              <span>10s</span>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-2">
              Keyboard Shortcuts
            </label>
            <div className="space-y-1.5 text-xs">
              <ShortcutRow keys="Space" action="Toggle scene play/pause" />
              <ShortcutRow keys="Escape" action="Panic — stop all audio" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-base-300)]">{action}</span>
      <kbd className="px-2 py-0.5 bg-[var(--color-base-800)] border border-[var(--color-base-600)] rounded text-[10px] text-[var(--color-base-400)]">
        {keys}
      </kbd>
    </div>
  );
}
