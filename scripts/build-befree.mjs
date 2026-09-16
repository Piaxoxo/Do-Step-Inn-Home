/* Build the self-contained single-file version of the Be Free site.
 *
 *   node scripts/build-befree.mjs
 *
 * CSS and JS are inlined; images load from absolute CDN URLs so the one
 * file works pasted into an Elementor HTML widget.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = '/home/user/Do-Step-Inn-Home';
const SRC  = path.join(ROOT, 'befree');
const OUT  = path.join(ROOT, 'befree-elementor');
/* Where the photos come from when they are not embedded.
 *
 * NOT GitHub Pages: this repo serves Pages from its default branch, which
 * does not contain befree/, so every photo 404s until this work is merged.
 * jsDelivr serves any public repo at /gh/<owner>/<repo>@<ref>/<path>, so it
 * works today. The ref is the commit that last touched the images — pinned
 * rather than a branch name, because a branch containing "/" breaks the URL,
 * and because a commit is immutable and cached forever.
 *
 * If the images change, commit and push them, then rebuild: the SHA below is
 * read from git, so it follows along on its own.
 */
const IMG_SHA = execSync('git log -1 --format=%H -- befree/assets/img',
                         { cwd: ROOT }).toString().trim();
const BASE = `https://cdn.jsdelivr.net/gh/Piaxoxo/Do-Step-Inn-Home@${IMG_SHA}/befree/`;

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

/* Pass --standalone to inline every photograph too: one file that needs no
   host at all. Without it only the logo is embedded and the photos load from
   GitHub Pages, which keeps the file small enough to paste comfortably. */
const STANDALONE = process.argv.includes('--standalone');

/* Pass --embed for a page that sits INSIDE a theme: no navigation of its own
   and no footer, because WordPress already draws both. The result is a
   fragment — no doctype, no <head> — so it can go straight into an HTML
   widget on an ordinary (non-Canvas) page. */
const EMBED = process.argv.includes('--embed');

/* Where Impressum, Datenschutz and AGB live in WordPress. Declared once at
   the top of every file that links them, so a different slug is a one-line
   edit instead of a search across an inlined page. */
const LEGAL_SWITCH = `<script>
/* ══════════════════════════════════════════════════════════════════════
   RECHTSSEITEN — wohin Impressum, Datenschutz und AGB führen sollen.

   Normalerweise müsst ihr hier NICHTS eintragen: die Seite fragt beim
   Laden bei WordPress nach, wo die Seiten mit den Titeln Impressum,
   Datenschutz und AGB wirklich liegen, und trägt die echten Adressen
   ein — auch bei einfachen Permalinks oder in einem Unterordner.

   Klappt das nicht (REST-API abgeschaltet, andere Slugs), hier einfach
   die Adressen aus der WordPress-Seitenliste eintragen: Seite öffnen,
   "Anzeigen" klicken, Adresse kopieren. Ein eingetragener Wert gewinnt.
   ══════════════════════════════════════════════════════════════════════ */
window.BEFREE_LEGAL = {
  impressum:   "/impressum/",
  datenschutz: "/datenschutz/",
  agb:         "/agb/"
};

(function () {
  var DEFAULT = { impressum: "/impressum/", datenschutz: "/datenschutz/", agb: "/agb/" };

  function apply() {
    var L = window.BEFREE_LEGAL || {};
    var a = document.querySelectorAll("a[data-legal]");
    for (var i = 0; i < a.length; i++) {
      var to = L[a[i].getAttribute("data-legal")];
      if (to) a[i].setAttribute("href", to);
    }
  }

  /* WordPress prints the address of its own API into every page head.
     That is the one reliable way to ask where a page actually lives —
     it survives plain permalinks, a subfolder and a renamed slug. */
  function askWordPress() {
    var tag = document.querySelector('link[rel="https://api.w.org/"]');
    var root = tag && tag.getAttribute("href");
    if (!root || !window.fetch) return;
    if (root.slice(-1) !== "/") root += "/";

    Object.keys(DEFAULT).forEach(function (slug) {
      if ((window.BEFREE_LEGAL || {})[slug] !== DEFAULT[slug]) return;   /* hand-set wins */
      fetch(root + "wp/v2/pages?slug=" + slug + "&_fields=link", { credentials: "omit" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (list) {
          if (!list || !list.length || !list[0].link) return;
          window.BEFREE_LEGAL[slug] = list[0].link;
          apply();
        })
        .catch(function () {});
    });
  }

  function start() { apply(); askWordPress(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
</script>`;


