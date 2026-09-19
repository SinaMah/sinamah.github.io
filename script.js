(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.getElementById('siteHeader');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const progress = document.getElementById('scrollProgress');
  const year = document.getElementById('year');

  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) body.classList.add('dark');

  const setTheme = (dark) => {
    body.classList.toggle('dark', dark);
    localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
  };

  themeToggle?.addEventListener('click', () => setTheme(!body.classList.contains('dark')));

  const setMenu = (open) => {
    mobileNav?.classList.toggle('open', open);
    menuToggle?.classList.toggle('open', open);
    mobileNav?.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => setMenu(!mobileNav?.classList.contains('open')));
  mobileNavClose?.addEventListener('click', () => setMenu(false));
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  }, { passive: true });

  let ticking = false;
  const updateScroll = () => {
    const scrollTop = window.scrollY;
    header?.classList.toggle('is-scrolled', scrollTop > 22);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? scrollTop / max : 0})`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-38% 0px -54% 0px', threshold: 0 });
    sections.forEach((section) => activeObserver.observe(section));
  }

  year.textContent = new Date().getFullYear();
})();
