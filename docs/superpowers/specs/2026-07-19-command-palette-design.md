# Command Palette — Design Spec

**Date:** 2026-07-19
**Status:** Approved for planning

## Purpose

A keyboard-driven quick-navigation overlay for the whole site. Visitors press
`Cmd/Ctrl+K` (or `/`, or click a nav button) to open a search panel, type to
filter, and hit Enter to jump to any page, project, or article. It is the final
interactive feature for the portfolio and should feel native to the existing
Noir Editorial design system.

## Scope

Searchable entries (~25 total), grouped into three sections:

- **Pages (6):** Home, About, Projects, Skills, Writing, Contact.
- **Projects (17):** the 12 main project cards plus the 5 mini-cards on
  `projects.html`. Each entry deep-links to `projects.html#<card-id>`
  (anchor `id`s added to cards where missing).
- **Writing (2):** the two articles in `posts/posts.json`, linking directly to
  their `posts/<slug>.html` pages. The list is duplicated statically in the
  palette data — acceptable because articles change rarely and the Writing page
  already duplicates this data pattern.

Out of scope: full-text search, fetching `posts.json` at runtime, analytics,
and any changes to existing filtering/lightbox behaviour.

## Architecture

No build tools exist, so the feature lives entirely in the shared assets:

- **`assets/script.js`** — one new IIFE module (matching the existing module
  style). It owns the palette data array, injects the dialog markup into
  `document.body` on first open, and handles all behaviour. The focus-trap and
  ARIA-dialog patterns mirror the existing lightbox module.
- **`assets/style.css`** — one new style block using existing design tokens
  (`--bg`, gold accent, mono font variables). Cache-bust query strings on both
  assets are bumped on every page.
- **HTML pages (7 root pages + 2 posts)** — each nav gains one small trigger
  button. No other markup changes.

### Path handling

Entry `href`s are stored root-relative (e.g. `projects.html#f1-raceops`,
`posts/building-a-tfl-realtime-lakehouse.html`). At runtime the module detects
whether `location.pathname` contains `/posts/` and prefixes `../` accordingly.

## UI

- Centered overlay panel, max-width ~560px, positioned in the upper third of
  the viewport. Dark navy panel on a blurred, darkened backdrop.
- Search input on top; below it a scrollable result list grouped under
  mono-font section labels (PAGES / PROJECTS / WRITING).
- Selected row highlighted with the gold accent; each row shows title and a
  muted section/keyword hint.
- Footer hint row: `↑↓ navigate · ↵ open · esc close`.
- Empty state: "No results for '<query>'".
- Nav trigger: a small pill button showing a search glyph plus `⌘K`
  (`Ctrl K` is fine to omit — the glyph communicates intent; on touch devices
  the pill is the only trigger and shows just the search glyph and "Search").
- Open/close uses a short fade/scale transition, disabled under
  `prefers-reduced-motion`.

## Behaviour

- **Open:** `Cmd/Ctrl+K` (toggles), `/` when focus is not in an input/textarea,
  or clicking the nav trigger. Opening records the previously focused element.
- **Filter:** case-insensitive substring match against title + keywords.
  Ranking: title prefix match, then title substring, then keyword match.
  Section grouping is preserved after filtering; empty sections are hidden.
- **Keyboard:** `↑/↓` move selection across section boundaries (wrapping),
  `Enter` navigates to the selected entry, `Escape` closes. Focus is trapped
  inside the dialog (`role="dialog"`, `aria-modal="true"`).
- **Mouse/touch:** hovering a row moves the selection; clicking navigates;
  clicking the backdrop closes.
- **Close:** restores focus to the recorded element; input is cleared so the
  next open starts fresh.
- Does not interfere with existing handlers: the hamburger menu's Escape
  handling and the lightbox shortcuts are unaffected (palette handlers no-op
  when the palette is closed; while open, the palette stops propagation).

## Error handling

Static data only — no network or storage. The only defensive requirement:
if an anchor id in an entry doesn't exist on `projects.html`, the browser
simply lands at the top of the page, which is acceptable degradation.

## Testing

Manual browser verification (no test framework in repo):

1. Open via `Cmd/Ctrl+K`, `/`, and the nav button on `index.html`.
2. Type to filter; verify ranking, grouping, and the empty state.
3. Full keyboard pass: arrows (with wrap), Enter navigation, Escape close,
   focus restore, focus trap.
4. From `posts/building-a-tfl-realtime-lakehouse.html`, open the palette and
   navigate to a project — verifies the `../` prefix.
5. Deep-link anchors land on the correct project cards.
6. Mobile viewport: trigger visible and usable, panel fits, hamburger menu
   still works.
7. `prefers-reduced-motion`: no open/close animation.
