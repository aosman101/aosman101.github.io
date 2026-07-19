# Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A site-wide `Cmd/Ctrl+K` command palette that lets visitors jump to any page, project card, or article.

**Architecture:** One new IIFE module appended to the shared `assets/script.js` injects the palette dialog into `document.body` and owns all behaviour; one new style block appended to `assets/style.css` styles it with existing design tokens. Each page's nav gains a single trigger button; project cards on `projects.html` gain anchor `id`s for deep links.

**Tech Stack:** Vanilla JS (ES5-style IIFE, matching existing modules), plain CSS with existing custom properties. No dependencies, no build step.

**Spec:** `docs/superpowers/specs/2026-07-19-command-palette-design.md`

## Global Constraints

- Static GitHub Pages site — no build tools, no npm, no test framework. Verification is `node --check`, grep assertions, and a manual browser pass.
- All styling MUST use existing tokens from `:root` in `assets/style.css` (`--bg-surface`, `--bg-elevated`, `--border`, `--border-hover`, `--accent`, `--accent-dim`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--font-mono`, `--radius-md`, `--ease-out`, `--nav-h`).
- JS follows the existing `script.js` idiom: self-contained IIFE, `var`, no arrow functions, ARIA attributes managed explicitly (see the lightbox module in the same file for the reference pattern).
- Palette overlay `z-index: 1100` (above lightbox at 1000, below skip-link/progress at 9999+).
- `prefers-reduced-motion: reduce` disables open/close transitions.
- Cache-bust: bump `style.css?v=20260708` → `style.css?v=20260719` and add `?v=20260719` to every `script.js` reference, on **all 10 HTML files** (7 root pages + 3 files in `posts/`).
- Commit after every task with a `feat:`/`chore:` message ending in the session trailer.

---

### Task 1: Palette + trigger styles in `assets/style.css`

**Files:**
- Modify: `assets/style.css` (append to end of file, after the lightbox `@media (max-width: 640px)` block)

**Interfaces:**
- Produces class names consumed by Task 2's injected markup and Task 3's nav button: `.nav-search`, `.nav-search-kbd`, `.cmdk`, `.cmdk.open`, `.cmdk-panel`, `.cmdk-input`, `.cmdk-list`, `.cmdk-section`, `.cmdk-row`, `.cmdk-row.selected`, `.cmdk-row-title`, `.cmdk-row-hint`, `.cmdk-empty`, `.cmdk-footer`.
- Produces `scroll-margin-top` on `.pcard[id]` / `.mini-card[id]` so Task 3's anchors land below the fixed nav.

- [ ] **Step 1: Append the style block**

Append to the end of `assets/style.css`:

```css
/* ================================================================
   COMMAND PALETTE (Cmd/Ctrl+K)
================================================================ */
.nav-search {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.4rem 0.75rem; margin-left: 1rem;
  background: transparent; border: 1px solid var(--border); border-radius: 999px;
  color: var(--text-tertiary); cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.nav-search:hover { color: var(--text-primary); border-color: var(--border-hover); }
.nav-search svg { width: 13px; height: 13px; }
.nav-search-kbd {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em;
  color: var(--text-tertiary);
}
@media (hover: none) { .nav-search-kbd { display: none; } }
@media (max-width: 768px) { .nav-search { margin-left: auto; margin-right: 0.85rem; } }

.pcard[id], .mini-card[id] { scroll-margin-top: calc(var(--nav-h) + 24px); }

.cmdk {
  position: fixed; inset: 0; z-index: 1100;
  background: rgba(6, 10, 18, 0.62);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  display: flex; align-items: flex-start; justify-content: center;
  padding: clamp(4rem, 14vh, 9rem) 1.25rem 1.25rem;
  opacity: 0; pointer-events: none;
  transition: opacity 0.18s ease;
}
.cmdk.open { opacity: 1; pointer-events: auto; }
.cmdk-panel {
  width: 100%; max-width: 560px;
  background: var(--bg-surface); border: 1px solid var(--border-hover);
  border-radius: var(--radius-md); overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  transform: translateY(8px) scale(0.98);
  transition: transform 0.18s var(--ease-out);
}
.cmdk.open .cmdk-panel { transform: none; }
.cmdk-input {
  width: 100%; padding: 1rem 1.15rem;
  background: transparent; border: none; border-bottom: 1px solid var(--border);
  color: var(--text-primary); font-family: var(--font-body); font-size: 0.95rem;
  outline: none;
}
.cmdk-input::placeholder { color: var(--text-muted); }
.cmdk-list { max-height: min(46vh, 380px); overflow-y: auto; padding: 0.5rem 0; }
.cmdk-section {
  padding: 0.65rem 1.15rem 0.35rem;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em;
  color: var(--text-muted);
}
.cmdk-row {
  display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
  padding: 0.55rem 1.15rem; cursor: pointer;
  border-left: 2px solid transparent;
}
.cmdk-row.selected { background: var(--accent-dim); border-left-color: var(--accent); }
.cmdk-row-title { font-size: 0.875rem; color: var(--text-secondary); }
.cmdk-row.selected .cmdk-row-title { color: var(--text-primary); }
.cmdk-row-hint {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--text-muted); white-space: nowrap;
}
.cmdk-empty { padding: 1.5rem 1.15rem; font-size: 0.85rem; color: var(--text-muted); }
.cmdk-footer {
  display: flex; gap: 1.25rem; padding: 0.6rem 1.15rem;
  border-top: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--text-muted);
}
@media (prefers-reduced-motion: reduce) {
  .cmdk, .cmdk-panel { transition: none; }
}
```

- [ ] **Step 2: Verify the file still parses sanely**

Run: `grep -c 'cmdk' assets/style.css`
Expected: `>= 15` (all new selectors present)

Run: `node -e "const c=require('fs').readFileSync('assets/style.css','utf8'); let d=0; for(const ch of c){if(ch==='{')d++; if(ch==='}')d--; if(d<0)throw 'unbalanced'}; if(d!==0)throw 'unbalanced'; console.log('braces balanced')"`
Expected: `braces balanced`

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "feat: add command palette and nav search trigger styles"
```

