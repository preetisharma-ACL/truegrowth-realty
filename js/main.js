/* ==========================================================================
   Truegrowth Realty — site script
   One file for the whole site. Every block checks for the elements it needs,
   so the same file can be loaded on every page.

   Contents
     1.  Smooth scroll + header    Lenis, sticky/hiding header, anchor links
     2.  Intro + scroll animations hero, [data-reveal], parallax, counters
     3.  Home: hero search tabs
     4.  Home: offering panels
     5.  Home: featured projects filter
     7.  Home: developer logo wall
     8.  About: story gates + manifesto
     7.  About: FAQ accordion
     9. Offerings: skyline, gates, city filter
     10. Projects listing: filters, sorting, pagination
     11. Careers: job filter + application form
     12. Enquiry form (contact, project sidebar, project popup)
     13. Project: section tabs, floor plans, lightbox, enquiry popup

   Libraries expected on the page: GSAP + ScrollTrigger, Lenis, Bootstrap
   (offcanvas menu).
   ========================================================================== */

/* ==========================================================================
   1. Smooth scroll (Lenis on GSAP's ticker) + header behaviour
   ========================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = new Lenis({ duration: 1.15, smoothWheel: !reduceMotion });

(function () {
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis; // used by the sections below and by page links

  // "/index.html" and "/" are the same page.
  const samePage = (path) => path.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');

  // Smooth-scroll any link that points at a section on the current page.
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const url = new URL(a.href, location.href);
      if (!url.hash || !samePage(url.pathname)) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      // Let Bootstrap close the offcanvas first so Lenis isn't locked.
      // Leave room for a sticky section bar if the page has one (project pages).
      const tabs = document.getElementById('sectionTabs');
      const offset = url.hash === '#home' ? 0 : -((tabs ? tabs.offsetHeight : 0) + 20);
      setTimeout(() => lenis.scrollTo(target, { offset }), 10);
    });
  });

  // Header: stays put the whole way down, and goes solid once past the hero.
  const header = document.getElementById('siteHeader');
  lenis.on('scroll', ({ scroll }) => {
    if (!header) return;
    header.classList.toggle('is-scrolled', scroll > 60);
  });
})();

/* ==========================================================================
   2. Intro (header + hero) and scroll animations
   ========================================================================== */
