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
| Book bar | Gold band under the hero — the UP Hotel search mask, the one on the page |
| Location | Turquoise band — the neighbourhood, four markers, distances as stickers |
| Check-in | Pink band — no reception, the three steps, the phone number, and the walk to Felberstraße |
| Rooms | Private room · Capsule bed · Classic dorm, as pastel cards |
| Book (rooms) | Strip closing the rooms section, pointing up to the search mask |
| Why Be Free | Freedom, together, clean, colour |
| Gallery | Scroll parallax: two columns drift at their own speed, click to enlarge, keyboard-navigable lightbox |
| Groups | Green band — group quotes, breakfast bookable at Felberstraße 20, route |
| Good to know | Violet band — quiet hours, bathrooms, kitchen, no front desk |
| Book | Pink band — closing call to action, pointing up to the search mask |
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
- English is learned off the page, **once per key**, the first time that
  element is seen. Two things follow from splitting the site across a theme:
  `header.html` and `footer.html` translate themselves before `befree.js`
  exists, so they stash the English they overwrite in `data-en` /
  `data-en-html`, and that copy wins over what is on screen; and the footer is
  parsed *after* the content script runs, so the page is read a second time on
  `DOMContentLoaded` — additively, because by then the rest of the page may
  already be showing German.
- Order of precedence: `?lang=de` → remembered choice → browser language.
- **To change a German string,** edit the `DE` dictionary. **To change an English
  string,** edit the HTML — and only add a `DE` entry if the German should differ.

The legal pages stay German-only. That is the legally clean option for a business
operating in Austria.

## The gallery

`assets/js/befree.js` lays the twelve photographs out in two columns and moves
them as you scroll: every card has its own speed, and inside each frame the
photograph shifts a little against the frame itself. That is where the depth
comes from — two planes moving at different rates, not a 3D scene.

The picture stays a picture. Nothing is rotated, masked or cut into a shape;
at the extremes about 4% of the height sits outside the frame, and a click
opens the full, uncropped image in the lightbox.

Only cards the viewport can actually see are moved (an `IntersectionObserver`
keeps that list), and all of them are placed in one `requestAnimationFrame`.
Under `prefers-reduced-motion` nothing moves at all: the section is then a
plain grid of large photographs, which loses no information. The page has no
third-party runtime dependency and no WebGL requirement.

## Replacing the photos

Drop a new file over the old one, keep the name, done. Every slot falls back to
nothing gracefully, and the gallery labels live in `PHOTOS` in `befree.js`.

| Slot | Files | Size |
|---|---|---|
| Gallery | `gallery-01-room.jpg` … `gallery-12-evening.jpg` | 1400 × 1000, landscape |
| Room cards | `room-capsule.jpg` `room-private.jpg` | 1000 × 750 |

## Elementor / WordPress

```bash
node scripts/build-befree.mjs                # photos from the CDN
node scripts/build-befree.mjs --standalone   # photos embedded, needs no host
node scripts/build-befree.mjs --embed        # no navigation, no footer
node scripts/build-befree.mjs --embed --standalone
```

All of them write into `befree-elementor/`; each flag adds its own suffix, so
the sets sit side by side.

| Variant | index | Photos |
|---|---|---|
| default | ~125 kB | load from jsDelivr, pinned to a commit |
| `--standalone` | ~2.6 MB | embedded as data URIs, no host needed |
| `--embed` | ~78 kB | content only — header and footer ship beside it |
| `--embed --standalone` | ~2.5 MB | both at once |

**The photos do not come from GitHub Pages.** Pages on this repo serves its
default branch, `claude/do-step-inn-home-eiit7m`, which does not contain
`befree/` — so every photo 404s from there until this work is merged. The
default build therefore points at jsDelivr, which serves any public repo at
`/gh/<owner>/<repo>@<ref>/<path>` with no Pages involved.

The ref is the commit that last touched `befree/assets/img/`, read from git at
build time. A commit rather than a branch, for two reasons: a branch name
containing `/` breaks the URL, and a commit is immutable, so the CDN can cache
it forever. Change the photos, commit, push, rebuild — the SHA follows on its
own, and the build warns if that commit is not pushed yet.

**The logo is embedded in both.** It is the one image nobody forgives when it
breaks, so it never depends on a host being up. It is quantized to 256 colours
at 600px wide — 32 kB instead of the 503 kB original, which was five times
larger than anything the page ever displays.

### Pointing the photos somewhere else

The default build opens with one switch, near the top of the file:

```js
window.BEFREE_IMG = "";   // e.g. "https://your-domain.at/wp-content/uploads/befree/"
```

Set it and every photo follows — the static `src` attributes are rewritten on
load, and the scripts read the same base. Leave it empty and the built-in
addresses are used. The logo stays embedded either way.

`befree-elementor/befree-bilder.zip` holds all 15 files ready to upload.

Or use `--standalone`, which depends on nothing at all.

Paste the file into a single **HTML widget** on a page set to the **Elementor
Canvas** layout (Page settings → Page Layout → Canvas), so the theme's own
header and footer step aside — the page brings its own fixed navigation and
full-height hero.

### Split across a theme's own templates

`--embed` is for the other case: WordPress keeps drawing a header and a
footer, and the site is delivered in pieces instead of one file.

| File | Goes where |
|---|---|
| `header.html` | the theme's header template, or an HTML widget at the top of every page |
| `index-content.html` | an HTML widget on an ordinary page — the start page |
| `footer.html` | the theme's footer template, or an HTML widget at the bottom |
| `impressum-content.html` `datenschutz-content.html` `agb-content.html` | one HTML widget each, on pages with those slugs |

