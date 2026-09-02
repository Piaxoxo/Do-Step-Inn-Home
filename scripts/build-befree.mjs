/* Build the self-contained single-file version of the Be Free site.
 *
 *   node scripts/build-befree.mjs
 *
 * CSS, JS and three.js are inlined; images load from absolute GitHub Pages
 * URLs so the one file works pasted into an Elementor HTML widget.
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

/* ── three.js ships as an ES module; turn its final export list into a
      plain global so the whole thing can live in one classic <script> ── */
function threeAsGlobal(src) {
  const i = src.lastIndexOf('export{');
  if (i < 0) throw new Error('three.js: no export block found');
  const j = src.indexOf('}', i);
  const pairs = src.slice(i + 'export{'.length, j)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(part => {
      const [local, exported] = part.includes(' as ') ? part.split(' as ') : [part, part];
      return `${exported.trim()}:${local.trim()}`;
    });
  return `(function(){${src.slice(0, i)};window.__THREE={${pairs.join(',')}};})();`;
}

/* ── flower.js imports from three; swap that for the global ── */
function flowerAsScript(src) {
  const m = src.match(/import\s*\{([\s\S]*?)\}\s*from\s*["'][^"']*three[^"']*["'];?/);
  if (!m) throw new Error('flower.js: import block not found');
  const names = m[1].split(',').map(s => s.trim()).filter(Boolean).join(', ');
  const body = src.replace(m[0], `const { ${names} } = window.__THREE;`);
  /* the module bails with `throw` when the stage is missing — contain it */
  return `(function(){try{\n${body}\n}catch(e){\n` +
         `  var s=document.querySelector(".bloom"); if(s) s.style.display="none";\n` +
         `}})();`;
}

function absolutise(html) {
  /* only the visible logo — embedding it in the favicon link too would
     double the weight of every page for an icon nobody misses */
  html = html.replace(/src="assets\/img\/logo-befree\.png"/g, `src="${LOGO}"`);

  if (STANDALONE) {
    html = html
      .replace(/(src|href)="(assets\/img\/[^"]+)"/g,
               (m, a, p2) => IMAGES[p2] ? `${a}="${IMAGES[p2]}"` : m)
      /* the gallery and the flower build their paths at runtime */
      .replace(/"assets\/img\/"/g, 'BF_IMG_BASE')
      .replace(/`assets\/img\/\$\{name\}/g, '`${BF_IMG_BASE}${name}');
  }

  return html
    .replace(/(src|href)="assets\//g, `$1="${BASE}assets/`)
    .replace(/url\((['"]?)assets\//g, `url($1${BASE}assets/`)
    /* the JS builds image paths at runtime too */
    .replace(/"assets\/img\/"/g, `"${BASE}assets/img/"`)
    .replace(/`assets\/img\/\$\{name\}/g, '`' + BASE + 'assets/img/${name}')
    /* legal pages become WordPress slugs */
    .replace(/href="impressum\.html"/g,   'href="/impressum/"')
    .replace(/href="datenschutz\.html"/g, 'href="/datenschutz/"')
    .replace(/href="agb\.html"/g,         'href="/agb/"')
    .replace(/href="index\.html"/g,       'href="/"');
}

const css      = read('assets/css/befree.css');
const legalCss = read('assets/css/legal.css');
const main   = read('assets/js/befree.js');
const three  = threeAsGlobal(read('assets/vendor/three.module.min.js'));
const flower = flowerAsScript(read('assets/js/flower.js'));

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
html = html.replace(
  '<script type="module" src="assets/js/flower.js"></script>',
  () => `<script>\n${three}\n${flower}\n</script>`
);

html = absolutise(html);

if (STANDALONE) {
  /* one map for every path the scripts assemble at runtime */
  html = html.replace('</head>', () =>
    `<script>\nwindow.__BFIMG = ${JSON.stringify(IMAGES)};\n` +
    `function BF_IMG(p){ return window.__BFIMG[p] || p; }\n</script>\n</head>`);
  html = html
    .replace(/BF_IMG_BASE \+ p\.f \+ "\.jpg"/g, 'BF_IMG("assets/img/" + p.f + ".jpg")')
    .replace(/`\$\{BF_IMG_BASE\}\$\{name\}\.jpg`/g, 'BF_IMG(`assets/img/${name}.jpg`)')
    .replace(/`\$\{BF_IMG_BASE\}\$\{name\}-depth\.png`/g, 'BF_IMG(`assets/img/${name}-depth.png`)');
  if (html.includes('BF_IMG_BASE')) throw new Error('a runtime image path was left unresolved');
}

/* Elementor Canvas gives the page the full width; make sure nothing in the
   theme can box the layout in */
html = html.replace('</head>', `  <style>
    html,body{max-width:100%!important;overflow-x:hidden}
    .elementor-section-wrap,.elementor-container,.elementor-widget-container,
    .e-con,.e-con-inner{max-width:100%!important;padding:0!important;margin:0!important}
  </style>
</head>`);

for (const token of ['assets/css/befree.css', 'assets/js/befree.js', 'assets/js/flower.js']) {
  if (html.includes(`"${token}"`)) throw new Error(`not inlined: ${token}`);
}

const NAME = STANDALONE ? 'index-standalone.html' : 'index.html';
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
