# 0005: Watering model - light, season and pot size

**Status**: Proposed | **Date**: _TBD_

## Context
Plants need different amounts and frequencies depending on type, light at their spot, season, and pot size. Without sensors the app has to estimate.

## Decision
A simple multiplicative model (architecture section 5): base interval x light factor x season factor; amount = pot volume x water fraction x light factor x season factor. Four fixed seasons from the date. Types with `winterRest` get a much longer winter interval. The next due date uses the season at the last watering, so countdowns never jump.

## Alternatives considered
- **Smooth seasonal curve (daylight hours by date)**: more accurate, harder to explain and test. Possible later.
- **Weather data**: needs a network service; breaks Constitution I and VII.
- **User-entered amounts only**: no help for the "how much" question, which is the point.

## Consequences
- All factors are in one config file and covered by unit tests with worked examples.
- When sensors arrive, measured moisture replaces the interval estimate, but the amount model stays useful.

**Diagrams**: `docs/diagrams/05-watering-model.md`