(function () {
  function intro() {
    // The header is deliberately not animated. It carries a CSS transition on transform
    // for the scroll hide/show, so animating transform here as well made the two fight:
    // the bar flashed in, jumped off-screen and crawled back over ~1.8s.
    // Everything below starts from a state set in CSS, so nothing is painted in its
    // final position first and then moved.
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      // The resting state is set in CSS (translateY(110%)), so this tween must drive the
      // whole translate — both y and yPercent — or GSAP reads the CSS offset as its own
      // starting y and the heading never comes back up. No clearProps either: the final
      // inline transform has to stay, otherwise the CSS rule puts it back down.
      .fromTo('[data-hero-title] .line > span',
        { y: 0, yPercent: 110 },
        { y: 0, yPercent: 0, duration: 1.3, stagger: 0.12, delay: 0.1 })
      .fromTo('[data-hero]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1 }, '<0.3');
  }

  function scrollAnimations() {
    // Generic reveal.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { autoAlpha: 0, y: 50 }, {
        autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // Image parallax inside its frame.
    gsap.utils.toArray('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } });
    });

    // Oversized wordmarks drift sideways against the scroll, so the band reads
    // as a moving backdrop rather than a static piece of type.
    const narrow = window.matchMedia('(max-width: 575.98px)').matches; // phones: no sideways drift, keep things centred
    gsap.utils.toArray('[data-drift]').forEach((el) => {
      if (narrow) return;
      gsap.fromTo(el, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Plates that slide as their section passes. The direction lives in the
    // markup so one tween serves any layout, and the travel is split either side
    // of the resting position - the element sits where it was laid out when the
    // section is centred, and drifts half the distance each way.
    const SHIFTS = { down: ['y', 1], up: ['y', -1], right: ['x', 1], left: ['x', -1] };
    gsap.utils.toArray('[data-shift]').forEach((el) => {
      const move = SHIFTS[el.dataset.shift];
      if (!move) return;
      const [axis, sign] = move;
      if (narrow && axis === 'x') return;
      const half = (Number(el.dataset.shiftBy) || 70) * sign * 0.5;
      const section = el.closest('section') || el.parentElement;
      gsap.fromTo(el, { [axis]: -half }, {
        [axis]: half, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Counters.
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 2.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('en-IN')),
      });
    });
  }

  function start() {
    if (reduceMotion) {
      gsap.set('[data-reveal], [data-hero]', { autoAlpha: 1 });
      gsap.set('[data-hero-title] .line > span', { y: 0, yPercent: 0 });
      return;
    }
    intro();
    scrollAnimations();
  }

  // This file is deferred, so the DOM is ready: start straight away rather than
  // waiting for window.load, which would leave the hero blank on a slow connection.
  start();

  // Recalculate trigger positions once web fonts and images settle.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();

/* ==========================================================================
   3. Home: sliding pill for the hero search tabs
   ========================================================================== */
(function () {
  const tabs = document.querySelectorAll('.search__tab');
  const pill = document.querySelector('.search__tab-pill');
  if (!tabs.length) return;
  const move = (el) => {
    if (!pill) return;
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.transform = `translateX(${el.offsetLeft - 5}px)`;
  };
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      move(tab);
    }),
  );
  const init = () => { const a = document.querySelector('.search__tab.is-active'); if (a) move(a); };
  init();
  window.addEventListener('resize', init);
  if (document.fonts) document.fonts.ready.then(init);
})();

/* ==========================================================================
   4. Home: Top Projects slider
   The track is a native scroll-snap row, so touch and trackpad scrolling come
   for free; the arrows only nudge scrollLeft by one card and the disabled
   states follow from where the scroll has got to.
   ========================================================================== */
(function () {
  const root = document.querySelector('[data-pslider]');
  if (!root) return;
  const track = root.querySelector('[data-pslider-track]');
  const prev = document.querySelector('[data-pslider-prev]');
  const next = document.querySelector('[data-pslider-next]');
  if (!track || !prev || !next) return;

  // Measured rather than hard-coded: the column count changes at each breakpoint.
  const step = () => {
    const card = track.querySelector('.featured__item');
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const sync = () => {
    // A couple of pixels of slack: sub-pixel column widths mean scrollLeft
    // almost never lands exactly on the maximum.
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = max <= 0 || track.scrollLeft >= max;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();

/* ==========================================================================
   5. Home: Featured Projects slider
   Same native scroll-snap track as the Top Projects row, but with the arrows
   sitting outside the cards on either side rather than up in the header.
   ========================================================================== */
(function () {
  const root = document.querySelector('[data-fpslider]');
  if (!root) return;
  const track = root.querySelector('[data-fpslider-track]');
  const prev = root.querySelector('[data-fpslider-prev]');
  const next = root.querySelector('[data-fpslider-next]');
  if (!track || !prev || !next) return;

  // Measured rather than hard-coded: the column count changes at each breakpoint.
  const step = () => {
    const card = track.firstElementChild;
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const sync = () => {
    // A couple of pixels of slack: sub-pixel column widths mean scrollLeft
    // almost never lands exactly on the maximum.
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = max <= 0 || track.scrollLeft >= max;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();

/* ==========================================================================
   6. Home: partner logo row
   One cell at a time: the current logo dissolves out (blur + fade + drift)
   while a logo from the spare pool dissolves in, with a light sweep.
   ========================================================================== */
(function () {
  const wall = document.querySelector('.partners__hive');
  const poolEl = document.getElementById('devPool');
  if (!wall || !poolEl || reduceMotion) return;

  const pool = JSON.parse(poolEl.textContent || '[]');
  const cells = [...wall.querySelectorAll('.logo-cell')];
  // a cell may hold a name placeholder instead of a logo
  const shown = new Set(cells.map((c) => c.querySelector('img')).filter(Boolean).map((i) => i.getAttribute('src')));
  // With a short roster every logo is already on the row, so there is nothing to
  // hold back as a spare. Seed the queue from the whole pool and let logos recur.
  const spares = pool.filter((p) => !shown.has(p.src));
  if (!spares.length) spares.push(...pool);

  // Preload spares so the dissolve never shows a half-loaded image.
  spares.forEach((s) => { const i = new Image(); i.src = s.src; });

  // Visit cells in a shuffled order so the "blink" feels organic, not a sweep.
  let order = [];
  const nextCell = () => {
    if (!order.length) order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);
    return cells[order.pop()];
  };

  const swap = () => {
    // pick the next cell that is visible, idle and not being hovered
    let cell;
    for (let tries = 0; tries < cells.length && !cell; tries++) {
      const c = nextCell();
      // a cell holding a name placeholder rather than a logo has nothing to dissolve
      if (c.offsetParent !== null && c.querySelector('.logo-cell__img') && !c.classList.contains('is-swapping') && !c.matches(':hover')) cell = c;
    }
    if (!cell || !spares.length) return;

    // tidy any leftovers so a cell only ever holds one logo
    const imgs = cell.querySelectorAll('.logo-cell__img');
    imgs.forEach((img, i) => { if (i < imgs.length - 1) img.remove(); });
    const oldImg = imgs[imgs.length - 1];

    let incoming = spares.shift();
    // never dissolve a logo into the cell that already shows it
    if (incoming.src === oldImg.getAttribute('src') && spares.length) { spares.push(incoming); incoming = spares.shift(); }
    const outgoing = { name: oldImg.alt, src: oldImg.getAttribute('src'), scale: Number(oldImg.style.getPropertyValue('--s')) || 1 };

    const newImg = oldImg.cloneNode();
    newImg.src = incoming.src;
    newImg.alt = incoming.name;
    newImg.title = incoming.name;
    newImg.style.cssText = `--s:${incoming.scale}`;
    cell.appendChild(newImg);
    cell.classList.add('is-swapping');

    const done = () => {
      oldImg.remove();
      newImg.style.cssText = `--s:${incoming.scale}`;
      cell.classList.remove('is-swapping');
      spares.push(outgoing); // only return the old logo once it has left the screen
    };

    gsap.timeline({ onComplete: done })
      .to(oldImg, { opacity: 0, filter: 'blur(8px) grayscale(0.15)', scale: 0.88, y: -8, duration: 0.9, ease: 'power2.inOut' })
      .fromTo(newImg,
        { opacity: 0, filter: 'blur(10px) grayscale(0.15)', scale: 1.1, y: 8 },
        { opacity: 1, filter: 'blur(0px) grayscale(0.15)', scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
        0.35)
      .fromTo(cell.querySelector('.logo-cell__shine'),
        { xPercent: 0, opacity: 0 },
        { xPercent: 420, opacity: 1, duration: 1.2, ease: 'power2.inOut' },
        0.1);
  };

  // Run on GSAP's clock (not setInterval) so it pauses with the animations
  // when the tab is hidden, instead of piling up swaps.
  let loop;
  const tick = () => { swap(); loop = gsap.delayedCall(1.4, tick); };
  const start = () => { if (!loop) loop = gsap.delayedCall(0.6, tick); };
  const stop = () => { if (loop) loop.kill(); loop = undefined; };

  let inView = false;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : stop(); }, { threshold: 0.25 }).observe(wall);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : inView && start()));
})();

/* ==========================================================================
   7. About: story gates and the manifesto
   ========================================================================== */
(function () {
  // Gates: start closed in the middle, slide apart to the sides as the section scrolls in.
  const gate = document.querySelector('.gate');
  if (gate && !reduceMotion) {
    const open = () => (window.innerWidth < 768 ? 62 : 46); // % of each door's width
    gsap.timeline({ scrollTrigger: { trigger: '.story', start: 'top 95%', end: 'top 5%', scrub: 0.8, invalidateOnRefresh: true } })
      .fromTo('.gate__door--l', { xPercent: 0 }, { xPercent: () => -open(), ease: 'power2.inOut' }, 0)
      .fromTo('.gate__door--r', { xPercent: 0 }, { xPercent: () => open(), ease: 'power2.inOut' }, 0);
  }

  // Words brighten one by one and image pills pop in as the manifesto scrolls through the viewport.
  const text = document.querySelector('.manifesto__text');
  if (!text) return;
  if (reduceMotion) {
    gsap.set('.mw, .mpill', { opacity: 1, scale: 1 });
    return;
  }
  const tl = gsap.timeline({ scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
  text.querySelectorAll('.mw, .mpill').forEach((el, i) => {
    const pill = el.classList.contains('mpill');
    tl.to(el, pill ? { opacity: 1, scale: 1, duration: 1.5, ease: 'back.out(2)' } : { opacity: 1, duration: 1 }, i * 0.5);
  });
})();

/* ==========================================================================
   8. About: FAQ accordion — one open at a time
   ========================================================================== */
(function () {
  const items = document.querySelectorAll('.acc__item');
  items.forEach((item) => {
    const btn = item.querySelector('.acc__btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((it) => {
        const on = it === item && open;
        it.classList.toggle('is-open', on);
        const b = it.querySelector('.acc__btn');
        if (b) b.setAttribute('aria-expanded', String(on));
      });
    });
  });
})();

/* ==========================================================================
   9. Offering pages: gates, city filter
   ========================================================================== */
(function () {
  // Gates: start closed in the middle, slide apart to the sides as the section scrolls in.

  /*
    One template serves Residential / Commercial / Plots, picked by ?type= in the URL.
    The grid holds every project once; this narrows it to the requested category and
    rebuilds the city chips and the stats strip from whatever is actually left, so the
    counts can never drift away from the cards on screen.
  */
  const TYPES = {
    residential: {
      label: 'Residential', heading: 'Residential <em>projects</em>', plural: 'residential projects',
      eyebrow: 'Homes for every chapter',
      title: ['Residential Projects'],
      lead: 'Whether you are buying your first home or your next one, our experienced team is here to help you every step of the way, from shortlisting to handover.',
      types: 'Find the right <em>residential fit</em>',
      whyEyebrow: 'Why residential', why: 'Reasons buyers <em>choose residential</em>',
      faq: 'Residential buying, <em>answered</em>',
    },
    commercial: {
      label: 'Commercial', heading: 'Commercial <em>projects</em>', plural: 'commercial projects',
      eyebrow: 'Offices, retail and dining',
      title: ['Commercial Projects'],
      lead: 'Retail frontage, Grade-A offices and food courts from developers we market directly. We walk you through the numbers before you commit.',
      types: 'Find the right <em>commercial fit</em>',
      whyEyebrow: 'Why commercial', why: 'Reasons investors <em>choose commercial</em>',
      faq: 'Commercial buying, <em>answered</em>',
    },
    plots: {
      label: 'Plots', heading: 'Plots &amp; <em>land</em>', plural: 'plots',
      eyebrow: 'Build it your way',
      title: ['Plots & Land'],
      lead: 'Tell us the corridor and the budget you have in mind and we will bring you plots with the approvals and title already verified.',
      types: 'Find the right <em>plot</em>',
      whyEyebrow: 'Why plots', why: 'Reasons buyers <em>choose plots</em>',
      faq: 'Buying land, <em>answered</em>',
    },
  };
  const grid = document.querySelector('.cprojects__grid');
  const items = [...document.querySelectorAll('.cprojects__item')];

  if (grid && items.length) {
    const asked = (new URLSearchParams(location.search).get('type') || '').toLowerCase();
    const type = TYPES[asked] ? asked : 'residential';
    const meta = TYPES[type];
    document.documentElement.setAttribute('data-cat', type);

    // narrow to the category
    const mine = items.filter((it) => it.dataset.type === type);
    items.forEach((it) => { it.hidden = it.dataset.type !== type; });

    const empty = document.querySelector('[data-cprojects-empty]');
    if (empty) empty.hidden = mine.length > 0;

    // page furniture that would otherwise contradict the grid
    document.title = meta.label + ' Properties in Noida & Ghaziabad | Truegrowth Realty';
    const crumb = document.querySelector('.phero__crumbs [aria-current]');
    if (crumb) crumb.textContent = meta.label;
    // headings that name the category; anything with real per-category facts behind it
    // (the three type tiles, the "why" reasons, the FAQ answers) stays as authored.
    document.querySelectorAll('[data-cat]').forEach((el) => {
      const copy = meta[el.dataset.cat];
      if (!copy) return;
      if (Array.isArray(copy)) {
        /*
          The hero h1 is pre-split into .line > span, and the intro tween keeps a
          reference to each of those spans. Replacing the markup would leave the
          tween animating detached nodes while the fresh ones stay parked below
          their clipped line box, so only the text inside them is swapped.
        */
        el.querySelectorAll('.line > span').forEach((span, i) => {
          if (copy[i] == null) return;
          (span.querySelector('em') || span).textContent = copy[i];
        });
      } else {
        el.innerHTML = copy;
      }
    });
    const secTitle = document.querySelector('.cprojects .section-title');
    if (secTitle) secTitle.innerHTML = meta.heading;
    const more = document.querySelector('.cprojects a.btn-lux--ghost');
    if (more) {
      more.setAttribute('href', 'projects.html?type=' + type);
      const icon = more.querySelector('.btn-icon');
      more.textContent = 'See all ' + meta.plural;
      if (icon) more.appendChild(icon);
    }
    // Other-category tiles: drop the one you are already on, and any category with
    // nothing to show, so no tile ever leads to an empty page. Counts come from the grid.
    const countOf = (t) => items.filter((it) => it.dataset.type === t).length;
    document.querySelectorAll('.others__grid .ocard').forEach((a) => {
      const t = a.dataset.otype;
      const n = countOf(t);
      a.hidden = t === type || n === 0;
      const c = a.querySelector('[data-ocount]');
      if (c) c.textContent = String(n).padStart(2, '0') + (n === 1 ? ' Project' : ' Projects');
    });

    // stats strip, derived from the visible cards only
    const setStat = (label, value, sub) => {
      const li = [...document.querySelectorAll('.cstat')].find((x) => {
        const l = x.querySelector('.cstat__label');
        return l && l.textContent.trim().toLowerCase() === label;
      });
      if (!li) return;
      const v = li.querySelector('.cstat__value'); if (v) v.textContent = value;
      const sb = li.querySelector('.cstat__sub'); if (sb && sub != null) sb.textContent = sub;
    };
    const cities = [...new Set(mine.map((it) => it.dataset.city))];
    const priced = mine
      .map((it) => { const p = it.querySelector('.pc__price'); if (!p) return ''; const s = p.querySelector('small'); return (s ? p.textContent.replace(s.textContent, '') : p.textContent).trim(); })
      .filter((t) => t && !/^on request$/i.test(t));
    setStat('projects listed', String(mine.length).padStart(2, '0'), 'Marketed by Truegrowth Realty');
    setStat('price range', priced.length ? 'From ' + priced[priced.length - 1].replace(/\*$/, '') : 'On request', priced.length ? 'Official developer pricing' : 'Share your budget and we will advise');
    setStat('locations', cities.length ? cities.length + (cities.length === 1 ? ' City' : ' Cities') : '—', cities.join(' · ') || 'Tell us where you are looking');

    // city chips, built from what survived the category filter
    const bar = document.querySelector('[data-cities]');
    if (bar) {
      const counts = cities.map((c) => [c, mine.filter((it) => it.dataset.city === c).length]);
      const chip = (city, label, n, active) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cities__btn' + (active ? ' is-active' : '');
        b.dataset.city = city;
        b.append(label + ' ', Object.assign(document.createElement('span'), { textContent: String(n).padStart(2, '0') }));
        return b;
      };
      bar.replaceChildren(chip('', 'All', mine.length, true), ...counts.map(([c, n]) => chip(c, c, n, false)));
      bar.hidden = counts.length < 2;

      bar.addEventListener('click', (e) => {
        const b = e.target.closest('.cities__btn');
        if (!b) return;
        [...bar.children].forEach((x) => x.classList.toggle('is-active', x === b));
        mine.forEach((it) => {
          it.hidden = !!b.dataset.city && it.dataset.city !== b.dataset.city;
          if (!it.hidden) it.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' });
        });
      });
    }
  }

  // "Talk to an expert" scrolls to the footer call-back form.
  const expert = document.querySelector('[data-cat-enquire]');
  if (expert) {
    expert.addEventListener('click', () => {
      const t = document.getElementById('contact');
      if (t) (window.__lenis ? window.__lenis.scrollTo(t, { offset: -20 }) : t.scrollIntoView({ behavior: 'smooth' }));
    });
  }
})();

/* ==========================================================================
   10. Projects listing: type tabs, search, filters, sorting, pagination
   State lives in the URL (?type=&city=&sub=&status=&budget=&page=).
   ========================================================================== */
(function () {
  const PER_PAGE = 6;
  const form = document.getElementById('filters');
  const grid = document.getElementById('projectGrid');
  if (!form || !grid) return;
  const cards = [...grid.querySelectorAll('.pc')];
  const tabs = [...document.querySelectorAll('.ftabs__btn')];
  const countEl = document.getElementById('resultCount');
  const chipsEl = document.getElementById('activeChips');
  const emptyEl = document.getElementById('emptyState');
  const pager = document.getElementById('pager');
  const listing = document.getElementById('listing');

  const field = (n) => form.elements.namedItem(n);
  const labels = { city: 'Location', sub: 'Type', status: 'Status', budget: 'Budget' };
  const SUBS = {
    residential: [['apartments', 'Apartments'], ['villas', 'Villas & Floors'], ['penthouses', 'Penthouses']],
    commercial: [['retail', 'Retail Shops'], ['office', 'Office Space'], ['food-court', 'Food Court'], ['studio', 'Studios']],
    plots: [['plots', 'Residential Plots']],
  };
  const GROUP = { residential: 'Residential', commercial: 'Commercial', plots: 'Plots' };
  const subOptions = () => {
    const sel = field('sub');
    const keep = state.sub;
    sel.innerHTML = '<option value="">Any type</option>';
    const groups = state.type === 'all' ? Object.keys(SUBS) : [state.type];
    groups.forEach((g) => {
      const host = state.type === 'all' ? Object.assign(document.createElement('optgroup'), { label: GROUP[g] }) : sel;
      (SUBS[g] || []).forEach(([v, l]) => host.append(new Option(l, v)));
      if (host !== sel) sel.append(host);
    });
    const ok = [...sel.options].some((o) => o.value === keep);
    state.sub = ok ? keep : '';
  };

  // ----- state <-> URL -----
  const read = () => {
    const u = new URLSearchParams(location.search);
    return {
      type: u.get('type') || 'all',
      q: u.get('q') || '',
      city: u.get('city') || '',
      status: u.get('status') || '',
      budget: u.get('budget') || '',
      sub: u.get('sub') || '',
      page: Math.max(1, Number(u.get('page')) || 1),
    };
  };
  let state = read();

  const write = () => {
    const u = new URLSearchParams();
    if (state.type !== 'all') u.set('type', state.type);
    ['q', 'city', 'sub', 'status', 'budget'].forEach((k) => state[k] && u.set(k, state[k]));
    if (state.page > 1) u.set('page', String(state.page));
    const qs = u.toString();
    try { history.replaceState(null, '', qs ? `?${qs}` : location.pathname); } catch (err) {}
  };

  const syncControls = () => {
    tabs.forEach((t) => {
      const on = t.dataset.type === state.type;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    ['q', 'city', 'sub', 'status', 'budget'].forEach((k) => {
      const el = field(k);
      el.value = state[k];
      const wrap = el.closest('.fsel');
      if (wrap) wrap.classList.toggle('is-set', !!state[k]);
    });
  };

  // ----- filtering -----
  const matches = (c) => {
    const price = Number(c.dataset.price);
    if (state.type !== 'all' && c.dataset.type !== state.type) return false;
    if (state.city && c.dataset.city !== state.city) return false;
    if (state.sub && !(' ' + (c.dataset.sub || '') + ' ').includes(' ' + state.sub + ' ')) return false;
    if (state.status && c.dataset.status !== state.status) return false;
    if (state.budget) {
      const opt = field('budget').querySelector(`option[value="${state.budget}"]`);
      if (opt && !(price >= Number(opt.dataset.min) && price < Number(opt.dataset.max))) return false;
    }
    if (state.q) {
      const words = state.q.toLowerCase().trim().split(/\s+/);
      if (!words.every((w) => c.dataset.name.includes(w))) return false;
    }
    return true;
  };

  const sorted = (list) => {
    const by = {
      'price-asc': (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
      'price-desc': (a, b) => Number(b.dataset.price) - Number(a.dataset.price),
      name: (a, b) => a.querySelector('.pc__name').textContent.localeCompare(b.querySelector('.pc__name').textContent),
    }[''] || ((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
    return [...list].sort(by);
  };

  // ----- rendering -----
  const renderChips = () => {
    chipsEl.innerHTML = '';
    ['city', 'sub', 'status', 'budget'].forEach((k) => {
      if (!state[k]) return;
      const sel = field(k);
      const text = (sel.selectedOptions[0] && sel.selectedOptions[0].textContent) || state[k];
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `${labels[k]}: ${text} <button type="button" aria-label="Remove ${labels[k]} filter">×</button>`;
      chip.querySelector('button').addEventListener('click', () => update({ [k]: '' }));
      chipsEl.appendChild(chip);
    });
    if (state.q) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `“${state.q}” `;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '×';
      b.setAttribute('aria-label', 'Clear search');
      b.addEventListener('click', () => update({ q: '' }));
      chip.appendChild(b);
      chipsEl.appendChild(chip);
    }
  };

  const pageButton = (label, page, opts = {}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pager__btn' + (opts.current ? ' is-current' : '');
    b.innerHTML = opts.html || label;
    if (opts.aria) b.setAttribute('aria-label', opts.aria);
    if (opts.current) b.setAttribute('aria-current', 'page');
    b.disabled = !!opts.disabled;
    b.addEventListener('click', () => { update({ page }, true); });
    return b;
  };

  const renderPager = (pages) => {
    pager.innerHTML = '';
    if (pages <= 1) return;
    const p = state.page;
    const arrow = (d) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    pager.appendChild(pageButton('', p - 1, { disabled: p === 1, aria: 'Previous page', html: `${arrow('M15 6l-6 6 6 6')}<span class="pager__label">Prev</span>` }));
    // 1 … p-1 p p+1 … last
    const nums = [...new Set([1, p - 1, p, p + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) {
        const gap = document.createElement('span');
        gap.className = 'pager__gap';
        gap.textContent = '…';
        pager.appendChild(gap);
      }
      pager.appendChild(pageButton(String(n), n, { current: n === p, aria: `Page ${n}` }));
    });
    pager.appendChild(pageButton('', p + 1, { disabled: p === pages, aria: 'Next page', html: `<span class="pager__label">Next</span>${arrow('M9 6l6 6-6 6')}` }));
  };

  const render = (animate = true) => {
    subOptions();
    const list = sorted(cards.filter(matches));
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PER_PAGE;
    const visible = list.slice(start, start + PER_PAGE);

    cards.forEach((c) => (c.hidden = true));
    visible.forEach((c) => { c.hidden = false; grid.appendChild(c); }); // re-append keeps sort order

    emptyEl.hidden = list.length > 0;
    pager.hidden = list.length === 0;
    countEl.innerHTML = list.length
      ? `Showing <strong>${start + 1}–${start + visible.length}</strong> of <strong>${list.length}</strong> ${list.length === 1 ? 'project' : 'projects'}`
      : 'No projects found';

    renderChips();
    renderPager(pages);
    syncControls();
    write();

    if (animate && visible.length) {
      gsap.fromTo(visible, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' });
    }
  };

  const update = (patch, scroll = false) => {
    state = { ...state, page: 1, ...patch };
    render();
    if (scroll) {
      window.__lenis ? window.__lenis.scrollTo(listing, { offset: -110 }) : listing.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ----- events -----
  tabs.forEach((t) => t.addEventListener('click', () => update({ type: t.dataset.type, sub: '' })));
  ['city', 'sub', 'status', 'budget'].forEach((k) => field(k).addEventListener('change', (e) => update({ [k]: e.target.value })));
  let t;
  field('q').addEventListener('input', (e) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => update({ q: e.target.value.trim() }), 250);
  });
  const reset = () => update({ type: 'all', q: '', city: '', sub: '', status: '', budget: '' });
  document.getElementById('resetFilters').addEventListener('click', reset);
  document.querySelector('[data-reset]').addEventListener('click', reset);

  render(false);
})();

/* ==========================================================================
   11. Careers: department filter and the application form
   ========================================================================== */
(function () {
  // Department filter
  const filters = [...document.querySelectorAll('.jobs__filter')];
  const jobEls = [...document.querySelectorAll('.job')];
  filters.forEach((f) =>
    f.addEventListener('click', () => {
      filters.forEach((x) => { x.classList.toggle('is-active', x === f); x.setAttribute('aria-selected', String(x === f)); });
      jobEls.forEach((j) => { j.hidden = f.dataset.dept !== 'All' && j.dataset.dept !== f.dataset.dept; if (j.hidden) j.open = false; });
    }),
  );

  // "Apply for this role" pre-selects the role and scrolls to the form
  const form = document.getElementById('applyForm');
  if (!form) return;
  document.querySelectorAll('[data-apply]').forEach((b) =>
    b.addEventListener('click', () => {
      form.elements.namedItem('role').value = b.dataset.apply;
      const target = document.getElementById('apply');
      window.__lenis ? window.__lenis.scrollTo(target, { offset: -20 }) : target.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => form.elements.namedItem('name').focus({ preventScroll: true }), 900);
    }),
  );

  // Application form
  const cv = form.elements.namedItem('cv');
  const fileLabel = form.querySelector('[data-file]');
  const MAX = 5 * 1024 * 1024;
  const okCv = () => !!(cv.files && cv.files[0]) && cv.files[0].size <= MAX && /\.(pdf|docx?)$/i.test(cv.files[0].name);
  cv.addEventListener('change', () => {
    fileLabel.textContent = (cv.files && cv.files[0] && cv.files[0].name) || 'Click to choose a file';
    cv.closest('.aform__f').classList.toggle('is-invalid', !okCv());
  });
  const phone = form.elements.namedItem('phone');
  phone.addEventListener('input', () => (phone.value = phone.value.replace(/\D/g, '').slice(0, 10)));

  const check = (el) => {
    const bad = el === cv ? !okCv() : !el.checkValidity() || (el.name === 'name' && el.value.trim().length < 2);
    el.closest('.aform__f').classList.toggle('is-invalid', bad);
    return !bad;
  };
  ['name', 'phone', 'email'].forEach((n) => form.elements.namedItem(n).addEventListener('blur', (e) => check(e.target)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = ['name', 'phone', 'email'].map((n) => form.elements.namedItem(n)).concat(cv);
    if (!fields.map(check).every(Boolean)) {
      const invalid = form.querySelector('.is-invalid input');
      if (invalid) invalid.focus();
      return;
    }
    form.classList.add('is-loading');
    // Placeholder: send FormData(form) to your HR inbox / ATS here.
    console.info('Application', Object.fromEntries(new FormData(form)));
    await new Promise((r) => setTimeout(r, 900));
    form.classList.remove('is-loading');
    form.classList.add('is-done');
  });
})();

/* ==========================================================================
   12. Enquiry form — contact page, project sidebar and project popup
   ========================================================================== */
(function () {
  // Placeholder for your lead endpoint (CRM, email service, Google Sheet…).
  async function submitLead(data) {
    console.info('Lead captured', data);
    await new Promise((r) => setTimeout(r, 900));
  }

  document.querySelectorAll('form.eform').forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = '1';

    const validate = (input) => {
      const field = input.closest('.eform__field');
      const bad = !input.checkValidity() || (input.name === 'name' && input.value.trim().length < 2);
      if (field) field.classList.toggle('is-invalid', bad);
      return !bad;
    };

    form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"]').forEach((i) => {
      i.addEventListener('blur', () => validate(i));
      i.addEventListener('input', () => i.closest('.is-invalid') && validate(i));
    });
    const phone = form.querySelector('input[name="phone"]');
    if (phone) {
      phone.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = [...form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"]')];
      const ok = inputs.map(validate).every(Boolean);
      const consent = form.querySelector('input[name="consent"]');
      if (!ok || !consent.checked) {
        const invalid = form.querySelector('.is-invalid input');
        if (invalid) invalid.focus();
        if (!consent.checked) consent.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      form.classList.add('is-loading');
      try {
        await submitLead(data);
        form.querySelector('[data-name]').textContent = data.name.split(' ')[0];
        form.classList.add('is-done');
        try { sessionStorage.setItem('enquired', '1'); } catch (err) {}
      } finally {
        form.classList.remove('is-loading');
      }
    });
  });
})();

/* ==========================================================================
   13. Project pages: sticky section tabs, floor-plan tabs, gallery lightbox
       and the enquiry popup
   ========================================================================== */

/* ---------- Sticky section tabs + scroll-spy ---------- */
(function () {
  const bar = document.getElementById('sectionTabs');
  if (!bar) return;
  const nav = bar.querySelector('.stabs__nav');
  const underline = bar.querySelector('.stabs__bar');
  const links = [...bar.querySelectorAll('.stabs__link')];
  const header = document.getElementById('siteHeader');

  const place = (a) => {
    underline.style.width = `${a.offsetWidth - 24}px`;
    underline.style.transform = `translateX(${a.offsetLeft + 12}px)`;
  };
  const activate = (a) => {
    if (a.classList.contains('is-active') && underline.style.width) return;
    links.forEach((l) => l.classList.toggle('is-active', l === a));
    place(a);
    nav.scrollTo({ left: a.offsetLeft - 40, behavior: 'smooth' }); // keep active tab visible on phones
  };
  const active = () => links.find((l) => l.classList.contains('is-active'));
  place(links[0]);
  window.addEventListener('resize', () => place(active()));
  if (document.fonts) document.fonts.ready.then(() => place(active()));

  // Scroll-spy
  const targets = links.map((l) => document.querySelector(l.getAttribute('href')));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) activate(links[targets.indexOf(e.target)]); }),
    { rootMargin: '-35% 0px -60% 0px' },
  );
  targets.forEach((t) => t && io.observe(t));

  // "Stuck" styling + step down when the main navbar is showing.
  const sentinel = document.createElement('div');
  bar.before(sentinel);
  new IntersectionObserver(([e]) => bar.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
  if (header) {
    const sync = () => bar.classList.toggle('is-pushed', header.classList.contains('is-scrolled'));
    new MutationObserver(sync).observe(header, { attributes: true, attributeFilter: ['class'] });
  }
})();

/* ---------- Floor-plan tabs ---------- */
(function () {
  document.querySelectorAll('.plan__tab').forEach((tab, _, all) =>
    tab.addEventListener('click', () =>
      all.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        const panel = document.getElementById(`plan-${t.dataset.plan}`);
        panel.hidden = !on;
        if (on) panel.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      }),
    ),
  );
})();

