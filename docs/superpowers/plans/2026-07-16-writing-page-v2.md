# Writing Page v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the Writing page with a magazine cover-story design (newest post featured — currently the TfL Somalis in Tech story) and re-link it across the site.

**Architecture:** One new static page `writing.html` (page-scoped `<style>` block + inline `POSTS` array rendered by vanilla JS, mirrored in `posts/posts.json`), plus small nav/footer edits to the 9 existing pages and a sitemap entry. Spec: `docs/superpowers/specs/2026-07-16-writing-page-v2-design.md`.

**Tech Stack:** Static HTML/CSS/vanilla JS. No build step, no test framework — verification is done with `grep` checks and a local `python3 -m http.server` smoke test.

## Global Constraints

- Theme color: `#0A0F1A` (current site value — NOT the old page's `#0B1626`).
- Stylesheet link: `assets/style.css?v=20260708` (match all current pages).
- Include `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />`.
- Fonts link identical to other pages (IBM Plex Mono, Instrument Serif, Outfit).
- Nav order everywhere: Work · About · Stack · Writing · Contact (Contact keeps `nav-cta`).
- Link prefixes: root pages use `writing.html`, `404.html` uses `/writing.html`, files in `posts/` use `../writing.html`.
- No job-seeking language anywhere.
- Featured slot = newest post by date (no permanent pin).

---

### Task 1: Create writing.html

**Files:**
- Create: `writing.html`

**Interfaces:**
- Consumes: `assets/style.css` design tokens (`--accent`, `--accent-rgb`, `--accent-dim`, `--accent-mid`, `--bg`, `--bg-surface`, `--bg-elevated`, `--border`, `--border-hover`, `--text-primary/secondary/tertiary`, `--font-mono/display`, `--radius-sm/md/lg`, `--ease-out`), shared classes (`page-hero`, `wrap`, `reveal`, `btn-primary`, nav/footer classes), `assets/script.js` (nav + reveal behaviour).
- Produces: `writing.html` at site root, linking to `posts/<slug>.html`. Later tasks link to it as `writing.html` / `/writing.html` / `../writing.html`.

- [ ] **Step 1: Write the complete file**

Write `writing.html` with exactly this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0A0F1A" />
  <title>Writing — Adil Osman</title>
  <meta name="description" content="Writing and technical notes by Adil Osman on data engineering, analytics engineering, community projects, and machine learning." />
  <meta property="og:title" content="Writing — Adil Osman" />
  <meta property="og:description" content="Technical writing on data engineering, analytics, pipeline design, and lessons from building real systems." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://aosman101.github.io/writing.html" />
  <meta property="og:image" content="https://aosman101.github.io/assets/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Writing — Adil Osman" />
  <meta name="twitter:description" content="Technical writing on data engineering, analytics, pipeline design, and lessons from building real systems." />
  <meta name="twitter:image" content="https://aosman101.github.io/assets/og-image.png" />
  <meta name="twitter:image:alt" content="Adil Osman portfolio social preview" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="canonical" href="https://aosman101.github.io/writing.html" />
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
  <link rel="stylesheet" href="assets/style.css?v=20260708" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://aosman101.github.io/" },
      { "@type": "ListItem", "position": 2, "name": "Writing", "item": "https://aosman101.github.io/writing.html" }
    ]
  }
  </script>
  <style>
    /* ── Post count ── */
    .post-count {
      font-family: var(--font-mono); font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--text-tertiary); margin-top: 1rem;
    }
    .post-count span { color: var(--accent); }

    /* ── Filter tabs ── */
    .filter-bar {
      display: flex; flex-wrap: wrap; gap: 0.5rem;
      margin-bottom: 3rem;
    }
    .filter-btn {
      font-family: var(--font-mono); font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-tertiary); background: none;
      border: 1px solid var(--border); border-radius: 100px;
      padding: 0.4rem 1rem; cursor: pointer;
      transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }
    .filter-btn:hover { color: var(--text-secondary); border-color: var(--border-hover); }
    .filter-btn.active {
      color: var(--accent); border-color: var(--accent-mid);
      background: var(--accent-dim);
    }

    /* ── Cover story (newest post) ── */
    .cover-story {
      display: block; position: relative; overflow: hidden;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: clamp(2.25rem, 5vw, 3.75rem);
      text-decoration: none; margin-bottom: 2.5rem;
      transition: border-color 0.3s var(--ease-out), transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
    }
    .cover-story::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--accent-mid), transparent);
      opacity: 0; transition: opacity 0.3s ease;
    }
    .cover-story::after {
      content: '';
      position: absolute; bottom: -80px; left: -80px;
      width: 280px; height: 280px;
      background: radial-gradient(ellipse, rgba(var(--accent-rgb),0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .cover-story:hover { border-color: var(--accent-mid); transform: translateY(-4px); box-shadow: 0 24px 64px rgba(0,0,0,0.08); }
    .cover-story:hover::before { opacity: 1; }
    .cover-eyebrow {
      display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;
      font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--text-tertiary); margin-bottom: 1.5rem;
    }
    .cover-eyebrow .cover-num { color: var(--accent); }
    .cover-eyebrow .cover-tag {
      color: var(--accent); background: var(--accent-dim);
      padding: 0.2rem 0.65rem; border-radius: 100px;
      border: 1px solid rgba(var(--accent-rgb),0.18);
      letter-spacing: 0.12em;
    }
    .cover-title {
      font-family: var(--font-display); font-weight: 400;
      font-size: clamp(1.9rem, 4.5vw, 3rem); line-height: 1.12;
      letter-spacing: -0.025em; color: var(--text-primary);
      max-width: 24ch; margin-bottom: 1.25rem;
    }
    .cover-title em { font-style: italic; color: var(--accent); }
    .cover-excerpt {
      font-size: 1rem; color: var(--text-secondary);
      line-height: 1.75; max-width: 62ch; margin-bottom: 2rem;
    }
    .cover-meta {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
      font-family: var(--font-mono); font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .cover-meta-dot {
      width: 3px; height: 3px; border-radius: 50%;
      background: var(--text-tertiary); opacity: 0.6;
    }
    .cover-read {
      margin-left: auto; color: var(--accent);
      display: flex; align-items: center; gap: 0.5rem;
      letter-spacing: 0.12em;
      transition: gap 0.2s var(--ease-out);
    }
    .cover-story:hover .cover-read { gap: 0.8rem; }

    /* ── Article cards ── */
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.25rem;
      margin-bottom: 5rem;
    }
    .article-card {
      display: flex; flex-direction: column;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 2rem;
      text-decoration: none; position: relative; overflow: hidden;
      transition: border-color 0.3s var(--ease-out), transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
    }
    .article-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--accent), transparent 60%);
      opacity: 0; transition: opacity 0.3s ease;
    }
    .article-card:hover { border-color: var(--accent-mid); transform: translateY(-4px); box-shadow: 0 20px 56px rgba(0,0,0,0.07); }
    .article-card:hover::before { opacity: 1; }
    .article-num {
      font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500;
      letter-spacing: 0.15em; color: var(--accent);
      text-transform: uppercase;
    }
    .article-meta {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 1.125rem; flex-wrap: wrap;
    }
    .article-tag {
      font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--accent); background: var(--accent-dim);
      padding: 0.2rem 0.65rem; border-radius: 100px;
      border: 1px solid rgba(var(--accent-rgb),0.18);
    }
    .article-date {
      font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500;
      letter-spacing: 0.1em; color: var(--text-tertiary);
      text-transform: uppercase;
    }
    .article-readtime {
      font-family: var(--font-mono); font-size: 0.6rem;
      letter-spacing: 0.08em; color: var(--text-tertiary);
    }
    .article-title {
      font-family: var(--font-display); font-weight: 400;
      font-size: 1.3rem; line-height: 1.3; letter-spacing: -0.01em;
      color: var(--text-primary); margin-bottom: 0.75rem;
    }
    .article-excerpt {
      font-size: 0.875rem; color: var(--text-secondary);
      line-height: 1.7; flex: 1; margin-bottom: 1.25rem;
    }
    .article-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto;
    }
    .article-read-link {
      font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--accent); display: flex; align-items: center; gap: 0.4rem;
      transition: gap 0.2s var(--ease-out);
    }
    .article-card:hover .article-read-link { gap: 0.7rem; }

    /* ── Upcoming topics ── */
    .upcoming-label {
      font-family: var(--font-mono); font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--text-tertiary); margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 0.625rem;
    }
    .upcoming-label::after {
      content: ''; display: block; height: 1px; width: 40px;
      background: var(--border);
    }
    .topics-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
    }
    .topic-card {
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-md); padding: 1.25rem 1.5rem;
      transition: border-color 0.2s ease, transform 0.2s ease;
      opacity: 0.7;
    }
    .topic-card:hover { border-color: var(--border-hover); opacity: 1; transform: translateY(-2px); }
    .topic-card-num {
      font-family: var(--font-mono); font-size: 0.58rem; font-weight: 500;
      letter-spacing: 0.15em; color: var(--text-tertiary);
      text-transform: uppercase; margin-bottom: 0.6rem;
    }
    .topic-card-title {
      font-size: 0.9rem; font-weight: 500;
      color: var(--text-secondary); margin-bottom: 0.4rem;
    }
    .topic-card-desc {
      font-size: 0.78rem; color: var(--text-tertiary); line-height: 1.55;
    }

    /* ── Empty state ── */
    .empty-state {
      text-align: center; padding: 4rem 2rem;
      color: var(--text-tertiary); font-size: 0.9rem;
      display: none;
    }
    .empty-state.visible { display: block; }

    /* ── Collaborate CTA ── */
    .writing-cta {
      background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 3rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap; position: relative; overflow: hidden;
      margin-top: 2rem;
    }
    .writing-cta::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-mid), transparent);
    }
    .writing-cta h3 {
      font-family: var(--font-display); font-weight: 400;
      font-size: 1.5rem; letter-spacing: -0.02em;
    }
    .writing-cta h3 em { font-style: italic; color: var(--accent); }
    .writing-cta p { font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.375rem; }

    @media (max-width: 900px) {
      .topics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .topics-grid { grid-template-columns: 1fr; }
      .articles-grid { grid-template-columns: 1fr; }
      .writing-cta { flex-direction: column; align-items: flex-start; }
      .cover-meta { gap: 0.6rem; }
      .cover-read { margin-left: 0; width: 100%; margin-top: 0.5rem; }
    }
  </style>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>

