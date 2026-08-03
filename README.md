# Sitetracker Feature Demos

Static Sitetracker-branded demo / onboarding pages. Shared chrome lives at the repo root; each feature is a folder under `demos/`.

**Live URLs:**

- Hub: [https://shankarism.github.io/feature-demos/](https://shankarism.github.io/feature-demos/)
- Demo pattern: `https://shankarism.github.io/feature-demos/demos/{folder-name}/`

Folder name = URL slug. Use kebab-case (`activity-tracker`, not `Activity Tracker`).

## Add a new demo (designers)

Do **not** edit root `css/`, `js/`, `assets/`, or `demos/manifest.json`. The hub list is generated automatically.

1. Create a folder and add markdown:

   ```bash
   mkdir -p demos/my-feature-name/videos
   # easiest: start from the template
   cp -R demos/_template demos/my-feature-name
   ```

2. Edit only `demos/my-feature-name/content.md`.

3. For each clip, set `video:` to either:
   - a **Loom** share/embed URL, or
   - an **MP4 filename** that you put in `demos/my-feature-name/videos/`

4. Push. GitHub Actions regenerates the hub manifest; Pages serves `/demos/my-feature-name/`.

If `index.html` is missing in your folder, the generate script copies it from `_template` for you.

## Videos: Loom or MP4

```md
## What is Activity Tracker?
time: 45-60s
video: https://www.loom.com/share/abc123def456

## Create a Project Tracker
time: 60-90s
video: at-demo-01-create-tracker.mp4
```

- Loom → embedded player (no upload)
- `.mp4` → file in that demo’s `videos/` folder; placeholder until the file exists

## Local review

```bash
npm run dev
```

This regenerates `demos/manifest.json` from every folder under `demos/` that has a `content.md`, then serves the site.

- Hub: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

Manual regenerate only:

```bash
npm run manifest
```

## `content.md` schema

```md
---
title: Short hub title
headline: Hero headline
lead: Supporting sentence under the headline.
preparedBy: Your Name
email: you@sitetracker.com
preparedFor: Customers
preparedOn: August 3, 2026
order: 10
---

# Section title

Full-width section intro (step bar uses this title).

## Video title
time: 45-60s
video: https://www.loom.com/share/...

- What this video will show you
- Second learning point

# Resources

- [User guide](https://example.com) — optional display text
- [FAQ](#) — Link coming soon
```

Rules:

- `#` = section (appears in the glass step bar)
- `##` = video row; optional `time:` and `video:` (Loom URL or MP4 name); bullets = “You’ll learn”
- `# Resources` = optional link list at the bottom
- `title` / `lead` / `order` drive the hub card (order is optional; lower comes first)
- Folders starting with `_` (like `_template`) are ignored by the hub

## Layout

```
/
  index.html              Hub (reads generated demos/manifest.json)
  css/ js/ vendor/ assets/ fonts/   Shared chrome — leave alone
  scripts/generate-manifest.js      Builds the hub list from folders
  demos/
    manifest.json         Auto-generated — do not edit by hand
    _template/            Copy this to start a demo
    my-feature-name/
      index.html          Thin shell (auto-copied if missing)
      content.md          All copy + Loom/MP4 references
      videos/             Optional MP4s for this demo
```

## Stack

- Zero app build: the browser loads `content.md` and renders the page
- Hub manifest: Node script + GitHub Action (static hosting cannot list folders)
- Lenis smooth scroll, self-hosted Barlow, GitHub Pages
