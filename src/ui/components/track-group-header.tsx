type TrackGroupHeaderProps = {
  name: string;
  trackCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function TrackGroupHeader({ name, trackCount, collapsed, onToggleCollapse }: TrackGroupHeaderProps) {
  return (
    <button
      onClick={onToggleCollapse}
      className="w-full flex items-center gap-2 px-4 py-1.5 bg-[var(--color-base-900)]/50 border-b border-[var(--color-base-800)] hover:bg-[var(--color-base-850)] transition-colors"
    >
      <span className="text-[10px] text-[var(--color-base-500)]">
        {collapsed ? '▸' : '▾'}
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-base-400)] font-medium">
        {name}
      </span>
      <span className="text-[10px] text-[var(--color-base-600)]">
        {trackCount}
      </span>
    </button>
  );
}
