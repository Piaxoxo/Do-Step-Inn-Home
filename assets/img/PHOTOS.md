# Photos — drop your real images here

The homepage is already wired to use real photography. Each slot **falls back
to a warm gradient** if the file is missing, so nothing ever looks broken —
the moment you add a correctly-named file, it appears on the live site.

Upload JPGs with **exactly these names** into this folder (`assets/img/`):

| Filename | Where it shows | Best photo to use |
|---|---|---|
| `hero.jpg` | Homepage hero background (mobile + reduced-motion; faint behind the 3D on desktop) | A wide, atmospheric room shot — e.g. the cozy reading-by-window one |
| `room-single.jpg` | Rooms → **Solo** tab | Woman in pink sweater by the window (private room) |
| `room-double.jpg` | Rooms → **Couple** tab | The couple arriving with luggage at the door |
| `room-friends.jpg` | Rooms → **Friends** tab | The dorm pillow-fight / group shot |
| `room-family.jpg` | Rooms → **Family** tab | A calm private room (reading-in-chair works well) |
| `room-dorm.jpg` | Rooms → **Best value** tab | Smiling guest on the bunk bed |
| `room-cozy.jpg` | Chapter II “Your home base” feature card (green scrim over it) | The moody reading-by-window shot |
| `bar.jpg` | Chapter II “House bar & coffee” card (dark scrim over it) | The bartender at the bar, or a coffee/drink pour |
| `coffee.jpg` | *(optional, spare)* good alternative for `hero.jpg` | The close-up coffee/espresso pour |

Fewer photos than slots? Reuse freely — e.g. use the same file for `hero.jpg`
and `room-cozy.jpg`.

## How to upload (no tools needed)
1. Go to **https://github.com/Piaxoxo/Do-Step-Inn-Home** and make sure the
   branch selector shows `claude/do-step-inn-home-eiit7m`.
2. Open the `assets/img` folder → **Add file → Upload files**.
3. Drag your renamed photos in → **Commit changes** (to this branch).
4. GitHub Pages redeploys automatically; the photos go live in ~1 minute.

## Image tips
- Landscape/wide crops work best for `hero.jpg`; the room tabs accept any ratio
  (they’re cropped to fill).
- Aim for ~1600px on the long edge and compress to keep each file under ~400 KB
  for fast loading.
