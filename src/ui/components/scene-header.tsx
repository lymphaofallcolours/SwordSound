import type { Scene } from '@domain/models/scene';

type SceneHeaderProps = {
  scene: Scene;
  onPlayScene: () => void;
  onStopScene: () => void;
  onFadeIn: () => void;
  onFadeOut: () => void;
};

export function SceneHeader({ scene, onPlayScene, onStopScene, onFadeIn, onFadeOut }: SceneHeaderProps) {
  return (
    <div
      className="border-b border-[var(--color-base-700)] px-5 py-3"
      style={{ '--scene-color': scene.color } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {scene.emoji && (
            <span className="text-2xl">{scene.emoji}</span>
          )}
          <div>
            <h1
              className="font-[var(--font-display)] text-lg font-semibold tracking-tight"
              style={{ color: scene.color }}
            >
              {scene.name}
            </h1>
            <span className="text-[var(--color-base-500)] text-xs font-[var(--font-display)]">
              {scene.tracks.length} track{scene.tracks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TransportButton onClick={onPlayScene} title="Play scene" icon="▶" />
          <TransportButton onClick={onStopScene} title="Stop scene" icon="◼" />
          <TransportButton onClick={onFadeIn} title="Fade in" icon="⬆" />
          <TransportButton onClick={onFadeOut} title="Fade out" icon="⬇" />
        </div>
      </div>

      {scene.notes && (
        <div className="mt-2 px-3 py-2 bg-[var(--color-base-850)] rounded-sm border-l-2 border-[var(--color-accent)]">
          <p className="text-xs text-[var(--color-base-300)] italic">{scene.notes}</p>
        </div>
      )}
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
