# Feature spec: Backup - export and import

**Feature**: `003-backup-export` | **Status**: Draft | **Created**: _TBD_

Why: data lives only in one browser (ADR 0001). Export protects against loss and is the path into the ERP later.

## User scenarios & testing

### User story 1 - Export everything (Priority: P1)
**Acceptance scenarios**:
1. **Given** a floor plan and plants, **When** I press Export, **Then** a file `plants-backup-YYYY-MM-DD.json` downloads containing everything in the format of `contracts/export-format.md`.
2. **Given** archived plants, **Then** they and their history are included.

### User story 2 - Import a backup (Priority: P1)
**Acceptance scenarios**:
1. **Given** an empty app (new device or cleared browser), **When** I import a backup, **Then** floor plan, plants and history are restored exactly.
2. **Given** an app with data, **When** I import, **Then** I am warned that current data will be replaced, and must confirm.
3. **Given** an invalid or corrupted file, **Then** I get an error and current data is untouched.
4. **Given** a file with a newer format version than the app supports, **Then** import is refused with a message.

### User story 3 - Reminder to back up (Priority: P2)
1. **Given** no export in the last 30 days and at least one plant, **Then** a small, dismissible banner suggests exporting.

## Requirements
- **FR-001**: Export MUST produce a single JSON file containing all entities and the floor plan image (base64).
- **FR-002**: Import MUST validate the whole file before changing anything; it is all-or-nothing.
- **FR-003**: Import MUST replace all existing data after confirmation (no merging in the pilot).
- **FR-004**: The format MUST carry a version number; the app imports versions it knows.
- **FR-005**: The app MUST remember the date of the last export and show the reminder per story 3.
- **FR-006**: On first save, the app MUST request persistent storage from the browser.

## Edge cases
- Export with a 10 MB image (file ~13.5 MB): must still work on a phone.
- Import interrupted (tab closed): previous data intact.

## Out of scope
- Automatic or cloud backups; merging two backups.
