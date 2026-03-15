export function PanicButton({ onPanic }: { onPanic: () => void }) {
  return (
    <button
      onClick={onPanic}
      className="
        relative group px-4 py-2
        bg-[var(--color-panic)] hover:bg-red-500
        text-white font-[var(--font-display)] font-bold text-xs uppercase tracking-widest
        border border-red-400/30
        transition-all duration-100
        hover:glow-panic active:scale-95
        rounded-sm
      "
      title="Stop all audio immediately (Escape)"
    >
      <span className="relative z-10">PANIC</span>
      <div className="absolute inset-0 bg-red-400/0 group-hover:bg-red-400/10 transition-colors rounded-sm" />
    </button>
  );
}
