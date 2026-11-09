# 01 - System context

The app is a static website. Everything personal stays in the browser of one shared device in the apartment. GitHub only serves code.

```mermaid
flowchart LR
  me(["Me<br/>sets up map and plants, waters"])
  others(["Others in the apartment<br/>water plants"])
  dev(["Me as developer<br/>+ Claude Code"])

  subgraph device["Shared device in the apartment (tablet / laptop / phone)"]
    app["Plant Watering Pilot<br/>static web app in the browser"]
    db[("IndexedDB<br/>floor plan + plants + watering history")]
    file[/"Backup file<br/>plants-backup-YYYY-MM-DD.json"/]
  end

  subgraph github["GitHub"]
    repo["Repository<br/>specs, code, tests"]
    actions["GitHub Actions<br/>test, build, deploy"]
    pages["GitHub Pages<br/>serves static files (public URL)"]
  end

  me --> app
  others --> app
  app <--> db
  app -- "export / import" --> file
  dev -- "push" --> repo --> actions --> pages
  pages -- "HTML, JS, CSS, plant library<br/>(no personal data)" --> app

  cloud["Cloud databases, analytics,<br/>weather APIs, accounts"]
  app -. "never (Constitution I and VII)" .-> cloud
  style cloud stroke-dasharray: 5 5
```

Key points for implementation:
- No request ever leaves the browser except loading the app itself from GitHub Pages.
- The floor plan image is uploaded by the user into IndexedDB; it is never part of the repo or the build.
- Anyone can open the public URL but sees an empty app, because data is per browser.
