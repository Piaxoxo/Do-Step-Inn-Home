# Be Free Hostel — Website

> **Be Free. Be You. Be Here.**
> Beingasse 13, 1150 Wien · befree-hostel@dostepinn.at · +43 699 19232769

A bilingual (EN/DE) single-page site for Be Free Hostel. Static, no build step
for the site itself — open `index.html` and it runs.

```bash
python3 -m http.server 8080     # from the repo root
# → http://localhost:8080/befree/
```

## What's on the page

| Section | Content |
|---|---|
| Hero | *Be Free. Be You. Be Here.* over a canvas field of colour-cycling flowers |
| Ticker | TOP DESTINATION · VIENNA · BEINGASSE 13 · BE FREE HOSTEL, endless |
| Book bar | Gold band under the hero — booking where intent is highest |
| Location | Turquoise band — the neighbourhood, four markers, distances as stickers |
| Check-in | Pink band — the three steps, plus the phone number for when the QR fails |
| Rooms | Private room · Capsule bed · Classic dorm, as pastel cards |
| Why Be Free | Freedom, together, clean, colour |
| Flower gallery | Scroll-driven 3D: every petal is a photograph with its own depth map |
| Gallery | Plain grid, click to enlarge, keyboard-navigable lightbox |
| Good to know | Violet band — quiet hours, bathrooms, kitchen, no front desk, groups |
| Book | Pink band — booking form, replaced by the UP Hotel widget when it loads |
| Contact | Email and phone |

Plus three German-only legal pages: `impressum.html`, `datenschutz.html`, `agb.html`.

## Design system

Every brand colour was sampled from the real logo artwork
(`assets/img/logo-befree.png`), then **pink was promoted to lead**: it carries
booking, emphasis and the big bands, and nothing else uses it.

| Token | Hex | Role |
|---|---|---|
| `--pink` | `#FF3D9A` | Booking, emphasis. Never decorative. |
| `--pink-mid` | `#F97CB6` | Full-bleed bands |
| `--pink-soft` | `#FFD9E9` | Cards, oversized background wordmarks |
| `--ink` | `#0B0B0C` | Every outline and all type |
| `--turq` | `#4FC3CE` | The cool counterweight — location, practical info |
| `--gold` | `#E4B430` | The most common logo colour — ticker, brand moments |
| `--orange` `--violet` `--leaf` `--cherry` | | Flower colours |
| `--paper` | `#FFF7E4` | Warm ground, pulled toward the gold. Never pure white. |

**Type:** Bagel Fat One (statements) · Shrikhand (headings) · Karla (body) ·
DM Mono (labels). Deliberately no graffiti face — the street-art feel comes
from stickers, hard outlines and offset shadows, not from a costume font.

**Components:** sticker tags, pill buttons with a circled arrow, pastel cards,
full-bleed colour bands, oversized wordmarks that bleed past both edges.

The site commits to one bright look on purpose and has no dark mode — every
colour is painted explicitly, so it renders the same everywhere.

## Languages

English is the source of truth and lives in the HTML, so the page reads
correctly even if JavaScript never runs. German lives in the `DE` dictionary at
the top of `assets/js/befree.js`.

- `data-i18n="key"` swaps `textContent`, `data-i18n-html="key"` swaps `innerHTML`
  (used where a line break matters).
- Order of precedence: `?lang=de` → remembered choice → browser language.
- **To change a German string,** edit the `DE` dictionary. **To change an English
  string,** edit the HTML — and only add a `DE` entry if the German should differ.

The legal pages stay German-only. That is the legally clean option for a business
operating in Austria.

## The flower gallery

`assets/js/flower.js` draws eight petals, each one a photograph, each with a
**depth map** that gives a flat photo real parallax: the foreground shifts
further than the back wall as you move the pointer or tilt the phone.

It stands down quietly — the whole section hides itself — when there is no
WebGL or the device reports under 2 GB of memory. Under
`prefers-reduced-motion` it draws one static, fully open frame. The plain
gallery below carries the same photographs either way, so nothing is lost.

three.js is vendored at `assets/vendor/three.module.min.js` (v0.169.0) rather
than loaded from a CDN, so the page has no third-party runtime dependency.

## Replacing the photos

Drop a new file over the old one, keep the name, done. Every slot falls back to
nothing gracefully, and the gallery labels live in `PHOTOS` in `befree.js`.

| Slot | Files | Size |
|---|---|---|
| Flower petals | `petal-1-capsule.jpg` … `petal-8-hangout.jpg` | 700 × 1130, portrait |
| Petal depth maps | `petal-N-*-depth.png` | 224 × 360, greyscale |
| Gallery | `gallery-01-room.jpg` … `gallery-12-evening.jpg` | 1400 × 1000, landscape |
| Room cards | `room-capsule.jpg` `room-private.jpg` | 1000 × 750 |

### Regenerating the depth maps

