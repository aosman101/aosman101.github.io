# Adil Osman Portfolio Website

[![Site](https://img.shields.io/website?url=https%3A%2F%2Faosman101.github.io&up_message=live&down_message=down&label=site)](https://aosman101.github.io/)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-222222?logo=githubpages&logoColor=white)](https://aosman101.github.io/)
[![Frontend](https://img.shields.io/badge/frontend-HTML5-E34F26?logo=html5&logoColor=white)](index.html)
[![Styling](https://img.shields.io/badge/styling-CSS3-1572B6?logo=css3&logoColor=white)](assets/style.css)
[![Interactivity](https://img.shields.io/badge/interactivity-Vanilla%20JavaScript-F7DF1E?logo=javascript&logoColor=000)](assets/script.js)
[![SEO](https://img.shields.io/badge/SEO-meta%20%2B%20sitemap-0A7C86)](sitemap.xml)

This repository hosts the live source for [aosman101.github.io](https://aosman101.github.io/), a static GitHub Pages portfolio for Adil Osman, a Data Engineer and Analytics Engineer based in London. The site showcases project work, technical writing, background information, tech stack, and contact details, all presented in a lightweight multi-page format without any framework overhead.

## What the Site Covers

- `Home`: positioning, featured work, stack highlights, and current availability.
- `Work`: filterable project catalogue across data engineering, analytics engineering, machine learning, and data science.
- `About`: professional background, experience timeline, education, and academic highlights.
- `Stack`: grouped breakdown of tools across pipelines, CDC, warehousing, BI, quality, cloud, and ML.
- `Writing`: published technical notes plus a reusable post template.
- `Contact`: email, LinkedIn, GitHub, and the roles this portfolio is aimed at.

## Built With

- Plain `HTML`, `CSS`, and vanilla `JavaScript`
- Shared styling in `assets/style.css`
- Shared behaviour in `assets/script.js`
- Static pages served directly from the repository root
- GitHub Pages hosting at `https://aosman101.github.io/`

## Highlights

- Responsive multi-page portfolio with mobile navigation.
- Client-side filtering for project cards and writing categories.
- Scroll reveal effects powered by `IntersectionObserver`
- SEO basics in place: page descriptions, Open Graph metadata for posts, `robots.txt`, and `sitemap.xml`
- Content-first structure that is easy to maintain without a build pipeline.

## Repository Layout

```text
aosman101.github.io/
├── index.html
├── about.html
├── projects.html
├── skills.html
├── writing.html
├── contact.html
├── posts/
│   ├── building-a-tfl-realtime-lakehouse.html
│   └── post-template.html
├── assets/
│   ├── profile.jpeg
│   ├── script.js
│   └── style.css
├── robots.txt
└── sitemap.xml
```

## Local Preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Because this is a pure static site, edits can be made directly in the HTML, CSS, and JavaScript files.

## Updating Content

- Add or revise project cards in `projects.html`, and surface selected work on `index.html`
- Publish a new article by copying `posts/post-template.html` and adding its card to `writing.html`
- Adjust shared styling in `assets/style.css` and shared interactions in `assets/script.js`

## Contact

- Website: [aosman101.github.io](https://aosman101.github.io/)
- LinkedIn: [adil-osman-303185297](https://www.linkedin.com/in/adil-osman-303185297/)
- GitHub: [aosman101](https://github.com/aosman101)
- Email: [aosman10020@gmail.com](mailto:aosman10020@gmail.com)
