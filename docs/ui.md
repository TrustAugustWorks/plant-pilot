# UI design

## Floor plan
The user uploads their own image. A clean redrawn plan (`floorplan-clean.svg`, kept outside the repo) is the recommended upload: no furniture, room names, orientation hints, north arrow.

The header summary line also shows the current season and what it means, e.g. "Autumn: a little less often, a little less water".

## Layout

Desktop (>= 900 px):
```
+----------------------------------------------------------------------+
| Plant Watering            [ Edit map: off ]   [Export] [Import]      |
+---------------------------------------------+------------------------+
|                                             | Needs water            |
|              FLOOR PLAN                     | (R) Basil    overdue 1d|
|                                             | (R) Monstera   today   |
|      (G)            (R)                     |------------------------|
|           (Y)                               | Soon                   |
|                         (G)                 | (Y) Pothos   in 2 days |
|                                             |------------------------|
|                                             | OK                     |
|                                             | (G) Cactus   in 15 days|
+---------------------------------------------+------------------------+
```
Phone (< 900 px): map on top (full width), list below.

## Modes

### Watering mode (default, edit off)
- **Tap / click a plant icon**: logs a watering immediately. A toast shows "<name> watered - Undo" for 10 seconds.
- **Hover a plant icon (desktop)**: tooltip with plant info (see below).
- **List row**: tap to expand and show the same plant info (works on phone, where hover doesn't exist). The row also has a "Water" button.
- Plants cannot be moved or deleted in this mode.

### Edit mode (toggle on)
- A visible banner "Editing map - tap Done when finished".
- **Click an empty spot on the map**: opens "Add plant" dialog with the position preset.
- **Drag a plant icon**: moves it (e.g. balcony -> living room in winter). Saved on drop.
- **Click a plant icon**: opens "Edit plant" dialog (name, type, spot light, last watered) with a "Remove plant" button (asks for confirmation).
- **Replace floor plan** button.
- Tapping plants does NOT water them in edit mode.

### First run (no floor plan yet)
Empty state with explanation and an "Upload floor plan" button. Nothing else is available until a floor plan exists (except Import).

## Plant info (tooltip and expanded list row)
- Name and plant type (English + Danish name)
- Light preference of the type, e.g. "Likes: bright, indirect light"
- Spot light, e.g. "This spot: sun"
- Warning if spot and preference mismatch, e.g. "This spot may be too sunny"
- Effective interval with its inputs, e.g. "Water every 6 days (base 7 · sun · autumn)"
- Water amount, e.g. "Give about 850 ml (24 cm pot)"
- Last watered, e.g. "3 days ago (Mon 2 Nov)"
- Next due, e.g. "in 2 days (Fri 6 Nov)" or "overdue by 1 day"
- Care note from the library

## Plant icon
- Round 44 px marker with the plant type's line icon (icon name from the library, drawn with Lucide-style stroke icons; no emoji).
- Ring colour by status: green (ok), yellow (soon), red (due). Red icons also show a small "!" so status isn't colour-only.
- Plant name as accessible label; short name shown below icon when the map is wide enough.

## Add / edit plant dialog
| Field | Input | Default |
|---|---|---|
| Plant type | Searchable dropdown (English and Danish names) | - (required) |
| Name | Text | Type name, e.g. "Monstera" (numbered if duplicate: "Monstera 2") |
| Spot light | Three buttons: Sun / Bright / Shade | Type's light preference |
| Pot size (diameter, cm) | Number, 5-60 | 14 |
| Last watered | Date picker | Today |

Below the fields the dialog previews: next watering date, amount and interval for the current season.

## Countdown list
- Sorted by days left ascending (most overdue first); ties sorted by name.
- Grouped: "Needs water" (due), "Soon", "OK".
- Each row: status icon + name + type/room + countdown text ("overdue 2 days", "today", "tomorrow", "in N days") with the water amount underneath, and a Water button.
- Updates automatically at midnight and when the app regains focus.
