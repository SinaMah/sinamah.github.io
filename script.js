(() => {
  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileNav');
  const menuClose = document.getElementById('menuClose');
  const navLinks = [...document.querySelectorAll('#navLinks a')];
  const sections = [...document.querySelectorAll('section[data-nav]')];
  const colorPreference = matchMedia('(prefers-color-scheme: dark)');
  const desktop = matchMedia('(min-width: 901px)');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let savedTheme;
  let focusAfterClose = menuToggle;
  let scrollFrame = 0;

  try {
    savedTheme = localStorage.getItem('portfolio-theme');
  } catch {}

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    themeMeta?.setAttribute('content', theme === 'dark' ? '#17231e' : '#f6f6f0');
    const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle?.setAttribute('aria-label', label);
    themeToggle?.setAttribute('title', label);
    themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    if (persist) {
      savedTheme = theme;
      try { localStorage.setItem('portfolio-theme', theme); } catch {}
    }
  };

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  if (themeToggle) {
    themeToggle.hidden = false;
    themeToggle.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  }
  colorPreference.addEventListener?.('change', ({ matches }) => {
    if (savedTheme !== 'dark' && savedTheme !== 'light') applyTheme(matches ? 'dark' : 'light');
  });

  if (menu && typeof menu.showModal === 'function' && menuToggle && menuClose) {
    root.classList.add('js');
    menuToggle.hidden = false;
    menuToggle.addEventListener('click', () => {
      if (menu.open) return;
      focusAfterClose = menuToggle;
      menu.showModal();
      document.body.classList.add('menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
    });
    menuClose.addEventListener('click', () => menu.close());
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...menu.querySelectorAll('a[href], button:not([disabled])')].filter(element => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
    menu.addEventListener('close', () => {
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      focusAfterClose?.focus({ preventScroll: true });
    });
    menu.addEventListener('click', event => {
      if (event.target !== menu) return;
      const box = menu.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) menu.close();
    });
    menu.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', () => {
        focusAfterClose = document.getElementById(link.hash.slice(1)) || menuToggle;
        menu.close();
      });
    });
    desktop.addEventListener?.('change', ({ matches }) => {
      if (matches && menu.open) {
        focusAfterClose = document.querySelector('.brand');
        menu.close();
      }
    });
  }

  const updateNavigation = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 20);
    const line = Math.min(innerHeight * 0.35, 230);
    let active = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) active = section.dataset.nav;
    }
    if (window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1]?.dataset.nav || active;
    }
    navLinks.forEach(link => {
      const selected = link.hash === `#${active}`;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollFrame = 0;
  };

  const queueNavigation = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNavigation);
  };
  addEventListener('scroll', queueNavigation, { passive: true });
  addEventListener('resize', queueNavigation, { passive: true });
  addEventListener('hashchange', queueNavigation);
  addEventListener('load', queueNavigation, { once: true });
  document.fonts?.ready.then(queueNavigation);
  updateNavigation();

  const printProfile = document.getElementById('printProfile');
  if (printProfile) {
    printProfile.hidden = false;
    printProfile.addEventListener('click', () => window.print());
  }

  const copyEmail = document.getElementById('copyEmail');
  const copyStatus = document.getElementById('copyStatus');
  if (copyEmail && copyStatus && isSecureContext && navigator.clipboard?.writeText) {
    copyEmail.hidden = false;
    copyEmail.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('sinamahboobipour@yahoo.com');
        copyStatus.textContent = 'Email address copied.';
      } catch {
        copyStatus.textContent = 'Copy is unavailable. You can use the email link above.';
      }
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  if (location.protocol === 'https:' || location.protocol === 'http:') {
    const canonical = document.querySelector('link[rel="canonical"]');
    const pageUrl = new URL('./', location.href).href;
    if (canonical) canonical.href = pageUrl;
    const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = pageUrl;
    document.head.append(ogUrl);
    document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
      meta.content = new URL('social-preview.png', pageUrl).href;
    });
  }
})();
