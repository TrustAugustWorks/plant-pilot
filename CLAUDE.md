# Instructions for Claude Code

This repo uses spec-driven development. Before any work, read:
1. `.specify/memory/constitution.md`
2. `docs/vision.md`, `docs/glossary.md`
3. `docs/architecture.md` (stack, layers, data model, calculations)
4. `docs/ui.md` (layout, modes, dialogs, plant info)
4b. `docs/diagrams/` - context, layers, domain model, watering model, UI states, sequences. Use them to check your structure; update a diagram in the same commit if the design changes.
5. The current feature folder in `specs/` and its `contracts/`

## Build order
001-map-and-plants -> 002-watering-countdown -> 003-backup-export -> 004-calendar-reminders. Finish and test one feature before starting the next.

## Delegation
- Plant library work (`src/data/plant-library.json`, its contract and validation test) belongs to the `plant-librarian` subagent. Don't edit library values in feature work; delegate.

## Rules
- Do not implement anything marked `[NEEDS CLARIFICATION]`. Ask me.
- Tests first: write failing tests from the acceptance scenarios, then implement. Name tests with requirement IDs, e.g. `FR003_second_tap_within_60s_is_ignored`.
- Domain logic in `src/domain/` is pure and never calls `Date.now()` or `new Date()` without an argument; use the injected clock.
- Only `src/storage/` touches IndexedDB. Everything else uses the `Storage` interface.
- Never commit personal data: no floor plan images, no real plant data. Test fixtures use generated images.
- No new dependencies beyond those in `docs/architecture.md` without asking.
- If the spec turns out wrong or incomplete, stop and propose a spec change. Never silently diverge.

## Project layout
```
src/
  app/        wiring, clock provider, storage selection
  domain/     config.ts, intervals, countdown, status (pure)
  storage/    Storage interface + IndexedDB implementation
  ui/         React components
  data/       plant-library.json
tests/
  unit/ component/ contract/ e2e/
```

## Commands
- `npm run dev` / `npm test` / `npm run e2e` / `npm run lint` / `npm run build`
