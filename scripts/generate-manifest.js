#!/usr/bin/env node
/**
 * Scan demos folders for content.md and write demos/manifest.json.
 * Also copies demos/_template/index.html into any demo folder that is missing it.
 * Skips folders that start with "_".
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DEMOS = path.join(ROOT, "demos");
const MANIFEST = path.join(DEMOS, "manifest.json");
const TEMPLATE_INDEX = path.join(DEMOS, "_template", "index.html");

function parseFrontmatter(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end === -1) return {};
  const block = text.slice(3, end).trim();
  const meta = {};
  block.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!m) return;
    meta[m[1]] = m[2].trim();
  });
  return meta;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function generate() {
  if (!fs.existsSync(DEMOS)) {
    console.error("demos/ folder not found");
    process.exit(1);
  }

  const entries = fs
    .readdirSync(DEMOS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort();

  const demos = [];

  entries.forEach((slug) => {
    const dir = path.join(DEMOS, slug);
    const contentPath = path.join(dir, "content.md");
    if (!fs.existsSync(contentPath)) {
      console.warn(`skip ${slug}: no content.md`);
      return;
    }

    const indexPath = path.join(dir, "index.html");
    if (!fs.existsSync(indexPath) && fs.existsSync(TEMPLATE_INDEX)) {
      fs.copyFileSync(TEMPLATE_INDEX, indexPath);
      console.log(`copied index.html → demos/${slug}/`);
    }

    const videosDir = path.join(dir, "videos");
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    const meta = parseFrontmatter(fs.readFileSync(contentPath, "utf8"));
    const order = Number(meta.order);
    demos.push({
      slug,
      title: meta.title || meta.headline || titleFromSlug(slug),
      description: meta.description || meta.lead || "",
      order: Number.isFinite(order) ? order : 1000,
    });
  });

  demos.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  const manifest = demos.map(({ slug, title, description }) => {
    const item = { slug, title };
    if (description) item.description = description;
    return item;
  });

  const next = JSON.stringify(manifest, null, 2) + "\n";
  const prev = fs.existsSync(MANIFEST) ? fs.readFileSync(MANIFEST, "utf8") : "";
  if (prev === next) {
    console.log(`manifest unchanged (${manifest.length} demos)`);
    return { changed: false, count: manifest.length };
  }

  fs.writeFileSync(MANIFEST, next);
  console.log(`wrote demos/manifest.json (${manifest.length} demos)`);
  manifest.forEach((d) => console.log(`  - ${d.slug}`));
  return { changed: true, count: manifest.length };
}

if (require.main === module) {
  generate();
}

module.exports = { generate };
