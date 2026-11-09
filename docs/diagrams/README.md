# Diagrams

All diagrams are Mermaid, so they render on GitHub and Claude Code can read them as text. When a diagram and a spec disagree, the spec wins; fix the diagram in the same commit.

| # | Diagram | Answers | Backs |
|---|---|---|---|
| 01 | [System context](01-context.md) | Who and what does the app touch, and what does it deliberately not touch? | Constitution I, ADR 0001 |
| 02 | [Build, deploy and runtime](02-deployment.md) | How does code get from a commit to the browser? Where does data live? | ADR 0001, 0003, 0004 |
| 03 | [Layers and dependency rules](03-layers.md) | Which folder may import which? | Constitution II, V; ADR 0002 |
| 04 | [Domain model](04-domain-model.md) | Which types exist and how are they related? | Storage contract, export contract |
| 05 | [Watering model](05-watering-model.md) | How are interval, amount, due date and status calculated? | ADR 0005, spec 002 |
| 06 | [UI states](06-ui-states.md) | Which modes and screens exist, and what does a tap do in each? | docs/ui.md, specs 001-002 |
| 07 | [Key sequences](07-sequences.md) | Step by step: startup, water + undo, add, move, export, import | specs 001-003 |
| 08 | [Evolution path](08-evolution.md) | How does the pilot become the Pi version and then the ERP module? | Constitution II, VI |
| 09 | [Test strategy](09-tests.md) | Which layer is tested how, and where do spec scenarios end up? | Constitution IV |
