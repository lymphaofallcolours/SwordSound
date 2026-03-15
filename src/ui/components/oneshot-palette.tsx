import type { Track } from '@domain/models/track';
import type { TrackPlaybackInfo } from '@ui/stores/playback-store';

type OneShotPaletteProps = {
  tracks: readonly Track[];
  playbackInfo: Record<string, TrackPlaybackInfo>;
  onTrigger: (trackId: string, soundcloudUrl: string) => void;
  onAdd: () => void;
  onRemove: (trackId: string) => void;
};

export function OneShotPalette({ tracks, playbackInfo, onTrigger, onAdd, onRemove }: OneShotPaletteProps) {
  if (tracks.length === 0) {
    return (
      <div className="px-3 py-2 border-t border-[var(--color-base-700)]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-base-500)] font-medium">
            One-Shots
          </span>
          <button
            onClick={onAdd}
            className="text-[var(--color-base-500)] hover:text-[var(--color-base-200)] text-sm transition-colors"
            title="Add one-shot sound"
          >
            +
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-base-600)]">No one-shots yet</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-t border-[var(--color-base-700)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-base-500)] font-medium">
          One-Shots
        </span>
        <button
          onClick={onAdd}
          className="text-[var(--color-base-500)] hover:text-[var(--color-base-200)] text-sm transition-colors"
          title="Add one-shot sound"
        >
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {tracks.map((track) => {
          const info = playbackInfo[track.id];
          const isPlaying = info?.state === 'playing';
          const isLoading = info?.state === 'loading';
          const displayName = info?.metadata?.title ?? track.title;

          return (
            <button
              key={track.id}
              onClick={() => onTrigger(track.id, track.soundcloudUrl)}
              onContextMenu={(e) => { e.preventDefault(); onRemove(track.id); }}
              disabled={isLoading}
              className={`
                px-2 py-1 rounded-sm text-[11px] transition-all
                border
                ${isPlaying
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-[var(--color-base-800)] border-[var(--color-base-700)] text-[var(--color-base-300)] hover:bg-[var(--color-base-700)] hover:text-[var(--color-base-100)]'
                }
                ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
              title={`${displayName} (right-click to remove)`}
            >
              {displayName.length > 15 ? displayName.slice(0, 15) + '…' : displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
