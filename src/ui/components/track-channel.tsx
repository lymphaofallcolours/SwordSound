import type { Track } from '@domain/models/track';

type TrackChannelProps = {
  track: Track;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onLoopToggle: () => void;
  onRemove: () => void;
};

export function TrackChannel({
  track,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onMuteToggle,
  onLoopToggle,
  onRemove,
}: TrackChannelProps) {
  const isPlaying = false; // Will be driven by playback store later

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-base-850)] transition-colors border-b border-[var(--color-base-800)]/50">
      {/* Status indicator */}
      <div
        className={`w-1.5 h-8 rounded-full flex-shrink-0 ${isPlaying ? 'animate-pulse-glow' : ''}`}
        style={{
          backgroundColor: isPlaying
            ? 'var(--color-playing)'
            : track.muted
              ? 'var(--color-base-600)'
              : 'var(--color-stopped)',
        }}
      />

      {/* Transport controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <SmallButton onClick={onPlay} title="Play" icon="▶" />
        <SmallButton onClick={onPause} title="Pause" icon="⏸" />
        <SmallButton onClick={onStop} title="Stop" icon="◼" />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-base-100)] truncate">
            {track.title}
          </span>
          {track.isOneShot && (
            <span className="px-1.5 py-0.5 text-[9px] font-[var(--font-display)] uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded-sm">
              1-shot
            </span>
          )}
          {track.loopEnabled && (
            <span className="px-1.5 py-0.5 text-[9px] font-[var(--font-display)] uppercase tracking-wider bg-purple-500/20 text-purple-400 rounded-sm">
              loop
            </span>
          )}
          {track.cueLoops.length > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-[var(--font-display)] uppercase tracking-wider bg-cyan-500/20 text-cyan-400 rounded-sm">
              {track.cueLoops.length} cue{track.cueLoops.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--color-base-500)] truncate block">
          {track.artist}
        </span>
      </div>

      {/* Timeline bar placeholder */}
      <div className="w-32 h-2 timeline-track flex-shrink-0 hidden lg:block">
        <div className="timeline-progress h-full" style={{ width: '0%' }} />
      </div>

      {/* Volume */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onMuteToggle}
          className={`text-xs w-6 h-6 flex items-center justify-center rounded-sm transition-colors ${
            track.muted
              ? 'text-red-400 bg-red-400/10'
              : 'text-[var(--color-base-400)] hover:text-[var(--color-base-100)]'
          }`}
          title={track.muted ? 'Unmute' : 'Mute'}
        >
          {track.muted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={track.muted ? 0 : track.volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-16 h-1 accent-[var(--color-accent)] cursor-pointer"
          title={`Volume: ${track.volume}%`}
        />
        <span className="text-[10px] font-[var(--font-display)] text-[var(--color-base-500)] w-7 text-right tabular-nums">
          {track.volume}
        </span>
      </div>

      {/* Loop toggle */}
      <button
        onClick={onLoopToggle}
        className={`text-xs w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${
          track.loopEnabled
            ? 'text-[var(--color-looping)] bg-purple-400/10'
            : 'text-[var(--color-base-500)] hover:text-[var(--color-base-300)]'
        }`}
        title={track.loopEnabled ? 'Disable loop' : 'Enable loop'}
      >
        ↻
      </button>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="text-xs text-[var(--color-base-600)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all w-6 h-6 flex items-center justify-center"
        title="Remove track"
      >
        ×
      </button>
    </div>
  );
}

function SmallButton({ onClick, title, icon }: { onClick: () => void; title: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="
        w-6 h-6 flex items-center justify-center
        text-[var(--color-base-400)] hover:text-[var(--color-base-100)]
        hover:bg-[var(--color-base-700)] rounded-sm
        transition-colors text-[10px]
      "
    >
      {icon}
    </button>
  );
}
