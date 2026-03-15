# Code Conventions

<!-- Claude: Update when a new pattern is adopted or an anti-pattern is discovered. -->

## Guiding Principles
- Pure functions by default. Side effects only at boundaries.
- Composition over inheritance — always.
- Make invalid states unrepresentable via the type system.
- Prefer explicitness over cleverness.

## Patterns In Use

<!-- Document each pattern with a concrete code example from this project. -->
<!-- TEMPLATE:
### {Pattern Name}
**When to use:** {context}
```typescript
{code example from this project}
```
-->

## Anti-Patterns to Avoid

| Anti-Pattern | Why | Do Instead |
|-------------|-----|------------|
| `any` type | Defeats the purpose of TypeScript | Use `unknown` and narrow with type guards |
| Default exports | Harder to refactor, inconsistent imports | Named exports only |
| Deep class hierarchies | Rigid, hard to test, hard to compose | Composition with plain objects and functions |
| Mutable global state | Race conditions, hard to test, unpredictable | Zustand stores with Immer middleware |
| Relative cross-layer imports | Couples layers, violates dependency rules | Path aliases: `@domain/`, `@application/`, etc. |
| `interface` for data shapes | `type` is more flexible (unions, intersections) | `type` for data, `interface` only when extending is needed |

## Import / Module Order

```typescript
// 1. Node builtins
import path from 'node:path';

// 2. External / third-party
import { create } from 'zustand';

// 3. @domain/
import type { Session } from '@domain/models/session';

// 4. @application/
import { createSession } from '@application/session/create-session';

// 5. @infrastructure/
import { FilePersistence } from '@infrastructure/persistence/file-persistence';

// 6. @ui/
import { TrackChannel } from '@ui/components/track-channel';

// 7. Relative (same layer only)
import { helpers } from './helpers';
```
