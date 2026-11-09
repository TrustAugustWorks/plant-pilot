# 04 - Domain model

## Types (TypeScript, see contracts for exact definitions)

```mermaid
classDiagram
  direction LR
  class FloorPlan {
    +Blob image
    +string mimeType
    +number widthPx
    +number heightPx
    +string uploadedAt
  }
  class PlantType {
    +string id
    +string name
    +string nameDa
    +number baseIntervalDays
    +LightLevel lightPreference
    +number waterFraction
    +boolean winterRest
    +boolean outdoorOk
    +IconName icon
    +string careNote
    +string[] sources
  }
  class Plant {
    +string id
    +string typeId
    +string name
    +Position position
    +LightLevel spotLight
    +number potDiameterCm
    +string createdAt
    +string archivedAt
  }
  class Position {
    +number x
    +number y
  }
  class WateringEvent {
    +string id
    +string plantId
    +string wateredAt
    +string source
  }
  class PlantStatus {
    <<derived>>
    +Season seasonAtLastWatering
    +number effectiveIntervalDays
    +number amountMl
    +string nextDue
    +number daysLeft
    +Status status
  }
  class Storage {
    <<interface>>
    +getFloorPlan()
    +saveFloorPlan(plan)
    +listPlants(opts)
    +savePlant(plant)
    +archivePlant(id, at)
    +listWateringEvents(plantId)
    +getLastWatering(plantId)
    +addWateringEvent(event)
    +deleteWateringEvent(id)
    +exportAll()
    +replaceAll(data)
    +getMeta(key)
    +setMeta(key, value)
  }
  class Clock {
    <<interface>>
    +now() Date
  }

  FloorPlan "1" .. "0..*" Plant : positions are relative to
  PlantType "1" <-- "0..*" Plant : typeId
  Plant "1" *-- "1" Position
  Plant "1" <-- "1..*" WateringEvent : plantId
  Plant ..> PlantStatus : computed from plant + type + last event + clock
```

## Storage view

```mermaid
erDiagram
  FLOOR_PLAN ||--o{ PLANT : "shown on"
  PLANT_TYPE ||--o{ PLANT : "is of"
  PLANT ||--|{ WATERING_EVENT : has
  META {
    string key
    string value
  }
```

Rules:
- `Position.x`/`y` are 0..1 relative to the image. `WateringEvent.source` is `manual` or `sensor` (reserved). `PlantStatus.status` is `ok`, `soon` or `due`.
- `PlantType` lives in `plant-library.json`, never in IndexedDB. Plants reference it by `typeId`.
- `PlantStatus` is always computed, never persisted; recomputed on every render, at midnight, and on focus.
- Removing a plant sets `archivedAt`; watering events are kept.
