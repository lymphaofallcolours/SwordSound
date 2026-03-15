# Feature Plan: UI Implementation

## Goal
Build the core UI shell and key components using the frontend-design plugin. Dark tactical command-center aesthetic with scene-colored accents.

## Aesthetic Direction
- **Tone:** Industrial/utilitarian command center — dense information, sharp edges, glowing accents
- **Typography:** Monospace headers (JetBrains Mono), clean sans-serif body (DM Sans)
- **Color:** Deep slate base, scene-colored glowing accents, high contrast status indicators
- **Motion:** Subtle glow pulses on active elements, smooth crossfades on scene transitions
- **Differentiation:** The scene accent color system — each scene tints the entire interface

## Components to Build
1. **AppShell** — main layout with sidebar, header, content area
2. **SceneList** — sidebar list of scenes with colored indicators
3. **SceneHeader** — active scene name, emoji, controls, notes
4. **TrackChannel** — compact track row with transport controls, volume, loop indicator
5. **PanicButton** — always-visible emergency stop
6. **AddTrackDialog** — modal for pasting SoundCloud URLs
7. **CreateSessionDialog** — modal for naming new sessions

## Implementation Steps
1. Set up Tailwind theme with CSS custom properties for scene accents
2. Build AppShell layout
3. Build SceneList sidebar
4. Build TrackChannel component
5. Build PanicButton
6. Build modal dialogs
7. Wire components to Zustand stores
