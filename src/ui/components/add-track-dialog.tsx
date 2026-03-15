import { useState } from 'react';

import { Modal } from './modal';

type AddTrackDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
};

export function AddTrackDialog({ open, onClose, onConfirm }: AddTrackDialogProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onConfirm(url.trim());
      setUrl('');
      onClose();
    }
  };

  const isValidUrl = url.trim().includes('soundcloud.com/');

  return (
    <Modal open={open} onClose={onClose} title="Add Track">
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-[var(--color-base-400)] font-[var(--font-display)] uppercase tracking-wider mb-2">
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

        <div className="flex justify-end gap-2 mt-4">
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
              px-4 py-2 text-xs font-[var(--font-display)] uppercase tracking-wider
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
