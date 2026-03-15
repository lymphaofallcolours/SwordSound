import { useState } from 'react';

import type { Scene } from '@domain/models/scene';

type SceneHeaderProps = {
  scene: Scene;
  onPlayScene: () => void;
  onStopScene: () => void;
  onFadeIn: () => void;
  onFadeOut: () => void;
  onUpdateNotes?: (notes: string) => void;
  onDuckToggle?: () => void;
  onSaveVolumes?: () => void;
  onRestoreVolumes?: () => void;
  isDucked?: boolean;
  fadeDurationMs?: number;
  hasVolumePresets?: boolean;
};

export function SceneHeader({ scene, onPlayScene, onStopScene, onFadeIn, onFadeOut, onUpdateNotes, onDuckToggle, onSaveVolumes, onRestoreVolumes, isDucked, fadeDurationMs = 3000, hasVolumePresets }: SceneHeaderProps) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(scene.notes);

  const handleSaveNotes = () => {
    onUpdateNotes?.(notesValue);
    setEditingNotes(false);
  };

  return (
    <div
      className="border-b border-[var(--color-base-700)] px-5 py-3 inner-glow"
      style={{ '--scene-color': scene.color } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {scene.emoji && (
            <span className="text-2xl">{scene.emoji}</span>
          )}
          <div>
            <h1
              className="text-lg font-semibold tracking-tight"
              style={{ color: scene.color }}
            >
              {scene.name}
            </h1>
            <span className="text-[var(--color-base-500)] text-xs">
              {scene.tracks.length} track{scene.tracks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TransportButton onClick={onPlayScene} title="Play all tracks" icon="▶" />
          <TransportButton onClick={onStopScene} title="Stop all tracks" icon="◼" />
          <div className="w-px h-5 bg-[var(--color-base-700)] mx-1" />
          <TransportButton onClick={onFadeIn} title={`Fade in scene (${(fadeDurationMs / 1000).toFixed(1)}s)`} icon="⏶" />
          <TransportButton onClick={onFadeOut} title={`Fade out scene (${(fadeDurationMs / 1000).toFixed(1)}s)`} icon="⏷" />
          {onDuckToggle && (
            <>
              <div className="w-px h-5 bg-[var(--color-base-700)] mx-1" />
              <button
                onClick={onDuckToggle}
                title="Duck all audio for narration (D key)"
                className={`w-8 h-8 flex items-center justify-center rounded-sm transition-colors text-xs ${
                  isDucked
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-[var(--color-base-400)] hover:text-[var(--color-base-100)] hover:bg-[var(--color-base-700)]'
                }`}
              >
                🎙
              </button>
            </>
          )}
          {onSaveVolumes && (
            <>
              <div className="w-px h-5 bg-[var(--color-base-700)] mx-1" />
              <TransportButton onClick={onSaveVolumes} title="Save current volume mix" icon="💾" />
              {hasVolumePresets && onRestoreVolumes && (
                <TransportButton onClick={onRestoreVolumes} title="Restore saved volume mix" icon="↩" />
              )}
            </>
          )}
        </div>
      </div>

      {/* GM Notes */}
      <div className="mt-2">
        {editingNotes ? (
          <div className="flex gap-2">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              autoFocus
              rows={2}
              className="
                flex-1 px-3 py-2 bg-[var(--color-base-800)] border border-[var(--color-base-600)]
                rounded-sm text-xs text-[var(--color-base-200)] placeholder-[var(--color-base-500)]
                focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none
              "
              placeholder="GM notes for this scene..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) handleSaveNotes();
                if (e.key === 'Escape') setEditingNotes(false);
              }}
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={handleSaveNotes}
                className="px-2 py-1 text-[10px] bg-[var(--color-accent)] text-white rounded-sm hover:brightness-110"
              >
                Save
              </button>
              <button
                onClick={() => setEditingNotes(false)}
                className="px-2 py-1 text-[10px] text-[var(--color-base-400)] hover:text-[var(--color-base-100)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : scene.notes ? (
          <button
            onClick={() => { setNotesValue(scene.notes); setEditingNotes(true); }}
            className="w-full text-left px-3 py-2 bg-[var(--color-base-800)]/50 rounded-sm border-l-2 hover:bg-[var(--color-base-800)] transition-colors"
            style={{ borderColor: scene.color }}
          >
            <p className="text-xs text-[var(--color-base-300)] italic">{scene.notes}</p>
          </button>
        ) : (
          <button
            onClick={() => { setNotesValue(''); setEditingNotes(true); }}
            className="text-[10px] text-[var(--color-base-500)] hover:text-[var(--color-base-300)] transition-colors"
          >
            + Add GM notes
          </button>
        )}
      </div>
    </div>
  );
}

function TransportButton({ onClick, title, icon }: { onClick: () => void; title: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="
        w-8 h-8 flex items-center justify-center
        text-[var(--color-base-400)] hover:text-[var(--color-base-100)]
        hover:bg-[var(--color-base-700)] rounded-sm
        transition-colors text-xs
      "
    >
      {icon}
    </button>
  );
}
