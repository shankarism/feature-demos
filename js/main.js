(function () {
  const data = window.AT_DEMO;
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

  function videoFrame(video) {
    const videoPath = `videos/${video.id}.mp4`;
    const frame = el("div", { className: "video-frame", "data-src": videoPath }, [
      el("video", {
        controls: true,
        preload: "none",
        playsinline: true,
        src: videoPath,
      }),
      el("div", { className: "video-frame__placeholder" }, [
        el("div", { className: "video-frame__play", "aria-hidden": "true" }),
        el("p", { className: "video-frame__soon", text: "Video coming soon" }),
        el("p", { className: "video-frame__file", text: videoPath }),
      ]),
    ]);

    fetch(videoPath, { method: "HEAD" })
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

  function videoCopy(video) {
    return el("div", { className: "video-copy" }, [
      el("h3", { text: video.title }),
      el("p", { className: "video-copy__time", text: video.time }),
      el("p", { className: "video-copy__label", text: "What this video will show you" }),
      el(
        "ul",
        null,
        video.learn.map((item) => el("li", { text: item }))
      ),
    ]);
  }

  function renderSection(section) {
    return el("section", { className: "demo-section", id: section.id, "data-step": section.title }, [
      el("header", { className: "demo-section__intro" }, [
        el("h2", { className: "demo-section__title", text: section.title }),
        el("p", { text: section.subtext }),
      ]),
      el(
        "div",
        { className: "demo-section__rows" },
        section.videos.map((video) =>
          el("article", { className: "video-row", id: video.id }, [
            el("div", { className: "video-row__copy" }, [videoCopy(video)]),
            el("div", { className: "video-row__media" }, [videoFrame(video)]),
          ])
        )
      ),
    ]);
  }

  function mountDemo() {
    const root = document.getElementById("demo-root");
    data.sections.forEach((section) => root.appendChild(renderSection(section)));
  }

  function mountResources() {
    const list = document.getElementById("resource-list");
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
    data.sections.forEach((section) => {
      nav.appendChild(
        el("a", {
          className: "step-bar__link",
          href: `#${section.id}`,
          "data-section": section.id,
          text: section.title,
        })
      );
    });
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

    if (!sections.length) return;

    function setMenuOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      chrome.classList.toggle("is-menu-open", open);
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
    }

    function closeMenu() {
      setMenuOpen(false);
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = toggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    document.addEventListener("click", (e) => {
      if (!chrome.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

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
      const titles = sections.map((section) => ({
        section,
        title: section.querySelector(".demo-section__title"),
      }));

      // Threshold: top edge while bar hidden; bottom of chrome panel once visible
      const chromeVisible = chrome.classList.contains("is-visible");
      const threshold = chromeVisible ? chrome.offsetHeight : 0;

      // Last section whose title has crossed the threshold
      let activeIndex = -1;
      titles.forEach((item, index) => {
        if (!item.title) return;
        const top = item.title.getBoundingClientRect().top;
        if (top <= threshold + 1) activeIndex = index;
      });

      const lastSection = sections[sections.length - 1];
      const lastBottom = lastSection.getBoundingClientRect().bottom;
      const pastDemo = lastBottom <= threshold + 8;
      const resourcesTop = resources ? resources.getBoundingClientRect().top : Infinity;
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

      // Page scroll progress
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      progressBar.style.width = `${Math.max(0, Math.min(1, p)) * 100}%`;
    }

    // Expose for Lenis scroll hook
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

  async function maybeLoadInternal() {
    const section = document.getElementById("internal");
    const mdPath = "_local/ActivityTracker-Demo-Webpage.md";
    const markedPath = "vendor/marked.min.js";

    async function exists(url) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
      } catch {
        return false;
      }
    }

    const [hasMd, hasMarked] = await Promise.all([exists(mdPath), exists(markedPath)]);
    if (!hasMd || !hasMarked) return;

    let mdText;
    try {
      const res = await fetch(mdPath);
      if (!res.ok) return;
      mdText = await res.text();
      if (!mdText || mdText.trim().length < 20) return;
    } catch {
      return;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = markedPath;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).catch(() => null);

    if (!window.marked || typeof window.marked.parse !== "function") return;

    section.classList.add("is-visible");
    document.getElementById("internal-md").innerHTML = window.marked.parse(mdText);
  }

  mountDemo();
  mountResources();
  mountStepNav();
  initStepBar();
  const hasLenis = initLenis();
  if (!hasLenis) initProgressFallback();
  maybeLoadInternal();
})();
