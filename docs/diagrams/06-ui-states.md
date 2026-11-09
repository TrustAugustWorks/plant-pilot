# 06 - UI states

## App modes

```mermaid
stateDiagram-v2
  [*] --> Loading
  Loading --> NoFloorPlan: no floor plan stored
  Loading --> Watering: floor plan stored

  NoFloorPlan --> Watering: upload valid image
  NoFloorPlan --> ImportConfirm: Import file

  state Watering {
    [*] --> Idle
    Idle --> UndoToast: tap plant (event saved)
    UndoToast --> Idle: Undo (event deleted)
    UndoToast --> Idle: 10 s elapsed
    UndoToast --> UndoToast: tap another plant (new toast replaces old)
  }

  Watering --> Edit: toggle Edit map on
  Edit --> Watering: Done / toggle off

  state Edit {
    [*] --> Editing
    Editing --> AddDialog: click empty spot
    Editing --> EditDialog: click plant
    Editing --> Dragging: drag plant
    Dragging --> Editing: drop inside image (saved)
    Dragging --> Editing: drop outside (cancelled)
    AddDialog --> Editing: Add (saved) / Cancel
    EditDialog --> Editing: Save / Cancel
    EditDialog --> RemoveConfirm: Remove plant
    RemoveConfirm --> Editing: Confirm (archived) / Cancel
    Editing --> ReplacePlan: Replace floor plan
    ReplacePlan --> Editing: upload (plants kept) / Cancel
  }

  Watering --> ImportConfirm: Import file
  ImportConfirm --> Watering: valid + confirmed (all data replaced)
  ImportConfirm --> Watering: invalid / cancelled (nothing changed)
```

## What a pointer action on a plant does

| Action | Watering mode | Edit mode |
|---|---|---|
| Tap / click plant | Water it + undo toast (ignored if watered < 60 s ago) | Open edit dialog |
| Hover / keyboard focus | Show plant info tooltip | Show plant info tooltip |
| Drag plant | Nothing | Move it |
| Click empty map | Nothing | Open add dialog at that spot |
| Tap list row | Expand plant info + Water button | Expand plant info |

## Plant status over time

```mermaid
stateDiagram-v2
  [*] --> ok: watered (daysLeft >= 3)
  [*] --> soon: watered, short interval (daysLeft 1-2)
  ok --> soon: day passes, daysLeft = 2
  soon --> due: day passes, daysLeft = 0
  due --> due: day passes (overdue grows)
  soon --> ok: watered
  due --> ok: watered
  due --> soon: watered, interval <= 2 days
  ok --> ok: watered early
```
