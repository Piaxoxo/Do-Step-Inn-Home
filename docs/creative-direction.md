# Do Step Inn Home — Creative Direction (Phase 1)

> The research and creative direction that this homepage is built on.
> Property facts verified from the hotel's booking listings and independent
> reviews (the live site is a JS SPA behind bot protection).

## Ground truth
- **Do Step Inn Home — Hotel & Hostel.** Felberstraße 20, 1150 Vienna,
  **opposite Westbahnhof** (~4 min walk), one block off **Mariahilfer Straße**.
- Excellent transport: U3 + U6, national/regional trains, airport bus / CAT.
- **Hybrid product:** private rooms (single, double/twin, triple, quad — private
  bath, Sat-TV, WiFi) **and** dorms (private bath, linen, lockers).
  Tagline today: *"rooms for every budget."*
- Amenities: two guest kitchens, house bar, garden courtyard, billiards, darts,
  giant chess, bikes, vending, free WiFi, parking, access-card luggage room,
  buffet breakfast (surcharge).
- Access: check-in 15:00, check-out 11:00, **self / contactless check-in**,
  late arrival to midnight. Location score ~8.5.
- Honest weaknesses from reviews: "can lack atmosphere," dorms small, some
  hallway noise, "not dead-centre."

## Positioning
**Your calm home base in Vienna.** Signature: **Feel at home. Step into Vienna.**
Built on the name itself — *Do · Step · Inn* → take the step, step inn, you're home.
(We deliberately avoid the banned cliché "home away from home.")

Three pillars nobody currently dramatizes:
1. **Effortless arrival** — station-opposite + self check-in.
2. **Calm home base** — private-or-shared, your own quiet corner.
3. **Vienna at the doorstep** — the city, measured from your bed.

## Brand personality
Warm, grounded, quietly confident, effortless, generous, un-fussy — *a good
local friend with a spare room by the station.* Not luxury-stiff, not hostel-loud.
Emotional arc: **relief → calm → confidence → belonging.**

## Visual & motion identity
- **Palette:** espresso, cream, soft beige, muted gold, deep green, glass, deep
  soft shadow, **Vienna golden-hour light** — a "day arc" from evening arrival
  (dark) → morning rooms (light) → night home (dark).
- **Type:** Fraunces (emotional serif display) + Inter (clean UI sans).
- **Motion:** slow, weighty, cinematic — content *arrives* like a train easing
  into a station. Full `prefers-reduced-motion` path.
- **Voice:** warm, calm, direct, short sentences. "Drop your bag. Breathe."

## 3D concept — Vienna Glass Map (chosen)
A glowing golden-hour glass city with the hotel as the warm centre; nearby
landmarks glow, and the **Vienna Concierge's tips surface as floating pins on
the same map.** Chosen because it's the only concept that dramatizes the real
superpower (location) *and* doubles as the chatbot's canvas — 3D that is the
product, not decoration. Gated + static fallback for mobile/reduced-motion.

## Two chatbots
- **Vienna Concierge** — local city guide; general suggestions, avoids claiming
  live opening hours, routes prices/booking to the engine, gives emergency
  numbers, drops map pins.
- **Home Assistant** — hotel facts only; says *"Please contact the hotel team
  for confirmation"* for anything unconfirmed. Never invents policy.

## Homepage as an 8-chapter arrival journey
Arrival → Your Home Base → Rooms Made Simple → Vienna Concierge → Home Assistant
→ Explore Vienna → Easy Stay → Book Your Stay. Every piece of existing homepage
content is preserved and upgraded (see the content map in the Phase 1 brief).

## Required client assets (to finish)
Golden-hour photography (rooms, courtyard, kitchen, arrival/keycard); 2–3 short
ambient video loops; vector logo & brand fonts; **confirmed factual copy for all
hotel policies** (check-in, cancellation, breakfast, parking, pets, luggage,
WiFi, contact, emergency) to safely feed the Assistant; booking-engine
integration details.
