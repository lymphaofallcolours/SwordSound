# Testing Patterns

<!-- Claude: Update when new testing strategies, fixtures, or conventions are established. -->

## Philosophy

**TDD is the default.** Write the failing test FIRST (Red), minimum code to pass (Green), then refactor. Applies to all domain logic, business rules, and pure functions without exception. Test-after acceptable ONLY for exploratory prototyping — backfill before feature is complete. A feature without tests is not done.

Target: ≤5 min per Red-Green-Refactor cycle. If a cycle exceeds 10 minutes, the scope is too large.

## Pyramid Ratio

| Layer | Target | Scope | Tools |
|-------|--------|-------|-------|
| Unit | ~70% | Single function/class, no I/O | Vitest |
| Integration | ~20% | Module interactions, data layer | Vitest + jsdom |
| E2E | ~10% | Critical user journeys only | Playwright |

## Conventions

### File Naming & Location
- Unit tests: colocated as `{module}.test.ts` next to source file
- Integration tests: `tests/integration/{feature}.test.ts`
- E2E tests: `tests/e2e/{journey}.test.ts`
- Fixtures: `tests/fixtures/`

### Test Structure
Every test follows AAA (Arrange-Act-Assert), one action per test, descriptive name as specification.

### Mocking Rules
- Mock ONLY at architectural boundaries (ports defined in `application/ports/`).
- NEVER mock the unit under test.
- Prefer fakes (in-memory implementations) over mocks for data layers.
- If a test needs more than 3 mocks, the code under test has too many dependencies.
- SoundCloud Widget API: mock at the `infrastructure/soundcloud/` boundary via the `AudioPlayerPort` interface.

### Test Factories

<!-- Document project-specific factories as they're created. -->

| Factory | Location | Purpose |
|---------|----------|---------|
| `createFakePersistence()` | `tests/fixtures/fake-persistence.ts` | In-memory PersistencePort for unit/integration tests |
