(() => {
  const body = document.body;
  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const mobileLinks = [...document.querySelectorAll('.mobile-nav-links a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const progress = document.getElementById('scrollProgress');
  const year = document.getElementById('year');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const applyTheme = (dark, persist = true) => {
    body.classList.toggle('dark', dark);
    if (persist) localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
    metaTheme?.setAttribute('content', dark ? '#070b12' : '#f4f6f9');
    themeToggle?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };

  const savedTheme = localStorage.getItem('portfolio-theme');
  applyTheme(savedTheme ? savedTheme === 'dark' : media.matches, false);
  themeToggle?.addEventListener('click', () => applyTheme(!body.classList.contains('dark')));
  media.addEventListener?.('change', (event) => {
    if (!localStorage.getItem('portfolio-theme')) applyTheme(event.matches, false);
  });

  const setMenu = (open) => {
    mobileNav?.classList.toggle('open', open);
    menuToggle?.classList.toggle('open', open);
    mobileNav?.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => setMenu(!mobileNav?.classList.contains('open')));
  mobileNavClose?.addEventListener('click', () => setMenu(false));
  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  let ticking = false;
  const updateScroll = () => {
    const top = window.scrollY;
    header?.classList.toggle('is-scrolled', top > 22);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? top / max : 0})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
        mobileLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
      }
    }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });
    sections.filter((section) => section.id !== 'top').forEach((section) => activeObserver.observe(section));
  }

  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let pointerFrame = 0;
    let x = window.innerWidth * 0.5;
    let y = window.innerHeight * 0.16;
    window.addEventListener('pointermove', (event) => {
      x = event.clientX;
      y = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${x}px`);
        root.style.setProperty('--pointer-y', `${y}px`);
        pointerFrame = 0;
      });
    }, { passive: true });
  }

  year.textContent = String(new Date().getFullYear());
})();
