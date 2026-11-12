/* ================================================================
   ADIL OSMAN — SHARED SCRIPTS
   ================================================================ */

/* ── Nav scroll effect ── */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile hamburger ── */
const burger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      burger.focus();
    }
  });
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  revealEls.forEach(el => obs.observe(el));
}

/* ── Project filter ── */
const filterBtns = document.querySelectorAll('.filter-btn');
const pcards = document.querySelectorAll('.pcard');
if (filterBtns.length && pcards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      pcards.forEach(card => {
        const cats = card.dataset.cats || '';
        const match = f === 'all' || cats.split(' ').includes(f);
        card.classList.toggle('hidden', !match);
        card.setAttribute('aria-hidden', String(!match));
      });
    });
  });
}

/* ── Gallery lightbox ── */
(function initLightbox() {
  const galleryLinks = document.querySelectorAll('.pcard-gallery a');
  if (!galleryLinks.length) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');
  let lightbox, imgEl, captionEl, closeBtn, lastFocused;

  function makeCloseIcon() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    [['18','6','6','18'], ['6','6','18','18']].forEach(([x1,y1,x2,y2]) => {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      line.setAttribute('x2', x2); line.setAttribute('y2', y2);
      svg.append(line);
    });
    return svg;
  }

  function build() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-labelledby', 'lightbox-caption');

    const figure = document.createElement('div');
    figure.className = 'lightbox-figure';

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image preview');
    closeBtn.append(makeCloseIcon());

    imgEl = document.createElement('img');
    imgEl.className = 'lightbox-img';
    imgEl.alt = '';

    captionEl = document.createElement('div');
    captionEl.className = 'lightbox-caption';
    captionEl.id = 'lightbox-caption';

    figure.append(closeBtn, imgEl, captionEl);
    lightbox.append(figure);
    document.body.append(lightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    closeBtn.addEventListener('click', close);
  }

  function getFocusable() {
    return Array.from(lightbox.querySelectorAll(focusableSelector))
      .filter(el => el.offsetParent !== null || el === document.activeElement);
  }

  function open(href, alt, caption) {
    if (!lightbox) build();
    imgEl.src = href;
    imgEl.alt = alt || '';
    captionEl.textContent = caption || alt || 'Image preview';
    lastFocused = document.activeElement;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.classList.add('menu-open');
    document.addEventListener('keydown', onKey);
    closeBtn.focus();
  }

  function close() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.classList.remove('menu-open');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => { imgEl.src = ''; }, 250);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = getFocusable();
    if (!focusable.length) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!lightbox.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  galleryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      const img = link.querySelector('img');
      const cap = link.querySelector('figcaption');
      open(link.getAttribute('href'), img && img.alt, cap && cap.textContent);
    });
  });
})();

/* ── Scroll progress bar ── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ── Back to top ── */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M8 13V3M3 8l5-5 5 5');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  btn.append(svg);
  document.body.append(btn);
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  const toggle = () => btn.classList.toggle('visible', window.scrollY > 600);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

/* ── Metric count-up ── */
(function initCountUp() {
  const nums = document.querySelectorAll('.metric-num');
  if (!nums.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const animate = (el) => {
    const match = el.textContent.trim().match(/^(\D?)(\d+)(.*)$/);
    if (!match) return;
    const prefix = match[1];
    const target = parseInt(match[2], 10);
    if (target < 2) return;
    const suffix = match[3];
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        cObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(el => cObs.observe(el));
})();

/* ── Active nav link (highlight current page) ── */
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
})();

