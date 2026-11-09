# 05 - Watering model

Exact factors: `docs/architecture.md` section 5 and `src/domain/config.ts`.

## Calculation flow

```mermaid
flowchart LR
  subgraph inputs["Inputs"]
    type["PlantType<br/>baseIntervalDays, waterFraction, winterRest"]
    plant["Plant<br/>spotLight, potDiameterCm"]
    last["Last WateringEvent<br/>wateredAt"]
    now["Clock.now()"]
  end

  last --> sLast["season(wateredAt)"]
  now --> sNow["season(today)"]

  type --> intv
  plant --> intv
  sLast --> intv["effectiveInterval =<br/>max(1, round(base x lightI x seasonI))"]

  type --> amt
  plant --> vol["potVolume = d^3 / 2000 L"] --> amt
  sNow --> amt["amount =<br/>max(50, roundTo50(vol x fraction x lightA x seasonA))"]

  last --> due["nextDue = date(wateredAt) + interval"]
  intv --> due
  due --> left["daysLeft = nextDue - today"]
  now --> left
  left --> status{"daysLeft"}
  status -- "<= 0" --> red["due (red, !)"]
  status -- "1-2" --> yellow["soon (yellow)"]
  status -- ">= 3" --> green["ok (green)"]
```

Note the two different seasons: the **interval** uses the season at the last watering (so countdowns never jump), the **amount** uses today's season (so the advice is current).

## Factor tables

```mermaid
flowchart TB
  subgraph light["Spot light"]
    l1["sun: interval x0.75, amount x1.1"]
    l2["bright: x1.0, x1.0"]
    l3["shade: interval x1.3, amount x0.9"]
  end
  subgraph seas["Season (from local date)"]
    s1["spring Mar-May: x1.0, x1.0"]
    s2["summer Jun-Aug: interval x0.85, amount x1.15"]
    s3["autumn Sep-Nov: interval x1.15, amount x0.9"]
    s4["winter Dec-Feb: interval x1.4 (x2.0 if winterRest), amount x0.75"]
  end
```

## Season boundary example

Monstera, base 7, sun spot. Autumn interval = 6 days, winter interval = 7 days.

```mermaid
gantt
  title Monstera across the autumn-winter boundary
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  section Season
  Autumn                 :done,   2026-11-22, 2026-12-01
  Winter                 :active, 2026-12-01, 2026-12-20
  section Watering cycles
  Watered 22 Nov - autumn 6 days :a1, 2026-11-22, 6d
  Watered 28 Nov - still autumn 6 days :a2, 2026-11-28, 6d
  Watered 4 Dec - winter 7 days :a3, 2026-12-04, 7d
  Watered 11 Dec - winter 7 days :a4, 2026-12-11, 7d
```

The cycle starting 28 Nov keeps its autumn interval even though it ends in winter (spec 002, story 5, scenario 2).
