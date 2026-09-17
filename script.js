(() => {
  "use strict";

  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const yearNode = document.getElementById("year");

  // -------------------------
  // Theme
  // -------------------------
  const storedTheme = localStorage.getItem("portfolio-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
    body.classList.add("dark");
  }

  themeToggle?.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem(
      "portfolio-theme",
      body.classList.contains("dark") ? "dark" : "light"
    );
  });

  // -------------------------
  // Mobile menu
  // -------------------------
  const setMenu = (open) => {
    menuToggle?.classList.toggle("open", open);
    navLinks?.classList.toggle("open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    // Lock scroll while the full-screen menu is open
    if (!document.querySelector(".cmd-overlay.open")) {
      document.documentElement.style.overflow = open ? "hidden" : "";
    }
  };

  menuToggle?.addEventListener("click", () => {
    setMenu(!navLinks?.classList.contains("open"));
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenu(false);
  });

  // -------------------------
  // Current year
  // -------------------------
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  // -------------------------
  // Scroll reveal
  // -------------------------
  const revealItems = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px" }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  }

  // -------------------------
  // Active navigation state
  // -------------------------
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = navAnchors
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navAnchors.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === id);
          });
        });
      },
      {
        rootMargin: "-38% 0px -48% 0px",
        threshold: 0
      }
    );
    sections.forEach((section) => activeObserver.observe(section));
  }

  // -------------------------
  // Header state + scroll progress (transform-based)
  // -------------------------
  const header = document.querySelector(".site-header");
  const progressBar = document.querySelector(".scroll-progress");
  let scrollTicking = false;

  const updateScrollUI = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 12);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }
    scrollTicking = false;
  };

  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScrollUI);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateScrollUI();

  // -------------------------
  // Code blocks — auto-wrap + copy button
  // Detects <pre><code class="language-xxx"> and wraps it.
  // Skips anything already inside a .code-block.
  // Requires an <svg> sprite symbol with id="icon-copy".
  // -------------------------
  document.querySelectorAll("pre > code").forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre || pre.closest(".code-block")) return;

    const match = (codeEl.className || "").match(/(?:language|lang)-([\w+-]+)/i);
    const lang = match ? match[1] : "code";

    const block = document.createElement("div");
    block.className = "code-block";

    const head = document.createElement("div");
    head.className = "code-block__head";
    head.innerHTML = `
      <span class="code-block__dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="code-block__lang">${lang}</span>
      <button type="button" class="code-block__copy" aria-label="Copy code">
        <svg class="icon" aria-hidden="true"><use href="#icon-copy"></use></svg>
        <span>Copy</span>
      </button>
    `;

    pre.parentNode.insertBefore(block, pre);
    block.appendChild(head);
    block.appendChild(pre);

    const btn = head.querySelector(".code-block__copy");
    const label = btn.querySelector("span");

    btn.addEventListener("click", async () => {
      const text = codeEl.textContent ?? "";
      let ok = false;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch (_) { /* fall through to legacy path */ }

      if (!ok) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); ok = true; } catch (_) { ok = false; }
        ta.remove();
      }

      if (!ok) return;

      btn.classList.add("copied");
      const original = label?.textContent || "Copy";
      if (label) label.textContent = "Copied";
      setTimeout(() => {
        btn.classList.remove("copied");
        if (label) label.textContent = original;
      }, 1800);
    });
  });

  // -------------------------
  // Copy-to-clipboard email
  // Markup: <button class="copy-email" data-email="you@example.com">
  // -------------------------
  document.querySelectorAll(".copy-email").forEach((btn) => {
    const email =
      btn.dataset.email ||
      btn.querySelector(".copy-email__text")?.textContent?.trim() ||
      btn.textContent.trim();

    btn.addEventListener("click", async () => {
      if (!email) return;
      let ok = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(email);
          ok = true;
        }
      } catch (_) {}
      if (!ok) return;

      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1800);
    });
  });

  // -------------------------
  // TOC active-link tracking
  // -------------------------
  const toc = document.querySelector(".toc");
  if (toc && "IntersectionObserver" in window) {
    const tocLinks = [...toc.querySelectorAll('a[href^="#"]')];
    const tocSections = tocLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    if (tocSections.length) {
      const tocObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = `#${entry.target.id}`;
            tocLinks.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === id)
            );
          });
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      tocSections.forEach((s) => tocObserver.observe(s));
    }
  }

  // -------------------------
  // Command palette
  // Shortcuts: ⌘K / Ctrl+K to open, Esc to close,
  // Arrow up/down to move, Enter to activate, typing to filter.
  // -------------------------
  const cmdOverlay = document.querySelector(".cmd-overlay");
  const cmdTrigger = document.querySelector(".cmd-trigger");
  const cmdInput = document.querySelector(".cmd-input");
  const cmdCloseBtn = document.querySelector(".cmd-close");

  if (cmdOverlay) {
    let cmdActiveIndex = 0;

    const visibleItems = () =>
      [...cmdOverlay.querySelectorAll(".cmd-item")].filter(
        (el) => el.style.display !== "none"
      );

    const updateActive = () => {
      const items = visibleItems();
      items.forEach((el, i) => el.classList.toggle("active", i === cmdActiveIndex));
      items[cmdActiveIndex]?.scrollIntoView({ block: "nearest" });
    };

    const filterItems = (query) => {
      const q = query.trim().toLowerCase();
      cmdOverlay.querySelectorAll(".cmd-item").forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = !q || text.includes(q) ? "" : "none";
      });
      cmdActiveIndex = 0;
      updateActive();
    };

    const openCmd = () => {
      cmdOverlay.classList.add("open");
      cmdOverlay.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      cmdActiveIndex = 0;
      updateActive();
      setTimeout(() => cmdInput?.focus(), 40);
    };

    const closeCmd = () => {
      cmdOverlay.classList.remove("open");
      cmdOverlay.setAttribute("aria-hidden", "true");
      if (!navLinks?.classList.contains("open")) {
        document.documentElement.style.overflow = "";
      }
      if (cmdInput) cmdInput.value = "";
      filterItems("");
    };

    cmdTrigger?.addEventListener("click", openCmd);
    cmdCloseBtn?.addEventListener("click", closeCmd);

    cmdOverlay.addEventListener("click", (e) => {
      if (e.target === cmdOverlay) closeCmd();
    });

    cmdInput?.addEventListener("input", (e) => filterItems(e.target.value));

    cmdOverlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCmd();
        return;
      }
      const items = visibleItems();
      if (!items.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        cmdActiveIndex = (cmdActiveIndex + 1) % items.length;
        updateActive();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        cmdActiveIndex = (cmdActiveIndex - 1 + items.length) % items.length;
        updateActive();
      } else if (e.key === "Enter") {
        e.preventDefault();
        items[cmdActiveIndex]?.click();
      }
    });

    cmdOverlay.querySelectorAll(".cmd-item").forEach((item) => {
      item.addEventListener("click", () => closeCmd());
    });

    // Global shortcut
    window.addEventListener("keydown", (e) => {
      const k = (e.key || "").toLowerCase();
      const isCmdK = k === "k" && (e.metaKey || e.ctrlKey);

      if (isCmdK) {
        e.preventDefault();
        cmdOverlay.classList.contains("open") ? closeCmd() : openCmd();
      }
    });
  }

  // -------------------------
  // Hash navigation — close mobile menu on jump
  // -------------------------
  window.addEventListener("hashchange", () => setMenu(false));
})();
