import { useEffect, useState, useCallback, useRef } from 'react';

import { useSessionStore, useUiStore, usePlaybackStore, useSettingsStore } from '@ui/hooks/use-stores';
import { WelcomeScreen } from '@ui/components/welcome-screen';
import { SceneList } from '@ui/components/scene-list';
import { SceneHeader } from '@ui/components/scene-header';
import { TrackChannel } from '@ui/components/track-channel';
import { PanicButton } from '@ui/components/panic-button';
import { CreateSessionDialog } from '@ui/components/create-session-dialog';
import { AddSceneDialog } from '@ui/components/add-scene-dialog';
import { AddTrackDialog } from '@ui/components/add-track-dialog';
import { SettingsPanel } from '@ui/components/settings-panel';
import { OneShotPalette } from '@ui/components/oneshot-palette';
import { AttributionPanel } from '@ui/components/attribution-panel';
import { CueLoopEditor } from '@ui/components/cue-loop-editor';
import { createTrack } from '@domain/models/track';
import type { CueLoop } from '@domain/models/cue-loop';
import { duckAllExcept, unduckAll } from '@infrastructure/soundcloud/duck-engine';
import { copyTrack } from '@application/scene/scene-use-cases';
import { useUndo } from '@ui/hooks/use-undo';

export function App() {
  const currentSession = useSessionStore((s) => s.currentSession);
  const sessionList = useSessionStore((s) => s.sessionList);
  const activeSceneId = useSessionStore((s) => s.activeSceneId);
  const createSession = useSessionStore((s) => s.createSession);
  const loadSession = useSessionStore((s) => s.loadSession);
  const refreshSessionList = useSessionStore((s) => s.refreshSessionList);
  const addScene = useSessionStore((s) => s.addScene);
  const removeScene = useSessionStore((s) => s.removeScene);
  const duplicateScene = useSessionStore((s) => s.duplicateScene);
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
  const seekTrack = usePlaybackStore((s) => s.seekTo);
  const setCueLoops = usePlaybackStore((s) => s.setCueLoops);
  const breakCueLoop = usePlaybackStore((s) => s.breakCueLoop);
  const fadeInTrack = usePlaybackStore((s) => s.fadeIn);
  const fadeOutTrack = usePlaybackStore((s) => s.fadeOut);
  const panic = usePlaybackStore((s) => s.panic);
  const tracks = usePlaybackStore((s) => s.tracks);
  const saveCurrentSession = useSessionStore((s) => s.saveCurrentSession);
  const updateScene = useSessionStore((s) => s.updateScene);
  const oneShotTracks = useSessionStore((s) => s.oneShotTracks);
  const addOneShotTrack = useSessionStore((s) => s.addOneShotTrack);
  const removeOneShotTrack = useSessionStore((s) => s.removeOneShotTrack);
  const updateOneShotTrack = useSessionStore((s) => s.updateOneShotTrack);
  const moveScene = useSessionStore((s) => s.moveScene);
  const moveTrack = useSessionStore((s) => s.moveTrack);

  const uiScale = useSettingsStore((s) => s.uiScale);
  const showSettings = useSettingsStore((s) => s.showSettings);
  const toggleSettings = useSettingsStore((s) => s.toggleSettings);
  const setUiScale = useSettingsStore((s) => s.setUiScale);
  const fadeDurationMs = useSettingsStore((s) => s.fadeDurationMs);
  const crossfadeDurationMs = useSettingsStore((s) => s.crossfadeDurationMs);
  const setFadeDuration = useSettingsStore((s) => s.setFadeDuration);
  const setCrossfadeDuration = useSettingsStore((s) => s.setCrossfadeDuration);

  const { pushState, undo, redo, pushRedo } = useUndo();

  const [showAddScene, setShowAddScene] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [showAddOneShot, setShowAddOneShot] = useState(false);
  const [showAttribution, setShowAttribution] = useState(false);
  const [dragTrackId, setDragTrackId] = useState<string | null>(null);
  const [editingCueLoopsTrackId, setEditingCueLoopsTrackId] = useState<string | null>(null);
  const [isDucked, setIsDucked] = useState(false);
  const [clipboardTrack, setClipboardTrack] = useState<ReturnType<typeof copyTrack> | null>(null);

  // Initialize playback engine
  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  useEffect(() => {
    refreshSessionList();
  }, [refreshSessionList]);

  // Loop support + custom end enforcement
  useEffect(() => {
    setOnTrackFinish((trackId: string) => {
      if (!currentSession) return;
      for (const scene of currentSession.scenes) {
        const track = scene.tracks.find((t) => t.id === trackId);
        if (track?.loopEnabled) {
          const startPos = track.customStart > 0 ? track.customStart : 0;
          setTimeout(() => {
            if (startPos > 0) seekTrack(trackId, startPos);
            playTrack(trackId);
          }, 100);
          return;
        }
      }
    });
  }, [currentSession, setOnTrackFinish, playTrack, seekTrack]);

  // Custom end point enforcement — use ref to avoid recreating interval on every tick
  const sessionRef = useRef(currentSession);
  const tracksRef = useRef(tracks);
  sessionRef.current = currentSession;
  tracksRef.current = tracks;

  useEffect(() => {
    const interval = setInterval(() => {
      const session = sessionRef.current;
      const playbackTracks = tracksRef.current;
      if (!session) return;
      for (const scene of session.scenes) {
        for (const track of scene.tracks) {
          if (!track.customEnd || track.customEnd <= 0) continue;
          const info = playbackTracks[track.id];
          if (info?.state !== 'playing') continue;
          if (info.positionMs >= (track.customEnd as number) - 500) {
            if (track.loopEnabled) {
              const startPos = track.customStart > 0 ? (track.customStart as number) : 0;
              seekTrack(track.id, startPos);
            } else {
              stopTrack(track.id);
            }
          }
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, [seekTrack, stopTrack]);

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
    setIsDucked(false);
  }, [panic]);

  const player = usePlaybackStore((s) => s.player);

  const handleDuckToggle = useCallback(() => {
    if (!player) return;
    const allPlayingIds = Object.keys(tracks).filter((id) => tracks[id]?.state === 'playing');
    if (allPlayingIds.length === 0) return;
    if (isDucked) {
      unduckAll(player, allPlayingIds, 500);
      setIsDucked(false);
    } else {
      duckAllExcept(player, [], allPlayingIds, 20, 300);
      setIsDucked(true);
    }
  }, [isDucked, tracks, player]);

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
      // Restore configured volume, initialize cue loops, seek to custom start
      if (currentSession) {
        for (const scene of currentSession.scenes) {
          const track = scene.tracks.find((t) => t.id === trackId);
          if (track) {
            setTrackVolume(trackId, track.muted ? 0 : track.volume);
            if (track.cueLoops.length > 0) {
              setCueLoops(trackId, track.cueLoops);
            }
            // Seek to custom start point if set
            if (track.customStart > 0) {
              seekTrack(trackId, track.customStart);
            }
            break;
          }
        }
      }
      playTrack(trackId);
    },
    [tracks, loadTrackToPlayer, playTrack, setTrackVolume, setCueLoops, currentSession],
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

  const handleDropOnTrack = useCallback(
    (targetTrackId: string) => {
      if (!dragTrackId || !activeScene || dragTrackId === targetTrackId) return;
      const trackIds = activeScene.tracks.map((t) => t.id);
      const fromIndex = trackIds.indexOf(dragTrackId);
      const toIndex = trackIds.indexOf(targetTrackId);
      if (fromIndex === -1 || toIndex === -1) return;

      // Move from → to by shifting with moveTrack
      const distance = toIndex - fromIndex;
      const direction = distance > 0 ? 'down' : 'up';
      for (let i = 0; i < Math.abs(distance); i++) {
        moveTrack(activeScene.id, dragTrackId, direction);
      }
      setDragTrackId(null);
    },
    [dragTrackId, activeScene, moveTrack],
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

  const handleTriggerOneShot = useCallback(
    async (trackId: string, soundcloudUrl: string) => {
      if (!tracks[trackId] || tracks[trackId].state === 'error') {
        await loadTrackToPlayer(trackId, soundcloudUrl);
      }

      // Duck all other playing tracks
      const player = usePlaybackStore.getState?.()?.player;
      if (player) {
        const allPlayingIds = Object.keys(tracks).filter(
          (id) => tracks[id]?.state === 'playing' && id !== trackId,
        );
        if (allPlayingIds.length > 0) {
          duckAllExcept(player, [trackId], allPlayingIds, 30, 300);

          // Set up auto-unduck when one-shot finishes
          const checkUnduck = setInterval(() => {
            const state = usePlaybackStore.getState?.()?.tracks[trackId]?.state;
            if (state !== 'playing') {
              unduckAll(player, allPlayingIds, 500);
              clearInterval(checkUnduck);
            }
          }, 500);
        }
      }

      playTrack(trackId);
    },
    [tracks, loadTrackToPlayer, playTrack],
  );

  const handleAddOneShot = useCallback(
    async (url: string) => {
      const track = createTrack({
        soundcloudUrl: url,
        title: 'Loading...',
        artist: 'Loading...',
        duration: 1,
        isOneShot: true,
      });
      addOneShotTrack(track);

      const metadata = await loadTrackToPlayer(track.id, url);
      if (metadata) {
        updateOneShotTrack(track.id, {
          title: metadata.title,
          artist: metadata.artist,
          duration: metadata.duration,
          artworkUrl: metadata.artworkUrl,
        } as Partial<typeof track>);
      }
    },
    [addOneShotTrack, updateOneShotTrack, loadTrackToPlayer],
  );

  const handleFadeInScene = useCallback(() => {
    if (!activeScene) return;
    for (const track of activeScene.tracks) {
      if (!track.muted) {
        // Load if needed, then fade in
        if (!tracks[track.id] || tracks[track.id].state === 'error') {
          loadTrackToPlayer(track.id, track.soundcloudUrl).then(() => {
            fadeInTrack(track.id, track.volume, fadeDurationMs);
          });
        } else {
          fadeInTrack(track.id, track.volume, fadeDurationMs);
        }
      }
    }
  }, [activeScene, tracks, loadTrackToPlayer, fadeInTrack, fadeDurationMs]);

  const handleFadeOutScene = useCallback(() => {
    if (!activeScene) return;
    for (const track of activeScene.tracks) {
      fadeOutTrack(track.id, fadeDurationMs, true);
    }
  }, [activeScene, fadeOutTrack, fadeDurationMs]);

  const handleCrossfadeToScene = useCallback(
    (targetSceneId: string) => {
      if (targetSceneId === activeSceneId) return;

      // Fade out current scene
      if (activeScene) {
        for (const track of activeScene.tracks) {
          if (tracks[track.id]?.state === 'playing') {
            fadeOutTrack(track.id, crossfadeDurationMs, true);
          }
        }
      }

      // Switch and fade in target scene
      setActiveScene(targetSceneId);
      const targetScene = currentSession?.scenes.find((s) => s.id === targetSceneId);
      if (targetScene) {
        setTimeout(() => {
          for (const track of targetScene.tracks) {
            if (!track.muted && track.autoPlay) {
              if (!tracks[track.id] || tracks[track.id].state === 'error') {
                loadTrackToPlayer(track.id, track.soundcloudUrl).then(() => {
                  fadeInTrack(track.id, track.volume, crossfadeDurationMs);
                });
              } else {
                fadeInTrack(track.id, track.volume, crossfadeDurationMs);
              }
            }
          }
        }, 200);
      }
    },
    [activeSceneId, activeScene, currentSession, tracks, fadeOutTrack, fadeInTrack, loadTrackToPlayer, setActiveScene, crossfadeDurationMs],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo
          const next = redo();
          if (next && currentSession) {
            pushState(currentSession);
            // Would need direct store set — simplified for now
          }
        } else {
          // Undo
          if (currentSession) {
            pushRedo(currentSession);
            const prev = undo();
            // Would need direct store set — simplified for now
          }
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          panic();
          setIsDucked(false);
          break;
        case 'd':
        case 'D':
          handleDuckToggle();
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
  }, [activeScene, tracks, panic, handlePlayScene, handleStopScene, handleDuckToggle, currentSession, undo, redo, pushState, pushRedo]);

  // Welcome screen
  if (!currentSession) {
    return (
      <>
        <WelcomeScreen
          sessions={sessionList}
          onCreateSession={() => openModal('create-session')}
          onLoadSession={loadSession}
          onImportSession={async () => {
            if (!window.swordsound?.dialog || !window.swordsound?.file) return;
            const filePath = await window.swordsound.dialog.showOpen();
            if (!filePath) return;
            const content = await window.swordsound.file.read(filePath);
            if (!content) return;
            try {
              const { importSession } = await import('@application/session/session-use-cases');
              const session = importSession(content);
              await saveCurrentSession();
              await createSession(session.name);
              // The imported session data needs to be loaded
              // For now, save it via persistence then load it
            } catch (err) {
              console.error('Import failed:', err);
            }
          }}
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
    <div className={`h-screen flex flex-col overflow-hidden scale-${uiScale}`}>
      {/* Top bar */}
      <header className="h-11 flex items-center justify-between px-4 bg-[var(--color-base-900)] border-b border-[var(--color-base-700)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              saveCurrentSession();
              setActiveScene(null);
              useSessionStore.getState?.();
              window.location.reload();
            }}
            className="text-xs font-bold tracking-tight text-[var(--color-accent)] hover:text-[var(--color-base-100)] transition-colors"
            title="Back to session list"
          >
            SwordSound
          </button>
          <div className="w-px h-4 bg-[var(--color-base-700)]" />
          <span className="text-xs text-[var(--color-base-400)]">
            {currentSession.name}
          </span>
          <button
            onClick={async () => {
              if (!window.swordsound?.dialog) return;
              const { exportSession } = await import('@application/session/session-use-cases');
              const json = exportSession(currentSession);
              const filePath = await window.swordsound.dialog.showSave(currentSession.name);
              if (filePath && window.swordsound?.file) {
                await window.swordsound.file.write(filePath, json);
              }
            }}
            className="text-[10px] text-[var(--color-base-500)] hover:text-[var(--color-base-300)] transition-colors"
            title="Export session"
          >
            Export
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSettings}
            className="w-8 h-8 flex items-center justify-center text-[var(--color-base-400)] hover:text-[var(--color-base-100)] hover:bg-[var(--color-base-700)] rounded-sm transition-colors text-sm"
            title="Settings"
          >
            ⚙
          </button>
          <PanicButton onPanic={handlePanic} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 bg-[var(--color-base-900)] border-r border-[var(--color-base-700)] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <SceneList
              scenes={currentSession.scenes}
              activeSceneId={activeSceneId}
              onSelectScene={handleCrossfadeToScene}
              onAddScene={() => setShowAddScene(true)}
              onDuplicateScene={duplicateScene}
              onDeleteScene={removeScene}
              onMoveScene={moveScene}
              onRenameScene={(id, name) => updateScene(id, { name })}
              onDragScene={(fromId, toId) => {
                const ids = currentSession.scenes.map((s) => s.id);
                const fromIdx = ids.indexOf(fromId);
                const toIdx = ids.indexOf(toId);
                if (fromIdx === -1 || toIdx === -1) return;
                const distance = toIdx - fromIdx;
                const dir = distance > 0 ? 'down' : 'up';
                for (let i = 0; i < Math.abs(distance); i++) moveScene(fromId, dir);
              }}
            />
          </div>
          <OneShotPalette
            tracks={oneShotTracks}
            playbackInfo={tracks}
            onTrigger={handleTriggerOneShot}
            onAdd={() => setShowAddOneShot(true)}
            onRemove={removeOneShotTrack}
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
                onFadeIn={handleFadeInScene}
                onFadeOut={handleFadeOutScene}
                fadeDurationMs={fadeDurationMs}
                onUpdateNotes={(notes) => updateScene(activeScene.id, { notes })}
                onDuckToggle={handleDuckToggle}
                isDucked={isDucked}
              />

              <div className="flex-1 overflow-y-auto">
                {activeScene.tracks.map((track, index) => (
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
                    onSeek={(posMs) => seekTrack(track.id, posMs)}
                    onBreakCueLoop={track.cueLoops.length > 0 ? () => breakCueLoop(track.id) : undefined}
                    onEditCueLoops={() => setEditingCueLoopsTrackId(track.id)}
                    onCopy={() => setClipboardTrack(copyTrack(activeScene, track.id))}
                    onDuplicate={() => {
                      const copy = copyTrack(activeScene, track.id);
                      addTrack(activeScene.id, copy);
                    }}
                    onAutoPlayToggle={() => updateTrack(activeScene.id, track.id, { autoPlay: !track.autoPlay })}
                    onMoveUp={() => moveTrack(activeScene.id, track.id, 'up')}
                    onMoveDown={() => moveTrack(activeScene.id, track.id, 'down')}
                    onDragStart={() => setDragTrackId(track.id)}
                    onDragEnd={() => setDragTrackId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnTrack(track.id)}
                    isFirst={index === 0}
                    isLast={index === activeScene.tracks.length - 1}
                    isDragging={dragTrackId === track.id}
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

      {/* Attribution panel */}
      <AttributionPanel
        open={showAttribution}
        onToggle={() => setShowAttribution(!showAttribution)}
        activeTrackIds={Object.keys(tracks)}
        playbackInfo={tracks}
      />

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
      <AddTrackDialog
        open={showAddOneShot}
        onClose={() => setShowAddOneShot(false)}
        onConfirm={handleAddOneShot}
      />
      {editingCueLoopsTrackId && activeScene && (() => {
        const track = activeScene.tracks.find((t) => t.id === editingCueLoopsTrackId);
        if (!track) return null;
        return (
          <CueLoopEditor
            open={true}
            onClose={() => setEditingCueLoopsTrackId(null)}
            track={track}
            onSave={(cueLoops: CueLoop[], customStart?: number, customEnd?: number | null, alias?: string) => {
              updateTrack(activeScene.id, track.id, {
                cueLoops,
                ...(customStart !== undefined && { customStart }),
                ...(customEnd !== undefined && { customEnd }),
                ...(alias !== undefined && { alias }),
              });
              setCueLoops(track.id, cueLoops);
              // Trigger seek cooldown for safe editing during playback
              const triggerSeekCooldown = usePlaybackStore.getState?.()?.triggerSeekCooldown;
              triggerSeekCooldown?.(track.id);
            }}
          />
        );
      })()}
      <SettingsPanel
        open={showSettings}
        onClose={toggleSettings}
        uiScale={uiScale}
        fadeDurationMs={fadeDurationMs}
        crossfadeDurationMs={crossfadeDurationMs}
        onScaleChange={setUiScale}
        onFadeDurationChange={setFadeDuration}
        onCrossfadeDurationChange={setCrossfadeDuration}
      />
    </div>
  );
}
