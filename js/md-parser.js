/**
 * Parse demo content.md into the page model.
 *
 * Schema:
 *   --- frontmatter ---
 *   # Section title          → section (step bar)
 *   paragraph                → section subtext
 *   ## Video title           → video row
 *   time: 45-60s
 *   video: file.mp4
 *   video: https://www.loom.com/share/...
 *   - learn bullets
 *   # Resources              → resource links
 *   - [Label](url) — display
 */
(function (global) {
  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      || "section";
  }

  /** @returns {{ kind: 'loom', id: string, embedUrl: string, shareUrl: string } | null} */
  function parseLoom(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const m = raw.match(
      /(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i
    );
    if (!m) return null;
    const id = m[1];
    return {
      kind: "loom",
      id,
      embedUrl: "https://www.loom.com/embed/" + id,
      shareUrl: "https://www.loom.com/share/" + id,
    };
  }

  function videoIdFromSource(source, title) {
    const loom = parseLoom(source);
    if (loom) return "loom-" + loom.id;
    if (source && !/^https?:\/\//i.test(source)) {
      return String(source)
        .replace(/\.(mp4|webm|mov)$/i, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "-");
    }
    return slugify(title);
  }

  function parseFrontmatter(raw) {
    const text = String(raw || "").replace(/^\uFEFF/, "");
    if (!text.startsWith("---")) {
      return { meta: {}, body: text };
    }
    const end = text.indexOf("\n---", 3);
    if (end === -1) {
      return { meta: {}, body: text };
    }
    const block = text.slice(3, end).trim();
    const body = text.slice(end + 4).replace(/^\s*\n/, "");
    const meta = {};
    block.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
      if (!m) return;
      meta[m[1]] = m[2].trim();
    });
    return { meta, body };
  }

  function parseResourceLine(line) {
    const link = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*[—–-]\s*(.+))?$/);
    if (link) {
      return {
        label: link[1].trim(),
        href: link[2].trim() || "#",
        display: (link[3] || link[2] || "").trim() || link[2].trim(),
      };
    }
    const plain = line.match(/^[-*]\s+(.+)$/);
    if (plain) {
      return { label: plain[1].trim(), href: "#", display: "Link coming soon" };
    }
    return null;
  }

  function parseBody(body) {
    const lines = String(body || "").split(/\r?\n/);
    const sections = [];
    const resources = [];
    let section = null;
    let video = null;
    let inResources = false;
    const usedIds = Object.create(null);

    function uniqueId(base) {
      let id = base;
      let n = 2;
      while (usedIds[id]) {
        id = base + "-" + n;
        n += 1;
      }
      usedIds[id] = true;
      return id;
    }

    function flushVideo() {
      if (!section || !video) return;
      if (!video.title) return;
      const loom = parseLoom(video.source);
      if (loom) {
        video.kind = "loom";
        video.loomId = loom.id;
        video.embedUrl = loom.embedUrl;
        video.file = "";
      } else {
        video.kind = "file";
        video.file = video.source || "";
      }
      video.id = uniqueId(videoIdFromSource(video.source, video.title));
      delete video.source;
      section.videos.push(video);
      video = null;
    }

    function flushSection() {
      flushVideo();
      if (section) sections.push(section);
      section = null;
    }

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const trimmed = line.trim();

      if (/^#\s+/.test(trimmed) && !/^##\s+/.test(trimmed)) {
        const title = trimmed.replace(/^#\s+/, "").trim();
        flushSection();
        if (/^resources$/i.test(title)) {
          inResources = true;
          continue;
        }
        inResources = false;
        section = {
          id: uniqueId(slugify(title)),
          title,
          subtext: "",
          videos: [],
        };
        continue;
      }

      if (inResources) {
        if (!trimmed) continue;
        const item = parseResourceLine(trimmed);
        if (item) resources.push(item);
        continue;
      }

      if (!section) continue;

      if (/^##\s+/.test(trimmed)) {
        flushVideo();
        video = {
          title: trimmed.replace(/^##\s+/, "").trim(),
          time: "",
          source: "",
          kind: "file",
          file: "",
          learn: [],
        };
        continue;
      }

      if (video) {
        const timeMatch = trimmed.match(/^time:\s*(.+)$/i);
        if (timeMatch) {
          video.time = timeMatch[1].trim();
          continue;
        }
        const videoMatch = trimmed.match(/^video:\s*(.+)$/i);
        if (videoMatch) {
          video.source = videoMatch[1].trim();
          continue;
        }
        const bullet = trimmed.match(/^[-*]\s+(.+)$/);
        if (bullet) {
          video.learn.push(bullet[1].trim());
          continue;
        }
        if (!trimmed) continue;
        continue;
      }

      if (!trimmed) continue;
      if (!section.subtext) section.subtext = trimmed;
      else section.subtext += " " + trimmed;
    }

    flushSection();
    return { sections, resources };
  }

  function parseContentMd(raw) {
    const { meta, body } = parseFrontmatter(raw);
    const { sections, resources } = parseBody(body);
    return {
      headline: meta.headline || "",
      lead: meta.lead || "",
      preparedBy: meta.preparedBy || "",
      email: meta.email || "",
      preparedFor: meta.preparedFor || "",
      preparedOn: meta.preparedOn || "",
      title: meta.title || meta.headline || "Demo",
      description: meta.description || meta.lead || "",
      order: meta.order || "",
      sections,
      resources,
    };
  }

  global.DemoMD = { parseContentMd, parseLoom, slugify };
})(typeof window !== "undefined" ? window : globalThis);
