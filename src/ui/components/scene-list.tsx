import { useState } from 'react';

import type { Scene } from '@domain/models/scene';

type SceneListProps = {
  scenes: readonly Scene[];
  activeSceneId: string | null;
  onSelectScene: (id: string) => void;
  onAddScene: () => void;
  onDuplicateScene?: (id: string) => void;
  onDeleteScene?: (id: string) => void;
  onMoveScene?: (sceneId: string, direction: 'up' | 'down') => void;
};

export function SceneList({ scenes, activeSceneId, onSelectScene, onAddScene, onDuplicateScene, onDeleteScene, onMoveScene }: SceneListProps) {
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 flex items-center justify-between border-b border-[var(--color-base-700)]">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-base-400)] font-medium">
          Scenes
        </h2>
        <button
          onClick={onAddScene}
          className="
            w-6 h-6 flex items-center justify-center
            text-[var(--color-base-400)] hover:text-[var(--color-base-100)]
            hover:bg-[var(--color-base-700)] rounded-sm
            transition-colors text-sm
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
            <div key={scene.id} className="relative">
              <button
                onClick={() => onSelectScene(scene.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuId(contextMenuId === scene.id ? null : scene.id);
                }}
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

              {/* Context menu */}
              {contextMenuId === scene.id && (
                <div className="absolute left-3 top-full z-20 bg-[var(--color-base-800)] border border-[var(--color-base-600)] rounded-sm shadow-lg py-1 min-w-[120px]"
                  onMouseLeave={() => setContextMenuId(null)}
                >
                  <button
                    onClick={() => { onMoveScene?.(scene.id, 'up'); setContextMenuId(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[var(--color-base-200)] hover:bg-[var(--color-base-700)] transition-colors disabled:opacity-30"
                    disabled={scenes.indexOf(scene) === 0}
                  >
                    Move Up
                  </button>
                  <button
                    onClick={() => { onMoveScene?.(scene.id, 'down'); setContextMenuId(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[var(--color-base-200)] hover:bg-[var(--color-base-700)] transition-colors disabled:opacity-30"
                    disabled={scenes.indexOf(scene) === scenes.length - 1}
                  >
                    Move Down
                  </button>
                  <div className="my-1 border-t border-[var(--color-base-700)]" />
                  <button
                    onClick={() => { onDuplicateScene?.(scene.id); setContextMenuId(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[var(--color-base-200)] hover:bg-[var(--color-base-700)] transition-colors"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => { onDeleteScene?.(scene.id); setContextMenuId(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-[var(--color-base-700)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
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
