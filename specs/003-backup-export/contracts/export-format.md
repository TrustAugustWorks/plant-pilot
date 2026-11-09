# Contract: Export file format v1

Also the migration format into the home ERP. Changes require a new `formatVersion`.

```json
{
  "format": "plant-pilot-export",
  "formatVersion": 1,
  "exportedAt": "2026-11-04T18:30:00.000Z",
  "appVersion": "0.1.0",
  "floorPlan": {
    "mimeType": "image/jpeg",
    "widthPx": 1150,
    "heightPx": 720,
    "uploadedAt": "2026-11-04T17:00:00.000Z",
    "imageBase64": "..."
  },
  "plants": [
    {
      "id": "6f1c...",
      "typeId": "monstera",
      "name": "Monstera",
      "position": { "x": 0.31, "y": 0.62 },
      "spotLight": "bright",
      "potDiameterCm": 24,
      "createdAt": "2026-11-04T17:05:00.000Z",
      "archivedAt": null
    }
  ],
  "wateringEvents": [
    { "id": "a92e...", "plantId": "6f1c...", "wateredAt": "2026-11-04T17:05:00.000Z", "source": "manual" }
  ]
}
```

Validation rules: all ids unique; every `wateringEvents[].plantId` exists in `plants`; `position.x/y` in [0,1]; `spotLight` in {sun, bright, shade}; `potDiameterCm` integer 5-60; `typeId` must exist in the app's library (unknown types -> import refused with list of unknown ids); timestamps ISO 8601 UTC. `floorPlan` may be null.
