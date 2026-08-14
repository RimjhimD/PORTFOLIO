# Rimjhim Dey — Portfolio

Personal portfolio site. Machine learning, applied research, full-stack engineering and automation.

**Live:** https://rimjhimd.github.io/PORTFOLIO/

---

## What's in it

- **Hero** — availability status, rotating role line, quick stats (CGPA, semester, repos, graduation).
- **Focus** — three areas of work: ML pipelines, backends and data layers, automation.
- **Projects** — filterable grid (ML & Research / Web / Desktop & IoT), each linking to its repo.
- **Skills** — grouped by domain: languages, ML and data, web and backend, automation, tools, hardware.
- **Education** — timeline with CGPA and current standing.
- **Contact** — direct details, coding profiles, and a form that composes a pre-filled email.

## Features

- Dark and light themes, remembered in `localStorage`, defaulting to the OS preference.
- Scroll progress bar, scroll-spy navigation, reveal-on-scroll animations.
- Pointer-tracking glow on cards, animated portrait ring, tech marquee.
- Fully responsive down to 360px, with a full-screen mobile menu.
- Accessible: skip link, semantic landmarks, visible focus rings, `aria` labels, and a full
  `prefers-reduced-motion` fallback that disables every animation.
- Print stylesheet — the page prints as a clean document.
- Résumé PDF served straight from `assets/`.

## Stack

Hand-written HTML, CSS and JavaScript. **No framework, no build step, no dependencies.**
The only external requests are Google Fonts (Sora, Inter, JetBrains Mono).
Icons are inline SVG, so there is no icon-font download.

```
index.html          markup, one file
css/styles.css      design tokens, layout, components, responsive rules
js/script.js        theme, nav, scroll-spy, reveal, typed roles, filters, form
assets/Rii.png      portrait
assets/*.pdf        résumé
```

## Running locally

Nothing to install. Either open `index.html` directly, or serve the folder:

```bash
git clone https://github.com/RimjhimD/PORTFOLIO.git
cd PORTFOLIO
python3 -m http.server 8000
# http://localhost:8000
```

## Customising

All colours, spacing, radii, shadows and fonts are CSS custom properties at the top of
`css/styles.css` — `:root` for the dark theme, `html[data-theme="light"]` for the light one.
Changing the accent everywhere is a two-line edit:

```css
--accent:   #7C5CFF;
--accent-2: #22D3EE;
```

Projects are plain `<article class="card project" data-cat="…">` blocks in `index.html`.
Add one, give it a `data-cat` that matches a filter button, and the filter picks it up with no JS change.

## Contact

- Email — rimjhimdey91@gmail.com
- GitHub — [@RimjhimD](https://github.com/RimjhimD)
- LinkedIn — [Rimjhim Dey](https://www.linkedin.com/in/rimjhim-dey-69ba6337b/)
- Codeforces — [@Peew](https://codeforces.com/profile/Peew) · Toph — [@riiChan](https://toph.co/u/riiChan) · Vjudge — [@Rimjhim](https://vjudge.net/user/Rimjhim)

## Licence

MIT — see [LICENSE](LICENSE). Content and images are mine; the code is free to learn from.
