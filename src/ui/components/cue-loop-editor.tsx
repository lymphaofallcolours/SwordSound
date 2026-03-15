import { useState } from 'react';

import { Modal } from './modal';
import type { Track } from '@domain/models/track';
import type { CueLoop } from '@domain/models/cue-loop';
import { createCueLoop } from '@domain/models/cue-loop';
import { createTimePosition } from '@domain/value-objects/time-position';
import { createFadeDuration } from '@domain/value-objects/fade-duration';

type CueLoopEditorProps = {
  open: boolean;
  onClose: () => void;
  track: Track;
  globalFadeDurationMs: number;
  onSave: (cueLoops: CueLoop[], customStart?: number, customEnd?: number | null, alias?: string, extra?: Record<string, unknown>) => void;
};

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function parseTime(str: string): number | null {
  const parts = str.split(':');
  if (parts.length !== 2) return null;
  const min = parseInt(parts[0], 10);
  const sec = parseInt(parts[1], 10);
  if (isNaN(min) || isNaN(sec) || min < 0 || sec < 0 || sec >= 60) return null;
  return (min * 60 + sec) * 1000;
}

export function CueLoopEditor({ open, onClose, track, globalFadeDurationMs, onSave }: CueLoopEditorProps) {
  const [alias, setAlias] = useState(track.alias ?? '');
  const [crossfadeLoop, setCrossfadeLoop] = useState(track.crossfadeLoop);
  const [crossfadeDurationSec, setCrossfadeDurationSec] = useState(track.crossfadeDuration as number);
  const [autoPlay, setAutoPlay] = useState(track.autoPlay);
  const [fadeInOnPlay, setFadeInOnPlay] = useState(track.fadeInOnPlay ?? false);
  const [groupId, setGroupId] = useState(track.groupId ?? '');
  const [fadeInDelayMs, setFadeInDelayMs] = useState((track as Record<string, unknown>).fadeInDelay as number ?? 0);
  // Per-track fade-in duration override. 0 means "use global setting"
  const [fadeInDurationSec, setFadeInDurationSec] = useState(
    (track as Record<string, unknown>).fadeInDuration as number ?? 0,
  );
  const globalFadeSec = globalFadeDurationMs / 1000;
  const effectiveFadeInSec = fadeInDurationSec > 0 ? fadeInDurationSec : globalFadeSec;
  const [customStartStr, setCustomStartStr] = useState(
    track.customStart > 0 ? formatTime(track.customStart) : '',
  );
  const [customEndStr, setCustomEndStr] = useState(
    track.customEnd ? formatTime(track.customEnd) : '',
  );
  const [loops, setLoops] = useState<{ startStr: string; endStr: string; xfade: boolean; xfadeSec: number }[]>(
    track.cueLoops.map((cl) => ({
      startStr: formatTime(cl.startPosition),
      endStr: formatTime(cl.endPosition),
      xfade: cl.crossfadeEnabled,
      xfadeSec: Number(cl.crossfadeDuration) || 0,
    })),
  );

  const addLoop = () => {
    setLoops([...loops, { startStr: '0:00', endStr: '0:30', xfade: false, xfadeSec: 1 }]);
  };

  const removeLoop = (index: number) => {
    setLoops(loops.filter((_, i) => i !== index));
  };

  const updateLoop = (index: number, field: 'startStr' | 'endStr', value: string) => {
    const updated = [...loops];
    updated[index] = { ...updated[index], [field]: value };
    setLoops(updated);
  };

  const handleSave = () => {
    const cueLoops: CueLoop[] = [];
    for (const loop of loops) {
      const startMs = parseTime(loop.startStr);
      const endMs = parseTime(loop.endStr);
      if (startMs === null || endMs === null || startMs >= endMs) continue;

      try {
        cueLoops.push(
          createCueLoop({
            startPosition: createTimePosition(startMs),
            endPosition: createTimePosition(endMs),
            crossfadeEnabled: loop.xfade,
            crossfadeDuration: loop.xfade ? createFadeDuration(loop.xfadeSec) : undefined,
          }),
        );
      } catch {
        // Skip invalid cue loops
      }
    }

    // Sort by start position and remove overlaps
    cueLoops.sort((a, b) => a.startPosition - b.startPosition);

    // Filter out overlapping cue loops (keep earlier ones)
    const filtered: CueLoop[] = [];
    for (const cl of cueLoops) {
      const last = filtered[filtered.length - 1];
      if (!last || cl.startPosition >= last.endPosition) {
        filtered.push(cl);
      }
    }

    const customStart = parseTime(customStartStr) ?? 0;
    const customEnd = customEndStr ? (parseTime(customEndStr) ?? null) : null;
    onSave(filtered, customStart, customEnd, alias, {
      crossfadeLoop,
      crossfadeDuration: crossfadeDurationSec,
      autoPlay,
      fadeInOnPlay,
      fadeInDuration: fadeInDurationSec,
      groupId: groupId || null,
      fadeInDelay: fadeInDelayMs,
    });
    onClose();
  };

  const durationStr = formatTime(track.duration);

  return (
    <Modal open={open} onClose={onClose} title={`Track Editor — ${track.title}`}>
      <div className="space-y-4">
        <p className="text-xs text-[var(--color-base-400)]">
          Track duration: {durationStr}
        </p>

        {/* GM Alias */}
        <div>
          <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-2">
            GM Alias / Label
          </label>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="e.g., Combat theme, Rain ambience"
            className="w-full px-2 py-1 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Group + Delay */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--color-base-400)]">Group:</span>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="px-2 py-0.5 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">None</option>
              <option value="music">Music</option>
              <option value="ambience">Ambience</option>
              <option value="effects">Effects</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--color-base-400)]">Start delay:</span>
            <input
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={fadeInDelayMs / 1000}
              onChange={(e) => setFadeInDelayMs(Number(e.target.value) * 1000)}
              className="w-12 px-1 py-0.5 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-[10px] text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span className="text-[9px] text-[var(--color-base-600)]">sec</span>
          </div>
        </div>

        {/* Playback options — checkboxes in a stable row, controls below */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
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
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-base-300)] cursor-pointer">
              <input type="checkbox" checked={crossfadeLoop} onChange={(e) => setCrossfadeLoop(e.target.checked)}
                className="accent-[var(--color-accent)]" />
              Crossfade loop
            </label>
          </div>
          {/* Conditional duration controls */}
          {(fadeInOnPlay || crossfadeLoop) && (
            <div className="flex items-center gap-4 ml-4">
              {fadeInOnPlay && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[var(--color-base-500)]">Fade in:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={fadeInDurationSec}
                    onChange={(e) => setFadeInDurationSec(Number(e.target.value))}
                    className="w-12 px-1 py-0.5 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-[10px] text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
                    placeholder={String(globalFadeSec)}
                  />
                  <span className="text-[9px] text-[var(--color-base-600)]">
                    {fadeInDurationSec > 0 ? 's' : `s (=${globalFadeSec}s)`}
                  </span>
                </div>
              )}
              {crossfadeLoop && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[var(--color-base-500)]">Crossfade:</span>
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={crossfadeDurationSec}
                    onChange={(e) => setCrossfadeDurationSec(Number(e.target.value))}
                    className="w-12 px-1 py-0.5 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-[10px] text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  <span className="text-[9px] text-[var(--color-base-600)]">s</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom start/end points */}
        <div>
          <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-2">
            Custom Start / End Points
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customStartStr}
              onChange={(e) => setCustomStartStr(e.target.value)}
              placeholder="0:00"
              className="w-16 px-2 py-1 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span className="text-xs text-[var(--color-base-500)]">→</span>
            <input
              type="text"
              value={customEndStr}
              onChange={(e) => setCustomEndStr(e.target.value)}
              placeholder={durationStr}
              className="w-16 px-2 py-1 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span className="text-[10px] text-[var(--color-base-600)]">(leave empty for full track)</span>
          </div>
        </div>

        <div className="border-t border-[var(--color-base-700)] pt-3">
          <label className="block text-xs text-[var(--color-base-400)] uppercase tracking-wider mb-2">
            Cue Loops
          </label>
          <p className="text-[10px] text-[var(--color-base-500)] mb-2">
            Playback holds at each region until you break it.
          </p>
        </div>

        <div className="space-y-2">
          {loops.map((loop, index) => {
            const loopStartMs = parseTime(loop.startStr);
            const loopEndMs = parseTime(loop.endStr);
            const csMs = parseTime(customStartStr) ?? 0;
            const ceMs = customEndStr ? parseTime(customEndStr) : null;
            const outsideRange = (loopStartMs !== null && loopStartMs < csMs) ||
              (ceMs !== null && loopEndMs !== null && loopEndMs > ceMs);
            const overlapsNext = index < loops.length - 1 && loopEndMs !== null && (() => {
              const nextStart = parseTime(loops[index + 1].startStr);
              return nextStart !== null && loopEndMs > nextStart;
            })();

            return (
            <div key={index}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-base-500)] w-6">#{index + 1}</span>
                <input
                  type="text"
                  value={loop.startStr}
                  onChange={(e) => updateLoop(index, 'startStr', e.target.value)}
                  placeholder="0:00"
                  className="w-16 px-2 py-1 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
                />
                <span className="text-xs text-[var(--color-base-500)]">→</span>
                <input
                  type="text"
                  value={loop.endStr}
                  onChange={(e) => updateLoop(index, 'endStr', e.target.value)}
                  placeholder="0:30"
                  className="w-16 px-2 py-1 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-xs text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
                />
                <button
                  onClick={() => removeLoop(index)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 ml-8 mt-1">
                <label className="flex items-center gap-1 text-[10px] text-[var(--color-base-400)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loop.xfade}
                    onChange={(e) => {
                      const updated = [...loops];
                      updated[index] = { ...updated[index], xfade: e.target.checked };
                      setLoops(updated);
                    }}
                    className="accent-[var(--color-accent)]"
                  />
                  Crossfade
                </label>
                {loop.xfade && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0.5}
                      max={10}
                      step={0.5}
                      value={loop.xfadeSec}
                      onChange={(e) => {
                        const updated = [...loops];
                        updated[index] = { ...updated[index], xfadeSec: Number(e.target.value) };
                        setLoops(updated);
                      }}
                      className="w-12 px-1 py-0.5 bg-[var(--color-base-800)] border border-[var(--color-base-700)] rounded-sm text-[10px] text-[var(--color-base-200)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <span className="text-[9px] text-[var(--color-base-500)]">sec</span>
                  </div>
                )}
              </div>
              {outsideRange && (
                <p className="text-[10px] text-amber-400 ml-8 mt-0.5">Outside custom start/end range</p>
              )}
              {overlapsNext && (
                <p className="text-[10px] text-amber-400 ml-8 mt-0.5">Overlaps with next loop — will be removed</p>
              )}
            </div>
            );
          })}
        </div>

        <button
          onClick={addLoop}
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          + Add cue loop
        </button>

        {/* Visual preview */}
        {loops.length > 0 && track.duration > 0 && (
          <div className="h-4 bg-[var(--color-base-800)] rounded-sm relative overflow-hidden">
            {loops.map((loop, index) => {
              const startMs = parseTime(loop.startStr);
              const endMs = parseTime(loop.endStr);
              if (startMs === null || endMs === null) return null;
              const left = (startMs / track.duration) * 100;
              const width = ((endMs - startMs) / track.duration) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-0 h-full bg-cyan-500/30 border-x border-cyan-400/50"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span className="text-[8px] text-cyan-400 px-0.5">
                    {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[var(--color-base-400)] hover:text-[var(--color-base-100)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs bg-[var(--color-accent)] text-white rounded-sm hover:brightness-110 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
