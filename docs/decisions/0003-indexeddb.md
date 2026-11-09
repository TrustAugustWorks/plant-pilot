# 0003: IndexedDB instead of localStorage

**Status**: Proposed | **Date**: _TBD_

## Context
Data includes a floor plan image that can be several MB. localStorage is limited to about 5 MB per site and stores strings only.

## Decision
Use IndexedDB through the small `idb` wrapper. Store the image as a Blob. Request persistent storage with `navigator.storage.persist()`.

## Alternatives considered
- **localStorage**: simpler API, but image (base64 adds ~33%) would hit the limit.
- **OPFS (origin private file system)**: good for files, but less familiar and still needs somewhere for structured data.

## Consequences
Async storage API; tests use `fake-indexeddb`.

**Diagrams**: `docs/diagrams/02-deployment.md`, `docs/diagrams/04-domain-model.md`