/* ---------- Gallery lightbox ---------- */
(function () {
  const dlg = document.getElementById('lightbox');
  if (!dlg) return;
  const img = dlg.querySelector('.lb__img');
  const counter = dlg.querySelector('.lb__counter');
  const srcs = JSON.parse(document.getElementById('galleryData').textContent || '[]');
  let i = 0;
  const show = (n) => {
    i = (n + srcs.length) % srcs.length;
    img.src = srcs[i];
    counter.textContent = `${i + 1} / ${srcs.length}`;
    img.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
  };
  const open = (n) => { show(n); dlg.showModal(); if (window.__lenis) window.__lenis.stop(); };

  document.querySelectorAll('.gs__item').forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.index))));
  document.querySelectorAll('[data-open-gallery]').forEach((b) => b.addEventListener('click', () => open(0)));
  dlg.addEventListener('close', () => { if (window.__lenis) window.__lenis.start(); });
  dlg.querySelector('.lb__close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb__nav--prev').addEventListener('click', () => show(i - 1));
  dlg.querySelector('.lb__nav--next').addEventListener('click', () => show(i + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
})();

/* ---------- Enquiry popup ---------- */
// Any element with [data-enquire] opens the popup; its value becomes the heading & intent.
(function () {
  const modal = document.getElementById('enquiryModal');
  if (!modal) return;
  const title = document.getElementById('emodalTitle');
  const form = document.getElementById('modalForm');

  const open = (intent = 'Enquire about this project') => {
    if (modal.open) return;
    title.textContent = intent;
    form.elements.namedItem('intent').value = intent;
    modal.showModal();
    if (window.__lenis) window.__lenis.stop();
  };
  const close = () => modal.close();

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-enquire]');
    if (trigger) { e.preventDefault(); open(trigger.dataset.enquire || undefined); }
  });
  modal.querySelector('.emodal__close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.addEventListener('close', () => { if (window.__lenis) window.__lenis.start(); });

  // Auto-popup 3 seconds after a project page opens (skipped once the visitor has enquired this session).
  const AUTO_POPUP_DELAY = 3000;
  const enquired = () => { try { return sessionStorage.getItem('enquired'); } catch (err) { return null; } };
  const autoOpen = () => {
    const lb = document.getElementById('lightbox');
    const typing = document.activeElement && document.activeElement.closest('form');
    if (enquired() || (lb && lb.open) || typing || document.hidden) return;
    // A modal <dialog> makes the page behind it inert, so popping up over an open
    // mobile menu would swallow its taps. Wait until the drawer is closed.
    if (document.querySelector('.offcanvas.show')) {
      document.addEventListener('hidden.bs.offcanvas', () => window.setTimeout(autoOpen, 500), { once: true });
      return;
    }
    open('Get exclusive launch offers');
  };
  window.setTimeout(autoOpen, AUTO_POPUP_DELAY);
})();

