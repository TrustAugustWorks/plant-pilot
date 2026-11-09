# Plant Watering Pilot

A website that shows my apartment's floor plan with an icon for every plant, counts down to each plant's next watering, and lets me water a plant by tapping it.

This is a **pilot** for the plant-care module of my future home ERP. It is built with spec-driven development (SDD): the specs in this repo are the source of truth, and the code is generated from them.

## Read in this order

| # | Document | Answers |
|---|---|---|
| 1 | `.specify/memory/constitution.md` | Which rules always apply? |
| 2 | `docs/vision.md` | What problem, for whom, what's in and out of scope? |
| 3 | `docs/glossary.md` | What do our words mean? |
| 4 | `docs/architecture.md` | How is it built? Data model, storage, risks |
| 5 | `docs/ui.md` | What does it look like and how does it behave? |
| 6 | `docs/decisions/` | Why were key technical choices made? |
| 6b | `docs/diagrams/` | Architecture, data model, watering model, UI states and flows, as Mermaid diagrams |
| 7 | `specs/NNN-*/spec.md` | What each feature must do, with acceptance scenarios |
| 8 | `specs/NNN-*/contracts/` | Exact data formats and interfaces |
| 9 | `docs/my-plants.md` | The plants I own (input for the library) |

## Features

| # | Feature | Status |
|---|---|---|
| 001 | Map and plants (floor plan, add/move/remove plants, plant library, hover info) | Implemented |
| 002 | Watering and countdown (tap to water, undo, countdown list, status colours) | Implemented |
| 003 | Backup: export and import | Implemented |
| 004 | Calendar reminders (Outlook/.ics export, copy-link per plant) | Implemented |
| later | Push notifications | Not specced |
| later | Moisture sensors | Not specced |
| later | Shared data via Raspberry Pi server | Not specced |

## Plant library (separate agent)

The plant type library is researched by its own Claude Code subagent, `plant-librarian` (`.claude/agents/plant-librarian.md`), so it can run in parallel with feature work.

1. Fill in `docs/my-plants.md`.
2. In Claude Code: *"Use the plant-librarian agent to build the plant library"*, or run it in a second terminal/session while the main session builds feature 001.
3. Review `docs/plant-library-report.md` before merging.

`src/data/plant-library.json` has 25 entries with sources (20 starter types plus 5 indoor palms); see `docs/plant-library-report.md`. The librarian can extend it to 40+.

## Next steps (SDD workflow, per feature)

1. Resolve every `[NEEDS CLARIFICATION]` in the feature's spec (`/speckit.clarify`).
2. Generate the plan (`/speckit.plan`); it must respect `docs/architecture.md`.
3. Generate tasks (`/speckit.tasks`), check consistency (`/speckit.analyze`).
4. Implement (`/speckit.implement`), tests first.

## Commands

```
npm install
npm run dev      # local dev server
npm test         # unit + component tests
npm run e2e      # end-to-end tests in a browser
npm run build    # static build for GitHub Pages
```
