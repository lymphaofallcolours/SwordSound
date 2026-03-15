import { useState } from 'react';

import { Modal } from './modal';

export type AddTrackOptions = {
  url: string;
  alias: string;
  groupId: string;
  loopEnabled: boolean;
  autoPlay: boolean;
  fadeInOnPlay: boolean;
};

type AddTrackDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: AddTrackOptions) => void;
};

export function AddTrackDialog({ open, onClose, onConfirm }: AddTrackDialogProps) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [groupId, setGroupId] = useState('');
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fadeInOnPlay, setFadeInOnPlay] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm({ url: url.trim(), alias, groupId, loopEnabled, autoPlay, fadeInOnPlay });
      setUrl('');
      setAlias('');
      setGroupId('');
      setLoopEnabled(false);
      setAutoPlay(false);
      setFadeInOnPlay(false);
      onClose();
    }
  };

  const isValidUrl = url.trim().includes('soundcloud.com/');

  return (
    <Modal open={open} onClose={onClose} title="Add Track">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* URL */}
        <div>
          <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-1">
            SoundCloud URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://soundcloud.com/artist/track-name"
            autoFocus
            className="
              w-full px-3 py-2 bg-[var(--color-base-850)] border border-[var(--color-base-700)]
              rounded-sm text-sm text-[var(--color-base-100)] placeholder-[var(--color-base-500)]
              focus:outline-none focus:border-[var(--color-accent)] transition-colors font-mono
            "
          />
          {url.trim() && !isValidUrl && (
            <p className="mt-1 text-xs text-red-400">Please enter a valid SoundCloud URL</p>
          )}
        </div>

        {/* Label + Group row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-1">
              GM Label
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g., Tavern music"
              className="w-full px-2 py-1.5 bg-[var(--color-base-850)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] placeholder-[var(--color-base-500)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-1">
              Group
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="px-2 py-1.5 bg-[var(--color-base-850)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">None</option>
              <option value="music">Music</option>
              <option value="ambience">Ambience</option>
              <option value="effects">Effects</option>
            </select>
          </div>
        </div>

        {/* Quick toggles */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-base-300)] cursor-pointer">
            <input type="checkbox" checked={loopEnabled} onChange={(e) => setLoopEnabled(e.target.checked)}
              className="accent-[var(--color-accent)]" />
            Loop
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-base-300)] cursor-pointer">
            <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)}
              className="accent-[var(--color-accent)]" />
            Auto-play
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--color-base-300)] cursor-pointer">
            <input type="checkbox" checked={fadeInOnPlay} onChange={(e) => setFadeInOnPlay(e.target.checked)}
              className="accent-[var(--color-accent)]" />
            Fade in
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValidUrl}
            className="
              px-4 py-2 text-xs uppercase tracking-wider
              bg-[var(--color-accent)] text-white rounded-sm
              hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            Add Track
          </button>
        </div>
      </form>
    </Modal>
  );
}
