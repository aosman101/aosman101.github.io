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
    const match = el.textContent.trim().match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    if (target < 2) return;
    const suffix = match[2];
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
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
    { title: 'Contact', section: 'Pages', href: 'contact.html', keywords: 'email get in touch hire' },
    { title: 'TfL Real-Time Lakehouse', section: 'Projects', href: 'projects.html#tfl-lakehouse', keywords: 'streaming airflow duckdb dbt data engineering real-time' },
    { title: 'StreamShop CDC Analytics Stack', section: 'Projects', href: 'projects.html#streamshop-cdc', keywords: 'debezium kafka change data capture streaming' },
    { title: 'London Air Quality & Weather Lakehouse', section: 'Projects', href: 'projects.html#air-quality-lakehouse', keywords: 'data engineering lakehouse weather pollution' },
    { title: 'F1 RaceOps Analytics Warehouse', section: 'Projects', href: 'projects.html#f1-raceops', keywords: 'formula 1 dbt warehouse analytics racing' },
    { title: 'Premier League Analytics Warehouse', section: 'Projects', href: 'projects.html#premier-league-warehouse', keywords: 'football soccer dbt warehouse analytics' },
    { title: 'Mini Lake — dbt + DuckDB', section: 'Projects', href: 'projects.html#mini-lake', keywords: 'dbt duckdb analytics engineering' },
    { title: 'Deep Stock Insights', section: 'Projects', href: 'projects.html#deep-stock-insights', keywords: 'financial prediction platform machine learning stocks' },
    { title: 'AI Trading Agent', section: 'Projects', href: 'projects.html#ai-trading-agent', keywords: 'machine learning trading llm agent' },
    { title: 'Stock Market Prediction with LSTM', section: 'Projects', href: 'projects.html#lstm-prediction', keywords: 'machine learning neural network time series' },
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
