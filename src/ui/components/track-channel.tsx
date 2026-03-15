import type { Track } from '@domain/models/track';
import type { TrackPlaybackInfo } from '@ui/stores/playback-store';

type TrackChannelProps = {
  track: Track;
  playbackInfo?: TrackPlaybackInfo;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onLoopToggle: () => void;
  onRemove: () => void;
  onSeek?: (positionMs: number) => void;
  onBreakCueLoop?: () => void;
  onEditCueLoops?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isDragging?: boolean;
};

export function TrackChannel({
  track,
  playbackInfo,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onMuteToggle,
  onLoopToggle,
  onRemove,
  onSeek,
  onBreakCueLoop,
  onEditCueLoops,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  isFirst,
  isLast,
  isDragging,
}: TrackChannelProps) {
  const state = playbackInfo?.state ?? 'stopped';
  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';
  const isError = state === 'error';
  const progress = (playbackInfo?.relativePosition ?? 0) * 100;

  const displayTitle = playbackInfo?.metadata?.title ?? track.title;
  const displayArtist = playbackInfo?.metadata?.artist ?? track.artist;
  const activeCueLoop = playbackInfo?.activeCueLoopIndex ?? -1;
  const isInCueLoop = activeCueLoop >= 0;

  const statusColor = isError
    ? 'var(--color-panic)'
    : isPlaying
      ? 'var(--color-playing)'
      : state === 'paused'
        ? 'var(--color-paused)'
        : track.muted
          ? 'var(--color-base-600)'
          : 'var(--color-stopped)';

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart?.(); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver?.(e); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
      className={`group flex items-center gap-3 hover:bg-[var(--color-base-850)] transition-colors border-b border-[var(--color-base-800)]/50 ${isDragging ? 'opacity-40' : ''}`}
      style={{ padding: 'var(--spacing-track)', minHeight: 'var(--track-height)' }}
    >
      {/* Status indicator */}
      <div
        className={`rounded-full flex-shrink-0 ${isPlaying ? 'animate-pulse-glow' : ''}`}
        style={{ backgroundColor: statusColor, width: '4px', height: 'var(--btn-size)' }}
      />

      {/* Transport controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {isPlaying ? (
          <ScaleButton onClick={onPause} title="Pause" icon="⏸" />
        ) : (
          <ScaleButton onClick={onPlay} title="Play" icon="▶" disabled={isLoading} />
        )}
        <ScaleButton onClick={onStop} title="Stop" icon="◼" />
        {isInCueLoop && onBreakCueLoop && (
          <ScaleButton
            onClick={onBreakCueLoop}
            title={`Break cue loop ${activeCueLoop + 1}`}
            icon="⏭"
            active
            activeColor="cyan"
          />
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-base-100)] truncate" style={{ fontSize: 'var(--text-sm)' }}>
            {displayTitle}
          </span>
          {isLoading && (
            <Badge color="blue" text="loading" pulse />
          )}
          {isError && (
            <Badge color="red" text="error" />
          )}
          {track.isOneShot && (
            <Badge color="amber" text="1-shot" />
          )}
          {track.loopEnabled && (
            <Badge color="purple" text="loop" />
          )}
        </div>
        <span className="text-[var(--color-base-500)] truncate block" style={{ fontSize: 'var(--text-xs)' }}>
          {displayArtist}
        </span>
      </div>

      {/* Timeline bar — click to seek, shows cue loop markers */}
      <div
        className="w-32 h-3 timeline-track flex-shrink-0 hidden lg:block cursor-pointer relative"
        onClick={(e) => {
          if (!onSeek || !track.duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek(Math.round(fraction * track.duration));
        }}
        title="Click to seek"
      >
        {/* Cue loop region markers */}
        {track.cueLoops.map((cl, i) => {
          if (!track.duration) return null;
          const left = (cl.startPosition / track.duration) * 100;
          const width = ((cl.endPosition - cl.startPosition) / track.duration) * 100;
          const isActive = i === activeCueLoop;
          return (
            <div
              key={cl.id}
              className={`absolute top-0 h-full ${isActive ? 'bg-cyan-400/40' : 'bg-cyan-500/20'} border-x border-cyan-400/30`}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
        <div className="timeline-progress h-full transition-[width] duration-300 relative z-10" style={{ width: `${progress}%` }} />
      </div>

      {/* Volume */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ScaleButton
          onClick={onMuteToggle}
          title={track.muted ? 'Unmute' : 'Mute'}
          icon={track.muted ? '🔇' : '🔊'}
          active={track.muted}
          activeColor="red"
        />
        <input
          type="range"
          min={0}
          max={100}
          value={track.muted ? 0 : track.volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-16 cursor-pointer"
          title={`Volume: ${track.volume}%`}
        />
        <span className="text-[var(--color-base-500)] tabular-nums text-right" style={{ fontSize: 'var(--text-xxs)', width: '2em' }}>
          {track.volume}
        </span>
      </div>

      {/* Loop toggle + Cue loop editor */}
      <ScaleButton
        onClick={onLoopToggle}
        title={track.loopEnabled ? 'Disable loop' : 'Enable loop'}
        icon="↻"
        active={track.loopEnabled}
        activeColor="purple"
      />
      {onEditCueLoops && (
        <ScaleButton
          onClick={onEditCueLoops}
          title={`Cue loops (${track.cueLoops.length})`}
          icon="⚑"
          active={track.cueLoops.length > 0}
          activeColor="cyan"
        />
      )}

      {/* Reorder + Remove */}
      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="text-[var(--color-base-600)] hover:text-[var(--color-base-200)] disabled:opacity-20 text-[8px] leading-none"
          title="Move up"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="text-[var(--color-base-600)] hover:text-[var(--color-base-200)] disabled:opacity-20 text-[8px] leading-none"
          title="Move down"
        >
          ▼
        </button>
      </div>
      <button
        onClick={onRemove}
        className="text-[var(--color-base-600)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
        style={{ width: 'var(--btn-size)', height: 'var(--btn-size)', fontSize: 'var(--btn-icon)' }}
        title="Remove track"
      >
        ×
      </button>
    </div>
  );
}

function ScaleButton({ onClick, title, icon, disabled, active, activeColor }: {
  onClick: () => void;
  title: string;
  icon: string;
  disabled?: boolean;
  active?: boolean;
  activeColor?: string;
}) {
  const colorClass = active
    ? activeColor === 'red'
      ? 'text-red-400 bg-red-400/10'
      : activeColor === 'purple'
        ? 'text-[var(--color-looping)] bg-purple-400/10'
        : activeColor === 'cyan'
          ? 'text-cyan-400 bg-cyan-400/10'
          : 'text-[var(--color-accent)] bg-[var(--color-accent-dim)]'
    : 'text-[var(--color-base-400)] hover:text-[var(--color-base-100)] hover:bg-[var(--color-base-700)]';

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${colorClass}`}
      style={{ width: 'var(--btn-size)', height: 'var(--btn-size)', fontSize: 'var(--btn-icon)' }}
    >
      {icon}
    </button>
  );
}

function Badge({ color, text, pulse }: { color: string; text: string; pulse?: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    red: 'bg-red-500/20 text-red-400',
    amber: 'bg-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <span
      className={`px-1.5 py-0.5 uppercase tracking-wider rounded-sm ${colorMap[color] ?? ''} ${pulse ? 'animate-pulse' : ''}`}
      style={{ fontSize: 'var(--text-xxs)' }}
    >
      {text}
    </span>
  );
}
