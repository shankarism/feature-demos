(function () {
  const list = document.getElementById("demo-list");
  const empty = document.getElementById("demo-empty");

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

  fetch("demos/manifest.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((demos) => {
      if (!Array.isArray(demos) || !demos.length) {
        if (empty) empty.hidden = false;
        return;
      }
      demos.forEach((demo) => {
        if (!demo || !demo.slug) return;
        const href = "demos/" + demo.slug + "/";
        list.appendChild(
          el("li", { className: "hub__item" }, [
            el("a", {
              className: "hub__card",
              href: href,
              target: "_blank",
              rel: "noopener noreferrer",
            }, [
              el("span", { className: "hub__card-title", text: demo.title || demo.slug }),
              demo.description
                ? el("span", { className: "hub__card-desc", text: demo.description })
                : null,
              el("span", { className: "hub__card-path", text: "/demos/" + demo.slug + "/" }),
            ]),
          ])
        );
      });
      if (!list.children.length && empty) empty.hidden = false;
    })
    .catch(() => {
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Could not load demos/manifest.json.";
      }
    });
})();
