# 0001: Static site with browser-only storage

**Status**: Accepted | **Date**: _TBD_

## Context
I want to host on GitHub for now and maybe a Raspberry Pi later. GitHub Pages serves static files only. Several people in the apartment should use the app. A GitHub Pages site is public.

## Decision
Build a static site with no backend. All data, including the floor plan, is stored in the browser of one shared device. Sharing between devices comes later with a Pi server.

## Alternatives considered
- **Pages + hosted database (Supabase/Firebase)**: shares data now, but puts my floor plan on a third-party cloud, needs auth, and adds a dependency to drop later.
- **Small server on my PC now**: shares data, but the PC must always be on; this is essentially the Pi phase, just earlier.

## Consequences
- Zero hosting cost, no personal data online.
- Only one device has the data; others must use that device.
- Risk of data loss if browser storage is cleared -> export/import is mandatory (feature 003).
- All storage goes through one interface so the Pi backend can be added later (Constitution II).

**Diagrams**: `docs/diagrams/01-context.md`, `docs/diagrams/02-deployment.md`