/* ---------- Blogs: category filter ---------- */
(function () {
  const filters = Array.from(document.querySelectorAll('.bloglist__filter'));
  const items = Array.from(document.querySelectorAll('.blog-item'));
  const empty = document.querySelector('.bloglist__empty');
  if (!filters.length || !items.length) return;

  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      filters.forEach((f) => {
        const on = f === btn;
        f.classList.toggle('is-active', on);
        f.setAttribute('aria-selected', String(on));
      });
      let shown = 0;
      items.forEach((li) => {
        const match = cat === 'all' || li.dataset.cat === cat;
        li.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }),
  );
})();

/* ---------- Who we are: "what sets us apart" picker ---------- */
(function () {
  const list = document.querySelector('.wapart__list');
  const img = document.querySelector('[data-apart-img]');
  const cap = document.querySelector('[data-apart-cap]');
  if (!list || !img || !cap) return;

  const tabs = Array.from(list.querySelectorAll('.wapart__btn'));
  let current = 0;

  function show(i) {
    if (i === current) return;
    const btn = tabs[i];
    current = i;

    tabs.forEach((t, n) => {
      t.setAttribute('aria-selected', String(n === i));
      t.parentElement.classList.toggle('is-active', n === i);
    });

    // Decode the next frame before swapping, so the card never shows a gap, and
    // hold the fade for its full length even when the file is already cached.
    const next = new Image();
    next.src = btn.dataset.apartSrc;
    // decode() can stay pending indefinitely if the frame never arrives, which
    // would leave the card faded out for good - so race it against a deadline.
    const decoded = next.decode ? next.decode().catch(() => {}) : Promise.resolve();
    const ready = Promise.race([decoded, new Promise((go) => setTimeout(go, 600))]);
    const held = new Promise((done) => setTimeout(done, 140));

    img.classList.add('is-out');
    cap.classList.add('is-out');

    Promise.all([ready, held]).then(() => {
      if (current !== i) return; // a later click already won
      img.src = btn.dataset.apartSrc;
      img.width = btn.dataset.apartW;
      img.height = btn.dataset.apartH;
      cap.innerHTML = btn.dataset.apartText;
      img.classList.remove('is-out');
      cap.classList.remove('is-out');
    });
  }

  // Hover drives the panel too. A short rest delay stops a pointer sweeping down
  // the list from firing every row on the way past; a click is always immediate.
  let intent;
  tabs.forEach((btn, i) => {
    btn.addEventListener('click', () => { clearTimeout(intent); show(i); });
    btn.addEventListener('mouseenter', () => {
      clearTimeout(intent);
      intent = setTimeout(() => show(i), 70);
    });
  });
  list.addEventListener('mouseleave', () => clearTimeout(intent));

  // Left/right arrows walk the list, which is what a tablist is expected to do.
  list.addEventListener('keydown', (e) => {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (current + step + tabs.length) % tabs.length;
    tabs[next].focus();
    show(next);
  });
})();

