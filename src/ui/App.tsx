import { useEffect, useState, useCallback } from 'react';

import { useSessionStore, useUiStore } from '@ui/hooks/use-stores';
import { WelcomeScreen } from '@ui/components/welcome-screen';
import { SceneList } from '@ui/components/scene-list';
import { SceneHeader } from '@ui/components/scene-header';
import { TrackChannel } from '@ui/components/track-channel';
import { PanicButton } from '@ui/components/panic-button';
import { CreateSessionDialog } from '@ui/components/create-session-dialog';
import { AddSceneDialog } from '@ui/components/add-scene-dialog';
import { AddTrackDialog } from '@ui/components/add-track-dialog';
import { createTrack } from '@domain/models/track';

export function App() {
  const currentSession = useSessionStore((s) => s.currentSession);
  const sessionList = useSessionStore((s) => s.sessionList);
  const activeSceneId = useSessionStore((s) => s.activeSceneId);
  const createSession = useSessionStore((s) => s.createSession);
  const loadSession = useSessionStore((s) => s.loadSession);
  const refreshSessionList = useSessionStore((s) => s.refreshSessionList);
  const addScene = useSessionStore((s) => s.addScene);
  const removeScene = useSessionStore((s) => s.removeScene);
  const setActiveScene = useSessionStore((s) => s.setActiveScene);
  const addTrack = useSessionStore((s) => s.addTrack);
  const removeTrack = useSessionStore((s) => s.removeTrack);
  const updateTrack = useSessionStore((s) => s.updateTrack);

  const activeModal = useUiStore((s) => s.activeModal);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);

  const [showAddScene, setShowAddScene] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);

  useEffect(() => {
    refreshSessionList();
  }, [refreshSessionList]);

  const activeScene = currentSession?.scenes.find((s) => s.id === activeSceneId) ?? null;

  // Set scene accent color as CSS variable
  useEffect(() => {
    if (activeScene?.color) {
      document.documentElement.style.setProperty('--scene-color', activeScene.color);
    }
  }, [activeScene?.color]);

  const handlePanic = useCallback(() => {
    // Will integrate with AudioPlayerPort later
    console.warn('PANIC: All audio stopped');
  }, []);

  const handleAddTrack = useCallback(
    (url: string) => {
      if (!activeSceneId) return;
      // In the full app, this would fetch metadata from SoundCloud Widget API.
      // For now, create a track with placeholder metadata.
      const track = createTrack({
        soundcloudUrl: url,
        title: url.split('/').pop()?.replace(/-/g, ' ') ?? 'Unknown Track',
        artist: url.split('/').slice(-2, -1)[0] ?? 'Unknown Artist',
        duration: 180000,
      });
      addTrack(activeSceneId, track);
    },
    [activeSceneId, addTrack],
  );

  // Welcome screen when no session is loaded
  if (!currentSession) {
    return (
      <>
        <WelcomeScreen
          sessions={sessionList}
          onCreateSession={() => openModal('create-session')}
          onLoadSession={loadSession}
          onImportSession={() => {/* TODO: import via file dialog */}}
        />
        <CreateSessionDialog
          open={activeModal === 'create-session'}
          onClose={closeModal}
          onConfirm={createSession}
        />
      </>
    );
  }

  // Main app layout
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-11 flex items-center justify-between px-4 bg-[var(--color-base-900)] border-b border-[var(--color-base-700)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-[var(--font-display)] text-xs font-bold tracking-tight text-[var(--color-accent)]">
            SwordSound
          </span>
          <div className="w-px h-4 bg-[var(--color-base-700)]" />
          <span className="text-xs text-[var(--color-base-400)]">
            {currentSession.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PanicButton onPanic={handlePanic} />
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — scene list */}
        <aside className="w-52 flex-shrink-0 bg-[var(--color-base-900)] border-r border-[var(--color-base-700)] overflow-hidden">
          <SceneList
            scenes={currentSession.scenes}
            activeSceneId={activeSceneId}
            onSelectScene={setActiveScene}
            onAddScene={() => setShowAddScene(true)}
          />
        </aside>

        {/* Content — active scene */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--color-base-950)]">
          {activeScene ? (
            <>
              <SceneHeader
                scene={activeScene}
                onPlayScene={() => {/* TODO */}}
                onStopScene={() => {/* TODO */}}
                onFadeIn={() => {/* TODO */}}
                onFadeOut={() => {/* TODO */}}
              />

              {/* Track list */}
              <div className="flex-1 overflow-y-auto">
                {activeScene.tracks.map((track) => (
                  <TrackChannel
                    key={track.id}
                    track={track}
                    onPlay={() => {/* TODO */}}
                    onPause={() => {/* TODO */}}
                    onStop={() => {/* TODO */}}
                    onVolumeChange={(vol) => updateTrack(activeScene.id, track.id, { volume: vol })}
                    onMuteToggle={() => updateTrack(activeScene.id, track.id, { muted: !track.muted })}
                    onLoopToggle={() => updateTrack(activeScene.id, track.id, { loopEnabled: !track.loopEnabled })}
                    onRemove={() => removeTrack(activeScene.id, track.id)}
                  />
                ))}

                {activeScene.tracks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <p className="text-[var(--color-base-500)] text-sm">No tracks in this scene</p>
                    <button
                      onClick={() => setShowAddTrack(true)}
                      className="mt-3 text-sm text-[var(--color-accent)] hover:underline font-[var(--font-display)]"
                    >
                      + Add a SoundCloud track
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom bar — add track */}
              <div className="flex-shrink-0 px-4 py-2 border-t border-[var(--color-base-800)] bg-[var(--color-base-900)]">
                <button
                  onClick={() => setShowAddTrack(true)}
                  className="
                    text-xs text-[var(--color-base-400)] hover:text-[var(--color-accent)]
                    font-[var(--font-display)] transition-colors
                  "
                >
                  + Add Track
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[var(--color-base-500)] text-sm">Select or create a scene</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <AddSceneDialog
        open={showAddScene}
        onClose={() => setShowAddScene(false)}
        onConfirm={(name, emoji, color) => addScene(name, emoji, color)}
      />
      <AddTrackDialog
        open={showAddTrack}
        onClose={() => setShowAddTrack(false)}
        onConfirm={handleAddTrack}
      />
    </div>
  );
}
