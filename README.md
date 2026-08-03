# Activity Tracker - Customer Demo Page

Static Sitetracker-branded demo / onboarding one-pager for Enhanced Activity Tracker.

## Local review

```bash
npm run dev
```

Opens at [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

`npm run setup` downloads gitignored `vendor/marked.min.js` for the local Internal brief.

Backup:

```bash
python3 -m http.server 5173
```

## Internal brief (local only)

- `_local/ActivityTracker-Demo-Webpage.md` (gitignored)
- With `marked` present, the Internal block appears at the bottom
- Hidden automatically when those files are missing (public Pages safe)

## Replace later

| Asset | Path |
| --- | --- |
| Logo | `assets/logo.svg` (full-color wordmark) |
| Favicon | `assets/favicon.svg` / `assets/favicon.png` (arrow mark) |
| Apple touch icon | `assets/apple-touch-icon.png` |
| Videos | `videos/at-demo-00` through `at-demo-08` |
| Resource URLs | `js/data.js` → `resources` |

## Stack

- Lenis smooth scroll (`vendor/lenis.min.js`, committed)
- Self-hosted Barlow
- Max width 2560px, video column 70%, sticky section titles
