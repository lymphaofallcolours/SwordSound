import type { TrackPlaybackInfo } from '@ui/stores/playback-store';

type AttributionPanelProps = {
  open: boolean;
  onToggle: () => void;
  activeTrackIds: string[];
  playbackInfo: Record<string, TrackPlaybackInfo>;
};

export function AttributionPanel({ open, onToggle, activeTrackIds, playbackInfo }: AttributionPanelProps) {
  const playingTracks = activeTrackIds
    .filter((id) => playbackInfo[id]?.state === 'playing' || playbackInfo[id]?.state === 'paused')
    .map((id) => playbackInfo[id]);

  return (
    <div className="border-t border-[var(--color-base-700)]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-1.5 text-[10px] text-[var(--color-base-500)] hover:text-[var(--color-base-300)] transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <span>♫</span>
          <span>SoundCloud Attribution</span>
          {playingTracks.length > 0 && (
            <span className="text-[var(--color-base-600)]">
              ({playingTracks.length} active)
            </span>
          )}
        </span>
        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="px-4 pb-2 space-y-1 max-h-32 overflow-y-auto">
          {playingTracks.length === 0 ? (
            <p className="text-[10px] text-[var(--color-base-600)] italic">No tracks currently active</p>
          ) : (
            playingTracks.map((info) => {
              if (!info?.metadata) return null;
              return (
                <div key={info.metadata.permalinkUrl} className="flex items-center gap-2 text-[10px]">
                  <span className="text-[var(--color-playing)]">●</span>
                  <span className="text-[var(--color-base-300)] truncate">
                    {info.metadata.title}
                  </span>
                  <span className="text-[var(--color-base-600)]">by</span>
                  <span className="text-[var(--color-base-400)] truncate">
                    {info.metadata.artist}
                  </span>
                  <a
                    href={info.metadata.permalinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent)] hover:underline ml-auto flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      // Open in default browser
                      window.open(info.metadata!.permalinkUrl, '_blank');
                    }}
                  >
                    SC ↗
                  </a>
                </div>
              );
            })
          )}
          <p className="text-[9px] text-[var(--color-base-600)] mt-1">
            Audio streamed via SoundCloud. All rights belong to the respective artists.
          </p>
        </div>
      )}
    </div>
  );
}