/* ---------- Careers: filter the openings ---------- */
(function () {
  const bar = document.querySelector('.jobs__bar');
  const list = document.querySelector('.jobs__list');
  if (!bar || !list) return;
  const jobs = Array.from(list.querySelectorAll('.job'));
  if (!jobs.length) return;

  const type = bar.querySelector('[data-filter="type"]');
  const place = bar.querySelector('[data-filter="place"]');
  const count = bar.querySelector('[data-job-count]');
  const empty = document.querySelector('[data-jobs-empty]');

  // The type options come from the roles themselves, so the dropdown can never
  // offer a value nothing matches. Location is a search box rather than a list:
  // it stays useful with one office and with twenty.
  if (type) {
    const values = [...new Set(jobs.map((j) => j.dataset.type).filter(Boolean))].sort();
    if (values.length < 2) type.closest('.jobfilter').hidden = true;
    else type.insertAdjacentHTML('beforeend', values.map((v) => '<option value="' + v + '">' + v + '</option>').join(''));
  }

  function apply() {
    const q = place ? place.value.trim().toLowerCase() : '';
    let shown = 0;
    jobs.forEach((job) => {
      const ok = (!type || !type.value || job.dataset.type === type.value)
        && (!q || (job.dataset.place || '').toLowerCase().includes(q));
      job.hidden = !ok;
      if (!ok) job.open = false; // a filtered-out role should not stay expanded
      if (ok) shown++;
    });
    if (count) count.textContent = shown + (shown === 1 ? ' role' : ' roles');
    if (empty) empty.hidden = shown > 0;
  }

  if (type) type.addEventListener('change', apply);
  if (place) place.addEventListener('input', apply);
  apply();
})();