function dataUri(rel) {
  const ext = path.extname(rel).toLowerCase();
  const mime = ext === '.png' ? 'image/png'
             : ext === '.svg' ? 'image/svg+xml'
             : 'image/jpeg';
  return `data:${mime};base64,` +
    fs.readFileSync(path.join(SRC, rel)).toString('base64');
}

/* The brand must never depend on a host being up, so the logo is embedded
   in every build — a broken logo is the one image nobody forgives. */
const LOGO = dataUri('assets/img/logo-befree.png');

const IMAGES = {};
if (STANDALONE) {
  for (const f of fs.readdirSync(path.join(SRC, 'assets/img'))) {
    IMAGES['assets/img/' + f] = dataUri('assets/img/' + f);
  }
}
fs.mkdirSync(OUT, { recursive: true });

if (!STANDALONE) {
  const pushed = execSync(
    `git branch -r --contains ${IMG_SHA} 2>/dev/null || true`, { cwd: ROOT }
  ).toString().trim();
  if (!pushed) {
    console.warn(`\n  WARNING  ${IMG_SHA.slice(0, 8)} is not pushed yet.\n` +
                 `           Every photo will 404 until it is. Push, then rebuild.\n`);
  }
}

function absolutise(html) {
  /* only the visible logo — embedding it in the favicon link too would
     double the weight of every page for an icon nobody misses */
  html = html.replace(/src="assets\/img\/logo-befree\.png"/g, `src="${LOGO}"`);

  if (STANDALONE) {
    html = html
      .replace(/(src|href)="(assets\/img\/[^"]+)"/g,
               (m, a, p2) => IMAGES[p2] ? `${a}="${IMAGES[p2]}"` : m)
      /* the gallery builds its paths at runtime */
      .replace(/"assets\/img\/"/g, 'BF_IMG_BASE')
      .replace(/`assets\/img\/\$\{name\}/g, '`${BF_IMG_BASE}${name}');
  }

  return html
    .replace(/(src|href)="assets\//g, `$1="${BASE}assets/`)
    .replace(/url\((['"]?)assets\//g, `url($1${BASE}assets/`)
    /* the JS builds image paths at runtime; route them through the one
       switch at the top of the file so a different host is a one-line edit */
    .replace(/"assets\/img\/"/g, 'window.BEFREE_IMG_BASE')
    .replace(/`assets\/img\/\$\{name\}/g, '`${window.BEFREE_IMG_BASE}${name}')
    /* legal pages become WordPress slugs */
    .replace(/href="impressum\.html"/g,   'href="/impressum/"')
    .replace(/href="datenschutz\.html"/g, 'href="/datenschutz/"')
    .replace(/href="agb\.html"/g,         'href="/agb/"')
    .replace(/href="index\.html"/g,       'href="/"');
}

const css      = read('assets/css/befree.css');
const legalCss = read('assets/css/legal.css');
const main   = read('assets/js/befree.js');

let html = read('index.html');

/* replacements are passed as FUNCTIONS: `$$` and `$&` inside CSS/JS would
   otherwise be treated as replacement patterns and mangle the output */
html = html.replace(
  '<link rel="stylesheet" href="assets/css/befree.css" />',
  () => `<style>\n${css}\n</style>`
);
html = html.replace(
  '<script src="assets/js/befree.js"></script>',
  () => `<script>\n${main}\n</script>`
);

html = absolutise(html);

if (STANDALONE) {
  /* one map for every path the scripts assemble at runtime */
  html = html.replace('</head>', () =>
    `<script>\nwindow.__BFIMG = ${JSON.stringify(IMAGES)};\n` +
    `function BF_IMG(p){ return window.__BFIMG[p] || p; }\n</script>\n</head>`);
  html = html
    .replace(/BF_IMG_BASE \+ p\.f \+ "\.jpg"/g, 'BF_IMG("assets/img/" + p.f + ".jpg")')
    .replace(/`\$\{BF_IMG_BASE\}\$\{name\}\.jpg`/g, 'BF_IMG(`assets/img/${name}.jpg`)');
  if (html.includes('BF_IMG_BASE')) throw new Error('a runtime image path was left unresolved');
}

