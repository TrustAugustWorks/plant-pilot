# Feature spec: Watering and countdown

**Feature**: `002-watering-countdown` | **Status**: Draft | **Created**: _TBD_

Depends on 001. Calculations: `docs/architecture.md` section 5.

## User scenarios & testing

### User story 1 - Water a plant with one tap (Priority: P1)
As anyone in the apartment, I want to tap a plant on the map to record that I watered it.

**Acceptance scenarios**:
1. **Given** watering mode and the Monstera is red, **When** I tap its icon, **Then** a watering event is saved with the current time, the icon turns green, and a toast "Monstera watered - Undo" shows for 10 seconds.
2. **Given** the toast is visible, **When** I tap Undo, **Then** the event is deleted and the icon and list return to their previous state.
3. **Given** I watered the Monstera less than 60 seconds ago, **When** I tap it again, **Then** no second event is saved and the toast says it was just watered.
4. **Given** edit mode is on, **When** I tap a plant, **Then** it is NOT watered (the edit dialog opens instead, see 001).
5. **Given** the list on a phone, **When** I press "Water" in an expanded row, **Then** the same happens as scenario 1.

### User story 2 - See the countdown for every plant (Priority: P1)
As the resident, I want a list next to the map that shows how long until each plant needs water.

**Acceptance scenarios** (today = Wednesday 4 Nov 2026, season autumn, interval factor 1.15):
1. **Given** a Pothos (base 7, bright) last watered 1 Nov, **Then** effective interval is 8 (7 x 1.15 = 8.05), next due 9 Nov, row says "in 5 days".
2. **Given** a Monstera (base 7) in a sun spot last watered 29 Oct, **Then** effective interval is 6 (7 x 0.75 x 1.15 = 6.04), next due 4 Nov, row says "today".
3. **Given** a Basil (base 2, sun) last watered 1 Nov, **Then** effective interval is 2 (2 x 0.75 x 1.15 = 1.73), next due 3 Nov, row says "overdue 1 day".
4. **Given** a Peace lily (base 5) in shade, **Then** effective interval is 7 (5 x 1.3 x 1.15 = 7.48).
5. **Given** several plants, **Then** the list is sorted by days left ascending, grouped "Needs water", "Soon", "OK", ties by name.
6. **Given** the app is open across midnight, **Then** all countdowns update without reload.

### User story 3 - See urgency on the map (Priority: P1)
**Acceptance scenarios**:
1. **Given** days left <= 0, **Then** the icon ring is red and shows "!".
2. **Given** days left is 1 or 2, **Then** the ring is yellow.
3. **Given** days left >= 3, **Then** the ring is green.

### User story 4 - Know how much water to give (Priority: P1)
As anyone watering, I want to see how much water each plant needs so I don't over- or under-water.

**Acceptance scenarios** (formula: `docs/architecture.md` section 5):
1. **Given** the Monstera (24 cm pot, fraction 0.125, sun) in autumn, **Then** the amount is 850 ml (6.91 L x 0.125 x 1.1 x 0.9 = 855 ml -> 850 ml).
2. **Given** the same Monstera in summer, **Then** 1.1 L (x 1.15 instead of 0.9 -> 1093 ml -> 1100 ml); in winter 700 ml (x 0.75 -> 712.8 ml -> 700 ml). Amounts of 1000 ml and above are shown in litres with up to two decimals, e.g. "1.45 L".
3. **Given** a Basil (12 cm pot, fraction 0.15, sun) in autumn, **Then** 150 ml (128.3 ml rounded to 50).
4. **Given** a Cactus (10 cm pot, fraction 0.05, bright) in winter, **Then** 50 ml (18.75 ml, raised to the 50 ml minimum).

_Amended 2026-11-09: all library water fractions were halved after review. The old values (e.g. 1.7 L every 6 days for a 24 cm Monstera) were closer to a full soak-through than to what the soil absorbs, which risks overwatering. A watering should refill roughly the dried top third of the pot, about 10-12% of pot volume for typical foliage plants._
5. **Given** any plant, **Then** the amount is shown in the list row, in the plant info, and on the list's Water button on phones.