---

### Task 2: Palette module in `assets/script.js`

**Files:**
- Modify: `assets/script.js` (append new IIFE at end of file, after the active-nav module)

**Interfaces:**
- Consumes CSS classes from Task 1 (`.cmdk*`, `.nav-search`, `.nav-search-kbd`).
- Consumes (Task 3): a `<button class="nav-search">` present in each page's nav containing a `<span class="nav-search-kbd">⌘K</span>`. The module must not fail on pages where no trigger exists.
- Produces: global keyboard shortcuts `Cmd/Ctrl+K` and `/`; navigation to entry hrefs. Anchor ids referenced here MUST match the ids Task 3 adds to `projects.html`.

- [ ] **Step 1: Append the module**

Append to the end of `assets/script.js`:

```js
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
```

- [ ] **Step 2: Verify syntax**

Run: `node --check assets/script.js`
Expected: no output (exit 0)

- [ ] **Step 3: Commit**

```bash
git add assets/script.js
git commit -m "feat: add command palette module with keyboard navigation"
```

---

### Task 3: HTML wiring — anchor ids, nav triggers, cache-bust

**Files:**
- Modify: `projects.html` (12 `.pcard` + 5 `.mini-card` opening tags get `id`s; nav trigger; cache-bust)
- Modify: `index.html`, `about.html`, `skills.html`, `contact.html`, `writing.html`, `404.html` (nav trigger; cache-bust)
- Modify: `posts/building-a-tfl-realtime-lakehouse.html`, `posts/building-the-tfl-travel-app-with-somalis-in-tech.html`, `posts/post-template.html` (nav trigger; cache-bust)

**Interfaces:**
- Consumes: `.nav-search` / `.nav-search-kbd` styles (Task 1) and click/shortcut wiring (Task 2).
- Produces: anchor ids that MUST match Task 2's `ENTRIES` hrefs exactly: `tfl-lakehouse`, `streamshop-cdc`, `air-quality-lakehouse`, `f1-raceops`, `premier-league-warehouse`, `mini-lake`, `deep-stock-insights`, `ai-trading-agent`, `lstm-prediction`, `missing-data`, `probability-fundamentals`, `linear-regression`, `fitness-gym-systems`, `fitness-gym-ui`, `wallet-polymorphism`, `coded-correspondence`, `storage-unit-manager`.

- [ ] **Step 1: Add ids to the 12 `.pcard` opening tags in `projects.html`**

The cards appear in this order (approx. lines 182–512). Edit each opening tag, e.g.:

```html
<!-- before -->
<article class="pcard wide reveal" data-cats="de streaming">
<!-- after -->
<article class="pcard wide reveal" data-cats="de streaming" id="tfl-lakehouse">
```

