# Sitetracker Feature Demos

Customer-facing demo / onboarding pages for Sitetracker features. One shared site; each feature is its own folder under `demos/`.

**Live site**

| What | URL |
| --- | --- |
| Hub | [https://shankarism.github.io/feature-demos/](https://shankarism.github.io/feature-demos/) |
| A demo | `https://shankarism.github.io/feature-demos/demos/{folder-name}/` |

Example: [Activity Tracker](https://shankarism.github.io/feature-demos/demos/activity-tracker/)

---

## For designers — end to end

You only need to add a folder with a markdown file (and optional Loom links or MP4s). You do **not** edit layout CSS/JS or `manifest.json`.

### Option A — ask your AI tool (recommended)

You can do this entirely with Cursor (or similar). Open this repo in the tool and paste a prompt like:

```text
Add a new Sitetracker feature demo using this repo’s README rules.

Feature slug (kebab-case folder name): <e.g. field-ops-mobile>
Feature hub title: <e.g. Field Ops Mobile>
Hero headline: <one line>
Lead / short description: <one or two sentences>
Prepared by: <Your Name>
Email: <you@sitetracker.com>
Prepared for: Customers
Prepared on: <today’s date>

Sections and videos:
1. Section: Overview
   - Video: <title> | time: 45-60s | Loom: <url> OR file: <name.mp4>
   - Learn: <bullet>, <bullet>, <bullet>
2. Section: …
   - …

Copy demos/_template → demos/<slug>, write content.md to the schema in README,
put any MP4s in videos/, do not touch root css/js/assets or manifest.json,
then commit and push if I ask.
```

Point the AI at this README and at `demos/_template/content.md` and `demos/activity-tracker/content.md` as examples.

### Option B — do it yourself (step by step)

#### 1. Get the repo

You need access to [shankarism/feature-demos](https://github.com/shankarism/feature-demos).

```bash
git clone https://github.com/shankarism/feature-demos.git
cd feature-demos
```

If you already have a clone:

```bash
git pull origin master
```

#### 2. Create your demo folder

Folder name = URL slug. Use **kebab-case** only (`risk-management`, not `Risk Management`).

```bash
cp -R demos/_template demos/my-feature-name
```

That gives you:

```text
demos/my-feature-name/
  index.html      ← leave as-is (shared shell)
  content.md      ← edit this (all copy lives here)
  videos/         ← optional MP4s
```

#### 3. Write `content.md`

Open `demos/my-feature-name/content.md`. Replace the template with your feature content.

**Frontmatter (top of the file)**

| Field | Purpose |
| --- | --- |
| `title` | Short name on the hub card |
| `headline` | Large hero text on the demo page |
| `lead` | One supporting sentence under the headline |
| `preparedBy` / `email` / `preparedFor` / `preparedOn` | Hero byline |
| `order` | Hub sort order (lower = higher). Optional; default is fine |

**Body structure**

| Markdown | Becomes |
| --- | --- |
| `# Section title` | Step in the top ToC / full-width section intro |
| Paragraph under `#` | Section description |
| `## Video title` | One video row |
| `time: 45-60s` | Duration line under the video title |
| `video: …` | Loom URL **or** MP4 filename in `videos/` |
| `- bullet` | “What this video will show you” list |
| `# Resources` | Optional links at the bottom |

Full example:

```md
---
title: My Feature
headline: One clear hero line about the feature
lead: One short sentence on what this demo covers.
preparedBy: Your Name
email: you@sitetracker.com
preparedFor: Customers
preparedOn: August 3, 2026
order: 10
---

# Overview

Section intro. This sits under the step title and appears in the glass ToC.

## What is My Feature?
time: 45-60s
video: https://www.loom.com/share/PASTE_ID_HERE

- First learning point
- Second learning point
- Third learning point

# Getting started

How someone begins using the feature.

## Create your first record
time: 60-90s
video: my-feature-01-create.mp4

- Where to click
- What to fill in
- What success looks like

# Resources

- [User guide](#) — Link coming soon
- [FAQ](#) — Link coming soon
```

#### 4. Add videos (Loom and/or MP4)

For each `##` video block, set **one** `video:` line:

**Loom (easiest — no file upload)**

```md
video: https://www.loom.com/share/abc123def456
```

Share or embed Loom URLs both work. The page embeds the player.

**MP4 file**

```md
video: my-feature-01-create.mp4
```

Put that file in `demos/my-feature-name/videos/`. Until the file is there, the page shows a placeholder with the expected path.

You can mix Loom and MP4 in the same demo.

#### 5. Preview locally (optional but recommended)

```bash
npm run dev
```

Then open:

- Hub: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)
- Your demo: `http://127.0.0.1:5173/demos/my-feature-name/`

`npm run dev` also refreshes the hub list from whatever folders exist under `demos/`.

#### 6. Publish

```bash
git add demos/my-feature-name
git commit -m "Add my-feature-name demo"
git push origin master
```

After push:

1. GitHub Action regenerates `demos/manifest.json` (hub list) — you should not edit that file by hand.
2. GitHub Pages updates in a minute or two.
3. Your page is live at  
   `https://shankarism.github.io/feature-demos/demos/my-feature-name/`

Hard-refresh the hub if the new card does not appear immediately.

### Designer checklist

- [ ] Cloned / pulled `feature-demos`
- [ ] Copied `demos/_template` → `demos/<kebab-slug>`
- [ ] Filled in `content.md` (frontmatter + sections + videos)
- [ ] Loom URLs and/or MP4s in `videos/` match every `video:` line
- [ ] Did **not** change root `css/`, `js/`, `assets/`, or `manifest.json`
- [ ] Previewed with `npm run dev` (optional)
- [ ] Committed and pushed; checked the live URL

### Do not touch (shared template)

Leave these alone unless you are intentionally changing the template for **every** demo:

- `css/`, `js/`, `vendor/`, `assets/`, `fonts/`
- `demos/manifest.json` (auto-generated)
- `index.html` at the repo root (hub)
- Other people’s folders under `demos/`

Folders starting with `_` (like `_template`) are ignored by the hub.

---

## Reference

### `content.md` rules (short)

- `#` = section (ToC step)
- `##` = video row
- `time:` and `video:` are optional metadata lines under `##`
- Bullets under a video = learning points
- `# Resources` = link list; format `- [Label](url) — optional note`
- `title` / `lead` / `order` feed the hub card

### Layout

```text
/
  index.html                 Hub
  css/ js/ vendor/ assets/   Shared chrome — designers leave alone
  scripts/generate-manifest.js
  demos/
    manifest.json            Auto-generated hub list
    _template/               Copy this to start
    activity-tracker/        Example demo
    my-feature-name/
      index.html
      content.md             ← your work
      videos/                ← optional MP4s
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Regenerate hub list + local server on port 5173 |
| `npm run manifest` | Only regenerate `demos/manifest.json` |

### Stack

Static HTML/CSS/JS on GitHub Pages. The browser loads each demo’s `content.md`. Hub listing is generated by a small Node script (and GitHub Action) because static hosting cannot list folders.
