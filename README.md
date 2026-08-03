# Sitetracker Feature Demos

Static Sitetracker-branded demo / onboarding pages. Shared chrome lives at the repo root; each feature is a folder under `demos/`.

**Live URLs:**

- Hub: [https://shankarism.github.io/feature-demos/](https://shankarism.github.io/feature-demos/)
- Activity Tracker: [https://shankarism.github.io/feature-demos/demos/activity-tracker/](https://shankarism.github.io/feature-demos/demos/activity-tracker/)
- Activity Based Scheduling: [https://shankarism.github.io/feature-demos/demos/activity-based-scheduling/](https://shankarism.github.io/feature-demos/demos/activity-based-scheduling/)
- Risk Management: [https://shankarism.github.io/feature-demos/demos/risk-management/](https://shankarism.github.io/feature-demos/demos/risk-management/)

Folder name = URL slug. Use kebab-case (`activity-tracker`, not `Activity Tracker`).

## Current demos

| Demo | Path | Videos folder |
| --- | --- | --- |
| Activity Tracker | `demos/activity-tracker/` | `at-demo-00` … `at-demo-08` |
| Activity Based Scheduling | `demos/activity-based-scheduling/` | `abs-demo-00` … `abs-demo-05` |
| Risk Management | `demos/risk-management/` | `risk-demo-00` … `risk-demo-05` |

Drop matching `.mp4` files into each demo’s `videos/` folder when ready. Until then, the page shows placeholders.

## Local review

```bash
npm run dev
```

- Hub: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- Activity Tracker: [http://127.0.0.1:5173/demos/activity-tracker/](http://127.0.0.1:5173/demos/activity-tracker/)
- Activity Based Scheduling: [http://127.0.0.1:5173/demos/activity-based-scheduling/](http://127.0.0.1:5173/demos/activity-based-scheduling/)
- Risk Management: [http://127.0.0.1:5173/demos/risk-management/](http://127.0.0.1:5173/demos/risk-management/)

## Add a new demo (designers)

Do **not** edit root `css/`, `js/`, or `assets/` unless you are changing the shared template for everyone.

1. Copy the starter folder:

   ```bash
   cp -R demos/_template demos/my-feature-name
   ```

2. Edit `demos/my-feature-name/content.md` (hero + sections + videos + resources).

3. Drop video files into `demos/my-feature-name/videos/`. Filenames must match the `video:` lines in the markdown.

4. Register the demo on the hub by appending to `demos/manifest.json`:

   ```json
   {
     "slug": "my-feature-name",
     "title": "My Feature",
     "description": "One-line summary for the hub"
   }
   ```

5. Push. Pages will serve `/demos/my-feature-name/`.

## `content.md` schema

```md
---
headline: Hero headline
lead: Supporting sentence under the headline.
preparedBy: Your Name
email: you@sitetracker.com
preparedFor: Customers
preparedOn: August 3, 2026
---

# Section title

Full-width section intro (step bar uses this title).

## Video title
time: 45-60s
video: demo-00-overview.mp4

- What this video will show you
- Second learning point

# Resources

- [User guide](https://example.com) — optional display text
- [FAQ](#) — Link coming soon
```

Rules:

- `#` = section (appears in the glass step bar)
- `##` = video row; optional `time:` and `video:` lines; bullets = “You’ll learn”
- `# Resources` = optional link list at the bottom
- Videos live only in that demo’s `videos/` folder

## Layout

```
/
  index.html              Hub (reads demos/manifest.json)
  css/ js/ vendor/ assets/ fonts/   Shared chrome — leave alone
  demos/
    manifest.json         Hub listing
    _template/            Copy this to start a demo
    activity-tracker/
    activity-based-scheduling/
    risk-management/
      index.html          Thin shell (same in every demo)
      content.md          All copy lives here
      videos/             MP4s for this demo only
```

## Stack

- Zero build: the browser loads `content.md` and renders the page
- Lenis smooth scroll (`vendor/lenis.min.js`)
- Self-hosted Barlow
- GitHub Pages (static only)
