import { useEffect, useState, useCallback } from 'react';

import { useSessionStore, useUiStore, usePlaybackStore } from '@ui/hooks/use-stores';
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

  const initPlayer = usePlaybackStore((s) => s.initPlayer);
  const setOnTrackFinish = usePlaybackStore((s) => s.setOnTrackFinish);
  const loadTrackToPlayer = usePlaybackStore((s) => s.loadTrack);
  const playTrack = usePlaybackStore((s) => s.play);
  const pauseTrack = usePlaybackStore((s) => s.pause);
  const stopTrack = usePlaybackStore((s) => s.stop);
  const setTrackVolume = usePlaybackStore((s) => s.setVolume);
  const panic = usePlaybackStore((s) => s.panic);
  const tracks = usePlaybackStore((s) => s.tracks);
  const saveCurrentSession = useSessionStore((s) => s.saveCurrentSession);

  const [showAddScene, setShowAddScene] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);

  // Initialize playback engine
  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  useEffect(() => {
    refreshSessionList();
  }, [refreshSessionList]);

  // Loop support: when a track finishes, replay if loop is enabled
  useEffect(() => {
    setOnTrackFinish((trackId: string) => {
      if (!currentSession) return;
      for (const scene of currentSession.scenes) {
        const track = scene.tracks.find((t) => t.id === trackId);
        if (track?.loopEnabled) {
          // Small delay to avoid race with widget state
          setTimeout(() => playTrack(trackId), 100);
          return;
        }
      }
    });
  }, [currentSession, setOnTrackFinish, playTrack]);

  // Auto-save session every 30 seconds when changes occur
  useEffect(() => {
    if (!currentSession) return;
    const timer = setInterval(() => {
      saveCurrentSession();
    }, 30000);
    return () => clearInterval(timer);
  }, [currentSession, saveCurrentSession]);

  const activeScene = currentSession?.scenes.find((s) => s.id === activeSceneId) ?? null;

  // Set scene accent color
  useEffect(() => {
    if (activeScene?.color) {
      document.documentElement.style.setProperty('--scene-color', activeScene.color);
    }
  }, [activeScene?.color]);

  const handlePanic = useCallback(() => {
    panic();
  }, [panic]);

  const handleAddTrack = useCallback(
    async (url: string) => {
      if (!activeSceneId) return;

      // Create a track with placeholder metadata first
      const track = createTrack({
        soundcloudUrl: url,
        title: 'Loading...',
        artist: 'Loading...',
        duration: 1,
      });
      addTrack(activeSceneId, track);

      // Load the widget and get real metadata
      const metadata = await loadTrackToPlayer(track.id, url);
      if (metadata) {
        updateTrack(activeSceneId, track.id, {
          title: metadata.title,
          artist: metadata.artist,
          duration: metadata.duration,
          artworkUrl: metadata.artworkUrl,
        } as Record<string, unknown>);
      }
    },
    [activeSceneId, addTrack, loadTrackToPlayer, updateTrack],
  );

  const handlePlayTrack = useCallback(
    async (trackId: string, soundcloudUrl: string) => {
      // Load widget if not already loaded
      if (!tracks[trackId] || tracks[trackId].state === 'error') {
        await loadTrackToPlayer(trackId, soundcloudUrl);
      }
      playTrack(trackId);
    },
    [tracks, loadTrackToPlayer, playTrack],
  );

  const handleVolumeChange = useCallback(
    (sceneId: string, trackId: string, volume: number) => {
      updateTrack(sceneId, trackId, { volume });
      setTrackVolume(trackId, volume);
    },
    [updateTrack, setTrackVolume],
  );

  const handleMuteToggle = useCallback(
    (sceneId: string, trackId: string, currentlyMuted: boolean) => {
      const newMuted = !currentlyMuted;
      updateTrack(sceneId, trackId, { muted: newMuted });
      // If muting, set volume to 0; if unmuting, restore track volume
      if (newMuted) {
        setTrackVolume(trackId, 0);
      } else {
        const scene = currentSession?.scenes.find((s) => s.id === sceneId);
        const track = scene?.tracks.find((t) => t.id === trackId);
        if (track) setTrackVolume(trackId, track.volume);
      }
    },
    [updateTrack, setTrackVolume, currentSession],
  );

  const handleRemoveTrack = useCallback(
    (sceneId: string, trackId: string) => {
      stopTrack(trackId);
      removeTrack(sceneId, trackId);
    },
    [stopTrack, removeTrack],
  );

  const handlePlayScene = useCallback(() => {
    if (!activeScene) return;
    for (const track of activeScene.tracks) {
      if (!track.muted) {
        handlePlayTrack(track.id, track.soundcloudUrl);
      }
    }
  }, [activeScene, handlePlayTrack]);

  const handleStopScene = useCallback(() => {
    if (!activeScene) return;
    for (const track of activeScene.tracks) {
      stopTrack(track.id);
    }
  }, [activeScene, stopTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Escape':
          panic();
          break;
        case ' ':
          e.preventDefault();
          if (activeScene) {
            const anyPlaying = activeScene.tracks.some((t) => tracks[t.id]?.state === 'playing');
            if (anyPlaying) {
              handleStopScene();
            } else {
              handlePlayScene();
            }
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeScene, tracks, panic, handlePlayScene, handleStopScene]);

  // Welcome screen
  if (!currentSession) {
    return (
      <>
        <WelcomeScreen
          sessions={sessionList}
          onCreateSession={() => openModal('create-session')}
          onLoadSession={loadSession}
          onImportSession={() => {}}
        />
        <CreateSessionDialog
          open={activeModal === 'create-session'}
          onClose={closeModal}
          onConfirm={createSession}
        />
      </>
    );
  }

  // Main app
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
        <PanicButton onPanic={handlePanic} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 bg-[var(--color-base-900)] border-r border-[var(--color-base-700)] overflow-hidden">
          <SceneList
            scenes={currentSession.scenes}
            activeSceneId={activeSceneId}
            onSelectScene={setActiveScene}
            onAddScene={() => setShowAddScene(true)}
          />
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--color-base-950)]">
          {activeScene ? (
            <>
              <SceneHeader
                scene={activeScene}
                onPlayScene={handlePlayScene}
                onStopScene={handleStopScene}
                onFadeIn={() => {}}
                onFadeOut={() => {}}
              />

              <div className="flex-1 overflow-y-auto">
                {activeScene.tracks.map((track) => (
                  <TrackChannel
                    key={track.id}
                    track={track}
                    playbackInfo={tracks[track.id]}
                    onPlay={() => handlePlayTrack(track.id, track.soundcloudUrl)}
                    onPause={() => pauseTrack(track.id)}
                    onStop={() => stopTrack(track.id)}
                    onVolumeChange={(vol) => handleVolumeChange(activeScene.id, track.id, vol)}
                    onMuteToggle={() => handleMuteToggle(activeScene.id, track.id, track.muted)}
                    onLoopToggle={() => updateTrack(activeScene.id, track.id, { loopEnabled: !track.loopEnabled })}
                    onRemove={() => handleRemoveTrack(activeScene.id, track.id)}
                  />
                ))}

                {activeScene.tracks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-16">
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

              <div className="flex-shrink-0 px-4 py-2 border-t border-[var(--color-base-800)] bg-[var(--color-base-900)]">
                <button
                  onClick={() => setShowAddTrack(true)}
                  className="text-xs text-[var(--color-base-400)] hover:text-[var(--color-accent)] font-[var(--font-display)] transition-colors"
                >
                  + Add Track
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[var(--color-base-500)] text-sm">Select or create a scene</p>
            </div>
          )}
        </main>
      </div>

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
