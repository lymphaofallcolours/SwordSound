import { useEffect, useRef, type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="bg-[var(--color-base-900)] border border-[var(--color-base-700)] rounded-sm shadow-2xl w-full max-w-md mx-4">
        <div className="px-5 py-3 border-b border-[var(--color-base-700)] flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-sm font-semibold text-[var(--color-base-100)] tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--color-base-500)] hover:text-[var(--color-base-100)] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
