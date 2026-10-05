# Truegrowth Realty — static HTML front-end

Plain HTML + CSS + Bootstrap 5.3 + vanilla JS, with GSAP (ScrollTrigger), Lenis and Swiper.
No build step: open `index.html` directly, or serve the folder with any static server
(VS Code Live Server, `python -m http.server`, `npx serve`, Apache, Nginx…).

Each page is self-contained — the header and footer markup lives in every `.html` file, so a
page can be opened or moved on its own.

## Structure

```
index.html            Home
about.html            About us
projects.html         Projects listing (filters, search, sort, pagination; state kept in the URL)
project-details.html  Project detail page — every project card links here
locations.html        Every city we have projects in — each card opens developers.html
developers.html       The developers building in a location — each card opens developer-projects.html
developer-projects.html  Every project by one developer
residential.html      Offering page
commercial.html       Offering page
plots.html            Offering page
careers.html          Careers
contact.html          Contact

css/style.css         All site styles, loaded after Bootstrap, grouped by section
js/main.js            All site JavaScript, in numbered sections (listed at the top of the file)
assets/images/        Optimised images (WebP, several widths for srcset) + developer logos
favicon.ico          Tab icon — one file holding 16/32/48px, made from the logo
favicon-512.png      Large icon (bookmarks, PWA)
apple-touch-icon.png 180px icon for iOS home screens
```

## Header and footer

Both are written into every page. Two things vary per page, so keep them in mind when
copying the markup between files:

- the current page's nav link carries `is-active` (offering pages mark none, and
  `project-details.html` marks Projects);
- the `<section class="cta">` call-back banner above the footer is present everywhere
  except `careers.html` and `contact.html`.

## Locations → Developers → Projects

Three pages make up the browse-by-location flow, reached from **Locations** in the nav:

1. `locations.html` — a card per city, with the number of projects there. Each card carries
   `data-city` (e.g. `data-city="Gurugram"`) so the backend knows which city was clicked.
2. `developers.html` — a card per developer, with their project count and the cities they
   build in. Each card carries `data-developer`.
3. `developer-projects.html` — that developer's projects, using the same `.pc` card as the
   listing page.

Levels 2 and 3 are single pages holding sample content, the same approach as
`project-details.html`: every city links to `developers.html` and every developer to
`developer-projects.html`, ready for the backend to fill in per city / per developer.

`project-details.html` is one static page holding sample content for a project (hero, section
tabs, description, amenities, highlights, price list, floor-plan drawings, payment plan,
developer, map, FAQs, sidebar form, gallery, enquiry popup, mobile action bar). Every project
link on the site points at it, ready for the backend to fill the content in.

## Libraries (CDN, jsDelivr)

| Library | Version | Used for |
|---|---|---|
| Bootstrap (CSS + bundle JS) | 5.3.8 | grid, utilities, mobile offcanvas menu |
| GSAP + ScrollTrigger | 3.15.0 | hero intro, scroll reveals, parallax, counters |
| Lenis | 1.3.26 | smooth scrolling |
| Swiper (home page only) | 14.2.0 | "more projects" slider |

## Notes for the backend

- The header and the footer are identical in every page, so they lift straight out into a
  Jinja/Django base template with `{% block %}` for the page body.
- Markup hooks used by the JS: `[data-reveal]` (scroll reveal), `[data-parallax]`,
  `[data-count]` (animated counter), `[data-hero]` / `[data-hero-title]` (intro),
  `[data-enquire]` (opens the enquiry popup with its value as the heading),
  `[data-open-gallery]`, and the listing's `data-type` / `data-city` / `data-status` /
  `data-price` / `data-name` attributes on `.pc` cards.
- Forms are front-end only. Wire your endpoint into `submitLead()` (section 13 of
  `js/main.js`) and the careers submit handler (section 12).
- All animations respect `prefers-reduced-motion`.
