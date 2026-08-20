import fs from 'fs';
import path from 'path';

const ROOT = '/home/user/Do-Step-Inn-Home';
const OUT = path.join(ROOT, 'elementor');
const BASE = 'https://piaxoxo.github.io/Do-Step-Inn-Home/';

fs.mkdirSync(OUT, { recursive: true });
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// rewrite url(../xxx) inside CSS (css lives in assets/css/) -> absolute
function rewriteCss(css) {
  return css.replace(/url\((['"]?)\.\.\//g, `url($1${BASE}assets/`);
}
// rewrite src/href="assets/..." in HTML -> absolute
function rewriteHtmlAssets(html) {
  return html
    .replace(/(src|href)="assets\//g, `$1="${BASE}assets/`)
    .replace(/"\.\/assets\/vendor\/three\.module\.min\.js"/g, `"${BASE}assets/vendor/three.module.min.js"`);
}

const styles = rewriteCss(read('assets/css/styles.css'));
const legal  = rewriteCss(read('assets/css/legal.css'));
const conc   = read('assets/js/concierge.js');
const main   = read('assets/js/main.js');
const scene  = read('assets/js/scene.js');

// ---- INDEX ----
// NOTE: replacement values are passed as FUNCTIONS so that `$$`/`$&` inside
// the JS/CSS are inserted literally (string replacements mangle them).
let idx = read('index.html');
idx = idx.replace(
  '<link rel="stylesheet" href="assets/css/styles.css" />',
  () => `<style>\n${styles}\n</style>`
);
idx = idx.replace(
  '<script src="assets/js/concierge.js" defer></script>',
  () => `<script>\n${conc}\n</script>`
);
idx = idx.replace(
  '<script src="assets/js/main.js" defer></script>',
  () => `<script>\n${main}\n</script>`
);
idx = idx.replace(
  '<script type="module" src="assets/js/scene.js"></script>',
  () => `<script type="module">\n${scene}\n</script>`
);
idx = rewriteHtmlAssets(idx);

// ── Elementor variant: drop the built-in header + footer (WordPress/Elementor supplies its own) ──
idx = idx.replace(/\n\s*<!-- ══ NAV[\s\S]*?<\/header>\n/, '\n');
idx = idx.replace(/\n\s*<!-- ══ FOOTER[\s\S]*?<\/footer>\n/, '\n');

// ── Elementor variant: break out of the column so it fills the page ─────
idx = idx.replace('</head>', `  <style>
    /* Full-bleed fit for Elementor: break out of the column to full viewport width */
    #top{ width: 100vw; margin-left: calc(50% - 50vw); }
    .bookbar{ width: 100vw; margin-left: calc(50% - 50vw); }
    /* No built-in fixed header in this build — reclaim the hero's top space */
    .hero{ padding-top: clamp(3rem, 8vh, 6rem); }
  </style>
</head>`);

fs.writeFileSync(path.join(OUT, 'index.html'), idx);

// ---- LEGAL PAGES ----
for (const pg of ['impressum', 'datenschutz', 'agb']) {
  let h = read(`${pg}.html`);
  h = h.replace('<link rel="stylesheet" href="assets/css/styles.css" />', () => `<style>\n${styles}\n</style>`);
  h = h.replace('<link rel="stylesheet" href="assets/css/legal.css" />', () => `<style>\n${legal}\n</style>`);
  h = rewriteHtmlAssets(h);
  fs.writeFileSync(path.join(OUT, `${pg}.html`), h);
}

// report sizes
for (const f of ['index.html','impressum.html','datenschutz.html','agb.html']) {
  const s = fs.statSync(path.join(OUT, f)).size;
  console.log(`elementor/${f}: ${Math.round(s/1024)} KB`);
}
// sanity: no remaining relative asset refs
const check = fs.readFileSync(path.join(OUT,'index.html'),'utf8');
const badHtml = (check.match(/(src|href)="assets\//g)||[]).length;
const badCss = (check.match(/url\((['"]?)\.\.\//g)||[]).length;
console.log('remaining relative html asset refs:', badHtml, '| relative css urls:', badCss);
console.log('external absolute img refs present:', (check.match(new RegExp(BASE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'assets/img','g'))||[]).length);
