# Tasks: [FEATURE NAME]

**Input**: spec.md, plan.md, data-model.md, contracts/

Format: `- [ ] T001 [P] [US1] Description (file path)`
- `[P]` = can run in parallel (different files, no dependency)
- `[USn]` = user story it belongs to

## Phase 1: Setup
- [ ] T001 ...

## Phase 2: Foundation (blocks all stories)
- [ ] T00x ...

## Phase 3: User story 1 (P1)
### Tests first (MUST fail before implementation)
- [ ] T0xx [P] [US1] Contract test for ... (tests/contract/...)
- [ ] T0xx [P] [US1] Integration test for acceptance scenario 1 (tests/integration/...)
### Implementation
- [ ] T0xx [US1] ...

## Phase N: Polish
- [ ] T0xx Update quickstart.md, docs

## Dependencies
- Foundation before all stories; tests before implementation within a story.