<nav id="nav" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">AO<em>.</em></a>
    <ul class="nav-links" id="navLinks" role="list">
      <li><a href="projects.html">Work</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="skills.html">Stack</a></li>
      <li><a href="writing.html">Writing</a></li>
      <li><a href="contact.html" class="nav-cta">Contact</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<main id="main">
<div class="page-hero" style="background:var(--bg-surface); border-bottom:1px solid var(--border);">
  <div class="wrap">
    <div class="page-hero-label">Writing</div>
    <h1 class="page-hero-title">Notes from <em>the work</em>.</h1>
    <p class="page-hero-sub">Honest writing on data engineering, analytics, pipeline design, and lessons from building real systems.</p>
    <p class="post-count" id="postCount"></p>
  </div>
</div>

<section aria-labelledby="writing-heading">
  <div class="wrap">
    <h2 class="visually-hidden" id="writing-heading">Articles</h2>

    <!-- Filter bar -->
    <div class="filter-bar reveal" role="group" aria-label="Filter articles by topic">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="data-engineering">Data Engineering</button>
      <button class="filter-btn" data-filter="community">Community</button>
      <button class="filter-btn" data-filter="analytics-engineering">Analytics Engineering</button>
      <button class="filter-btn" data-filter="machine-learning">Machine Learning</button>
      <button class="filter-btn" data-filter="data-quality">Data Quality</button>
    </div>

    <!-- Cover story (newest post) — populated dynamically -->
    <div id="coverStory" class="reveal"></div>

    <!-- Remaining articles grid -->
    <div class="articles-grid" id="articlesGrid"></div>

    <div class="empty-state" id="emptyState" aria-live="polite">
      No posts in this category yet — check back soon.
    </div>

    <!-- Upcoming topics -->
    <div class="reveal" style="margin-top:1rem">
      <div class="upcoming-label" aria-hidden="true">Coming up</div>
      <div class="topics-grid" aria-label="Upcoming topics">

        <div class="topic-card">
          <div class="topic-card-num">Next up</div>
          <div class="topic-card-title">dbt Patterns &amp; Analytics Engineering</div>
          <div class="topic-card-desc">Model structure, data contracts, testing strategies, and tradeoffs in analytics engineering.</div>
        </div>

        <div class="topic-card">
          <div class="topic-card-num">Coming soon</div>
          <div class="topic-card-title">Lakehouse Design Decisions</div>
          <div class="topic-card-desc">Bronze/silver/gold tradeoffs, DuckDB vs BigQuery, and local-first data platforms.</div>
        </div>

        <div class="topic-card">
          <div class="topic-card-num">Coming soon</div>
          <div class="topic-card-title">Data Quality as Engineering</div>
          <div class="topic-card-desc">Schema tests, row-level validation, and why quality is never optional in production.</div>
        </div>

      </div>
    </div>

    <!-- CTA -->
    <div class="writing-cta reveal">
      <div>
        <h3>Want to <em>collaborate</em>?</h3>
        <p>If you're building pipelines, working on data quality, or teaching data engineering — let's connect.</p>
      </div>
      <a href="contact.html" class="btn-primary">
        Get in Touch
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1 6.5h11M7 1l5.5 5.5L7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>

  </div>
