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
    localStorage.setItem("portfolio-theme", body.classList.contains("dark") ? "dark" : "light");
  });

  // -------------------------
  // Mobile menu
  // -------------------------
  const setMenu = (open) => {
    menuToggle?.classList.toggle("open", open);
    navLinks?.classList.toggle("open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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
  // Tiny interaction polish:
  // keep hash navigation from leaving the mobile menu open.
  // -------------------------
  window.addEventListener("hashchange", () => setMenu(false));
})();