/* ================================================================
   COMMAND PALETTE (Cmd/Ctrl+K)
================================================================ */
(function () {
  var IN_POSTS = window.location.pathname.indexOf('/posts/') !== -1;
  var PREFIX = IN_POSTS ? '../' : '';
  var SECTIONS = ['Pages', 'Projects', 'Writing'];
  var ENTRIES = [
    { title: 'Home', section: 'Pages', href: 'index.html', keywords: 'start landing intro hero' },
    { title: 'Work', section: 'Pages', href: 'projects.html', keywords: 'projects portfolio case studies' },
    { title: 'About', section: 'Pages', href: 'about.html', keywords: 'bio experience education timeline' },
    { title: 'Stack', section: 'Pages', href: 'skills.html', keywords: 'skills tools technologies' },
    { title: 'Writing', section: 'Pages', href: 'writing.html', keywords: 'articles blog posts' },
    { title: 'CV', section: 'Pages', href: 'cv.html', keywords: 'resume curriculum vitae experience' },
    { title: 'Contact', section: 'Pages', href: 'contact.html', keywords: 'email get in touch hire' },
    { title: 'TfL Real-Time Lakehouse', section: 'Projects', href: 'projects.html#tfl-lakehouse', keywords: 'streaming airflow duckdb dbt data engineering real-time' },
    { title: 'StreamShop CDC Analytics Stack', section: 'Projects', href: 'projects.html#streamshop-cdc', keywords: 'debezium kafka change data capture streaming' },
    { title: 'London Air Quality & Weather Lakehouse', section: 'Projects', href: 'projects.html#air-quality-lakehouse', keywords: 'data engineering lakehouse weather pollution' },
    { title: 'F1 RaceOps Analytics Warehouse', section: 'Projects', href: 'projects.html#f1-raceops', keywords: 'formula 1 dbt warehouse analytics racing' },
    { title: 'Premier League Analytics Warehouse', section: 'Projects', href: 'projects.html#premier-league-warehouse', keywords: 'football soccer dbt warehouse analytics' },
    { title: 'Mini Lake — dbt + DuckDB', section: 'Projects', href: 'projects.html#mini-lake', keywords: 'dbt duckdb analytics engineering' },
    { title: 'Deep Stock Insights', section: 'Projects', href: 'projects.html#deep-stock-insights', keywords: 'financial prediction platform machine learning stocks' },
    { title: 'AI Trading Agent', section: 'Projects', href: 'projects.html#ai-trading-agent', keywords: 'machine learning trading llm agent' },
    { title: 'LSTM Stock Forecasting — Dissertation', section: 'Projects', href: 'projects.html#lstm-prediction', keywords: 'machine learning neural network time series dissertation tesla arima' },
    { title: 'Missing Data — Imputation Techniques', section: 'Projects', href: 'projects.html#missing-data', keywords: 'data science statistics imputation pandas' },
    { title: 'Chebyshev, LLN & CLT', section: 'Projects', href: 'projects.html#probability-fundamentals', keywords: 'probability statistics central limit theorem' },
    { title: 'Linear Regression from Scratch', section: 'Projects', href: 'projects.html#linear-regression', keywords: 'data science statistics numpy gradient' },
    { title: 'Fitness Gym Systems Design', section: 'Projects', href: 'projects.html#fitness-gym-systems', keywords: 'uml systems analysis crc' },
    { title: 'Fitness Gym UI Prototype', section: 'Projects', href: 'projects.html#fitness-gym-ui', keywords: 'javascript spa frontend prototype' },
    { title: 'Wallet Polymorphism Demo', section: 'Projects', href: 'projects.html#wallet-polymorphism', keywords: 'java oop inheritance polymorphism' },
    { title: 'Casual Coded Correspondence', section: 'Projects', href: 'projects.html#coded-correspondence', keywords: 'python cryptography caesar vigenere cipher jupyter' },
    { title: 'Storage Unit Manager', section: 'Projects', href: 'projects.html#storage-unit-manager', keywords: 'java oop classes' },
    { title: 'Building the TfL Travel App with Somalis in Tech', section: 'Writing', href: 'posts/building-the-tfl-travel-app-with-somalis-in-tech.html', keywords: 'article community case study travel app' },
    { title: 'Building a Real-Time TfL Lakehouse from Scratch', section: 'Writing', href: 'posts/building-a-tfl-realtime-lakehouse.html', keywords: 'article data engineering streaming pipeline' }
  ];

  var overlay = null, panel = null, input = null, list = null;
  var lastFocus = null, visible = [], selected = 0;

  function score(entry, q) {
    if (!q) return 1;
    var t = entry.title.toLowerCase();
    if (t.indexOf(q) === 0) return 0;
    if (t.indexOf(q) !== -1) return 1;
    if (entry.keywords.indexOf(q) !== -1) return 2;
    return -1;
  }

  function render(query) {
    var q = query.trim().toLowerCase();
    visible = [];
    list.innerHTML = '';
    SECTIONS.forEach(function (name) {
      var matches = ENTRIES.filter(function (e) {
        return e.section === name && score(e, q) !== -1;
      }).sort(function (a, b) { return score(a, q) - score(b, q); });
      if (!matches.length) return;
      var label = document.createElement('div');
      label.className = 'cmdk-section';
      label.textContent = name.toUpperCase();
      list.appendChild(label);
      matches.forEach(function (e) {
        var idx = visible.length;
        var row = document.createElement('div');
        row.className = 'cmdk-row';
        row.setAttribute('role', 'option');
        row.setAttribute('aria-selected', 'false');
        row.id = 'cmdk-opt-' + idx;
        var title = document.createElement('span');
        title.className = 'cmdk-row-title';
        title.textContent = e.title;
        var hint = document.createElement('span');
        hint.className = 'cmdk-row-hint';
        hint.textContent = e.section;
        row.appendChild(title);
        row.appendChild(hint);
        row.addEventListener('mouseenter', function () { select(idx); });
        row.addEventListener('click', function () { go(idx); });
        list.appendChild(row);
        visible.push(e);
      });
    });
    if (!visible.length) {
      var empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      empty.textContent = 'No results for “' + query.trim() + '”';
      list.appendChild(empty);
    }
    select(0);
  }

  function select(idx) {
    selected = idx;
    var rows = list.querySelectorAll('.cmdk-row');
    for (var i = 0; i < rows.length; i++) {
      var on = i === idx;
      rows[i].classList.toggle('selected', on);
      rows[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    if (rows[idx]) {
      rows[idx].scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', rows[idx].id);
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function go(idx) {
    var e = visible[idx];
    if (!e) return;
    close();
    window.location.href = PREFIX + e.href;
  }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'cmdk';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Site search">' +
        '<input class="cmdk-input" type="text" placeholder="Search pages, projects, writing…" ' +
          'aria-label="Search site" role="combobox" aria-expanded="true" aria-controls="cmdkList" ' +
          'autocomplete="off" autocapitalize="off" spellcheck="false" />' +
        '<div class="cmdk-list" role="listbox" id="cmdkList"></div>' +
        '<div class="cmdk-footer" aria-hidden="true">' +
          '<span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    panel = overlay.querySelector('.cmdk-panel');
    input = overlay.querySelector('.cmdk-input');
    list = overlay.querySelector('.cmdk-list');
    overlay.addEventListener('mousedown', function (e) {
      if (!panel.contains(e.target)) close();
    });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', onInputKey);
  }

  function isOpen() {
    return overlay !== null && overlay.classList.contains('open');
  }

  function open() {
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    render('');
    input.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (visible.length) select((selected + 1) % visible.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (visible.length) select((selected - 1 + visible.length) % visible.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(selected);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  }

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (isOpen()) { close(); } else { open(); }
      return;
    }
    if (e.key === '/' && !isOpen()) {
      var t = e.target;
      var tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (t && t.isContentEditable) return;
      e.preventDefault();
      open();
    }
  });

  var triggers = document.querySelectorAll('.nav-search');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('click', function () { open(); });
  }

  if (!/Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
    var kbds = document.querySelectorAll('.nav-search-kbd');
    for (var j = 0; j < kbds.length; j++) kbds[j].textContent = 'Ctrl K';
  }
})();

/* ── Theme toggle ──
   The <head> snippet on each page applies a saved choice before paint;
   without one, the CSS follows the device's light/dark setting. */
(function initThemeToggle() {
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  var meta = document.querySelector('meta[name="theme-color"]');
  var anchor = document.querySelector('.nav-search') || document.getElementById('hamburger');
  if (!anchor) return;

  function active() { return root.getAttribute('data-theme') || (mq && mq.matches ? 'light' : 'dark'); }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.innerHTML =
    '<svg class="icon-moon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z"/></svg>' +
    '<svg class="icon-sun" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg>';
  if (anchor.classList.contains('nav-search')) {
    // Group search + toggle so the nav's space-between keeps them together
    var tools = document.createElement('div');
    tools.className = 'nav-tools';
    anchor.parentNode.insertBefore(tools, anchor);
    tools.appendChild(anchor);
    tools.appendChild(btn);
  } else {
    anchor.parentNode.insertBefore(btn, anchor);
  }

  function apply() {
    var a = active();
    root.setAttribute('data-theme-active', a);
    if (meta) meta.setAttribute('content', a === 'light' ? '#F6F3EC' : '#0A0F1A');
    var next = a === 'light' ? 'dark' : 'light';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    btn.title = 'Switch to ' + next + ' theme';
  }

  btn.addEventListener('click', function () {
    var next = active() === 'light' ? 'dark' : 'light';
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ao_theme', next); } catch (e) {}
    apply();
    setTimeout(function () { root.classList.remove('theme-anim'); }, 400);
  });

  if (mq) {
    var onChange = function () { if (!root.getAttribute('data-theme')) apply(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  apply();
})();

/* ── Visitor counter ──
   Cookie-free counts via the Abacus counter API. Only the live site
   writes to the real namespace; local copies count into a dev one.
   Visit /stats.html to see the numbers or exclude your own browser. */
(function initVisitorCounter() {
  var API = 'https://abacus.jasoncameron.dev';
  var LIVE = location.hostname === 'aosman101.github.io';
  var NS = LIVE ? 'aosman101-github-io' : 'aosman101-dev';

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function today() {
    try { return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }

  function pageKey(path) {
    var p = (path || location.pathname).replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
    return 'p_' + (p || 'index').replace(/\//g, '_').slice(0, 60);
  }

  // Resolves to the count, 0 for a key that doesn't exist yet, or null on failure
  function call(action, key) {
    return fetch(API + '/' + action + '/' + NS + '/' + key, { keepalive: action === 'hit' })
      .then(function (r) {
        if (r.status === 404) return { value: 0 };
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (d) { return typeof d.value === 'number' && d.value > 0 ? d.value : 0; })
      .catch(function () { return null; });
  }

  // The API allows ~30 requests per 10s, so the stats page reads through a
  // small queue and retries anything that was throttled.
  var queue = [], active = 0;
  function pump() {
    while (active < 4 && queue.length) {
      var job = queue.shift();
      active++;
      call('get', job.key).then(function (job, v) {
        if (v === null && job.tries < 4) {
          job.tries++;
          setTimeout(function () { queue.push(job); pump(); }, 2500 * job.tries);
        } else {
          job.resolve(v);
        }
        active--;
        pump();
      }.bind(null, job));
    }
  }
  function queuedGet(key) {
    return new Promise(function (resolve) { queue.push({ key: key, tries: 0, resolve: resolve }); pump(); });
  }

  window.AO_STATS = { get: queuedGet, pageKey: pageKey, today: today, store: store, live: LIVE };

  if (document.documentElement.hasAttribute('data-no-count') || !window.fetch) return;

  var skip = store('ao_notrack') === '1' || navigator.webdriver;
  var day = today();
  var views;

  if (skip) {
    views = call('get', 'views');
  } else {
    views = call('hit', 'views');
    call('hit', pageKey());
    call('hit', 'd_' + day);
    if (!store('ao_seen')) { call('hit', 'visitors'); store('ao_seen', '1'); }
    if (store('ao_seen_day') !== day) { call('hit', 'u_' + day); store('ao_seen_day', day); }
  }

  var slot = document.querySelector('.foot-bottom');
  if (!slot) return;
  views.then(function (n) {
    if (!n) return;
    var el = document.createElement('a');
    el.className = 'foot-views';
    el.href = (location.pathname.indexOf('/posts/') !== -1 ? '../' : '') + 'stats.html';
    el.setAttribute('aria-label', n.toLocaleString('en-GB') + ' page views. Open site stats');
    el.innerHTML = '<span class="foot-views-dot" aria-hidden="true"></span>' + n.toLocaleString('en-GB') + ' views';
    slot.insertBefore(el, slot.lastElementChild);
  });
})();

/* ── Tool logos ──
   Adds a logo to any badge whose text names a known tool. Logos live
   in assets/logos.svg (Simple Icons, CC0) in each tool's brand colour;
   a few projects without an icon there use their GitHub avatar from
   assets/logos/. window.AO_LOGOS is reused by home.js. */
(function initToolLogos() {
  var self = document.querySelector('script[src*="script.js"]');
  var SPRITE = (self ? self.getAttribute('src').split('script.js')[0] : 'assets/') + 'logos.svg?v=20261113';
  var IMG_BASE = SPRITE.split('logos.svg')[0] + 'logos/';
  // slug: [colour on dark, colour on light (optional)]; a string is an image file in assets/logos/
  var BRAND = {
    python: ['#4B8BBE', '#3776AB'], dbt: ['#FF694B'], apacheairflow: ['#2E9BFF', '#017CEE'], duckdb: ['#FFF000', '#B59F00'],
    clickhouse: ['#FFCC01', '#C99700'], postgresql: ['#6B93F5', '#336791'], googlebigquery: ['#669DF6', '#4285F4'], snowflake: ['#29B5E8', '#1A9BD0'],
    terraform: ['#A67BE0', '#844FBA'], docker: ['#2496ED'], apachekafka: ['#E8ECF2', '#231F20'], fastapi: ['#10B3A3', '#009688'],
    pytorch: ['#EE4C2C'], tensorflow: ['#FF8F1F', '#E86400'], githubactions: ['#3B9BFF', '#2088FF'], react: ['#61DAFB', '#0A9CC4'],
    numpy: ['#6C93E0', '#4D77CF'], pandas: ['#E70488'], scikitlearn: ['#F7931E'], jupyter: ['#F37626'],
    mysql: ['#5E9BC8', '#4479A1'], plotly: ['#8F8BFF', '#5F5BE0'], tableau: ['#E97627'], metabase: ['#509EE3'],
    supabase: ['#3FCF8E', '#23A36B'], tailwindcss: ['#06B6D4'], minio: ['#E0455F', '#C72E49'], git: ['#F03C2E'],
    apacheparquet: ['#50ABF1', '#2D8BD6'], transportforlondon: ['#7C9BFF', '#113B92'], sql: ['#7AB2D3', '#24607F'],
    amazonwebservices: ['#FF9900', '#E07F00'], powerbi: ['#F2C811', '#C79A00'],
    gnubash: ['#6CC644', '#3E8E1F'], huggingface: ['#FFD21E', '#C99700'],
    debezium: 'debezium.png', redpanda: 'redpanda.png', greatexpectations: 'greatexpectations.png',
    openlineage: 'openlineage.png', thoughtspot: 'thoughtspot.png'
  };
  var NAMES = {
    'python': 'python', 'dbt': 'dbt', 'dbt core': 'dbt', 'dbt tests': 'dbt',
    'apache airflow': 'apacheairflow', 'airflow': 'apacheairflow', 'duckdb': 'duckdb',
    'clickhouse': 'clickhouse', 'postgresql': 'postgresql', 'postgres': 'postgresql',
    'bigquery': 'googlebigquery', 'snowflake': 'snowflake', 'terraform': 'terraform', 'docker': 'docker',
    'kafka': 'apachekafka', 'kafka / redpanda': 'apachekafka', 'redpanda / kafka': 'redpanda', 'redpanda': 'redpanda',
    'debezium': 'debezium', 'cdc (debezium)': 'debezium',
    'great expectations': 'greatexpectations', 'openlineage': 'openlineage', 'openlineage / marquez': 'openlineage',
    'aws': 'amazonwebservices', 'aws (s3, iam, ec2, rds)': 'amazonwebservices',
    'power bi': 'powerbi', 'thoughtspot': 'thoughtspot',
    'fastapi': 'fastapi', 'pytorch': 'pytorch', 'tensorflow': 'tensorflow', 'tensorflow / keras': 'tensorflow',
    'github actions': 'githubactions', 'github actions ci/cd': 'githubactions', 'react': 'react',
    'numpy': 'numpy', 'pandas': 'pandas', 'scikit-learn': 'scikitlearn', 'jupyter': 'jupyter',
    'mysql': 'mysql', 'plotly': 'plotly', 'tableau': 'tableau', 'metabase': 'metabase',
    'supabase': 'supabase', 'tailwind css': 'tailwindcss', 'minio': 'minio', 'minio (s3)': 'minio',
    'git / github': 'git', 'parquet': 'apacheparquet', 'tfl api': 'transportforlondon', 'sql': 'sql'
  };
  var NS = 'http://www.w3.org/2000/svg';

  function make(slug) {
    var b = BRAND[slug];
    if (!b) return null;
    if (typeof b === 'string') {
      var img = document.createElement('img');
      img.className = 'tool-logo is-img';
      img.src = IMG_BASE + b;
      img.alt = '';
      img.width = 24; img.height = 24;
      img.decoding = 'async';
      return img;
    }
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'tool-logo');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.setProperty('--brand', b[0]);
    if (b[1]) svg.style.setProperty('--brand-l', b[1]);
    var use = document.createElementNS(NS, 'use');
    use.setAttribute('href', SPRITE + '#lg-' + slug);
    svg.appendChild(use);
    return svg;
  }

  window.AO_LOGOS = { make: make, slugFor: function (name) { return NAMES[String(name).trim().toLowerCase()] || null; } };

  document.querySelectorAll('[data-logo]').forEach(function (el) {
    var logo = make(el.getAttribute('data-logo'));
    if (!logo) return;
    var dot = el.querySelector('.dot');
    if (dot) dot.replaceWith(logo); else el.insertBefore(logo, el.firstChild);
  });

  document.querySelectorAll('.badge, .stack-pill, .tool-badge').forEach(function (el) {
    var slug = NAMES[el.textContent.trim().toLowerCase()];
    var logo = slug && make(slug);
    if (!logo) return;
    var dot = el.querySelector('.dot');
    if (dot) dot.replaceWith(logo); else el.insertBefore(logo, el.firstChild);
    el.classList.add('has-logo');
  });
})();

/* ── Card spotlight ──
   Project cards light up under the pointer. */
(function initCardSpotlight() {
  if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.pcard').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
