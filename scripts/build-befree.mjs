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

/* ── strip the page down to something a theme can host ──────────────
   Out: our fixed navigation, our footer, the skip link (the theme has
   its own), and the document shell around them. In: a language switch,
   since the one in the navigation went with it, and a quiet legal line,
   because Impressum, Datenschutz and AGB have to be reachable from the
   page even if the theme's footer does not carry them. */
const EMBED_CSS = `<style>
/* ── Be Free im Theme: Kopf- und Fußzeile kommen von WordPress ──
   Hat euer Theme einen mitscrollenden (sticky) Header? Dann hier seine
   Höhe eintragen, damit Sprungmarken nicht darunter verschwinden. */
:root{ --nav-h: 0px; }

.lang--float{
  position:fixed;left:14px;bottom:14px;z-index:60;
  background:var(--card);box-shadow:var(--shadow-sm);
}
/* Diese Zeile kann weg, wenn der Theme-Footer die Rechtsseiten schon verlinkt */
.bf-legal{
  margin:0;padding:18px;text-align:center;
  background:var(--paper);border-top:2px solid var(--ink);
  font-family:var(--f-mono);font-size:12.5px;letter-spacing:.06em;
}
.bf-legal a{color:var(--text)}
</style>`;

const EMBED_TAIL = `
<div class="lang lang--float" role="group" aria-label="Sprache">
  <button type="button" id="lang-en" aria-pressed="true">EN</button>
  <button type="button" id="lang-de" aria-pressed="false">DE</button>
</div>

<p class="bf-legal">
  <a href="/impressum/">Impressum</a> ·
  <a href="/datenschutz/">Datenschutz</a> ·
  <a href="/agb/">AGB</a>
</p>
`;

function toEmbed(doc) {
  const head = doc.slice(doc.indexOf('<head>'), doc.indexOf('</head>'));
  let body = doc.slice(doc.indexOf('<body>') + '<body>'.length, doc.lastIndexOf('</body>'));

  const fonts  = head.match(/<link rel="preconnect"[^>]*>|<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/g) || [];
  const styles = head.match(/<style>[\s\S]*?<\/style>/g) || [];
  const ld     = head.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || [];
  /* --standalone puts the image map in the head, and it has to run before
     anything that reads it */
  const boot   = (head.match(/<script>[\s\S]*?<\/script>/g) || []);
  if (STANDALONE && !boot.some(b => b.includes('__BFIMG'))) {
    throw new Error('embed: the embedded image map went missing');
  }
  if (!styles.length) throw new Error('embed: the stylesheet was not inlined');
  if (!fonts.length)  throw new Error('embed: the font link is missing');

  const before = body.length;
  body = body
    .replace(/<a class="skip"[\s\S]*?<\/a>\n?/, '')
    .replace(/<!-- =*\s*NAV\s*=*\s*-->\n?/, '')
    .replace(/<header class="nav">[\s\S]*?<\/header>\n?/, '')
    .replace(/<!-- =*\s*FOOTER\s*=*\s*-->\n?/, '')
    .replace(/<footer class="foot">[\s\S]*?<\/footer>\n?/, '');
  if (/<header class="nav"|<footer class="foot"/.test(body)) throw new Error('embed: header or footer survived');
  if (before - body.length < 2000) throw new Error('embed: too little was removed — did the markup move?');

  /* the language switch goes back in, and the legal line closes the page */
  body = body.replace('</main>', () => '</main>\n' + EMBED_TAIL);
  if (!body.includes('lang--float')) throw new Error('embed: the language switch was not placed');

  return [
    '<!-- Be Free Hostel — Seite ohne eigenen Header und Footer.',
    '     Für eine normale Theme-Seite (kein Canvas): ein HTML-Widget, alles hier hinein.',
    '     Titel und Meta-Beschreibung setzt ihr in WordPress. -->',
    ...fonts, ...styles, EMBED_CSS, ...boot, body.trim(), ...ld
  ].join('\n');
}

if (EMBED) html = toEmbed(html);

const NAME = 'index' + (EMBED ? '-embed' : '') + (STANDALONE ? '-standalone' : '') + '.html';
fs.writeFileSync(path.join(OUT, NAME), html);
console.log(`${NAME.padEnd(24)} ${(html.length / 1024).toFixed(0)} kB`);

/* ── the legal pages: same treatment, only stylesheets to inline ── */
for (const page of ['impressum.html', 'datenschutz.html', 'agb.html']) {
  let lg = read(page);
  lg = lg.replace('<link rel="stylesheet" href="assets/css/befree.css" />', () => `<style>\n${css}\n</style>`);
  lg = lg.replace('<link rel="stylesheet" href="assets/css/legal.css" />',  () => `<style>\n${legalCss}\n</style>`);
  lg = absolutise(lg);
  if (lg.includes('"assets/css/')) throw new Error(`not inlined: ${page}`);
  const name = STANDALONE ? page.replace('.html', '-standalone.html') : page;
  fs.writeFileSync(path.join(OUT, name), lg);
  console.log(`${name.padEnd(24)} ${(lg.length / 1024).toFixed(0)} kB`);
}
