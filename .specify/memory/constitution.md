# Plant Watering Pilot Constitution

**Version**: 0.1.0 | **Ratified**: _TBD_ | **Last amended**: _TBD_

> DRAFT. Rewrite in your own words before ratifying.

## Core principles

### I. My floor plan never leaves my device
The floor plan image and all plant data are stored only in the browser. Nothing personal is committed to the repository or sent to any server. The site is public on GitHub Pages, so the code must contain no personal data.

### II. Storage behind one interface
All reading and writing of data goes through a single storage interface (`specs/001-map-and-plants/contracts/storage-interface.md`). No component touches browser storage directly. This is what lets the pilot move to a Raspberry Pi server later by replacing one module.

### III. Never lose a plant's history
Data loss is the worst failure. Every change is saved immediately; destructive actions can be undone or require confirmation; export/import exists from the first release.

### IV. Spec before code, tests before implementation
No code without an approved spec. Every functional requirement (FR-xxx) has at least one automated test, written and failing before implementation. Tests reference requirement IDs in their names.

### V. Time is injected
Nothing reads the system clock directly. "Now" comes from a clock that tests can control, so countdowns and status colours are testable for any date.

### VI. Ready to join the ERP
Names and data shapes follow the ERP glossary (plant, plant type, watering event). The export format is versioned so the ERP can import it.

### VII. Simplicity
Few dependencies, no backend, no accounts. Each added library must be justified in an ADR or the feature's `research.md`.

## Quality standards
- TypeScript strict mode, no `any` without a comment explaining why.
- CI runs lint, unit tests, and end-to-end tests on every push; deploy only from a green main branch.
- Works in current Chrome, Firefox, Safari and Edge, on desktop and phone.

## Governance
The constitution overrides specs and plans. Amendments bump the version and are logged below.

| Version | Date | Change |
|---|---|---|
| 0.1.0 | _TBD_ | Initial draft |
