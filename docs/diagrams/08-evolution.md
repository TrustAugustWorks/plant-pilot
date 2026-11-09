# 08 - Evolution path

Why the storage interface exists: each later step replaces or adds one piece, and the domain and UI stay as they are.

```mermaid
flowchart LR
  subgraph p1["Phase 1 - Pilot (now)"]
    ui1["UI"] --> dom1["Domain"]
    ui1 --> st1["Storage interface"] --> idb1["IndexedDbStorage<br/>one device"]
  end

  subgraph p2["Phase 2 - Raspberry Pi (later)"]
    ui2["Same UI"] --> dom2["Same domain"]
    ui2 --> st2["Storage interface"] --> http2["HttpStorage<br/>REST client"]
    http2 --> pi["Pi server<br/>same contract tests"] --> db2[("Database on the Pi")]
    pi --> notify["Notifications"]
  end

  subgraph p3["Phase 3 - Sensors"]
    esp["ESP32 moisture sensors"] -- "reading v1" --> pi3["Pi server"]
    pi3 --> ev["WateringEvent source = sensor"]
  end

  subgraph p4["Phase 4 - Home ERP"]
    erp["ERP module 004 plant-care<br/>+ 005 sensor-ingestion"]
  end

  idb1 -- "export file v1" --> pi
  p2 --> p3
  pi -- "export / shared glossary" --> erp
```

## What changes at each step

| Step | Added | Replaced | Unchanged |
|---|---|---|---|
| Pilot -> Pi | `HttpStorage`, Pi server, notifications | storage selection in `src/app` | domain, UI, export format |
| Pi -> Sensors | ingestion on the Pi, firmware | - | `WateringEvent` (source `sensor` already reserved) |
| -> ERP | plant becomes an ERP inventory item | pilot app shell | glossary terms, watering model, export file as migration |

Design decisions taken now so these steps stay cheap: Constitution II (storage interface), VI (ERP glossary), versioned export format, `source` field on watering events.
