# Writing Page v2 — Design

**Date:** 2026-07-16
**Status:** Approved by Adil (conversation, 2026-07-16)

## Goal

Recreate the Writing page (deleted in commit `e55deba`) and elevate its design.
The TfL Somalis in Tech story appears first as the featured "cover story"
because it is the newest post — the featured slot always shows the newest
post, not a permanent pin.

## Scope

- Recreate `writing.html` with an elevated, magazine-style design.
- Re-add the "Writing" link to the nav and footer of all site pages
  (`index.html`, `projects.html`, `about.html`, `skills.html`,
  `contact.html`, `404.html`, and the pages in `posts/`).
- Restore `writing.html` and the two post URLs to `sitemap.xml`.

Out of scope: post content. `posts/` is intact on disk (both articles,
`post-template.html`, `posts.json`) and needs no changes.

## Page structure (top to bottom)

1. **Hero** — existing page-hero pattern: label "Writing", title
   "Notes from *the work*.", subtitle, live post count.
2. **Filter bar** — same topic filters as before: All, Data Engineering,
   Community, Analytics Engineering, Machine Learning, Data Quality.
3. **Cover story** — newest post, full width. Mono eyebrow
   `№ 01 · Cover Story · <Topic>`, large Instrument Serif display title,
   excerpt, and inline meta (date · read time · topic), "Read →" link.
4. **Articles grid** — remaining posts as refined cards numbered `№ 02…`,
   with tag, date, read time, excerpt, and sharper hover states consistent
   with the site's existing card language.
5. **Coming up** — trimmed from six teasers to the three strongest:
   dbt Patterns & Analytics Engineering, Lakehouse Design Decisions,
   Data Quality as Engineering.
6. **Collaborate CTA** — kept as before ("Want to *collaborate*?" → contact).

## Behaviour

- Posts defined in one `POSTS` array in the page script, mirrored in
  `posts/posts.json` for crawlers; the inline comment block explaining how
  to add a post is kept.
- Newest-first sort by date; featured = newest.
- Filters hide/show cards including the cover story; empty state preserved.
- No new dependencies: same Google Fonts, `assets/style.css`, page-scoped
  `<style>` block, `assets/script.js`.

## Consistency constraints

- Use existing design tokens (accent, borders, radius, mono labels, fonts).
- Nav/footer markup identical to the other pages, plus the Writing link.
- No job-seeking language anywhere (site-wide preference).
- Standard meta set (OG/Twitter, canonical, theme-color, apple-touch-icon,
  versioned stylesheet link) matching the current pages, not the old page's
  stale versions.
