# 0004: GitHub Pages deployed by GitHub Actions

**Status**: Proposed | **Date**: _TBD_

## Decision
A workflow builds the site on every push to `main` after tests pass and deploys to GitHub Pages. Vite `base` is set to the repository name.

## Consequences
The site URL is public; acceptable because the site contains no data (Constitution I). Hash-based routing (or no routing) to avoid 404s on refresh.

**Diagrams**: `docs/diagrams/02-deployment.md`
