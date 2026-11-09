# Contract: Plant library

File: `src/data/plant-library.json`. Static, shipped with the app. Maintained by the `plant-librarian` subagent (`.claude/agents/plant-librarian.md`).

```ts
export interface PlantType {
  id: string;                 // kebab-case, stable forever (stored in plants and exports)
  name: string;               // English
  nameDa: string;             // Danish
  baseIntervalDays: number;   // integer >= 1: days between waterings in spring, bright indirect light
  lightPreference: 'sun' | 'bright' | 'shade';
  waterFraction: number;      // 0.05..0.4: share of pot volume per watering
  winterRest: boolean;        // nearly dormant in winter (cacti, succulents, some others)
  outdoorOk: boolean;         // can live on the balcony in summer
  icon: 'leaf' | 'sprout' | 'flower' | 'cactus' | 'tree' | 'herb' | 'fruit'; // line icon name, no emoji
  careNote: string;           // max 120 chars, plain language
  sources: string[];          // at least 2 URLs backing interval, light and water needs
}
```

Rules:
- ids unique; never remove or rename an id once released.
- Values are typical indoor guidance in a Danish climate, not exact botany.
- `baseIntervalDays` is for spring; summer/autumn/winter come from the season factors, so do not bake seasons into it.