if (!STANDALONE) {
  /* One place to point the photos somewhere else — the WordPress media
     library, your own CDN, anywhere. Leave it empty and the built-in
     addresses are used. Static src attributes are rewritten on load; the
     scripts read the same base. */
  html = html.replace('<body>', `<body>
<script>
/* ══════════════════════════════════════════════════════════════════════
   BILDER / PHOTOS — hier den Ordner eintragen, in dem eure Fotos liegen.
   Beispiel WordPress-Mediathek:
     window.BEFREE_IMG = "https://eure-domain.at/wp-content/uploads/befree/";
   Leer lassen = die voreingestellten Adressen verwenden.
   ══════════════════════════════════════════════════════════════════════ */
window.BEFREE_IMG = "";

(function () {
  var DEFAULT = ${JSON.stringify(BASE + 'assets/img/')};
  var custom  = (window.BEFREE_IMG || "").trim();
  if (custom && custom.slice(-1) !== "/") custom += "/";
  window.BEFREE_IMG_BASE = custom || DEFAULT;
  if (!custom) return;

  function repoint() {
    var imgs = document.querySelectorAll('img[src^="' + DEFAULT + '"]');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].src = custom + imgs[i].getAttribute("src").slice(DEFAULT.length);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repoint);
  } else { repoint(); }
})();
</script>`);
}

/* Elementor Canvas gives the page the full width; make sure nothing in the
   theme can box the layout in. In embed mode the theme's layout is the point,
   so these overrides stay out. */
if (!EMBED) html = html.replace('</head>', `  <style>
    html,body{max-width:100%!important;overflow-x:hidden}
    .elementor-section-wrap,.elementor-container,.elementor-widget-container,
    .e-con,.e-con-inner{max-width:100%!important;padding:0!important;margin:0!important}
  </style>
</head>`);

for (const token of ['assets/css/befree.css', 'assets/js/befree.js']) {
  if (html.includes(`"${token}"`)) throw new Error(`not inlined: ${token}`);
}

/* ══ CONTENT-ONLY BUILD (--embed) ═════════════════════════════════════
   Splits the site the way a WordPress theme wants it: the page keeps only
   its content, and the chrome ships as two separate files — header.html
   and footer.html — for the theme's own header and footer templates. The
   content then has to break out of whatever container the theme wraps it
   in, or the colour bands stop short of the screen edge. */

const EMBED_CSS = `<style>
/* ── Be Free — Inhalt einer Theme-Seite ──────────────────────────────
   Header und Footer liegen als eigene Dateien daneben: header.html und
   footer.html.

   --nav-h ist der Platz, den die Seite oben freihält:
     74px  = ihr benutzt unseren header.html (Standard)
     0px   = euer Theme-Header scrollt normal mit
     eigene Höhe = euer Theme-Header bleibt beim Scrollen stehen        */
:root{ --nav-h: 74px; }

/* Volle Breite, egal wie schmal der Container des Themes ist.
   Bewusst kein width:100vw — das rechnet die Scrollbar mit und erzeugt
   genau das Querscrollen, das es verhindern soll. */
.befree-full{ margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw) }
</style>`;

/* The German strings live in befree.js. Every partial takes exactly the
   keys its own markup uses, read from that one dictionary, so the two can
   never drift apart. */
const DE = (function () {
  const m = main.match(/var DE = \{[\s\S]*?\n  \};/);
  if (!m) throw new Error('partials: the German dictionary was not found');
  return (0, eval)('(' + m[0].replace(/^var DE = /, '').replace(/;\s*$/, '') + ')');
})();

function dictFor(markup) {
  const out = {};
  for (const m of markup.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) {
    if (DE[m[1]]) out[m[1]] = DE[m[1]];
  }
  if (!Object.keys(out).length) throw new Error('partials: nothing translatable found');
  return out;
}

/* A partial has to stand on its own: it may end up on a page where
   befree.js never runs, such as a legal page. Where befree.js IS present
   it switches the language live, so the button here only records the
   choice and leaves the reload to the case where nobody else will. */
function partialScript(dict, rootSel, extra) {
  return `<script>
(function () {
  var DE = ${JSON.stringify(dict)};
  var KEY = "befree-lang";
  var root = document.querySelector(${JSON.stringify(rootSel)});
  if (!root) return;

  var lang = (function () {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q) return q.toLowerCase().indexOf("de") === 0 ? "de" : "en";
      var s = localStorage.getItem(KEY);
      if (s) return s === "de" ? "de" : "en";
    } catch (e) {}
    return (navigator.language || "en").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  })();

  if (lang === "de") {
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = DE[el.getAttribute("data-i18n")];
      if (!v) return;
      /* keep the English before overwriting it: befree.js reads the page to
         learn what English says, and it runs after this. Without the copy it
         would learn German and the EN button would change nothing. */
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.textContent);
      el.textContent = v;
    });
    root.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = DE[el.getAttribute("data-i18n-html")];
      if (!v) return;
      if (!el.hasAttribute("data-en-html")) el.setAttribute("data-en-html", el.innerHTML);
      el.innerHTML = v;
    });
  }
${extra}
})();
</script>`;
}

