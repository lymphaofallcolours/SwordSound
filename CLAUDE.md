# CLAUDE.md

## Project Context

SwordSound — Desktop soundboard for tabletop RPG Game Masters that streams audio from SoundCloud via the Widget API.

**Stack:** TypeScript · Electron · React · Zustand · Tailwind CSS
**Language version:** Node ≥20
**Package manager:** pnpm

## Architecture

Electron app with React renderer. Domain/Application/Infrastructure/UI layers in the renderer process; Electron main process handles OS integration, persistence, and global shortcuts.

**UI Design (if applicable):** Claude MUST use the `frontend-design` skill/plugin when building any UI component. Read skill instructions BEFORE writing component code. Dark-mode-first tactical interface with scene-colored accents. Compact, information-dense layout optimized for live tabletop sessions.

```
src/
├── main/              # Electron main process — window management, IPC, OS integration
├── domain/            # Pure domain logic — ZERO framework imports
├── application/       # Use cases, orchestration, port interfaces
├── infrastructure/    # I/O, SoundCloud adapter, persistence, shortcuts
├── ui/                # React renderer — components, stores, hooks, styles
└── tests/             # Colocated unit tests + tests/ for integration & e2e
```

### Hard Rules
- `domain/` MUST NOT import from any other layer.
- `application/` MUST NOT import from `ui/` or `infrastructure/`.
- All shared types live in `domain/`. Other layers import, never redefine.
- Use path aliases (`@domain/`, `@application/`, `@infrastructure/`, `@ui/`). NEVER cross layer boundaries with relative imports.
- **Elegance principle:** Between two valid approaches, ALWAYS choose the more elegant — cleaner abstractions, fewer moving parts, better separation of concerns, easier to test and extend. Clever hacks are never acceptable when a principled solution exists. If unsure, write both in the plan file and evaluate before coding.

> Full architecture → `docs/architecture.md`

## Key Commands
```bash
pnpm dev              # Start Electron in dev mode
pnpm build            # Production build
pnpm test             # Unit tests (watch mode)
pnpm test:ci          # Full suite — unit + integration + e2e
pnpm lint             # Lint + type check
pnpm lint:fix         # Auto-fix lint + format
```

## Code Conventions
- Files: `kebab-case`. Descriptive names reflecting purpose.
- Types/Classes: `PascalCase` — no `I` prefix. Functions/variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Named exports ONLY. No default exports.
- Prefer `type` over `interface`.
- Composition over inheritance — always. No deep class hierarchies.
- Zustand for global state. Immer middleware for immutable updates.
- Max function length: ~20 lines. If it needs "and" to describe, split it.
- Result pattern for expected failures, try/catch for unexpected.
- Import order: node builtins → external packages → `@domain/` → `@application/` → `@infrastructure/` → `@ui/` → relative, separated by blank lines.

> Detailed patterns → `docs/code-conventions.md`

## Testing

**TDD is the default.** Write the failing test FIRST, minimum code to pass, then refactor. Not optional for domain logic, business rules, and pure functions. Test-after ONLY for exploratory UI/prototype work — backfill before feature is complete.

Vitest for unit/integration. Playwright for E2E. Target: ≤5 min Red-Green-Refactor cycles.
- **~70% Unit** — domain logic, business rules, pure functions. TDD mandatory.
- **~20% Integration** — module interactions, data layer, middleware. TDD encouraged.
- **~10% E2E** — critical user flows only. Written after interfaces stabilize.
- AAA pattern. Test names as specs. Independent tests. Mock only at architectural boundaries.
- Every commit that adds/changes behavior MUST include tests. Code without tests is not done.

> Testing patterns → `docs/testing.md`

## Gotchas (Top 5 — full list in `docs/gotchas.md`)
- **[TOP 5]** SoundCloud Widget API loop precision overshoot (~100-250ms) due to event frequency
- **[TOP 5]** Volume changes are integer steps (0-100) across iframe boundary — crossfades are smooth enough for background music but not studio-grade
- **[TOP 5]** Each track = one SoundCloud iframe = one browser context — performance degrades with many simultaneous tracks
- **[TOP 5]** Not all SoundCloud tracks are available for embedded playback — must handle gracefully

## Autonomous Workflow — MANDATORY, Unprompted

Claude is a self-directed developer. All behaviors below happen WITHOUT being asked.

### Session Start
- Read `docs/wip.md` and `docs/decisions-log.md` BEFORE anything else.
- Read `docs/spec.md` if task touches a specified feature.
- If `docs/plans/{feature}.md` exists for current work, read and resume.

### During Development
- New file/module → update `docs/architecture.md` if it adds a boundary.
- Non-obvious decision → append to `docs/decisions-log.md` (ADR format).
- New dependency → document WHY in `docs/dependencies.md`.
- Gotcha discovered → add to `docs/gotchas.md`. If top-5 severity, promote to CLAUDE.md Gotchas (demote the least critical entry to docs-only).
- New pattern → add to `docs/code-conventions.md`.

### Every Commit
- Update relevant docs IN THE SAME COMMIT as code. Docs are part of the work, not a separate task.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.

### Session End
- Update `docs/wip.md`: completed, in-progress, blocked, next steps.
- Log TODO/FIXME in `docs/wip.md` with file path. Self-check for stale docs.

### Feature Planning
Before coding any new feature, Claude MUST:
1. Create `docs/plans/{feature-name}.md` with: goal, affected files/layers, data model changes, implementation steps, test strategy, acceptance criteria.
2. Reference the plan during implementation. Update if approach changes (append, don't delete).
3. On completion: move to `docs/plans/completed/`, note in `docs/wip.md`.

### Spec as Source of Truth
`docs/spec.md` governs all feature design. Implement as specified. On ambiguity or a better approach: log in decisions-log, propose to user, deviate only after approval, update spec.

> Docs are NOT optional. A feature is not done until docs are updated and plan is archived.

## Documentation Map
```
docs/
├── spec.md              # Project specification — source of truth
├── architecture.md      # Layer boundaries, data flow
├── code-conventions.md  # Patterns, anti-patterns
├── testing.md           # Test strategies, fixtures
├── gotchas.md           # Full gotcha list (top 5 promoted to CLAUDE.md)
├── wip.md               # Session state — updated EVERY session
├── decisions-log.md     # ADRs — append-only
├── dependencies.md      # Why each dep exists
├── changelog.md         # Via conventional commits
└── plans/               # Feature plans (active) → plans/completed/ (archived)
```
