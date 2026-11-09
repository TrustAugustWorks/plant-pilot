# Feature spec: Map and plants

**Feature**: `001-map-and-plants` | **Status**: Draft | **Created**: _TBD_

Related: `docs/ui.md` (layout, modes, dialogs), `docs/glossary.md`.

## User scenarios & testing

### User story 1 - Upload my floor plan (Priority: P1)
As the resident, I want to upload an image of my floor plan so that I can place my plants where they really are.

**Independent test**: Open the app for the first time, upload an image, reload, image is still shown.

**Acceptance scenarios**:
1. **Given** no floor plan exists, **When** I open the app, **Then** I see an empty state with an "Upload floor plan" button and nothing else except Import.
2. **Given** the empty state, **When** I upload a JPEG/PNG/WebP up to 10 MB, **Then** it is shown as the map, scaled to fit the available width while keeping its aspect ratio.
3. **Given** a floor plan is shown, **When** I reload the page, **Then** the same floor plan is shown.
4. **Given** I upload a PDF or a 15 MB image, **Then** I get a clear error and nothing is saved.
5. **Given** a floor plan with plants exists, **When** I replace it in edit mode, **Then** I am warned that plant positions stay at the same relative coordinates and may need moving, and plants are kept.

### User story 2 - Add a plant to the map (Priority: P1)
As the resident, I want to add a plant by clicking where it stands on the map.

**Acceptance scenarios**:
1. **Given** edit mode is on, **When** I click an empty spot on the map, **Then** the "Add plant" dialog opens with that position.
2. **Given** the dialog, **When** I pick "Monstera", keep the defaults and save, **Then** a Monstera icon appears at that spot, named "Monstera", spot light "bright" (the type's preference), pot size 14 cm, last watered today.
3. **Given** a plant named "Monstera" exists, **When** I add another Monstera, **Then** its default name is "Monstera 2".
4. **Given** the dialog, **When** I try to save without a plant type, **Then** saving is blocked with a message.
5. **Given** I search "monst" or the Danish name in the type dropdown, **Then** Monstera is offered.
6. **Given** edit mode is off, **When** I click an empty spot, **Then** nothing happens.

### User story 3 - Move a plant (Priority: P1)
As the resident, I want to drag a plant to a new spot, for example from the balcony inside for winter.

**Acceptance scenarios**:
1. **Given** edit mode is on, **When** I drag the Basil icon from the balcony to the kitchen and drop it, **Then** it stays there after reload.
2. **Given** edit mode is on, **When** I drop a plant outside the floor plan image, **Then** it returns to its previous position.
3. **Given** I moved a plant, **Then** its watering history and countdown are unchanged.
4. **Given** edit mode is off, **When** I drag a plant icon, **Then** it does not move.

### User story 4 - Edit or remove a plant (Priority: P1)
**Acceptance scenarios**:
1. **Given** edit mode is on, **When** I click a plant, **Then** the "Edit plant" dialog opens with its current values.
2. **Given** the edit dialog, **When** I change spot light from bright to sun and save, **Then** its effective interval updates (see 002).
3. **Given** the edit dialog, **When** I press "Remove plant" and confirm, **Then** the plant disappears from map and list.
4. **Given** the confirmation, **When** I cancel, **Then** nothing changes.

### User story 5 - See information about a plant (Priority: P2)
As the resident, I want to hover a plant and see its needs, such as sun or shade.

**Acceptance scenarios**:
1. **Given** watering mode on desktop, **When** I hover a plant, **Then** a tooltip shows the fields listed in `docs/ui.md` ("Plant info").
2. **Given** a Cactus (prefers sun) placed in a shade spot, **Then** the info shows a mismatch warning.
3. **Given** a phone, **When** I tap the plant's row in the list, **Then** the row expands with the same information.
4. **Given** keyboard use, **When** a plant icon has focus, **Then** the tooltip is shown.

### Edge cases
- Very tall or very wide floor plan images.
- Window resized or phone rotated: icons keep their relative positions.
- Two plants placed on almost the same spot: both remain clickable (icons may overlap slightly; the topmost is the most recently moved).
- Many plants (50): map and list stay responsive.
- Removing the last plant: map stays, list shows "No plants yet".

## Requirements

### Functional requirements
- **FR-001**: Users MUST be able to upload a floor plan image (JPEG, PNG, WebP, max 10 MB); other files are rejected with an error.
- **FR-002**: The floor plan MUST be stored in the browser and never sent anywhere (Constitution I).
- **FR-003**: There MUST be exactly one floor plan; it can be replaced in edit mode, keeping plants and their relative positions.
- **FR-004**: The app MUST have an edit mode toggle; adding, moving, editing and removing plants is only possible in edit mode.
- **FR-005**: In edit mode, clicking an empty map spot MUST open the add dialog at that position.
- **FR-006**: A plant MUST have a plant type (from the library), a name, a position (relative 0..1), a spot light (sun/bright/shade), a pot diameter (5-60 cm) and at least one watering event.
- **FR-007**: The add dialog MUST default name to the type's name (numbered if taken), spot light to the type's preference, pot size to 14 cm, and last watered to today; it MUST preview next watering date and amount.
- **FR-008**: In edit mode, plants MUST be movable by drag and drop with mouse and touch; drops outside the image are cancelled.
- **FR-009**: Removing a plant MUST require confirmation and MUST archive it (history kept, hidden from map and list).
- **FR-010**: The app MUST ship with a built-in plant library (`src/data/plant-library.json`, schema in `contracts/plant-library.md`).
- **FR-011**: Plant info MUST be available by hover and keyboard focus on desktop, and by expanding the list row on any device.
- **FR-012**: Plant info MUST warn when spot light differs from the type's light preference.
- **FR-013**: All data access MUST go through the storage interface in `contracts/storage-interface.md`.

### Non-functional requirements
- **NFR-001**: Every change is persisted before the UI shows it as done.
- **NFR-002**: Positions are stored relative to the image so they are independent of screen size.

### Key entities
FloorPlan, PlantType, Plant (see `docs/architecture.md` section 4).

## Success criteria
- **SC-001**: I can upload my floor plan and place 10 plants in under 15 minutes.

## Out of scope
- Drawing or editing the floor plan itself; rooms as data.
- Plant photos, custom plant types (later; see clarification below).

## Clarifications (resolved 2026-11-09)
- Custom plant types: not in the pilot. "Pick the closest type" is enough.
- Plants owned: a Monstera (living room) and a palm of unknown species; see `docs/my-plants.md`. The library gets several indoor palms to choose from.

## Review checklist
- [x] No implementation details beyond those fixed in the constitution/architecture
- [x] No `[NEEDS CLARIFICATION]` markers remain
- [x] Consistent with constitution and glossary