const HEADER_EXTRA = `
  var en = root.querySelector("#lang-en"), de = root.querySelector("#lang-de");
  if (en) en.setAttribute("aria-pressed", String(lang === "en"));
  if (de) de.setAttribute("aria-pressed", String(lang === "de"));

  function choose(l) {
    return function () {
      try { localStorage.setItem(KEY, l); } catch (e) {}
      /* on the start page befree.js switches everything live — only a page
         without it needs the reload */
      setTimeout(function () { if (!window.BeFree) location.reload(); }, 0);
    };
  }
  if (en) en.addEventListener("click", choose("en"));
  if (de) de.addEventListener("click", choose("de"));

  var burger = root.querySelector("#burger"), links = root.querySelector("#navlinks");
  if (burger && links) {
    burger.dataset.bound = "1";   /* befree.js must not bind it a second time */
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }`;

const FOOTER_EXTRA = `
  var y = root.querySelector("#year");
  if (y) y.textContent = String(new Date().getFullYear());`;

/* the pieces every fragment needs before its own markup */
function fragmentHead(doc, extraCss) {
  const head = doc.slice(doc.indexOf('<head>'), doc.indexOf('</head>'));
  const fonts  = head.match(/<link rel="preconnect"[^>]*>|<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/g) || [];
  const styles = head.match(/<style>[\s\S]*?<\/style>/g) || [];
  if (!styles.length) throw new Error('fragment: the stylesheet was not inlined');
  if (!fonts.length)  throw new Error('fragment: the font link is missing');
  return [...fonts, ...styles, extraCss];
}

function toContent(doc) {
  let body = doc.slice(doc.indexOf('<body>') + '<body>'.length, doc.lastIndexOf('</body>'));
  const ld = doc.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
  /* --standalone keeps the embedded image map in the head, and it has to
     run before anything reads it */
  const headScripts = doc.slice(doc.indexOf('<head>'), doc.indexOf('</head>'))
                         .match(/<script>[\s\S]*?<\/script>/g) || [];
  if (STANDALONE && !headScripts.some(b => b.includes('__BFIMG'))) {
    throw new Error('fragment: the embedded image map went missing');
  }

  const before = body.length;
  body = body
    .replace(/<a class="skip"[\s\S]*?<\/a>\n?/, '')
    .replace(/<!-- =*\s*NAV\s*=*\s*-->\n?/, '')
    .replace(/<header class="nav">[\s\S]*?<\/header>\n?/, '')
    .replace(/<!-- =*\s*FOOTER\s*=*\s*-->\n?/, '')
    .replace(/<footer class="foot">[\s\S]*?<\/footer>\n?/, '');
  if (/<header class="nav"|<footer class="foot"/.test(body)) throw new Error('content: header or footer survived');
  if (before - body.length < 2000) throw new Error('content: too little was removed — did the markup move?');

  return [
    '<!-- Be Free Hostel — INHALT der Startseite.',
    '     Header und Footer sind eigene Dateien: header.html, footer.html.',
    '     Auf eine normale Seite (kein Canvas), ein HTML-Widget, alles hier hinein.',
    '     Seitentitel und Meta-Beschreibung setzt ihr in WordPress. -->',
    ...fragmentHead(doc, EMBED_CSS), ...headScripts,
    /data-legal="/.test(body) ? LEGAL_SWITCH : '',
    '<div class="befree-full">', body.trim(), '</div>', ...ld
  ].join('\n');
}

