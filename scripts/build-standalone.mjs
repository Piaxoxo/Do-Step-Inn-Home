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
idx = idx.replace('</head>', `  <script>window.__DSI_STATIC = true;</script>
  <style>
    /* Full-bleed fit for Elementor: break out of the column to full viewport width */
    #top{ width: 100vw; margin-left: calc(50% - 50vw); }
    .bookbar{ width: 100vw; margin-left: calc(50% - 50vw); }
    /* No built-in fixed header in this build — reclaim the hero's top space */
    .hero{ padding-top: clamp(3rem, 8vh, 6rem); }
    /* Embed-safe: force scroll-effect sections into their static layout so
       position:sticky can't collapse and leave long empty gaps inside Elementor */
    .hgallery__pin{ position: static !important; height: auto !important; padding: clamp(3rem,8vh,6rem) 0; }
    .hgallery__track{ overflow-x: auto !important; transform: none !important; -webkit-overflow-scrolling: touch; }
    .story{ height: auto !important; }
    .story__pin{ position: static !important; height: auto !important; padding: 4rem 0; }
    .story__line{ opacity: 1 !important; transform: none !important; }
    .fly{ height: auto !important; }
    .fly__pin{ position: static !important; height: auto !important; perspective: none !important; overflow: visible !important; }
    .fly__space{ position: static !important; transform: none !important; }
    .fly__panel{ position: relative !important; left: auto !important; top: auto !important; transform: none !important; opacity: 1 !important; width: auto; max-width: 640px; margin: 1rem auto; }
    .fly__head{ position: static !important; margin-bottom: 1.5rem; }
    .fly__hint{ display: none; }
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

// ---- SELF-CONTAINED DOC HELPER (fonts + inlined CSS) ----
function doc({ title, headExtra = '', bodyClass = '', body }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>
${styles}
${legal}
${headExtra}
</style>
</head>
<body class="${bodyClass}">
${body}
</body>
</html>`;
}

// ---- COMBINED LEGAL PAGE (Impressum + Datenschutz + AGB on one page) ----
const grabMain = (f) => {
  const m = read(`${f}.html`).match(/<main class="legal-wrap">([\s\S]*?)<\/main>/);
  return m ? m[1] : '';
};
const rechtCss = `
.legal-bleed{ width: 100vw; margin-left: calc(50% - 50vw); background: var(--bg); }
.legal-topnav{ position: sticky; top: 0; z-index: 20; display: flex; gap: 1.4rem; justify-content: center; flex-wrap: wrap;
  padding: 1rem; background: color-mix(in srgb, var(--surface) 90%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
.legal-topnav a{ color: var(--ink-soft); font-size: .92rem; font-weight: 500; }
.legal-topnav a[aria-current], .legal-topnav a:hover{ color: var(--accent); }
.legal-sep{ border: 0; border-top: 1px solid var(--line); max-width: 860px; margin: 1rem auto; }
`;
const rechtBody = `<div class="legal-bleed">
  <nav class="legal-topnav" aria-label="Rechtliches">
    <a href="#impressum">Impressum</a>
    <a href="#datenschutz">Datenschutz</a>
    <a href="#agb">AGB</a>
  </nav>
  <main class="legal-wrap" id="impressum">${grabMain('impressum')}</main>
  <hr class="legal-sep" />
  <main class="legal-wrap" id="datenschutz">${grabMain('datenschutz')}</main>
  <hr class="legal-sep" />
  <main class="legal-wrap" id="agb">${grabMain('agb')}</main>
</div>
<script>var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();</script>`;
// on the combined page, internal cross-links jump to the section anchors
const rechtBodyLinked = rechtBody.replace(/href="(impressum|datenschutz|agb)\.html"/g, 'href="#$1"');
let recht = doc({ title: 'Rechtliches — Do Step Inn Home', bodyClass: 'legal', headExtra: rechtCss, body: rechtBodyLinked });
recht = rewriteHtmlAssets(recht);
fs.writeFileSync(path.join(OUT, 'recht.html'), recht);

// ---- HEADER SNIPPET (nav HTML + CSS + minimal JS) ----
const srcIndex = read('index.html');
const headerHtml = srcIndex.match(/<header class="nav"[\s\S]*?<\/header>/)[0];
const headerJs = `<script>
(function(){
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function(){ nav.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    var b = document.querySelector('[data-toggle-menu]');
    if (b) b.addEventListener('click', function(){ var o = nav.classList.toggle('is-menu-open'); b.setAttribute('aria-expanded', String(o)); });
  }
  document.addEventListener('click', function(e){
    var o = e.target.closest('[data-open-booking]');
    if (o){ var t = document.getElementById('book-top'); if (t){ e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); } }
  });
})();
</script>`;
let header = doc({ title: 'Header — Do Step Inn Home', body: headerHtml + '\n' + headerJs });
header = rewriteHtmlAssets(header);
fs.writeFileSync(path.join(OUT, 'header.html'), header);

// ---- FOOTER SNIPPET (footer HTML + CSS + year JS) ----
const footerHtml = srcIndex.match(/<footer class="footer"[\s\S]*?<\/footer>/)[0];
const footerJs = `<script>var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();</script>`;
let footer = doc({ title: 'Footer — Do Step Inn Home', body: footerHtml + '\n' + footerJs });
footer = rewriteHtmlAssets(footer);
fs.writeFileSync(path.join(OUT, 'footer.html'), footer);

// report sizes
for (const f of ['index.html','impressum.html','datenschutz.html','agb.html','recht.html','header.html','footer.html']) {
  const s = fs.statSync(path.join(OUT, f)).size;
  console.log(`elementor/${f}: ${Math.round(s/1024)} KB`);
}
// sanity: no remaining relative asset refs
const check = fs.readFileSync(path.join(OUT,'index.html'),'utf8');
const badHtml = (check.match(/(src|href)="assets\//g)||[]).length;
const badCss = (check.match(/url\((['"]?)\.\.\//g)||[]).length;
console.log('remaining relative html asset refs:', badHtml, '| relative css urls:', badCss);
console.log('external absolute img refs present:', (check.match(new RegExp(BASE.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'assets/img','g'))||[]).length);
