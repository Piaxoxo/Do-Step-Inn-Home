# Standalone HTML for Elementor / WordPress

These are **self-contained, single-file** versions of the site. All CSS and
JavaScript are inlined; images, fonts, the 3D library and the booking widget
load from absolute URLs, so each file works on its own — just paste it in.

| File | Page |
|------|------|
| `index.html` | Homepage (hero, rooms, gallery, story, 3D fly-through, locations, booking) |
| `impressum.html` | Impressum |
| `datenschutz.html` | Datenschutzerklärung |
| `agb.html` | AGB |

## How to use in Elementor

1. Create a new page and set the **page layout to “Elementor Canvas”**
   (Page settings → Page Layout → Canvas). This removes the theme’s
   header/footer so the design has the full screen — important, because the
   page brings its own fixed navigation and full-height hero.
2. Drag in a single **“HTML” widget** that fills the page.
3. Open the matching file, **copy the entire contents**, and paste it into the
   HTML widget.
4. Publish.

### Notes
- The **booking widget** (UP Hotel IBE) and **Google Maps/Fonts** load from the
  internet — they need a live connection, which is normal.
- The **3D hero and fly-through** only run on capable desktops and quietly fall
  back to a static image on phones or if a browser blocks modules — that is by
  design.
- Cross-page links (Impressum/Datenschutz/AGB) point to `impressum.html` etc.
  In WordPress, repoint them to the real page URLs you create.
- Images are served from the live GitHub Pages URL. If you’d rather host the
  images in WordPress, upload them to the Media Library and replace the
  `https://piaxoxo.github.io/Do-Step-Inn-Home/assets/img/...` URLs.

## Regenerating

After changing the source site, rebuild these files with:

```
node scripts/build-standalone.mjs
```
