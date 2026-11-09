# 02 - Build, deploy and runtime

## Pipeline

```mermaid
flowchart LR
  subgraph local["Developer machine"]
    cc["Claude Code<br/>implements tasks.md"] --> git["git push"]
  end
  subgraph ci["GitHub Actions: ci-and-deploy"]
    direction TB
    install["npm ci"] --> lint["lint"] --> unit["unit + component + contract tests<br/>(Vitest)"] --> e2e["end-to-end tests<br/>(Playwright)"] --> build["vite build -> dist/"]
  end
  git --> install
  build -- "main branch only, all green" --> deploy["deploy to GitHub Pages"]
  build -- "pull request" --> stop["no deploy"]
  deploy --> url["https://USER.github.io/REPO/"]
```

## Runtime in the browser

```mermaid
flowchart TB
  url["GitHub Pages URL"] -- "first load" --> shell["index.html + JS bundle + plant-library.json"]
  shell --> app["React app"]
  app --> storage["IndexedDbStorage"]
  storage --> idb[("IndexedDB database 'plant-pilot'<br/>stores: floorPlan, plants, wateringEvents, meta")]
  app -- "on first save" --> persist["navigator.storage.persist()"]
  app -- "Export" --> dl[/"JSON download"/]
  ul[/"JSON file"/] -- "Import" --> app
```

Notes:
- Vite `base` must equal `/<repo-name>/` for Pages.
- No client-side routing with paths (Pages would 404 on refresh); single screen or hash only.
- IndexedDB object stores and their keys are defined in `src/storage/` and nowhere else.
