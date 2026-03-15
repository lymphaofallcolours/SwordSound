import { useState } from 'react';

import { Modal } from './modal';

type CreateSessionDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
};

export function CreateSessionDialog({ open, onClose, onConfirm }: CreateSessionDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Session">
      <form onSubmit={handleSubmit}>
        <label className="block text-xs text-[var(--color-base-400)] font-[var(--font-display)] uppercase tracking-wider mb-2">
          Session Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Curse of Strahd"
          autoFocus
          className="
            w-full px-3 py-2 bg-[var(--color-base-850)] border border-[var(--color-base-700)]
            rounded-sm text-sm text-[var(--color-base-100)] placeholder-[var(--color-base-500)]
            focus:outline-none focus:border-[var(--color-accent)]
            transition-colors
          "
        />
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
            disabled={!name.trim()}
            className="
              px-4 py-2 text-xs font-[var(--font-display)] uppercase tracking-wider
              bg-[var(--color-accent)] text-white rounded-sm
              hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all
            "
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