/* ---------- Careers: animate the openings ---------- */
(function () {
  const list = document.querySelector('.jobs__list');
  if (!list) return;
  const jobs = Array.from(list.querySelectorAll('.job'));
  if (!jobs.length || !Element.prototype.animate) return;

  const OPEN = 420;
  const SHUT = 300;
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // <details> has no transition of its own: the panel appears at full height the
  // instant "open" is set. So the height is animated by hand, padding included -
  // with border-box a box cannot shrink below its own padding, so animating
  // height alone would leave a gap at the end of the close.
  function frames(el) {
    const cs = getComputedStyle(el);
    return [
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
      { height: el.scrollHeight + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 },
    ];
  }

  // The finished promise rather than onfinish: Chrome removes a filling-free
  // animation once it ends, and the event can be missed with it. A token guards
  // against a stale run settling state that a newer click has moved on from.
  function play(job, opening) {
    const el = job.querySelector('.job__body');
    if (!el) return;
    const token = (job._run || 0) + 1;
    job._run = token;
    if (job._anim) job._anim.cancel();

    if (opening) job.open = true;
    const [shut, open] = frames(el);
    const anim = el.animate(opening ? [shut, open] : [open, shut], {
      duration: opening ? OPEN : SHUT,
      easing: opening ? EASE : 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
    job._anim = anim;
    anim.finished.then(
      () => { if (job._run === token) { job._anim = null; if (!opening) job.open = false; } },
      () => {}, // cancelled by a newer click; that click owns the state now
    );
  }

  jobs.forEach((job) => {
    const row = job.querySelector('.job__row');
    if (!row) return;
    row.addEventListener('click', (e) => {
      if (reduceMotion) return; // let the browser do it plainly
      e.preventDefault();
      if (job.open) { play(job, false); return; }
      // one at a time, the way the name group used to - but on the way out
      jobs.forEach((other) => { if (other !== job && other.open) play(other, false); });
      play(job, true);
    });
  });
})();

/* ==========================================================================
   Developers page: filtered by city when opened from a Locations card
   (developers.html?city=Noida). Each card lists its cities in data-cities.
   ========================================================================== */
(function () {
  const grid = document.querySelector('.dev-grid');
  const city = new URLSearchParams(location.search).get('city');
  if (!grid || !city) return;
  const cards = [...grid.querySelectorAll('.dcard[data-cities]')];
  const match = (c) => c.dataset.cities.split('|').some((x) => x.toLowerCase() === city.toLowerCase());
  const shown = cards.filter(match);
  if (!shown.length) return;
  cards.forEach((c) => { if (!match(c)) c.style.display = 'none'; });
  const eyebrow = document.querySelector('[data-devs-eyebrow]');
  const title = document.querySelector('[data-devs-title]');
  const link = document.querySelector('[data-devs-link]');
  if (eyebrow) eyebrow.textContent = shown.length + (shown.length === 1 ? ' developer' : ' developers');
  if (title) title.innerHTML = 'Developers in <em></em>';
  if (title) title.querySelector('em').textContent = city;
  if (link) { link.href = 'developers.html'; link.firstChild.textContent = 'See all developers'; }
  const crumb = document.querySelector('.phero__crumbs [aria-current]');
  if (crumb) crumb.textContent = 'Developers in ' + city;
  document.title = 'Developers in ' + city + ' | Truegrowth Realty';
})();

/* ==========================================================================
   Category page (property-type.html?type=…): filter bar over the project grid.
   Type chips are per category; each card lists its sub-types in data-sub.
   ========================================================================== */
(function () {
  const bar = document.querySelector('[data-cfilter]');
  const grid = document.querySelector('.cprojects__grid');
  if (!bar || !grid) return;
  const SUBS = {
    residential: [['apartments', 'Apartments'], ['villas', 'Villas & Floors'], ['penthouses', 'Penthouses']],
    commercial: [['retail', 'Retail Shops'], ['office', 'Office Space'], ['food-court', 'Food Court'], ['studio', 'Studios']],
    plots: [['plots', 'Residential Plots']],
  };
  const cat = document.documentElement.getAttribute('data-cat') || 'residential';
  const items = [...grid.querySelectorAll('.cprojects__item')];
  const mine = items.filter((it) => it.dataset.type === cat);
  const original = items.slice();
  const subsEl = bar.querySelector('[data-csubs]');
  const searchEl = bar.querySelector('[data-csearch]');
  const cityEl = bar.querySelector('[data-ccity]');
  const sortEl = bar.querySelector('[data-csort]');
  const statusEl = bar.querySelector('[data-cstatus]');
  const budgetEl = bar.querySelector('[data-cbudget]');
  const countEl = document.querySelector('[data-ccount]');
  const empty = document.querySelector('[data-cprojects-empty]');
  const state = { sub: '', q: '', city: '', sort: '', status: '', budget: '' };
  const has = (it, sub) => (' ' + (it.dataset.sub || '') + ' ').includes(' ' + sub + ' ');

  // type chips with counts
  const chip = (key, label, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cfilter__chip' + (key === state.sub ? ' is-active' : '');
    b.dataset.sub = key;
    b.setAttribute('role', 'tab');
    b.append(label + ' ', Object.assign(document.createElement('span'), { textContent: n }));
    return b;
  };
  subsEl.replaceChildren(chip('', 'All', mine.length), ...(SUBS[cat] || []).map(([k, l]) => chip(k, l, mine.filter((it) => has(it, k)).length)));

  // locations present in this category
  [...new Set(mine.map((it) => it.dataset.city))].sort().forEach((c) => cityEl.append(new Option(c, c)));
  // statuses present in this category
  if (statusEl) [...new Set(mine.map((it) => it.querySelector('.pc')?.dataset.status).filter(Boolean))].sort().forEach((s) => statusEl.append(new Option(s, s)));

  const price = (it) => { const v = Number(it.querySelector('.pc')?.dataset.price); return v || null; };
  const apply = () => {
    const q = state.q.trim().toLowerCase();
    let shown = 0;
    items.forEach((it) => {
      const pc = it.querySelector('.pc');
      const ok = it.dataset.type === cat
        && (!state.sub || has(it, state.sub))
        && (!state.city || it.dataset.city === state.city)
        && (!state.status || pc?.dataset.status === state.status)
        && (!state.budget || (() => { const [lo, hi] = state.budget.split('-').map(Number); const v = Number(pc?.dataset.price); return v > 0 && v >= lo && v < hi; })())
        && (!q || (pc?.dataset.name || '').includes(q));
      it.hidden = !ok;
      if (ok) shown++;
    });
    // order
    let order = original.slice();
    if (state.sort === 'name') order.sort((a, b) => a.querySelector('.pc__name').textContent.localeCompare(b.querySelector('.pc__name').textContent));
    if (state.sort.startsWith('price')) {
      const dir = state.sort === 'price-asc' ? 1 : -1;
      order.sort((a, b) => { const x = price(a), y = price(b); if (x === null) return 1; if (y === null) return -1; return (x - y) * dir; });
    }
    order.forEach((it) => grid.append(it));
    subsEl.querySelectorAll('.cfilter__chip').forEach((b) => b.classList.toggle('is-active', b.dataset.sub === state.sub));
    if (countEl) countEl.textContent = shown + (shown === 1 ? ' project' : ' projects');
    if (empty) empty.hidden = shown > 0;
  };
  subsEl.addEventListener('click', (e) => { const b = e.target.closest('.cfilter__chip'); if (b) { state.sub = b.dataset.sub; apply(); } });
  searchEl.addEventListener('input', () => { state.q = searchEl.value; apply(); });
  cityEl.addEventListener('change', () => { state.city = cityEl.value; apply(); });
  sortEl?.addEventListener('change', () => { state.sort = sortEl.value; apply(); });
  statusEl?.addEventListener('change', () => { state.status = statusEl.value; apply(); });
  budgetEl?.addEventListener('change', () => { state.budget = budgetEl.value; apply(); });
  document.querySelectorAll('[data-creset]').forEach((r) => r.addEventListener('click', () => {
    Object.assign(state, { sub: '', q: '', city: '', sort: '', status: '', budget: '' });
    searchEl.value = ''; cityEl.value = ''; if (sortEl) sortEl.value = '';
    if (statusEl) statusEl.value = ''; if (budgetEl) budgetEl.value = '';
    apply();
  }));
  apply();
})();

/* ==========================================================================
   Testimonials: hover a column and scroll its cards with the mouse wheel.
   The column's auto-slide stops while the pointer is on it, the wheel moves
   the cards (looping), and the slide resumes from that spot on leaving.
   ========================================================================== */
(function () {
  const cols = document.querySelectorAll('.tst__col');
  // only with a real mouse: on touch screens the page must keep scrolling over the cards
  if (!cols.length || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  cols.forEach((col) => col.setAttribute('data-lenis-prevent', ''));
  cols.forEach((col) => {
    const track = col.querySelector('.tst__track');
    if (!track) return;
    const down = col.classList.contains('tst__col--down');
    const duration = () => parseFloat(getComputedStyle(track).animationDuration) || 46;
    let y = 0;
    const half = () => track.scrollHeight / 2;
    const wrap = () => { const h = half(); while (y > 0) y -= h; while (y <= -h) y += h; };
    col.addEventListener('mouseenter', () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      y = m.m42;
      track.style.animation = 'none';
      track.style.transform = `translateY(${y}px)`;
    });
    col.addEventListener('wheel', (e) => {
      e.preventDefault();
      y -= e.deltaY;
      wrap();
      track.style.transform = `translateY(${y}px)`;
    }, { passive: false });
    col.addEventListener('mouseleave', () => {
      const d = duration();
      const p = Math.min(Math.max(-y / half(), 0), 1); // 0 = top, 1 = halfway
      track.style.transform = '';
      track.style.animation = '';
      track.style.animationDelay = `${-(down ? 1 - p : p) * d}s`;
    });
  });
})();

/* Mobile menu: parents with sub-pages open and close like a dropdown */
(function () {
  document.querySelectorAll('.mobile-menu__links > li').forEach((li) => {
    const link = li.querySelector(':scope > a');
    if (!link || !li.querySelector(':scope > .mobile-menu__sub')) return;
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const open = !li.classList.contains('is-open');
      li.parentElement.querySelectorAll(':scope > li.is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector(':scope > a').setAttribute('aria-expanded', 'false'); });
      li.classList.toggle('is-open', open);
      link.setAttribute('aria-expanded', String(open));
    });
  });
})();

/* Testimonials on phones and tablets: touch the cards and drag, and the list
   follows your finger - the touch version of the desktop wheel. The column
   stops auto-sliding while touched and carries on from there when released. */
(function () {
  document.querySelectorAll('.tst__col').forEach((col) => {
    const track = col.querySelector('.tst__track');
    if (!track) return;
    const down = col.classList.contains('tst__col--down');
    let y = 0;
    let lastY = 0;
    let dragging = false;
    const half = () => track.scrollHeight / 2;
    const wrap = () => { const h = half(); while (y > 0) y -= h; while (y <= -h) y += h; };
    col.addEventListener('touchstart', (e) => {
      dragging = true;
      lastY = e.touches[0].clientY;
      y = new DOMMatrixReadOnly(getComputedStyle(track).transform).m42;
      track.style.animation = 'none';
      track.style.transform = `translateY(${y}px)`;
    }, { passive: true });
    col.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      e.preventDefault(); // the cards move, not the page
      const cy = e.touches[0].clientY;
      y += cy - lastY;
      lastY = cy;
      wrap();
      track.style.transform = `translateY(${y}px)`;
    }, { passive: false });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      const d = parseFloat(getComputedStyle(track).animationDuration) || 46;
      const p = Math.min(Math.max(-y / half(), 0), 1);
      track.style.transform = '';
      track.style.animation = '';
      track.style.animationDelay = `${-(down ? 1 - p : p) * d}s`;
    };
    col.addEventListener('touchend', release, { passive: true });
    col.addEventListener('touchcancel', release, { passive: true });
  });
})();

