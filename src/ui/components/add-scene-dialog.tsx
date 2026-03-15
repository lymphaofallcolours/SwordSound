import { useState } from 'react';

import { Modal } from './modal';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6b7280',
];

type AddSceneDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, emoji: string, color: string) => void;
};

export function AddSceneDialog({ open, onClose, onConfirm }: AddSceneDialogProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), emoji, color);
      setName('');
      setEmoji('');
      setColor(PRESET_COLORS[0]);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Scene">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--color-base-400)] font-[var(--font-display)] uppercase tracking-wider mb-2">
            Scene Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., The Weary Traveler"
            autoFocus
            className="
              w-full px-3 py-2 bg-[var(--color-base-850)] border border-[var(--color-base-700)]
              rounded-sm text-sm text-[var(--color-base-100)] placeholder-[var(--color-base-500)]
              focus:outline-none focus:border-[var(--color-accent)] transition-colors
            "
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-base-400)] font-[var(--font-display)] uppercase tracking-wider mb-2">
            Emoji (optional)
          </label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🏰"
            maxLength={2}
            className="
              w-16 px-3 py-2 bg-[var(--color-base-850)] border border-[var(--color-base-700)]
              rounded-sm text-sm text-center text-[var(--color-base-100)] placeholder-[var(--color-base-500)]
              focus:outline-none focus:border-[var(--color-accent)] transition-colors
            "
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--color-base-400)] font-[var(--font-display)] uppercase tracking-wider mb-2">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-sm transition-all ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--color-base-900)] scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="
              px-4 py-2 text-xs font-[var(--font-display)] uppercase tracking-wider
              bg-[var(--color-accent)] text-white rounded-sm
              hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            Create Scene
          </button>
        </div>
      </form>
    </Modal>
  );
}