</section>

</main>

<footer role="contentinfo">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a href="index.html" class="foot-logo">AO<em>.</em></a>
        <p class="foot-tagline">Data Engineer &amp; Analytics Engineer building reliable pipelines and analytics-ready data systems in London.</p>
        <div class="foot-social">
          <a href="https://github.com/aosman101" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 11c0 .9.4 1.4.9 1.9.4-.5.9-.9.9-1.9"/><path d="M7.5 1.5a5.5 5.5 0 00-1.92 10.65c.27.04.36-.12.36-.26v-1.1c-1.5.33-1.82-.72-1.82-.72a1.43 1.43 0 00-.6-.79c-.49-.33.04-.32.04-.32a1.14 1.14 0 01.83.56 1.16 1.16 0 001.58.45 1.15 1.15 0 01.34-.72C4.7 10.2 3.3 9.7 3.3 7.3a2.13 2.13 0 01.57-1.48 2 2 0 01.05-1.46s.46-.15 1.52.56a5.2 5.2 0 012.76 0c1.05-.71 1.51-.56 1.51-.56a2 2 0 01.06 1.46 2.13 2.13 0 01.57 1.48c0 2.4-1.46 2.92-2.85 3.07a1.3 1.3 0 01.37 1v1.49c0 .14.08.3.37.26A5.5 5.5 0 007.5 1.5z"/></svg></a>
          <a href="https://www.linkedin.com/in/adil-osman-303185297/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="1" width="13" height="13" rx="2"/><path d="M4.5 6.5v4M4.5 4v.5"/><path d="M7.5 10.5v-2A1.5 1.5 0 0110.5 10v.5" stroke-linejoin="round"/></svg></a>
          <a href="mailto:aosman10020@gmail.com" aria-label="Email"><svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="1" y="3" width="13" height="9" rx="1.5"/><path d="M1 5l6.5 4.5L14 5"/></svg></a>
        </div>
      </div>
      <div class="foot-nav-col">
        <div class="foot-col-title">Navigation</div>
        <a href="projects.html">Work</a>
        <a href="about.html">About</a>
        <a href="skills.html">Stack</a>
        <a href="writing.html">Writing</a>
        <a href="contact.html">Contact</a>
      </div>
      <div class="foot-nav-col">
        <div class="foot-col-title">Connect</div>
        <a href="https://github.com/aosman101" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/adil-osman-303185297/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:aosman10020@gmail.com">Email</a>
      </div>
    </div>
    <div class="foot-bottom">
      <p class="foot-copy">&copy; 2026 <span>Adil Osman</span> &nbsp;·&nbsp; London, UK</p>
      <p class="foot-built">Built with precision</p>
    </div>
  </div>