/* Core values on phones: as each card is covered by the next, it eases back
   (a touch smaller and dimmer) so the pile reads as depth, not a flat overlap */
(function () {
  const items = [...document.querySelectorAll('.cvalues__grid > li')];
  if (items.length < 2) return;
  const mq = window.matchMedia('(max-width: 767.98px)');
  let ticking = false;
  const update = () => {
    ticking = false;
    items.forEach((li, i) => {
      const card = li.querySelector('.cval');
      if (!card) return;
      if (!mq.matches || i === items.length - 1) { card.style.transform = ''; card.style.filter = ''; return; }
      const next = items[i + 1].getBoundingClientRect();
      const mine = li.getBoundingClientRect();
      // 0 while the next card is still below this one, 1 once it fully covers it
      const p = Math.min(Math.max((mine.bottom - next.top) / mine.height, 0), 1);
      card.style.transform = `scale(${1 - p * 0.06})`;
      card.style.filter = `brightness(${1 - p * 0.25})`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* Testimonials: the featured review sits in the middle with its neighbours
   above and below; it advances on its own, and a tap, a dot or a swipe moves it */
(function () {
  const stage = document.querySelector('[data-reviews]');
  if (!stage) return;
  const cards = [...stage.querySelectorAll('.rcard')];
  if (cards.length < 2) return;
  let i = 0;
  let timer;
  stage.querySelector('[data-review-prev]')?.addEventListener('click', () => go(i - 1));
  stage.querySelector('[data-review-next]')?.addEventListener('click', () => go(i + 1));
  const go = (n) => {
    i = (n + cards.length) % cards.length;
    cards.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      c.classList.toggle('is-prev', k === (i - 1 + cards.length) % cards.length);
      c.classList.toggle('is-next', k === (i + 1) % cards.length);
    });
    clearInterval(timer);
    timer = setInterval(() => go(i + 1), 4500);
  };
  cards.forEach((c, k) => c.addEventListener('click', () => { if (k !== i) go(k); }));
  // swipe up / down on touch screens
  let sy = null;
  stage.addEventListener('touchstart', (e) => { sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sy === null) return;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dy) > 40) go(i + (dy < 0 ? 1 : -1));
    sy = null;
  }, { passive: true });
  stage.addEventListener('mouseenter', () => clearInterval(timer));
  stage.addEventListener('mouseleave', () => go(i));
  go(0);
})();

