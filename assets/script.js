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

/* ── Active nav link (highlight current page) ── */
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
})();