</footer>

<script src="assets/script.js"></script>
<script>
  // ─────────────────────────────────────────────────────────────
  //  ADD A NEW ARTICLE
  //  1. Duplicate posts/post-template.html → posts/<slug>.html
  //  2. Write your article inside that new file
  //  3. Add a new object to the POSTS array below
  //     Fields:
  //       slug      → filename without .html (must match the file)
  //       title     → article title (plain text)
  //       titleHtml → OPTIONAL — title with <em>…</em> accents, used
  //                   only when the post is the cover story
  //       excerpt   → one-paragraph summary for the card
  //       date      → YYYY-MM-DD (newest post becomes the cover story)
  //       readTime  → estimated minutes to read (number)
  //       tag       → display label e.g. "Data Engineering"
  //       filterTag → slug form used by the filter buttons above
  //  4. Keep posts/posts.json in sync so search engines see it too.
  // ─────────────────────────────────────────────────────────────
  const POSTS = [
    {
      slug: "building-the-tfl-travel-app-with-somalis-in-tech",
      title: "Building the TfL Travel App with Somalis in Tech",
      titleHtml: "Building the TfL Travel App with <em>Somalis in Tech</em>",
      excerpt: "How a community data engineering project became a real tool for London students and commuters — and what it taught me about building software that actually helps people.",
      date: "2026-04-09",
      readTime: 12,
      tag: "Community",
      filterTag: "community"
    },
    {
      slug: "building-a-tfl-realtime-lakehouse",
      title: "Building a Real-Time TfL Lakehouse from Scratch",
      excerpt: "How I designed and built a production-style streaming data lakehouse using the TfL Unified API — covering Airflow orchestration, DuckDB, dbt transformations, Great Expectations validation, and OpenLineage lineage tracking. Built as a teaching tool for Somalis in Tech, helping students and users understand real-world pipeline design.",
      date: "2026-03-24",
      readTime: 8,
      tag: "Data Engineering",
      filterTag: "data-engineering"
    }
  ];

  const coverEl = document.getElementById('coverStory');
  const grid = document.getElementById('articlesGrid');
  const emptyState = document.getElementById('emptyState');
  const postCountEl = document.getElementById('postCount');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const arrowSvg = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1 6.5h11M7 1l5.5 5.5L7 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderCover(p) {
    coverEl.innerHTML =
      '<a href="posts/' + p.slug + '.html" class="cover-story" data-tags="' + p.filterTag + '">' +
        '<div class="cover-eyebrow">' +
          '<span class="cover-num">№ 01</span><span aria-hidden="true">·</span>' +
          '<span>Cover Story</span><span aria-hidden="true">·</span>' +
          '<span class="cover-tag">' + p.tag + '</span>' +
        '</div>' +
        '<h3 class="cover-title">' + (p.titleHtml || p.title) + '</h3>' +
        '<p class="cover-excerpt">' + p.excerpt + '</p>' +
        '<div class="cover-meta">' +
          '<span>' + formatDate(p.date) + '</span>' +
          '<span class="cover-meta-dot" aria-hidden="true"></span>' +
          '<span>' + p.readTime + ' min read</span>' +
          '<span class="cover-meta-dot" aria-hidden="true"></span>' +
          '<span>' + p.tag + '</span>' +
          '<span class="cover-read">Read story ' + arrowSvg + '</span>' +
        '</div>' +
      '</a>';
  }

  function renderCards(posts) {
    grid.innerHTML = '';
    posts.forEach(function(p, i) {
      var a = document.createElement('a');
      a.className = 'article-card reveal';
      a.href = 'posts/' + p.slug + '.html';
      a.dataset.tags = p.filterTag;
      a.innerHTML =
        '<div class="article-meta">' +
          '<span class="article-num">№ ' + pad2(i + 2) + '</span>' +
          '<span class="article-tag">' + p.tag + '</span>' +
          '<span class="article-date">' + formatDate(p.date) + '</span>' +
          '<span class="article-readtime">&middot; ' + p.readTime + ' min read</span>' +
        '</div>' +
        '<h3 class="article-title">' + p.title + '</h3>' +
        '<p class="article-excerpt">' + p.excerpt + '</p>' +
        '<div class="article-footer">' +
          '<span class="article-read-link">Read post ' + arrowSvg + '</span>' +
        '</div>';
      grid.appendChild(a);
    });
  }

  function applyFilter(filter) {
    var cover = coverEl.querySelector('.cover-story');
    var cards = grid.querySelectorAll('.article-card');
    var visible = 0;

    if (cover) {
      var cTags = cover.dataset.tags || '';
      var cShow = filter === 'all' || cTags.split(',').map(function(t){return t.trim()}).indexOf(filter) !== -1;
      cover.style.display = cShow ? '' : 'none';
      if (cShow) visible++;
    }

    cards.forEach(function(card) {
      var tags = card.dataset.tags || '';
      var show = filter === 'all' || tags.split(',').map(function(t){return t.trim()}).indexOf(filter) !== -1;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    emptyState.classList.toggle('visible', visible === 0);
  }

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  var sorted = POSTS.slice().sort(function(a, b) { return b.date.localeCompare(a.date); });
  if (sorted.length > 0) {
    renderCover(sorted[0]);
    renderCards(sorted.slice(1));
    postCountEl.innerHTML = '<span>' + pad2(sorted.length) + '</span> stories published';
  } else {
    emptyState.classList.add('visible');
  }
</script>
</body>
</html>
```

- [ ] **Step 2: Verify file structure**

Run:
```bash
grep -c 'id="coverStory"\|id="articlesGrid"\|id="emptyState"\|id="postCount"' writing.html
grep -c 'style.css?v=20260708' writing.html
grep -c '#0A0F1A' writing.html
grep -c 'apple-touch-icon' writing.html
grep -c 'writing.html' writing.html
```
Expected: `4`, `1`, `1`, `1`, and ≥5 (canonical, og:url, JSON-LD, nav, footer).

- [ ] **Step 3: Commit**

```bash
git add writing.html
git commit -m "feat: recreate writing page with magazine cover-story design"
```

---

### Task 2: Re-add Writing links to nav and footer on all pages

**Files:**
- Modify: `index.html`, `projects.html`, `about.html`, `skills.html`, `contact.html` (nav ~lines 143–182 area, footer Navigation column)
- Modify: `404.html` (absolute `/writing.html` paths)
- Modify: `posts/building-the-tfl-travel-app-with-somalis-in-tech.html`, `posts/building-a-tfl-realtime-lakehouse.html`, `posts/post-template.html` (`../writing.html` paths)

**Interfaces:**
- Consumes: `writing.html` from Task 1.
- Produces: nothing consumed later; nav order everywhere becomes Work · About · Stack · Writing · Contact.

- [ ] **Step 1: Nav edits — root pages**

In each of `index.html`, `projects.html`, `about.html`, `skills.html`, `contact.html`, insert before the Contact nav item:

Old:
```html
      <li><a href="skills.html">Stack</a></li>
      <li><a href="contact.html" class="nav-cta">Contact</a></li>
```
New:
```html
      <li><a href="skills.html">Stack</a></li>
      <li><a href="writing.html">Writing</a></li>
      <li><a href="contact.html" class="nav-cta">Contact</a></li>
```

- [ ] **Step 2: Nav edit — 404.html** (absolute paths)

Old:
```html
      <li><a href="/skills.html">Stack</a></li>
      <li><a href="/contact.html" class="nav-cta">Contact</a></li>
```
New:
```html
      <li><a href="/skills.html">Stack</a></li>
      <li><a href="/writing.html">Writing</a></li>
      <li><a href="/contact.html" class="nav-cta">Contact</a></li>
```

- [ ] **Step 3: Nav edits — posts pages** (all three files in `posts/`)

Old:
```html
      <li><a href="../skills.html">Stack</a></li>
      <li><a href="../contact.html" class="nav-cta">Contact</a></li>
```
New:
```html
      <li><a href="../skills.html">Stack</a></li>
      <li><a href="../writing.html">Writing</a></li>
      <li><a href="../contact.html" class="nav-cta">Contact</a></li>
```

- [ ] **Step 4: Footer edits — root pages**

Root pages use one link per line in the footer Navigation column:

Old:
```html
        <a href="skills.html">Stack</a>
        <a href="contact.html">Contact</a>
```
New:
```html
        <a href="skills.html">Stack</a>
        <a href="writing.html">Writing</a>
        <a href="contact.html">Contact</a>
```

Posts pages use a single-line footer Navigation column:

Old:
```html
        <a href="../projects.html">Work</a><a href="../about.html">About</a><a href="../skills.html">Stack</a><a href="../contact.html">Contact</a>
```
New:
```html
        <a href="../projects.html">Work</a><a href="../about.html">About</a><a href="../skills.html">Stack</a><a href="../writing.html">Writing</a><a href="../contact.html">Contact</a>
```

For `404.html`, check whether it has a footer Navigation column; if so apply the same edit with `/writing.html` paths. If it has no footer nav, skip.

- [ ] **Step 5: Verify link counts**

Run:
```bash
for f in index.html projects.html about.html skills.html contact.html; do echo "$f: $(grep -c 'writing.html' $f)"; done
grep -c '/writing.html' 404.html
for f in posts/*.html; do echo "$f: $(grep -c '\.\./writing.html' $f)"; done
```
Expected: each root page ≥2 (nav + footer), `404.html` ≥1, each posts file ≥2 (nav + footer).

- [ ] **Step 6: Commit**

```bash
git add index.html projects.html about.html skills.html contact.html 404.html posts/
git commit -m "feat: restore Writing links in nav and footer across all pages"
```

---

### Task 3: Restore writing.html to sitemap

**Files:**
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: `writing.html` URL from Task 1.
- Produces: nothing downstream.

- [ ] **Step 1: Add writing.html entry and refresh lastmod dates**

Insert after the `skills.html` `<url>` block:

```xml
  <url>
    <loc>https://aosman101.github.io/writing.html</loc>
    <lastmod>2026-07-16</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

Update `<lastmod>` to `2026-07-16` for every page modified in Task 2 that appears in the sitemap: `/`, `projects.html`, `about.html`, `skills.html`, `contact.html`, and both post URLs.

- [ ] **Step 2: Verify well-formed XML**

Run: `python3 -c "import xml.dom.minidom; xml.dom.minidom.parse('sitemap.xml'); print('OK')" && grep -c '<loc>' sitemap.xml`
Expected: `OK` and `8`.

- [ ] **Step 3: Commit**

```bash
git add sitemap.xml
git commit -m "feat: add writing page back to sitemap"
```

---

### Task 4: End-to-end smoke test

**Files:** none (verification only)

- [ ] **Step 1: Serve the site locally**

Run: `python3 -m http.server 8912` (in background, from repo root)

- [ ] **Step 2: Check every page responds and links resolve**

```bash
for p in "" index.html writing.html projects.html about.html skills.html contact.html posts/building-the-tfl-travel-app-with-somalis-in-tech.html posts/building-a-tfl-realtime-lakehouse.html; do curl -s -o /dev/null -w "%{http_code} $p\n" "http://localhost:8912/$p"; done
```
Expected: all `200`.

- [ ] **Step 3: Visual check in browser**

Open `http://localhost:8912/writing.html` and confirm: cover story shows the Somalis in Tech post with `№ 01 · Cover Story · Community` eyebrow and italic accent in the title; the lakehouse post renders as card `№ 02`; filters work (Community shows only cover; Machine Learning shows empty state); nav Writing link highlighted pages navigate correctly; mobile width (≤640px) lays out cleanly.

- [ ] **Step 4: Stop the server**