/* Project amenities: arrow buttons slide the card row */
(function () {
  const track = document.querySelector('[data-ax-track]');
  if (!track) return;
  document.querySelectorAll('[data-ax]').forEach((b) => b.addEventListener('click', () => {
    const card = track.querySelector('.ax__card');
    const step = card ? card.getBoundingClientRect().width + 16 : 200;
    track.scrollBy({ left: Number(b.dataset.ax) * step * 2, behavior: 'smooth' });
  }));
})();

/* Team page: the intro heading rises in word by word, and the director
   cards filter by group */
(function () {
  const title = document.querySelector('[data-tin-words]');
  if (title) {
    let w = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const s = document.createElement('span');
            s.className = 'tw';
            s.style.setProperty('--w', w++);
            s.textContent = part;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(title);
    const box = title.closest('.tintro');
    new IntersectionObserver((es, o) => es.forEach((e) => {
      if (e.isIntersecting) { box.classList.add('is-in'); o.disconnect(); }
    }), { threshold: 0.3 }).observe(box);
  }
  const chips = document.querySelectorAll('[data-team-filter]');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.classList.toggle('is-active', x === c));
    const g = c.dataset.teamFilter;
    document.querySelectorAll('[data-team-group]').forEach((card) => {
      card.classList.toggle('is-hidden', g !== 'all' && card.dataset.teamGroup !== g);
    });
  }));
})();

/* Team statement: words ink in (and photo chips pop) as the block scrolls past */
(function () {
  const el = document.querySelector('[data-scrub]');
  if (!el) return;
  const parts = [];
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (/^\s+$/.test(t)) { frag.append(t); return; }
        const s = document.createElement('span');
        s.className = 'sw';
        s.textContent = t;
        frag.append(s);
        parts.push(s);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) parts.push(n);
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the block's top is at 85% of the screen, 1 when it reaches 35%
    const p = reduce ? 1 : Math.min(Math.max((vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.4), 0), 1);
    const n = Math.round(p * parts.length);
    parts.forEach((s, i) => s.classList.toggle('on', i < n));
  };
  const on = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', on, { passive: true });
  window.addEventListener('resize', on);
  update();
})();

/* Team cards: exactly one card is open at a time (the middle one by default,
   otherwise the last one pointed at), so the row never changes width and
   nothing shifts or flickers as the pointer crosses the gaps */
(function () {
  const grid = document.querySelector('.tmem__grid');
  if (!grid || !window.matchMedia('(hover: hover) and (min-width: 992px)').matches) return;
  const cards = [...grid.querySelectorAll('.tmem__card')];
  if (!cards.length) return;
  const def = cards[Math.floor(cards.length / 2)];
  let timer;
  const open = (c) => cards.forEach((x) => x.classList.toggle('is-open', x === c));
  grid.classList.add('js-slices');
  open(def);
  cards.forEach((c) => c.addEventListener('mouseenter', () => { clearTimeout(timer); open(c); }));
  grid.addEventListener('mouseleave', () => { clearTimeout(timer); timer = setTimeout(() => open(def), 350); });
})();

/* Custom dropdown panel for select boxes (desktop, mouse only).
   The native <select> stays in place and keeps its value, keyboard behaviour
   and change events; only the mouse-opened list is replaced by a styled panel
   built from the select's current options each time it opens. */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const SEL = '.search__select, .cfilter__field select, .fsel select';
  const tick = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  let panel = null;
  let owner = null;

  const close = () => {
    if (!panel) return;
    panel.remove();
    panel = null;
    if (owner) owner.closest('label, .search__field')?.classList.remove('dd-open');
    owner = null;
  };

  const choose = (select, value) => {
    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    }
    close();
    select.focus({ preventScroll: true });
  };

  const open = (select) => {
    close();
    owner = select;
    const host = select.closest('.search__field, .cfilter__field, .fsel') || select;
    host.classList.add('dd-open');
    panel = document.createElement('div');
    panel.className = 'dd';
    panel.setAttribute('role', 'listbox');
    const add = (opt) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dd__opt' + (opt.value === select.value ? ' is-sel' : '');
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', String(opt.value === select.value));
      b.innerHTML = '<span></span>' + tick;
      b.firstChild.textContent = opt.textContent;
      b.addEventListener('click', () => choose(select, opt.value));
      panel.append(b);
    };
    [...select.children].forEach((node) => {
      if (node.tagName === 'OPTGROUP') {
        const h = document.createElement('div');
        h.className = 'dd__group';
        h.textContent = node.label;
        panel.append(h);
        [...node.children].forEach(add);
      } else if (node.tagName === 'OPTION') add(node);
    });
    document.body.append(panel);
    openY = window.scrollY;
    const r = host.getBoundingClientRect();
    const w = Math.max(r.width, 220);
    let left = Math.min(r.left, window.innerWidth - w - 12);
    panel.style.width = w + 'px';
    panel.style.left = Math.max(12, left) + 'px';
    const below = window.innerHeight - r.bottom;
    // open below whenever there is reasonable room, shrinking to fit; only flip up when cramped
    if (below >= 200 || below >= r.top) {
      panel.style.top = (r.bottom + 8) + 'px';
      panel.style.maxHeight = Math.min(240, below - 20) + 'px';
    } else {
      const h = Math.min(panel.scrollHeight, 240, r.top - 20);
      panel.style.maxHeight = h + 'px';
      panel.style.top = (r.top - h - 8) + 'px';
    }
    requestAnimationFrame(() => panel && panel.classList.add('is-in'));
    panel.querySelector('.is-sel')?.scrollIntoView({ block: 'nearest' });
  };

  document.addEventListener('mousedown', (e) => {
    const select = e.target.closest(SEL);
    if (select) {
      e.preventDefault();
      if (owner === select) close(); else open(select);
      return;
    }
    if (panel && !panel.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', close);
  let openY = 0;
  window.addEventListener('scroll', (e) => { if (panel && !panel.contains(e.target) && Math.abs(window.scrollY - openY) > 6) close(); }, true);
})();
