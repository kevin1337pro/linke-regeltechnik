(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('scroll-lightning');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = `
    <path class="lightning-trail lightning-trail-glow" />
    <path class="lightning-trail lightning-trail-core" />
    <g class="lightning-bolt">
      <path class="lightning-shape" d="M 3 -30 L -23 5 L -3 5 L -12 30 L 24 -9 L 4 -9 L 14 -30 Z" />
      <path class="lightning-shine" d="M 2 -20 L -12 0 L 4 0" />
    </g>`;
  document.body.append(svg);

  const bolt = svg.querySelector('.lightning-bolt');
  const trails = svg.querySelectorAll('.lightning-trail');
  let width = innerWidth;
  let height = innerHeight;
  let scrollPosition = scrollY;
  let lastScroll = -Infinity;
  let previousFrame = 0;
  let frame = 0;
  let points = [];
  let pointIndex = 0;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    points = [];
    svg.classList.remove('is-active');
  }

  function resize() {
    width = document.documentElement.clientWidth;
    height = innerHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    points = [];
  }

  function draw(now) {
    if (reducedMotion.matches || document.hidden) {
      stop();
      return;
    }

    const elapsed = Math.min(now - previousFrame, 40);
    previousFrame = now;
    scrollPosition += (Math.max(0, scrollY) - scrollPosition) * (1 - Math.exp(-elapsed / 100));

    // Each screenful of scrolling carries the bolt through a curved hop.
    const phase = scrollPosition / Math.max(650, height * 1.15) * Math.PI;
    const margin = width < 600 ? 35 : 60;
    const x = margin + (width - margin * 2) * (0.5 - Math.cos(phase) * 0.5);
    const y = height * (0.69 - Math.sin(phase) ** 2 * 0.36);
    const scale = width < 600 ? 0.72 : 1;
    bolt.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.sin(phase) * 14).toFixed(1)}) scale(${scale})`);

    const previous = points.at(-1);
    if (!previous || Math.hypot(x - previous.x, y - previous.y) > 5) {
      points.push({ x, y, time: now, offset: (++pointIndex % 2 ? 5 : -5) * scale });
    }
    points = points.filter(point => now - point.time < 220).slice(-14);
    const path = points.map((point, index) => {
      const offset = index === 0 || index === points.length - 1 ? 0 : point.offset;
      return `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${(point.y + offset).toFixed(1)}`;
    }).join(' ');
    trails.forEach(trail => trail.setAttribute('d', path));

    svg.classList.toggle('is-active', now - lastScroll < 400);
    if (now - lastScroll < 850) {
      frame = requestAnimationFrame(draw);
    } else {
      stop();
    }
  }

  addEventListener('scroll', () => {
    if (reducedMotion.matches || document.hidden) return;
    lastScroll = performance.now();
    if (!frame) {
      // Start near the current position after a pause, without crossing the whole page.
      scrollPosition = Math.max(0, scrollY - 45);
      previousFrame = lastScroll;
      frame = requestAnimationFrame(draw);
    }
  }, { passive: true });
  addEventListener('resize', resize, { passive: true });
  addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reducedMotion.addEventListener('change', stop);
  resize();
})();
