/* Build the self-contained single-file version of the Be Free site.
 *
 *   node scripts/build-befree.mjs
 *
 * CSS, JS and three.js are inlined; images load from absolute GitHub Pages
 * URLs so the one file works pasted into an Elementor HTML widget.
 */
import fs from 'fs';
import path from 'path';

const ROOT = '/home/user/Do-Step-Inn-Home';
const SRC  = path.join(ROOT, 'befree');
const OUT  = path.join(ROOT, 'befree-elementor');
const BASE = 'https://piaxoxo.github.io/Do-Step-Inn-Home/befree/';

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
fs.mkdirSync(OUT, { recursive: true });

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

fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(`index.html        ${(html.length / 1024).toFixed(0)} kB`);

/* ── the legal pages: same treatment, only stylesheets to inline ── */
for (const page of ['impressum.html', 'datenschutz.html', 'agb.html']) {
  let lg = read(page);
  lg = lg.replace('<link rel="stylesheet" href="assets/css/befree.css" />', () => `<style>\n${css}\n</style>`);
  lg = lg.replace('<link rel="stylesheet" href="assets/css/legal.css" />',  () => `<style>\n${legalCss}\n</style>`);
  lg = absolutise(lg);
  if (lg.includes('"assets/css/')) throw new Error(`not inlined: ${page}`);
  fs.writeFileSync(path.join(OUT, page), lg);
  console.log(`${page.padEnd(17)} ${(lg.length / 1024).toFixed(0)} kB`);
}
