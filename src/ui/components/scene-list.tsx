import type { Scene } from '@domain/models/scene';

type SceneListProps = {
  scenes: readonly Scene[];
  activeSceneId: string | null;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
};

export function SceneList({ scenes, activeSceneId, onSelectScene, onAddScene }: SceneListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 flex items-center justify-between border-b border-[var(--color-base-700)]">
        <h2 className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-base-400)]">
          Scenes
        </h2>
        <button
          onClick={onAddScene}
          className="
            w-6 h-6 flex items-center justify-center
            text-[var(--color-base-400)] hover:text-[var(--color-base-100)]
            hover:bg-[var(--color-base-700)] rounded-sm
            transition-colors text-sm font-mono
          "
          title="Add scene"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`
                w-full text-left px-3 py-2 flex items-center gap-2
                transition-all duration-150 group
                ${isActive
                  ? 'bg-[var(--color-accent-dim)] text-[var(--color-base-100)]'
                  : 'text-[var(--color-base-300)] hover:bg-[var(--color-base-800)] hover:text-[var(--color-base-100)]'
                }
              `}
              style={isActive ? { '--scene-color': scene.color } as React.CSSProperties : undefined}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'animate-pulse-glow' : ''}`}
                style={{ backgroundColor: scene.color }}
              />
              <span className="text-sm truncate">
                {scene.emoji && <span className="mr-1.5">{scene.emoji}</span>}
                {scene.name}
              </span>
              {isActive && (
                <div
                  className="ml-auto w-1 h-4 rounded-full"
                  style={{ backgroundColor: scene.color }}
                />
              )}
            </button>
          );
        })}

        {scenes.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-[var(--color-base-500)] text-xs">No scenes yet</p>
            <button
              onClick={onAddScene}
              className="mt-2 text-xs text-[var(--color-accent)] hover:underline"
            >
              Create first scene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