### User story 5 - Watering follows the seasons (Priority: P1)
As the resident, I want watering to slow down in winter and speed up in summer without me changing anything.

**Acceptance scenarios**:
1. **Given** today is 4 Nov, **Then** the header says it is autumn and that plants get a little less water, a little less often.
2. **Given** a Monstera (sun) last watered 28 Nov (autumn, interval 6), **Then** next due is 4 Dec, even though winter starts 1 Dec (the season at the last watering counts).
3. **Given** that Monstera is watered on 4 Dec (winter), **Then** its next interval is 7 (7 x 0.75 x 1.4 = 7.35).
4. **Given** a Cactus (base 21, bright, winter rest) watered in winter, **Then** its interval is 42 days (21 x 2.0).
5. **Given** a Cactus watered in summer, **Then** its interval is 18 days (21 x 0.85 = 17.85).

### User story 6 - Correct the last watered date (Priority: P2)
**Acceptance scenarios**:
1. **Given** I forgot to log watering yesterday, **When** I set "last watered" to yesterday in the edit dialog, **Then** a watering event dated yesterday is added and the countdown updates.
2. **Given** I pick a date in the future, **Then** it is rejected.

### Edge cases
- Rounding: `.5` rounds up (6.5 -> 7, 1.5 -> 2). Effective interval is never below 1.
- Daylight saving time changes: days are counted as calendar dates in local time, not 24-hour blocks.
- Device clock wrong or changed backwards: next due is still computed from the latest event by date.
- Undo after the plant was edited or moved within the 10 seconds: undo only removes the watering event.
- Spot light changed: countdown recalculates from the same last watered date.

## Requirements

### Functional requirements
- **FR-001**: In watering mode, tapping a plant icon MUST create a watering event at the current time.
- **FR-002**: After watering, an undo option MUST be shown for 10 seconds; undo deletes that event.
- **FR-003**: A second tap on the same plant within 60 seconds of its last event MUST NOT create an event.
- **FR-004**: Effective interval, next due, days left and status MUST be calculated exactly as in `docs/architecture.md` section 5, with constants in one config file.
- **FR-005**: The list MUST show every non-archived plant with name, type, status and a human countdown text ("overdue N days", "today", "tomorrow", "in N days").
- **FR-006**: The list MUST be sorted and grouped as in story 2 scenario 5.
- **FR-007**: Map icon ring colour MUST reflect status; `due` also shows a non-colour marker.
- **FR-008**: Countdowns MUST refresh at local midnight and when the app regains focus.
- **FR-009**: Users MUST be able to add a past watering date via the edit dialog; future dates are rejected.
- **FR-010**: Domain calculations MUST take "now" from an injected clock (Constitution V).
- **FR-011**: The system MUST show a water amount per plant, calculated from pot size, the type's water fraction, spot light and current season, rounded to 50 ml with a 50 ml minimum.
- **FR-012**: The season MUST be derived from the local date (spring Mar-May, summer Jun-Aug, autumn Sep-Nov, winter Dec-Feb).
- **FR-013**: The interval used for a plant's next due date MUST use the season on the date of its last watering.
- **FR-014**: Plant types with `winterRest` MUST use the winter-rest interval factor in winter.
- **FR-015**: The header MUST show the current season and a one-line explanation of its effect.

### Non-functional requirements
- **NFR-001**: Tap-to-water gives visual feedback within 100 ms.
- **NFR-002**: Status is understandable without colour (text in list, "!" on icon).

## Success criteria
- **SC-001**: Watering a plant is one tap (vision SC-002).
- **SC-002**: At any moment I can see which plants need water within 3 seconds of opening the app.

## Out of scope
- Notifications (later).
- Weather-based adjustment; southern-hemisphere seasons.
- Showing watering history beyond "last watered" (history is stored, not displayed).

## Clarifications (resolved 2026-11-09)
- Factors and thresholds: use the values in architecture section 5 as written; tune after a few weeks of use.
- Rain on balcony plants: ignored in the pilot.
