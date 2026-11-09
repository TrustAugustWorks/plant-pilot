# Feature spec: Calendar reminders

**Feature**: `004-calendar-reminders` | **Status**: Approved | **Created**: 2026-11-09

Depends on 002 (next due, interval, amount). Requested by the user: "a calendar link I can copy so it can give me notification when to water the plants". The user's calendar is Outlook / Microsoft 365.

## Why not a live subscription link?
A calendar subscription URL ("Subscribe from web" in Outlook) must be served by a server that recalculates the feed. GitHub Pages serves static files only and the data lives only in the browser (ADR 0001, Constitution I and VII). A live feed comes with the Raspberry Pi server later. For the pilot the app generates reminders the user adds to Outlook once and refreshes when the schedule changes.

## User scenarios & testing

### User story 1 - Get all reminders into Outlook (Priority: P1)
**Acceptance scenarios** (today = Wed 4 Nov 2026):
1. **Given** plants exist, **When** I open "Calendar" and press "Download calendar file", **Then** a file `plant-watering.ics` downloads with one reminder event per planned watering for every active plant, for the next 12 months.
2. **Given** a Monstera (base 7, sun, 24 cm) next due 4 Nov, **Then** its events are on 4 Nov, 10 Nov (autumn interval 6), 16 Nov, 22 Nov, 28 Nov, 4 Dec, 11 Dec (winter interval 7, from 4 Dec on)... and each event title says "Water Monstera (1.7 L)" with that day's season amount ("1.45 L" in winter).
3. **Given** a plant is overdue, **Then** its first reminder is today.
4. **Given** the reminder time is 09:00, **Then** every event starts 09:00 local time, lasts 15 minutes and has a reminder alarm at the start time.
5. **Given** I import the file into Outlook, **Then** each event's description contains the amount, the care note and the app's address.

### User story 2 - Copy a link for one plant (Priority: P1)
**Acceptance scenarios**:
1. **Given** a plant row in the Calendar dialog, **When** I press "Copy Outlook link", **Then** a link to Outlook's "new event" page for that plant's next watering (title, time, description prefilled) is copied to the clipboard and a toast confirms it.
2. **Given** I choose "Work or school (Microsoft 365)", **Then** links use `outlook.office.com`; with "Personal (Outlook.com)" they use `outlook.live.com`.
3. **Given** I press "Open" instead, **Then** the same link opens in a new tab.

### User story 3 - Know when my calendar is out of date (Priority: P2)
**Acceptance scenarios**:
1. **Given** I downloaded the calendar file, **When** I later water a plant on another day than planned, add, remove or edit a plant, **Then** the Calendar button shows a dot and the dialog says "Your calendar is out of date. Download it again."
2. **Given** nothing changed since the download, **Then** no warning is shown.

## Requirements
- **FR-001**: The app MUST generate an iCalendar (RFC 5545) file with VEVENTs for every active plant's planned waterings from today up to 365 days ahead.
- **FR-002**: Planned waterings MUST assume each watering happens on its due date and apply the interval of the season on that date (same rule as 002 FR-013).
- **FR-003**: Each event MUST have a stable UID `<plantId>-<YYYYMMDD>@plant-pilot`, a title "Water <name> (<amount>)", local start time (default 09:00, user-settable), 15-minute duration, and a DISPLAY alarm at the start.
- **FR-004**: The app MUST offer a copyable Outlook "new event" link per plant for its next watering, for Microsoft 365 or Outlook.com.
- **FR-005**: The app MUST remember the reminder time, the Outlook account kind, and a fingerprint (plant id + next due + interval + amount) of the last download, and show an out-of-date warning when the current fingerprint differs.
- **FR-006**: Calendar data leaves the device only when the user downloads the file or copies/opens a link (user-initiated; Constitution I).
- **FR-007**: All calendar generation is pure domain code using the injected clock.

## Edge cases
- No plants: download disabled with a hint.
- Plant names with commas, semicolons, Danish letters: escaped and UTF-8, lines folded at 75 octets.
- Re-import into Outlook: Outlook may add duplicates. The dialog advises importing into a separate "Plants" calendar and replacing it when refreshing.

## Out of scope
- A live subscription URL (needs the Pi server).
- Push/browser notifications.
