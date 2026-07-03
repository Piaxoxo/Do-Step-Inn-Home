# Do Step Inn Home — a breathtaking Vienna hotel experience

> **Feel at home. Step into Vienna.**
> A cinematic, premium homepage for Do Step Inn Home — a calm, well-connected
> home base opposite Westbahnhof, one block from Mariahilfer Straße.

This is **Phase 2**: the new homepage, built as a fast, self-contained static
site (no build step). The full research & creative direction lives in
[`docs/creative-direction.md`](docs/creative-direction.md).

## What's inside

| Chapter | Section | Highlight |
|---|---|---|
| I | Arrival | Cinematic **Vienna Glass Map** 3D hero (Three.js) |
| II | Your home base | Calm, warm alternative to a party hostel |
| III | Rooms made simple | Choose by *how you travel* (solo/couple/friends/family/value) |
| IV & V | Two guides | **Vienna Concierge** + **Home Assistant** chatbots |
| VI | Explore Vienna | Live "from your door" distances |
| VII | Easy stay | Self check-in, luggage, late arrival |
| VIII | Book your stay | Warm, native booking CTA |

## The two concierges

- **Vienna Concierge** — a local city guide. First-day plans, rainy-day ideas,
  free things, food & coffee, romantic/solo suggestions. Recommendations land
  as glowing **pins on the 3D map**.
- **Home Assistant** — hotel facts only. Check-in, luggage, WiFi, breakfast,
  getting here. **Never invents policy** — anything unconfirmed routes to
  *"Please contact the hotel team for confirmation."*

Both are rule-based and run fully offline (no API key, no external calls),
which makes them honest by construction and instantly fast.

## Run it

It's a static site — just serve the folder:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

No install, no build. The 3D hero loads Three.js from a CDN via an import map
and **degrades gracefully** to a static golden-hour hero if WebGL or the CDN
is unavailable.

## Design & engineering notes

- **Palette:** warm espresso, cream, muted gold, deep Vienna green — a
  golden-hour "day arc" (evening arrival → morning rooms → night home).
- **Performance:** static hero paints first; the 3D scene is **gated**
  (skipped on mobile, low-power and reduced-motion) and lazy-initialised so it
  never blocks the booking CTA. Tab-hidden pauses the render loop.
- **Accessibility:** skip link, full keyboard paths, focus-visible states,
  `prefers-reduced-motion` route (static hero, no animation), semantic
  landmarks, AA-contrast on the warm palette, ARIA-labelled chat.
- **SEO:** real server-side content in the DOM (unlike the current SPA),
  `LodgingBusiness` JSON-LD, descriptive headings, Open Graph.

## Not yet wired (Phase 3)

- Real booking-engine URL (the search form is a styled placeholder).
- Real photography & ambient video loops (currently crafted CSS/gradient art).
- Live hotel contact details & confirmed policy copy for the Assistant.
- Optional live data for Vienna opening hours.

See the creative direction doc for the full asset list and roadmap.
