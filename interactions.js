(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const animate = (element, frames, options) => {
    if (reducedMotion.matches || !element.animate) return null;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  };
  const settle = () => {
    animations.forEach(animation => animation.finish());
    animations.clear();
  };
  reducedMotion.addEventListener?.('change', event => {
    if (event.matches) settle();
  });
  addEventListener('beforeprint', settle);
  const targets = document.querySelectorAll('.project, .research-list > article, .timeline-item, .experience-entry, .toolkit-list > div, .systems-figure');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      let stagger = 0;
      entries.forEach(entry => {
        const element = entry.target;
        element.dataset.inView = String(entry.isIntersecting);
        if (!entry.isIntersecting || element.classList.contains('is-seen')) return;
        element.classList.add('is-seen');
        if (element.classList.contains('systems-figure')) return;
        animate(element, [{ opacity: .45, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], {
          duration: 560, delay: Math.min(stagger++, 3) * 45, easing: 'cubic-bezier(.22,.61,.36,1)'
        });
      });
    }, { threshold: .08 });
    targets.forEach(element => observer.observe(element));
  }
  const figure = document.querySelector('.rag-figure');
  const panel = document.getElementById('workflowDescription');
  const tabs = [...document.querySelectorAll('[data-workflow-step]')];
  const descriptions = {
    documents: 'A conceptual workflow: Persian-language documents provide the information source.',
    retrieval: 'Retrieval brings relevant information into context, with time as the project’s central question.',
    generation: 'Generation uses that context to form an answer. This project explores how answers relate to time.'
  };
  let panelAnimation;
  const select = (index, focus = false) => {
    tabs.forEach((tab, position) => {
      tab.setAttribute('aria-selected', String(position === index));
      tab.tabIndex = position === index ? 0 : -1;
    });
    const tab = tabs[index];
    figure.dataset.step = tab.dataset.workflowStep;
    panel.textContent = descriptions[tab.dataset.workflowStep];
    panel.setAttribute('aria-labelledby', tab.id);
    panelAnimation?.cancel();
    panelAnimation = animate(panel, [{ opacity: .35 }, { opacity: 1 }], { duration: 220 });
    if (focus) tab.focus();
  };
  if (figure && panel && tabs.length) {
    figure.dataset.step = 'documents';
    tabs.forEach((tab, index) => {
      tab.disabled = false;
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
  }
})();
