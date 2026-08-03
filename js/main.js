(function () {
  let data = null;
  let lenis = null;

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (value == null || value === false) return;
        if (key === "className") node.className = value;
        else if (key === "text") node.textContent = value;
        else node.setAttribute(key, value === true ? "" : value);
      });
    }
    (children || []).forEach((child) => {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function videoPath(video) {
    const file = video.file || (video.id ? video.id + ".mp4" : "");
    return "videos/" + file;
  }

  function loomFrame(video) {
    const title = video.title ? video.title + " (Loom)" : "Loom video";
    return el("div", { className: "video-frame has-video has-loom" }, [
      el("iframe", {
        className: "video-frame__loom",
        src: video.embedUrl,
        title: title,
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowfullscreen: true,
        frameborder: "0",
        loading: "lazy",
        webkitallowfullscreen: true,
        mozallowfullscreen: true,
      }),
    ]);
  }

  function fileFrame(video) {
    const path = videoPath(video);
    const frame = el("div", { className: "video-frame", "data-src": path }, [
      el("video", {
        controls: true,
        preload: "none",
        playsinline: true,
        src: path,
      }),
      el("div", { className: "video-frame__placeholder" }, [
        el("div", { className: "video-frame__play", "aria-hidden": "true" }),
        el("p", { className: "video-frame__soon", text: "Video coming soon" }),
        el("p", {
          className: "video-frame__file",
          text: video.file ? path : "Add an MP4 or a Loom link in content.md",
        }),
      ]),
    ]);

    if (!video.file) return frame;

    fetch(path, { method: "HEAD" })
      .then((res) => {
        const len = Number(res.headers.get("content-length") || 0);
        if (res.ok && len > 0) {
          frame.classList.add("has-video");
          const ph = frame.querySelector(".video-frame__placeholder");
          if (ph) ph.hidden = true;
        }
      })
      .catch(() => {});

    return frame;
  }

  function videoFrame(video) {
    if (video.kind === "loom" && video.embedUrl) return loomFrame(video);
    return fileFrame(video);
  }

  function videoCopy(video) {
    return el("div", { className: "video-copy" }, [
      el("h3", { text: video.title }),
      video.time ? el("p", { className: "video-copy__time", text: video.time }) : null,
      el("p", { className: "video-copy__label", text: "What this video will show you" }),
      el(
        "ul",
        null,
        (video.learn || []).map((item) => el("li", { text: item }))
      ),
    ]);
  }

  function renderSection(section) {
    return el("section", { className: "demo-section", id: section.id, "data-step": section.title }, [
      el("header", { className: "demo-section__intro" }, [
        el("h2", { className: "demo-section__title", text: section.title }),
        section.subtext ? el("p", { text: section.subtext }) : null,
      ]),
      el(
        "div",
        { className: "demo-section__rows" },
        (section.videos || []).map((video) =>
          el("article", { className: "video-row", id: video.id }, [
            el("div", { className: "video-row__copy" }, [videoCopy(video)]),
            el("div", { className: "video-row__media" }, [videoFrame(video)]),
          ])
        )
      ),
    ]);
  }

  function featureSlugFromPath() {
    const parts = location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "";
    if (!slug || slug === "demos" || slug === "index.html") return "";
    return slug;
  }

  /** activity-based-scheduling → Activity based scheduling */
  function sentenceCaseFromSlug(slug) {
    const words = String(slug || "")
      .split("-")
      .filter(Boolean)
      .map((w) => w.toLowerCase());
    if (!words.length) return "";
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ");
  }

  function mountHero() {
    const headline = document.getElementById("hero-headline");
    const lead = document.getElementById("hero-lead");
    if (headline) headline.textContent = data.headline || data.title || "";
    if (lead) {
      lead.textContent = data.lead || "";
      lead.hidden = !data.lead;
    }

    const featureName =
      sentenceCaseFromSlug(featureSlugFromPath()) || data.title || data.headline || "Demo";
    document.title = "Sitetracker | Demo | " + featureName;
    if (data.description || data.lead) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", data.description || data.lead);
    }

    const byline = document.getElementById("hero-byline");
    let showByline = false;

    if (data.preparedBy) {
      const item = document.getElementById("byline-by");
      const name = document.getElementById("hero-prepared-by");
      if (item && name) {
        name.textContent = data.preparedBy;
        item.hidden = false;
        showByline = true;
      }
      const mail = document.getElementById("hero-email");
      if (mail && data.email) {
        mail.href = "mailto:" + data.email;
        mail.setAttribute("aria-label", "Email " + data.preparedBy);
        mail.setAttribute("title", data.email);
        mail.hidden = false;
      }
    }

    if (data.preparedOn) {
      const item = document.getElementById("byline-on");
      const value = document.getElementById("hero-prepared-on");
      if (item && value) {
        value.textContent = data.preparedOn;
        item.hidden = false;
        showByline = true;
      }
    }

    if (byline) byline.hidden = !showByline;
  }

  function mountDemo() {
    const root = document.getElementById("demo-root");
    if (!root) return;
    data.sections.forEach((section) => root.appendChild(renderSection(section)));
  }

  function mountResources() {
    const section = document.getElementById("resources");
    const list = document.getElementById("resource-list");
    if (!section || !list) return;
    if (!data.resources || !data.resources.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    data.resources.forEach((item) => {
      const urlText = item.href && item.href !== "#" ? item.href : item.display;
      list.appendChild(
        el("li", null, [
          el("a", { href: item.href || "#" }, [
            el("span", { text: item.label }),
            el("span", { className: "resource-list__url", text: urlText }),
          ]),
        ])
      );
    });
  }

  function mountStepNav() {
    const nav = document.getElementById("step-bar-nav");
    const label = document.getElementById("step-bar-label");
    if (!nav) return;
    data.sections.forEach((section) => {
      nav.appendChild(
        el("a", {
          className: "step-bar__link",
          href: "#" + section.id,
          "data-section": section.id,
          text: section.title,
        })
      );
    });
    if (label && data.sections[0]) label.textContent = data.sections[0].title;
  }

  function scrollToTarget(target) {
    if (!target) return;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function initStepBar() {
    const chrome = document.getElementById("chrome");
    const label = document.getElementById("step-bar-label");
    const toggle = document.getElementById("step-bar-toggle");
    const menu = document.getElementById("step-bar-menu");
    const progressBar = document.getElementById("progress-bar");
    const sections = Array.from(document.querySelectorAll(".demo-section"));
    const resources = document.getElementById("resources");
    const links = Array.from(document.querySelectorAll(".step-bar__link"));

    if (!chrome || !sections.length) return;

    let menuCloseTimer = null;
    let openScrollY = 0;

    let backdrop = document.getElementById("toc-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "toc-backdrop";
      backdrop.className = "toc-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }

    function isMenuOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function setMenuOpen(open) {
      if (menuCloseTimer) {
        clearTimeout(menuCloseTimer);
        menuCloseTimer = null;
      }

      if (open) {
        menu.hidden = false;
        openScrollY = window.scrollY || window.pageYOffset || 0;
        // Sync open — avoid an extra frame of delay
        void menu.offsetHeight;
        chrome.classList.add("is-menu-open");
        document.body.classList.add("toc-open");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        toggle.setAttribute("aria-expanded", "false");
        chrome.classList.remove("is-menu-open");
        document.body.classList.remove("toc-open");
        menuCloseTimer = setTimeout(() => {
          if (!isMenuOpen()) menu.hidden = true;
          menuCloseTimer = null;
        }, 160);
      }
    }

    function closeMenu() {
      if (!isMenuOpen()) return;
      setMenuOpen(false);
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenuOpen(!isMenuOpen());
    });

    backdrop.addEventListener("click", closeMenu);

    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      if (chrome.contains(e.target) || backdrop.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    function closeMenuIfScrollOutsideToc(e) {
      if (!isMenuOpen()) return;
      if (menu.contains(e.target)) return;
      closeMenu();
    }

    window.addEventListener("wheel", closeMenuIfScrollOutsideToc, { passive: true });
    window.addEventListener("touchmove", closeMenuIfScrollOutsideToc, { passive: true });

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("data-section");
        const target = document.getElementById(id);
        closeMenu();
        scrollToTarget(target);
      });
    });

    function updateChrome() {
      if (isMenuOpen()) {
        const y = window.scrollY || window.pageYOffset || 0;
        if (Math.abs(y - openScrollY) > 4) closeMenu();
      }

      const titles = sections.map((section) => ({
        section,
        title: section.querySelector(".demo-section__title"),
      }));

      const chromeVisible = chrome.classList.contains("is-visible");
      const threshold = chromeVisible ? chrome.offsetHeight : 0;

      let activeIndex = -1;
      titles.forEach((item, index) => {
        if (!item.title) return;
        const top = item.title.getBoundingClientRect().top;
        if (top <= threshold + 1) activeIndex = index;
      });

      const lastSection = sections[sections.length - 1];
      const lastBottom = lastSection.getBoundingClientRect().bottom;
      const pastDemo = lastBottom <= threshold + 8;
      const resourcesTop =
        resources && !resources.hidden ? resources.getBoundingClientRect().top : Infinity;
      const inResources = resourcesTop <= threshold + 24;

      const shouldShow = activeIndex >= 0 && !pastDemo && !inResources;

      chrome.classList.toggle("is-visible", shouldShow);

      if (!shouldShow) {
        closeMenu();
        label.textContent = data.sections[0].title;
        links.forEach((l) => l.classList.remove("is-active"));
      } else {
        const active = data.sections[activeIndex];
        label.textContent = active.title;
        links.forEach((l) => {
          l.classList.toggle("is-active", l.getAttribute("data-section") === active.id);
        });
      }

      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      progressBar.style.width = Math.max(0, Math.min(1, p)) * 100 + "%";
    }

    window.__atUpdateChrome = updateChrome;
    updateChrome();
    window.addEventListener("resize", updateChrome, { passive: true });
  }

  function initLenis() {
    if (typeof Lenis === "undefined") return null;

    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on("scroll", () => {
      if (typeof window.__atUpdateChrome === "function") window.__atUpdateChrome();
    });

    return lenis;
  }

  function initProgressFallback() {
    window.addEventListener(
      "scroll",
      () => {
        if (typeof window.__atUpdateChrome === "function") window.__atUpdateChrome();
      },
      { passive: true }
    );
  }

  function showError(message) {
    const root = document.getElementById("demo-root");
    if (!root) return;
    root.appendChild(
      el("div", { className: "demo-error", role: "alert" }, [
        el("p", { text: message }),
      ])
    );
  }

  function boot(parsed) {
    data = parsed;
    mountHero();
    mountDemo();
    mountResources();
    mountStepNav();
    initStepBar();
    const hasLenis = initLenis();
    if (!hasLenis) initProgressFallback();
  }

  async function loadDemo() {
    if (typeof DemoMD === "undefined" || typeof DemoMD.parseContentMd !== "function") {
      showError("Demo parser failed to load.");
      return;
    }
    try {
      const res = await fetch("content.md", { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const raw = await res.text();
      boot(DemoMD.parseContentMd(raw));
    } catch (err) {
      console.error(err);
      showError("Could not load content.md for this demo.");
    }
  }

  loadDemo();
})();
