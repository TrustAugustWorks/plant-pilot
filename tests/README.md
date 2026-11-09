# Tests

Tests are written from acceptance scenarios before implementation (Constitution IV).

| Folder | What | Tool |
|---|---|---|
| `unit/` | Domain calculations: effective interval, rounding, days left, status, DST | Vitest |
| `component/` | UI components: dialogs, list sorting, toast/undo, modes | Vitest + Testing Library |
| `contract/` | `Storage` implementations pass the same suite | Vitest + fake-indexeddb |
| `e2e/` | Full user stories in a real browser (desktop + phone viewport) | Playwright |

Rules:
- Test names include requirement IDs: `spec002_FR004_shade_factor_rounds_6_5_to_7`.
- Use a fixed clock. The worked examples in `specs/002-watering-countdown/spec.md` (today = 4 Nov 2026) are ready-made test cases.
- Generate test floor plan images in the test; never commit a real floor plan.
