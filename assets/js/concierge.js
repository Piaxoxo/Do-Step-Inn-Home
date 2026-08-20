/* ═══════════════════════════════════════════════════════════════════════
   CONCIERGE ENGINE — two guardrailed minds
   · Vienna Concierge  → local city guide (general suggestions, map pins)
   · Home Assistant     → hotel facts only; never invents policy
   Rule-based & offline: honest by construction. No hallucinated data.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const CONTACT = "Please contact the hotel team for confirmation.";
  const BOOKING = 'For live prices, availability and booking, use <a href="#" data-open-booking>Check availability</a>.';

  /* ── Verified hotel facts (single source of truth for the Assistant) ── */
  const HOME = [
    { k: ["self check", "checkin", "check-in", "check in", "arrive", "key", "access"], a:
      "<strong>Self check-in</strong> keeps arrival stress-free. Check-in opens at <strong>15:00</strong> and you can arrive contactlessly — you’ll receive your access details for the door and your room. Late arrival is possible <strong>until midnight</strong>. If you’ll arrive after midnight, " + CONTACT.toLowerCase() },
    { k: ["late", "midnight", "after hours", "night arrival"], a:
      "Arriving late is fine — <strong>self check-in works up to midnight</strong>. You won’t need anyone at a desk. Arriving after midnight? " + CONTACT },
    { k: ["check-out", "checkout", "check out", "leave", "leaving"], a:
      "<strong>Check-out is 11:00</strong>, quick and contactless. Leaving later in the day? Drop your bags in our secure luggage room and keep exploring." },
    { k: ["luggage", "bag", "store", "storage", "suitcase"], a:
      "Yes — there’s a <strong>secure luggage room</strong> with card access, so you can store bags before check-in or after check-out and head straight into the city. (Bags stored long-term may need the access card renewed.)" },
    { k: ["wifi", "wi-fi", "internet", "wlan"], a:
      "<strong>Free WiFi</strong> is available throughout the building — rooms and common areas." },
    { k: ["breakfast", "morning", "food included", "buffet"], a:
      "A <strong>buffet breakfast</strong> is served every morning — no need to pre-book — available for a small surcharge. For the current price and times, " + CONTACT.toLowerCase() },
    { k: ["parking", "car", "garage", "park"], a:
      "There is <strong>parking available</strong> for guests. For spaces and current rates, " + CONTACT.toLowerCase() },
    { k: ["kitchen", "cook", "cooking"], a:
      "You’re welcome to cook — there’s a <strong>guest kitchen</strong>, great for saving your euros for the city." },
    { k: ["facilit", "amenit", "included", "what do you have", "games", "bar", "billiard", "bike", "bicycle"], a:
      "Your home base includes a <strong>guest kitchen</strong>, a garden courtyard, a small house bar, <strong>billiards, darts and giant chess</strong>, bikes to borrow, vending, free WiFi and a luggage room. Rooms have private bathrooms, linen and Sat-TV." },
    { k: ["room", "private", "dorm", "double", "single", "family", "bathroom"], a:
      "We’re a hotel <em>and</em> hostel — <strong>rooms for every budget</strong>. Private singles, doubles/twins, triples and quads (each with private bathroom, Sat-TV, WiFi), or a bed in a bright dorm with private bathroom, linen and a locker. " + BOOKING },
    { k: ["where", "address", "location", "how do i get", "get there", "directions", "from airport", "airport", "westbahnhof", "station", "transport", "u-bahn", "ubahn", "tram"], a:
      "We’re at <strong>Felberstraße 20, 1150 Vienna</strong>, directly <strong>opposite Westbahnhof</strong> (about a 4-minute walk) and one block from Mariahilfer Straße. From the airport, take the <strong>airport bus or CAT</strong> toward the city; U3 and U6 both serve Westbahnhof." },
    { k: ["price", "cost", "rate", "cheap", "how much", "available", "availability", "book", "reserve"], a:
      "Rooms suit every budget, from dorm beds to private rooms. " + BOOKING },
    { k: ["cancel", "cancellation", "refund", "policy", "house rules", "rules", "pet", "smoking"], a:
      "Cancellation terms and house rules depend on your rate and dates. Rather than guess, here’s the honest answer: <strong>" + CONTACT + "</strong> You’ll also see the exact terms during booking." },
    { k: ["contact", "phone", "email", "reception", "call", "reach"], a:
      "The hotel team is happy to help directly. You can reach reception during opening hours — for the current phone and email, please use the contact details on your booking confirmation, or " + CONTACT.toLowerCase() },
    { k: ["emergency", "help", "police", "ambulance", "fire", "doctor", "hospital"], a:
      "For any emergency in Austria, dial <strong>112</strong> (general emergency), <strong>133</strong> police, <strong>144</strong> ambulance, or <strong>122</strong> fire. For anything urgent at the hotel, contact the on-site team." },
  ];
  const HOME_FALLBACK =
    "I can help with check-in, luggage, WiFi, breakfast, parking, getting here and facilities. For anything I can’t confirm — like exact prices or specific policies — <strong>" + CONTACT + "</strong>";

  /* ── Vienna Concierge · general local suggestions (+ map pins) ──────── */
  const VIENNA = [
    { k: ["first day", "24 hour", "first 24", "one day", "itinerary", "plan my", "plan my first"], a:
      "Here’s a calm, walkable <strong>first day from your door</strong>:", pins: [
        "Morning · coffee + stroll along Mariahilfer Straße (1 block away)",
        "Midday · U3 to Stephansplatz — Stephansdom & the old town lanes",
        "Afternoon · Hofburg & the Ringstrasse, or Naschmarkt for a bite",
        "Evening · sunset at Belvedere gardens, dinner back near the hotel" ] },
    { k: ["rain", "rainy", "bad weather", "indoor", "when it rains"], a:
      "Perfect rainy-day ideas, mostly indoors:", pins: [
        "Kunsthistorisches Museum — world-class art, easy by U3",
        "Albertina — modern masters in the centre",
        "A grand Viennese café (Café Central, Sperl) — coffee & cake",
        "Naschmarkt’s covered stalls for a warm bite" ] },
    { k: ["free", "cheap", "no money", "budget", "without paying"], a:
      "Wonderful <strong>free</strong> things near you:", pins: [
        "Belvedere & Schönbrunn gardens — free to wander",
        "Stephansdom — free to step inside",
        "Stroll the Ringstrasse & Danube Canal art walls",
        "Window-shopping + people-watching on Mariahilfer Straße" ] },
    { k: ["coffee", "cafe", "café", "breakfast out", "espresso"], a:
      "Vienna runs on coffee. Nearby & classic:", pins: [
        "Cafés right along Mariahilfer Straße (1 block)",
        "Café Sperl — historic, elegant, ~10 min",
        "Café Central — grand and iconic, near Stephansplatz" ] },
    { k: ["romantic", "couple", "date", "evening", "sunset"], a:
      "A romantic Vienna evening:", pins: [
        "Sunset over the city from Belvedere gardens",
        "A cand-lit dinner in the old town lanes",
        "An evening classical concert (many near the centre)",
        "A slow walk along the illuminated Ringstrasse" ] },
    { k: ["solo", "alone", "by myself", "traveling alone"], a:
      "Great picks for solo travellers:", pins: [
        "MuseumsQuartier — art, courtyards, easy to linger",
        "Naschmarkt — browse & snack at your own pace",
        "Join a free walking tour from Stephansplatz",
        "Back home base: kitchen, courtyard & games to meet others" ] },
    { k: ["food", "eat", "restaurant", "dinner", "lunch", "schnitzel", "local"], a:
      "Local flavours to seek out:", pins: [
        "Wiener Schnitzel — a Viennese classic",
        "Naschmarkt — global stalls + Austrian bites (~10 min)",
        "A traditional Beisl (cosy tavern) in the old town",
        "Sachertorte with coffee at a grand café" ] },
    { k: ["museum", "art", "gallery", "history", "culture"], a:
      "Museums worth your time:", pins: [
        "Kunsthistorisches — old masters & antiquities",
        "Albertina — Monet to Picasso",
        "MuseumsQuartier — modern art complex",
        "Belvedere — Klimt’s ‘The Kiss’" ] },
    { k: ["nearby", "close", "around", "near the hotel", "walking distance", "near me"], a:
      "Right around your home base:", pins: [
        "Mariahilfer Straße shopping — 1 block",
        "Westbahnhof (U3/U6, trains, airport bus) — 4 min walk",
        "Schönbrunn Palace & gardens — ~8 min by U-Bahn",
        "Old town / Stephansdom — ~10 min by U3" ] },
    { k: ["stephansdom", "cathedral", "st stephen", "how do i get to"], a:
      "To <strong>Stephansdom</strong>: walk to Westbahnhof (4 min), take <strong>U3</strong> direction Simmering to Stephansplatz — about 10 minutes total. It’s free to step inside.", pins: [
        "Westbahnhof → U3 → Stephansplatz (~10 min)" ] },
    { k: ["schönbrunn", "schonbrunn", "palace", "garden"], a:
      "<strong>Schönbrunn Palace</strong> is delightfully close — U-Bahn from Westbahnhof, roughly 8 minutes. The gardens are free to wander.", pins: [
        "Westbahnhof → U-Bahn → Schönbrunn (~8 min)" ] },
    { k: ["open today", "opening hours", "hours today", "what is open"], a:
      "Opening hours change by day and season, so I won’t guess and risk sending you to a closed door. Check the venue’s official page for today’s hours — and your Vienna Concierge is happy to suggest <em>what</em> to see any time." },
    { k: ["shopping", "shop", "mall", "buy", "mariahilfer"], a:
      "You’re beside Vienna’s biggest shopping street:", pins: [
        "Mariahilfer Straße — 1 block from the hotel",
        "Ringstrassen-Galerien & centre boutiques by U3",
        "Naschmarkt for food & flea-market finds (weekends)" ] },
  ];
  const VIENNA_FALLBACK =
    "I’m your <strong>Vienna Concierge</strong> — ask me for a first-day plan, rainy-day ideas, free things, coffee & food, romantic or solo suggestions, or how to reach a landmark. What are you in the mood for?";

  const PROMPTS = {
    vienna: ["Plan my first day", "Rainy-day ideas", "Something nearby", "Best free things", "Romantic evening", "Local food tips", "Museums today"],
    home:   ["How does self check-in work?", "What time is check-in?", "Can I store luggage?", "How do I get there?", "What facilities are included?", "I arrive late — what now?"],
  };
  const GREETING = {
    vienna: "Hallo! I’m your <strong>Vienna Concierge</strong> — your local guide in your pocket. Tell me how you like to travel and I’ll map out the city for you. 🗺️",
    home:   "Welcome home. I’m the <strong>Home Assistant</strong> — ask me anything about your stay: check-in, luggage, getting here, what’s included. I only share confirmed details, and point you to the team for anything I can’t. 🏠",
  };
  const DISCLAIMER = {
    vienna: "General suggestions only · opening hours & prices change — always confirm before you go.",
    home:   "Confirmed hotel info only · for anything unlisted, we’ll point you to the hotel team.",
  };

  function normalize(s) { return (" " + s.toLowerCase() + " ").replace(/[^a-z0-9äöüß\s-]/g, " "); }

  function score(text, keys) {
    const t = normalize(text);
    let hits = 0;
    for (const k of keys) if (t.includes(k)) hits += k.length;   // longer phrase = stronger match
    return hits;
  }

  function answer(mode, text) {
    const kb = mode === "vienna" ? VIENNA : HOME;
    let best = null, bestScore = 0;
    for (const item of kb) {
      const s = score(text, item.k);
      if (s > bestScore) { bestScore = s; best = item; }
    }
    if (best && bestScore > 0) return { html: best.a, pins: best.pins || null };
    return { html: mode === "vienna" ? VIENNA_FALLBACK : HOME_FALLBACK, pins: null };
  }

  window.Concierge = { answer, PROMPTS, GREETING, DISCLAIMER };
})();
