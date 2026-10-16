(() => {
  const figure = document.getElementById('systemsFigure');
  if (!figure) return;

  const nodes = [...figure.querySelectorAll('.network-node')];
  const links = [...figure.querySelectorAll('.network-link')];
  const circles = [...figure.querySelectorAll('.network-packet')];
  const toggle = document.getElementById('simulationToggle');
  const reset = document.getElementById('simulationReset');
  const stateLabel = document.getElementById('simulationState');
  const message = document.getElementById('simulationMessage');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const unavailable = new Set();
  const routes = {
    a: [[220, 254], [220, 173], [76, 173], [76, 95]],
    b: [[220, 254], [220, 95]],
    c: [[220, 254], [220, 173], [364, 173], [364, 95]]
  };
  const routeGeometry = Object.fromEntries(Object.entries(routes).map(([key, points]) => {
    const segments = points.slice(1).map((point, index) => ({
      from: points[index],
      to: point,
      length: Math.hypot(point[0] - points[index][0], point[1] - points[index][1])
    }));
    return [key, { segments, length: segments.reduce((total, segment) => total + segment.length, 0) }];
  }));

  let routeCursor = 0;
  let paused = reducedMotion.matches;
  let visible = true;
  let printing = false;
  let frame = 0;
  let lastTime = 0;
  const available = () => Object.keys(routes).filter(key => !unavailable.has(key));
  const nextRoute = () => {
    const choices = available();
    return choices.length ? choices[routeCursor++ % choices.length] : null;
  };
  const packets = circles.map((circle, index) => ({ circle, progress: index / circles.length, route: nextRoute() }));

  const positionAt = (key, progress) => {
    const geometry = routeGeometry[key];
    let distance = geometry.length * progress;
    for (const segment of geometry.segments) {
      if (distance <= segment.length) {
        const ratio = distance / segment.length;
        return [segment.from[0] + (segment.to[0] - segment.from[0]) * ratio, segment.from[1] + (segment.to[1] - segment.from[1]) * ratio];
      }
      distance -= segment.length;
    }
    return geometry.segments[geometry.segments.length - 1].to;
  };

  const draw = () => {
    packets.forEach(packet => {
      if (!packet.route || unavailable.has(packet.route)) packet.route = nextRoute();
      if (!packet.route) {
        packet.circle.removeAttribute('data-route');
        return;
      }
      const outbound = packet.progress < .5;
      const progress = outbound ? packet.progress * 2 : (1 - packet.progress) * 2;
      const [x, y] = positionAt(packet.route, progress);
      packet.circle.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      if (packet.circle.dataset.route !== packet.route) packet.circle.dataset.route = packet.route;
      const direction = outbound ? 'request' : 'response';
      if (packet.circle.dataset.direction !== direction) packet.circle.dataset.direction = direction;
    });
  };

  const canRun = () => !paused && visible && !document.hidden && !printing && available().length > 0;
  const tick = time => {
    frame = 0;
    if (!canRun()) return;
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 0;
    lastTime = time;
    packets.forEach(packet => {
      packet.progress += elapsed / 5600;
      if (packet.progress >= 1) {
        packet.progress %= 1;
        packet.route = nextRoute();
      }
    });
    draw();
    frame = requestAnimationFrame(tick);
  };

  const sync = () => {
    const stalled = available().length === 0;
    const state = stalled ? 'stalled' : paused ? 'paused' : 'running';
    figure.classList.toggle('is-stalled', stalled);
    figure.dataset.simulation = state;
    stateLabel.dataset.state = state;
    stateLabel.textContent = stalled ? 'NO ROUTE' : paused ? 'PAUSED' : 'RUNNING';
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume simulation' : 'Pause simulation');
    toggle.querySelector('span').textContent = paused ? 'Play' : 'Pause';
    toggle.querySelector('use').setAttribute('href', paused ? '#icon-play' : '#icon-pause');
    nodes.forEach(node => {
      const offline = unavailable.has(node.dataset.node);
      const label = `Cloud ${node.dataset.node.toUpperCase()}`;
      node.classList.toggle('is-offline', offline);
      node.setAttribute('aria-pressed', String(offline));
      node.setAttribute('aria-label', offline ? `Restore ${label}` : `Take ${label} offline`);
      node.querySelector('.node-status').textContent = offline ? 'Offline' : 'Online';
    });
    links.forEach(link => link.classList.toggle('is-offline', unavailable.has(link.dataset.route)));
    draw();
    if (canRun()) {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  };

  const describe = () => {
    const online = available().map(key => key.toUpperCase());
    if (!online.length) message.textContent = 'All clouds are offline. Restore a cloud to give requests a route.';
    else if (unavailable.size) message.textContent = `Traffic rerouted. ${online.length === 1 ? 'Cloud' : 'Clouds'} ${online.join(' and ')} ${online.length === 1 ? 'is' : 'are'} handling the work.`;
    else message.textContent = 'Choose a cloud to take it offline. The remaining nodes pick up the work.';
  };

  nodes.forEach(node => {
    node.disabled = false;
    node.addEventListener('click', () => {
      const key = node.dataset.node;
      if (unavailable.has(key)) unavailable.delete(key);
      else unavailable.add(key);
      describe();
      sync();
    });
  });
  toggle.addEventListener('click', () => {
    paused = !paused;
    sync();
    message.textContent = paused ? 'Simulation paused. You can still take clouds offline or restore them.' : 'Simulation resumed. Choose a cloud to explore how traffic reroutes.';
    if (!available().length) describe();
  });
  reset.addEventListener('click', () => {
    unavailable.clear();
    paused = reducedMotion.matches;
    routeCursor = 0;
    packets.forEach((packet, index) => {
      packet.progress = index / packets.length;
      packet.route = nextRoute();
    });
    describe();
    sync();
  });
  reducedMotion.addEventListener?.('change', event => {
    paused = event.matches;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  addEventListener('beforeprint', () => { printing = true; sync(); });
  addEventListener('afterprint', () => { printing = false; sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { rootMargin: '40px' }).observe(figure);
  }
  document.getElementById('simulationControls').hidden = false;
  describe();
  sync();
})();