`--standalone` combines with it and adds a `-standalone` suffix to the
content files (the partials carry no photographs, so they are written once).

Every piece stands on its own: each carries the stylesheet, and the header
and footer each carry a small translator, because they also appear on the
legal pages where `befree.js` never runs. The German strings for those two
are **read out of `befree.js` at build time** — only the keys their own
markup uses — so the partials cannot drift away from the site.

Three things follow from the split, and the build takes care of all three:

- **Full width.** A themed page boxes its content, which would leave the
  colour bands short of the screen edge. The content opens with
  `.befree-full{ margin-left:calc(50% - 50vw); … }` — deliberately not
  `width:100vw`, which counts the scrollbar and produces the very sideways
  scrolling it is meant to prevent.
- **Room for the header.** The content opens with `:root{ --nav-h: 74px; }` —
  our own header is fixed and 74px tall. Using only the theme's header
  instead: `0px` if it scrolls away, its height if it stays.
- **Links that work from any page.** The header's anchors get the home slug
  in front of them (`/#rooms`), so the menu works from the legal pages too.

The language switch in the header stores the choice and reloads — except on
the start page, where `befree.js` is present and switches everything live,
which the switch detects and leaves alone. The burger is bound once: the
header marks it, and `befree.js` skips a control that is already bound.

## Still open

- [ ] **A dorm photograph would finish the rooms row.** The three types follow
      the booking listings: private rooms (double, twin, triple, quad),
      lockable capsule beds, and classic open-bunk dorms. The first two carry
      photographs from the shoot; there is no open-bunk dorm in it. Rather
      than illustrate it with a different room type — the mistake that card
      carried once — it reads as a plain colour card beside two photo cards.
      Nothing about it looks unfinished, and adding an `<img>` at the marked
      spot in `index.html` turns it into a third photo card.
- [ ] **Other facts to confirm.** Prices, bed counts, exact quiet hours, what
      is included, and whether luggage storage exists.
- [x] **Booking engine.** The UP Hotel IBE runs with Be Free's own key,
      `75e0a485-…`, in **three** places: a gold search bar directly under the
      hero, a strip closing the rooms section, and the Book band further down. Any element marked
      `data-ibe-host` joins in; the gate checks the key once and brings them
      all up together, so a keyless or misconfigured engine leaves no empty
      frames — just the mail/phone fallback. Both follow the page language:
      the widget reads `language` only when it initialises, so a switch swaps
      in a fresh `<ibe-up>` rather than editing an attribute nothing watches.
      On screens under 980px the nav's booking pill is hidden, so a floating
      button appears between the hero and the Book band. Never use another
      house's key — Do Step Inn Home's `35b41b51-…` would send guests to the
      wrong hotel.

      **The engine is in the page, visible, from the start** — with no
      JavaScript too. It used to be hidden until the page approved it, which
      was wrong twice over: an embed inside `display:none` can neither draw
      nor measure itself, and the approval hung on `<ibe-up>` being
      registered as a custom element, which an embed that simply scans the
      DOM and drops in an iframe never does. Then the box stayed hidden and
      only the mail form ever showed.

      **The engine is the only way to book a bed.** There is no mail form
      beside it: the three spots carry the widget and nothing else. Mail is
      offered in exactly one place, group bookings, where a quote has to be
      written by hand anyway, plus the contact section at the end.

      **One search mask, in the gold bar under the hero.** UP Hotel's embed
      initialises the element it finds when it loads, and on this property it
      fills exactly one per page — three masks were tried, in the page and
      each in its own `srcdoc` frame, and only the first ever came up. So the
      page carries one, where intent is highest, and the two spots below it
      send guests there: the strip closing the rooms, and the Book band.
      Every *Book now* on the page — nav, hero, the floating button — points
      at `#bookbar` for the same reason. `language` is set on the element
      before the engine loads, so a German visitor gets a German mask.

      Where even that one renders nothing — the engine unreachable, not busy
      — the bar shows a single line with the phone number and the address,
      and a spot that stays empty is first given its own document (an
      `iframe` written with `srcdoc`, carrying UP Hotel's snippet and nothing
      else) before it gives up.

      **Two CSS traps cost the widget its width.** A custom element the
      browser does not know is an *inline* box, so whatever the engine
      renders shrink-wraps: `.ibe ibe-up{display:block;width:100%}`. And the
      Book band lays its children out with `align-items:flex-start`, which
      sizes them to their content — `.bookband` opts out with `align-self:
      stretch`. Where the engine actually took over, the host is marked
      `.is-engine` and gets the full width, the gold bar dropping to a single
      column; our own compact form was drawn for that narrow column and keeps
      it.

      A language switch swaps in a fresh `<ibe-up>`, because that is what
      makes the engine re-read `language` — but only when it really is a
      custom element. An engine that scanned the page once would leave the
      replacement empty, so that box is left as it stands.

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
      language preference stored in `localStorage` is disclosed.

      Three processors could not be verified for Be Free, so the policy names
      **categories** rather than companies — which Art. 13(1)(e) GDPR permits,
      and which beats naming the wrong company: **hosting**, the
      **property-management system** (Do Step Inn Home uses apaleo) and the
      **check-in service** (Do Step Inn Home uses straiv). Confirm all three
      and name them; the sentences are written so a company name drops
      straight in.

      Have the operator read all three pages before they go live.
- [ ] **Own repository.** This lives under `befree/` for now because creating
      `Piaxoxo/Be-Free-Hostel` was refused (`403`). Once it exists, this folder
      moves across unchanged.
- [ ] **Domain.** `befree-hostel.com` currently serves an unfilled
      "Travel Magazine" theme.
