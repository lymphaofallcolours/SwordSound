# Gotchas

<!-- Claude: Add every non-obvious bug, quirk, or footgun discovered during development. -->
<!-- Top 5 highest-impact entries are promoted to the Gotchas section in CLAUDE.md. -->
<!-- When adding a new gotcha, evaluate: "More critical than the least critical top-5  -->
<!-- entry?" If yes, swap them. Gotchas are NEVER deleted — mark resolved ones [RESOLVED]. -->

## How This File Works

- **Every gotcha goes here.** This is the comprehensive list.
- **Top 5 most critical** are duplicated in CLAUDE.md (read every session automatically).
- Claude evaluates severity on each new entry and promotes/demotes as needed.
- Resolved gotchas: mark `[RESOLVED]` with the fix, don't delete.

---

## Categories

### Environment / Setup

- **Electron Forge requires `node-linker=hoisted` with pnpm**
  **Context:** Forge's native dependency rebuilding and module resolution expect a flat `node_modules`. Without `.npmrc` setting `node-linker=hoisted`, `electron-forge start` fails with unhelpful errors.
  **Fix:** Add `node-linker=hoisted` to `.npmrc` in project root.

- **Electron must be in `devDependencies`, not `dependencies`**
  **Context:** `@electron-forge/core-utils` scans `devDependencies` to find the Electron package for version detection. If Electron is in `dependencies`, Forge errors with "Could not find any Electron packages in devDependencies".
  **Fix:** Always `pnpm add -D electron`.

### Language / Runtime
<!-- Surprising behavior, footguns in the primary language -->

### Libraries / Frameworks

- **[TOP 5]** SoundCloud Widget API loop precision overshoot (~100-250ms)
  **Context:** The Widget API's event frequency means `seekTo()` calls and `FINISH` events have latency. Loop boundaries will overshoot by 100-250ms. This is generally imperceptible for ambient/background music but noticeable for rhythmic loops.
  **Fix:** Accept as a known limitation. Document in app help. Consider pre-seeking slightly before the loop end point to compensate.

- **[TOP 5]** SoundCloud volume is integer steps 0-100 across iframe boundary
  **Context:** Volume changes are communicated via `postMessage` to the SoundCloud iframe. Integer precision means crossfades step in 1% increments. Smooth enough for background music, not studio-grade.
  **Fix:** Accept as a known limitation. Use small time intervals between volume steps for smoother perceived fades.

- **[TOP 5]** Each SoundCloud track = one iframe = one browser context
  **Context:** Every track in every scene creates a SoundCloud iframe (essentially a browser tab). With many simultaneous tracks, memory and CPU usage climb significantly.
  **Fix:** Lazy-load iframes — only create them for tracks that are playing or about to play. Destroy iframes for tracks in inactive scenes. Monitor resource usage.

- **[TOP 5]** Not all SoundCloud tracks are available for embedded playback
  **Context:** Some tracks are paywalled, geo-blocked, or have app playback disabled by the uploader. The Widget API will fail silently or show an error in the iframe.
  **Fix:** Validate track availability when adding a URL. Listen for Widget API error events. Show clear user feedback when a track can't be played.

### Data / Persistence
<!-- File formats, encoding, serialization, migration issues -->

### Performance
<!-- Memory, CPU, network, rendering bottlenecks -->

### Security
<!-- Auth pitfalls, input validation gaps, secret handling -->