In document order: `tfl-lakehouse`, `streamshop-cdc`, `air-quality-lakehouse`, `f1-raceops`, `premier-league-warehouse`, `mini-lake`, `deep-stock-insights`, `ai-trading-agent`, `lstm-prediction`, `missing-data`, `probability-fundamentals`, `linear-regression`. Match each id to the card whose `.pcard-title` corresponds (TfL Real-Time Lakehouse, StreamShop CDC, London Air Quality, F1 RaceOps, Premier League, Mini Lake, Deep Stock Insights, AI Trading Agent, Stock Market LSTM, Missing Data, Chebyshev/LLN/CLT, Linear Regression) — verify by title, not just position.

- [ ] **Step 2: Add ids to the 5 `.mini-card` divs in `projects.html`** (lines ~520–568), in document order:

```html
<div class="mini-card reveal" id="fitness-gym-systems">
<div class="mini-card reveal d1" id="fitness-gym-ui">
<div class="mini-card reveal d2" id="wallet-polymorphism">
<div class="mini-card reveal d1" id="coded-correspondence">
<div class="mini-card reveal d2" id="storage-unit-manager">
```

- [ ] **Step 3: Add the nav trigger to all 10 pages**

In each file, insert between the closing `</ul>` of `.nav-links` and the `<button class="hamburger"...>`:

```html
    <button class="nav-search" aria-label="Search site (Ctrl+K or Cmd+K)">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>
      <span class="nav-search-kbd">⌘K</span>
    </button>
```

Files: `index.html`, `about.html`, `projects.html`, `skills.html`, `contact.html`, `writing.html`, `404.html`, `posts/building-a-tfl-realtime-lakehouse.html`, `posts/building-the-tfl-travel-app-with-somalis-in-tech.html`, `posts/post-template.html`.

- [ ] **Step 4: Bump cache-bust versions on all 10 pages**

- Replace every `style.css?v=20260708` with `style.css?v=20260719`.
- Replace every `script.js"` (in `<script src=...>` tags) with `script.js?v=20260719"`.
- Note `404.html` uses absolute paths (`/assets/style.css`), the rest relative — the replacement is the same either way.

- [ ] **Step 5: Verify wiring with grep**

Run: `grep -c 'id="' projects.html` and confirm the 17 new ids exist:
`for id in tfl-lakehouse streamshop-cdc air-quality-lakehouse f1-raceops premier-league-warehouse mini-lake deep-stock-insights ai-trading-agent lstm-prediction missing-data probability-fundamentals linear-regression fitness-gym-systems fitness-gym-ui wallet-polymorphism coded-correspondence storage-unit-manager; do grep -q "id=\"$id\"" projects.html || echo "MISSING: $id"; done`
Expected: no output.

Run: `grep -l 'nav-search' *.html posts/*.html | wc -l`
Expected: `10`

Run: `grep -rL 'style.css?v=20260719' *.html posts/*.html` and `grep -rl 'v=20260708' *.html posts/*.html`
Expected: no files listed by either.

- [ ] **Step 6: Commit**

```bash
git add *.html posts/*.html
git commit -m "feat: wire command palette trigger, project anchors, cache-bust bump"
```

---

### Task 4: Browser verification pass

**Files:**
- No planned changes — fixes only if verification fails (commit any as `fix:`).

- [ ] **Step 1: Serve the site locally**

Run: `python3 -m http.server 8010` (from repo root, in background).

- [ ] **Step 2: Verify on `http://localhost:8010/index.html`** (browser tools or manual):
  1. `Cmd/Ctrl+K` opens the palette; pressing it again closes it.
  2. `/` opens it; typing `/` inside the open palette input does NOT retrigger.
  3. Nav pill visible; clicking it opens the palette.
  4. Typing `tfl` shows TfL entries ranked with title matches first; typing `zzz` shows the empty state.
  5. `↑/↓` wrap across sections; `Enter` on a project navigates to `projects.html#<id>` and lands on the correct card below the fixed nav.
  6. `Escape` closes and focus returns to the trigger.

- [ ] **Step 3: Verify on `http://localhost:8010/posts/building-a-tfl-realtime-lakehouse.html`:**
  1. Palette opens; selecting "F1 RaceOps Analytics Warehouse" navigates to `../projects.html#f1-raceops` correctly.

- [ ] **Step 4: Verify mobile viewport (~390px wide):**
  1. Trigger pill visible next to the hamburger, `⌘K` label hidden at `hover:none` (emulate touch).
  2. Palette panel fits the viewport; hamburger menu still opens/closes.
  3. Contact page: focusing a form field then typing `/` does NOT open the palette.

- [ ] **Step 5: Stop the server, commit any fixes**

```bash
git add -A && git commit -m "fix: command palette verification fixes"  # only if changes exist
```