/* ── header.html and footer.html: the chrome, on its own ── */
function partial(doc, which) {
  const body = doc.slice(doc.indexOf('<body>'), doc.lastIndexOf('</body>'));
  const markup = which === 'header'
    ? (body.match(/<header class="nav">[\s\S]*?<\/header>/) || [])[0]
    : (body.match(/<footer class="foot">[\s\S]*?<\/footer>/) || [])[0];
  if (!markup) throw new Error(`partial: the ${which} markup was not found`);

  /* inside a theme every link has to work from any page, not just from the
     start page, so the anchors get the home slug in front of them */
  const linked = markup.replace(/href="#/g, 'href="/#');
  const note = which === 'header'
    ? ['<!-- Be Free Hostel — HEADER. In die Kopfzeilen-Vorlage des Themes,',
       '     oder als HTML-Widget ganz oben auf jeder Seite.',
       '     Die Seite darunter hält mit --nav-h: 74px Platz dafür frei. -->']
    : ['<!-- Be Free Hostel — FOOTER. In die Fußzeilen-Vorlage des Themes,',
       '     oder als HTML-Widget ganz unten auf jeder Seite.',
       '     Verlinkt /impressum/, /datenschutz/ und /agb/. -->'];

  return [
    ...note,
    ...fragmentHead(doc, ''),
    /data-legal="/.test(markup) ? LEGAL_SWITCH : '',
    '<div class="befree-full">', linked, '</div>',
    partialScript(dictFor(markup), which === 'header' ? 'header.nav' : 'footer.foot',
                  which === 'header' ? HEADER_EXTRA : FOOTER_EXTRA)
  ].filter(Boolean).join('\n');
}

/* the switch belongs in whatever file still carries the links */
if (!EMBED && /data-legal="/.test(html)) {
  html = html.replace('<body>', () => '<body>\n' + LEGAL_SWITCH);
}

if (EMBED) {
  for (const which of ['header', 'footer']) {
    const out = partial(html, which);
    fs.writeFileSync(path.join(OUT, which + '.html'), out);
    console.log(`${(which + '.html').padEnd(26)} ${(out.length / 1024).toFixed(0)} kB`);
  }
  html = toContent(html);
}

const NAME = 'index' + (EMBED ? '-content' : '') + (STANDALONE ? '-standalone' : '') + '.html';
fs.writeFileSync(path.join(OUT, NAME), html);
console.log(`${NAME.padEnd(26)} ${(html.length / 1024).toFixed(0)} kB`);

/* ── the legal pages: same treatment, only stylesheets to inline ── */
for (const page of ['impressum.html', 'datenschutz.html', 'agb.html']) {
  let lg = read(page);
  lg = lg.replace('<link rel="stylesheet" href="assets/css/befree.css" />', () => `<style>\n${css}\n</style>`);
  lg = lg.replace('<link rel="stylesheet" href="assets/css/legal.css" />',  () => `<style>\n${legalCss}\n</style>`);
  lg = absolutise(lg);
  if (lg.includes('"assets/css/')) throw new Error(`not inlined: ${page}`);
  if (!EMBED && /data-legal="/.test(lg)) {
    lg = lg.replace('<body>', () => '<body>\n' + LEGAL_SWITCH);
  }

  let name = STANDALONE ? page.replace('.html', '-standalone.html') : page;

  if (EMBED) {
    /* the legal pages carry their own small header and footer; in a theme
       both are one too many */
    let body = lg.slice(lg.indexOf('<body>') + '<body>'.length, lg.lastIndexOf('</body>'));
    const before = body.length;
    body = body
      .replace(/<a class="skip"[\s\S]*?<\/a>\n?/, '')
      .replace(/<header class="lg-nav">[\s\S]*?<\/header>\n?/, '')
      .replace(/<footer class="lg-foot">[\s\S]*?<\/footer>\n?/, '')
      /* that footer held the only #year, so its script has nothing left to do */
      .replace(/<script>[\s\S]*?getElementById\("year"\)[\s\S]*?<\/script>\n?/, '');
    if (/lg-nav|lg-foot|getElementById\("year"\)/.test(body)) throw new Error(`content: chrome survived in ${page}`);
    if (before - body.length < 500) throw new Error(`content: too little was removed from ${page}`);

    lg = [
      `<!-- Be Free Hostel — INHALT von ${page.replace('.html', '').toUpperCase()}.`,
      '     Header und Footer kommen vom Theme (header.html / footer.html). -->',
      ...fragmentHead(lg, EMBED_CSS),
      /data-legal="/.test(body) ? LEGAL_SWITCH : '',
      '<div class="befree-full">', body.trim(), '</div>'
    ].join('\n');
    name = page.replace('.html', '-content' + (STANDALONE ? '-standalone' : '') + '.html');
  }

  fs.writeFileSync(path.join(OUT, name), lg);
  console.log(`${name.padEnd(26)} ${(lg.length / 1024).toFixed(0)} kB`);
}