A petal photo needs a matching `-depth.png` or its parallax goes flat. The maps
here are **estimated** from image geometry and brightness — floor near, back
wall far, bright reads as far — deliberately kept low-frequency, because a
smooth depth map never smears the parallax.

For production, run a real monocular depth model (Depth Anything V2 or MiDaS)
over each petal photo, save the result greyscale at 224 × 360 with a light
blur, and drop it in under the same name. Nothing in the page changes.

## Elementor / WordPress

```bash
node scripts/build-befree.mjs                # photos from GitHub Pages
node scripts/build-befree.mjs --standalone   # photos embedded, needs no host
```

Both write into `befree-elementor/`; `--standalone` adds a `-standalone`
suffix so the two sets sit side by side.

| Variant | index | Photos |
|---|---|---|
| default | ~800 kB | load from the GitHub Pages URL |
| `--standalone` | ~4.3 MB | embedded as data URIs, no host needed |

**The logo is embedded in both.** It is the one image nobody forgives when it
breaks, so it never depends on a host being up. It is quantized to 256 colours
at 600px wide — 32 kB instead of the 503 kB original, which was five times
larger than anything the page ever displays.

The default variant only works once the photos are reachable, so it needs this
branch merged and GitHub Pages serving `befree/`. Until then, use
`--standalone` — or upload the contents of `befree/assets/img/` to the
WordPress media library and search-replace
`https://piaxoxo.github.io/Do-Step-Inn-Home/befree/assets/img/` with your
uploads folder.

Paste the file into a single **HTML widget** on a page set to the **Elementor
Canvas** layout (Page settings → Page Layout → Canvas), so the theme's own
header and footer step aside — the page brings its own fixed navigation and
full-height hero.

Legal links and the home link are rewritten to WordPress slugs
(`/impressum/`, `/datenschutz/`, `/agb/`, `/`), so create those pages and
every link resolves.

## Still open

- [ ] **A dorm photograph is missing.** The three room types follow the
      booking listings: private rooms (double, twin, triple, quad), lockable
      capsule beds, and classic open-bunk dorms. The first two are backed by
      photographs from the shoot; the classic dorm is not, so its card shows
      a striped brand panel rather than a picture of a different room type.
      Replace it with a real dorm photo before launch — the card picks up an
      `<img>` the moment one exists.
- [ ] **Other facts to confirm.** Prices, bed counts, exact quiet hours, what
      is included, and whether luggage storage exists.
- [x] **Booking engine.** The UP Hotel IBE runs with Be Free's own key,
      `75e0a485-…`, in **two** places: a gold search bar directly under the
      hero, and the Book band further down. Any element marked
      `data-ibe-host` joins in; the gate checks the key once and brings them
      all up together, so a keyless or misconfigured engine leaves no empty
      frames — just the mail/phone fallback. Both follow the page language:
      the widget reads `language` only when it initialises, so a switch swaps
      in a fresh `<ibe-up>` rather than editing an attribute nothing watches.
      On screens under 980px the nav's booking pill is hidden, so a floating
      button appears between the hero and the Book band. Never use another
      house's key — Do Step Inn Home's `35b41b51-…` would send guests to the
      wrong hotel.

      **The booking form is the floor, not a stand-in.** Both hosts carry a
      real form — check-in, check-out, guests — and it shows immediately, so
      the section is never an empty frame. The widget takes over only once the
      browser reports `<ibe-up>` as actually defined
      (`customElements.whenDefined`), which covers a missing key, a blocked
      script, an ad-blocker and a dead network with one path instead of four
      guesses. Submitting the form opens a mail with the dates filled in.

      **Not verified here:** `ibe.uphotel.agency` is blocked by this
      environment's egress proxy, so the rendered widget has never been seen —
      only the form it hands over from. Check both on a real host.
- [ ] **Legal pages — three facts still to confirm.** `impressum.html`,
      `datenschutz.html` and `agb.html` are written, in German only, adapted
      from the Do Step Inn Home pages: same operating company (Kern
      Beherbergungsbetriebs GmbH, UID, Firmenbuch, Geschäftsführung), Be Free's
      own establishment address and contact.

      The privacy policy was **not** copied wholesale — it describes what this
      site actually does. Google Maps is gone (Be Free embeds no map), and the
      language preference stored in `localStorage` is disclosed. Three
      processors could not be verified for Be Free and are marked in the page
      with a dashed red box: **hosting**, the **property-management system**
      (Do Step Inn Home uses apaleo) and the **check-in service** (Do Step Inn
      Home uses straiv). Fill those in and delete the boxes before publishing —
      a wrong processor named in a privacy policy is worse than none.

      Have the operator read all three before they go live.
- [ ] **Own repository.** This lives under `befree/` for now because creating
      `Piaxoxo/Be-Free-Hostel` was refused (`403`). Once it exists, this folder
      moves across unchanged.
- [ ] **Domain.** `befree-hostel.com` currently serves an unfilled
      "Travel Magazine" theme.
