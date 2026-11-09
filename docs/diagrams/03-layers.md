# 03 - Layers and dependency rules

```mermaid
flowchart TB
  subgraph appL["src/app  - wiring"]
    main["main.tsx<br/>creates Storage + Clock,<br/>renders App"]
  end
  subgraph uiL["src/ui  - React components"]
    App["App"]
    Header["Header<br/>season summary, Edit toggle,<br/>Export, Import"]
    MapView["MapView<br/>floor plan + PlantMarkers"]
    Marker["PlantMarker"]
    Tip["PlantInfo<br/>(tooltip / expanded row)"]
    List["CountdownList"]
    Dlg["PlantDialog<br/>add / edit / remove"]
    Toast["UndoToast"]
  end
  subgraph domainL["src/domain  - pure functions"]
    cfg["config.ts<br/>all factors + thresholds"]
    season["season.ts"]
    calc["watering.ts<br/>interval, amount, nextDue,<br/>daysLeft, status"]
    sort["countdown.ts<br/>sort + group + texts"]
  end
  subgraph storageL["src/storage"]
    iface["Storage interface"]
    idbImpl["IndexedDbStorage"]
    memImpl["InMemoryStorage<br/>(tests)"]
  end
  subgraph dataL["src/data"]
    lib["plant-library.json"]
  end
  clock["Clock interface<br/>now()"]

  main --> App
  main --> idbImpl
  main --> clock
  App --> Header & MapView & List & Dlg & Toast
  MapView --> Marker --> Tip
  uiL --> calc
  uiL --> sort
  uiL --> iface
  calc --> season --> cfg
  calc --> cfg
  sort --> calc
  calc --> lib
  idbImpl -. implements .-> iface
  memImpl -. implements .-> iface
  uiL --> clock
```

## Rules (enforce with lint rules / review)

| From | May import | Must NOT import |
|---|---|---|
| `src/domain` | `src/domain`, types from `src/data` | React, `src/storage`, `src/ui`, `Date.now()` / `new Date()` without argument |
| `src/storage` | `src/domain` types | React, `src/ui` |
| `src/ui` | `src/domain`, `Storage` interface, `Clock` | `IndexedDbStorage` directly, `indexedDB` API |
| `src/app` | everything | - |

Why: domain stays 100% unit-testable with a fixed clock (Constitution V); storage can be swapped for the Pi server by changing only `src/app` (Constitution II, diagram 08).
