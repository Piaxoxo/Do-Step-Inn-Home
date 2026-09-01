/* ═══════════════════════════════════════════════════════════════════
   Be Free Hostel — language switch, hero flowers, gallery, lightbox.
   No dependencies. The 3D flower lives in flower.js and is optional.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var RM = window.matchMedia &&
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══ 1. LANGUAGE ═════════════════════════════════════════════════
     English is the source of truth: every English string lives in the
     HTML, so the page reads correctly even if this script never runs.
     Only the German strings are carried here.                        */

  var DE = {
    "skip": "Zum Inhalt springen",

    "nav.rooms": "Zimmer", "nav.location": "Lage", "nav.checkin": "Check-in",
    "nav.gallery": "Galerie", "nav.groups": "Gruppen",
    "nav.rules": "Gut zu wissen", "nav.contact": "Kontakt",
    "nav.menu": "Menü",

    "cta.book": "Jetzt buchen", "cta.rooms": "Zimmer ansehen", "cta.ask": "Frage stellen",

    "hero.l1": "Be Free.", "hero.l2": "Be You.", "hero.l3": "Be Here.",
    "hero.sub": "Das Be Free Hostel Wien ist eine bunte, leistbare Bleibe nahe dem Westbahnhof — entspannt, flexibel und mitten in der Stadt. Mit unkompliziertem Self-Check-in, zentraler Lage und lebendiger Atmosphäre ist es die perfekte Basis, um Wien auf deine Art zu entdecken und dabei Leute aus aller Welt zu treffen.",

    "tag.selfcheckin": "Self-Check-in", "tag.noreception": "Keine Rezeption",
    "tag.from15": "Ab 15:00", "tag.wifi": "WLAN gratis",

    "loc.eyebrow": "Top-Lage",
    "loc.h": "Wien beginnt<br />vor der Tür",
    "loc.p1": "In der Beingasse 13 liegt das Be Free Hostel in einem der bestangebundenen Grätzl der Stadt. Von hier kommst du mühelos zu Kultur, Einkaufsstraßen, Lokalen, Nachtleben und dem ganz normalen Wiener Alltag — flexibel und unabhängig.",
    "loc.p2": "Ob Städtetrip, Rucksackreise oder längerer Aufenthalt: Von hier aus erlebst du Wien mit Energie, kurzen Wegen und Freiheit. Ein kluger Ausgangspunkt für alle, die nah am Geschehen bleiben und die Stadt auf eigene Faust erkunden wollen.",
    "loc.m1t": "Beingasse 13",
    "loc.m1d": "Ecke Goldschlagstraße, 1150 Wien — der 15. Bezirk, Rudolfsheim-Fünfhaus.",
    "loc.m2t": "Zentral in Wien",
    "loc.m2d": "Westbahnhof und die Mariahilfer Straße, die lange Einkaufsstraße der Stadt, sind zu Fuß erreichbar.",
    "loc.m3t": "Gute Verbindungen",
    "loc.m3d": "300 m zur U3 Schweglerstraße, 200 m zur Bushaltestelle Beingasse, Straßenbahn direkt zum Hauptbahnhof.",
    "loc.m4t": "Wiener Stadthalle",
    "loc.m4d": "Wiens größte Konzert- und Veranstaltungshalle liegt sechs Gehminuten entfernt.",
    "loc.s1": "300 m zur U3", "loc.s2": "200 m zum Bus",
    "loc.s3": "6 Min zur Stadthalle", "loc.s4": "Westbahnhof zu Fuß",

    "bk.in": "Anreise", "bk.out": "Abreise", "bk.pax": "Gäste",
    "bk.go": "Verfügbarkeit prüfen",

    "bar.k": "Heute Nacht frei?",
    "bar.h": "Finde dein Bett.",
    "bar.p": "Termin wählen und sehen, was frei ist — Zahlung online, Schlüssel aufs Handy.",
    "bar.rooms": "Ein Zimmer gefunden? Dann wähl deinen Termin.",

    "chk.eyebrow": "So kommst du rein",
    "chk.h": "Ein Self-Service-Haus.<br />Es gibt keine Rezeption.",
    "chk.lede": "Alles passiert vor deiner Ankunft, damit bei der Ankunft nichts mehr passieren muss. Um Mitternacht da sein und einfach reingehen — niemand wartet an einem Tresen, und niemand muss es.",
    "chk.s1t": "Online buchen",
    "chk.s1d": "Zahlung und Meldung laufen digital. Nichts zum Ausdrucken, nichts an einem Tresen zu unterschreiben.",
    "chk.s2t": "Dein Check-in-Link kommt",
    "chk.s2d": "Per E-Mail, wenn du direkt bei uns gebucht hast. Über Booking.com oder ein anderes Portal gebucht? Dann kommt er im Nachrichten-Chat des Portals — schau dort nach, nicht im Posteingang.",
    "chk.s3t": "Dein QR-Code öffnet die Tür",
    "chk.s3d": "Check-in abschließen, und der Code landet auf deinem Handy. Er öffnet Haustür und Zimmer — ab 15:00, zu jeder Uhrzeit. Keine Rezeption, keine Wartezeit, keine Sperrstunde.",
    "chk.helpt": "Probleme mit dem QR-Code oder dem Check-in?",
    "chk.helph": "Ruf an. Es hebt immer jemand ab.",
    "chk.helpd": "Eine Tür, die nicht aufgeht, ist das Schlimmste auf jeder Reise. Deshalb sagen wir es deutlich: Wenn dein Code streikt oder der Check-in nicht durchgeht, ruf diese Nummer an, und wir bringen das in Ordnung.",
    "chk.facet": "Lieber ein echtes Gesicht?",
    "chk.faceh": "Unsere Rezeption ist drei Minuten entfernt.",
    "chk.faced": "Wir können leider nicht immer in die Beingasse rüberkommen — aber die Rezeption in unserem Schwesterhaus ist drei Gehminuten entfernt. Komm vorbei, wann immer dir ein Mensch lieber ist als ein Bildschirm.",
    "chk.faceb": "Route anzeigen",

    "room.eyebrow": "Zimmer",
    "room.h": "Schlaf, wie es dir passt",
    "room.lede": "Drei Arten zu schlafen: hinter der eigenen Tür, hinter dem eigenen Schloss oder ganz offen mit allen anderen. Alles frisch renoviert, die Bäder werden im ganzen Haus geteilt, Bettwäsche ist inklusive.",
    "room.c1t": "Privatzimmer",
    "room.c1d": "Doppel, Twin, Dreibett oder Vierbett. Ein breites Bett auf massivem Holzpodest, ein Fenster zur Straße, ein Graffiti-Mural an der Wand — und eine Tür, die hinter dir zugeht.",
    "room.c1m": "2 bis 4 Personen · Eigene Tür",
    "room.c2t": "Capsule-Bett",
    "room.c2d": "Ein Bett im geteilten Zimmer, das sich absperren lässt. Eigenes Licht, eigene Steckdose, eine Tür, die du zuziehst. Die ruhige, private Art, zum Dorm-Preis zu schlafen.",
    "room.c2m": "Absperrbar · Eigenes Licht · Eigene Steckdose",
    "room.c3t": "Klassisches Dorm",
    "room.c3d": "Offene Stockbetten im geteilten Zimmer, Spinde für deine Sachen und der günstigste Preis im Haus. Der einfachste Weg, die Leute zu treffen, mit denen du am Ende durch die Stadt ziehst.",
    "room.c3m": "Stockbetten · Spinde · Bester Preis",

    "why.eyebrow": "Warum Be Free",
    "why.h": "Unkompliziert, gesellig, bunt.",
    "why.lede": "Be Free ist für Reisende gemacht, die Freiheit wollen, eine starke Lage und einen Aufenthalt, der sich vom ersten Moment an modern, offen und mühelos anfühlt.",
    "why.c1k": "Freiheit", "why.c1t": "Niemand fragt, wann du kommst",
    "why.c1d": "Keine Rezeptionszeiten, keine Sperrstunde, kein Schlüssel zum Abgeben. Das Haus richtet sich nach deinem Zeitplan, nicht nach unserem.",
    "why.c2k": "Gemeinsam", "why.c2t": "Eine Küche, die nachts offen ist",
    "why.c2d": "Das Erdgeschoss gehört allen, rund um die Uhr — Gästeküche und Aufenthaltsraum, wo Ausflüge geplant werden und Leute sich treffen.",
    "why.c3k": "Sauber", "why.c3t": "Frisch renoviert, ehrlich geführt",
    "why.c3d": "Was Gäste in Bewertungen am häufigsten erwähnen, ist die Sauberkeit. Das wollen wir uns lieber weiter verdienen, als etwas Feineres zu versprechen.",
    "why.c4k": "Farbe", "why.c4t": "Keine beige Schachtel",
    "why.c4d": "Gelbe Wände, Graffiti-Murals direkt auf den Putz gemalt, Ziegel und warmes Holz. Hier drin ist nichts beige, und keine zwei Zimmer sehen gleich aus.",

    "bl.k1": "Galerie · nach unten scrollen",
    "bl.h1": "Das Haus, aufgeblüht.",
    "bl.p1": "Jedes Blütenblatt ist ein Foto. Scroll, und die Knospe öffnet sich — die Kapsel-Pods, ein Zimmer mit seinem Mural, der Aufenthaltsraum, die Gänge. Es sieht aus wie unser Logo, weil es unser Logo ist.",
    "bl.k2": "Beweg die Maus",
    "bl.h2": "Die Zimmer haben Tiefe.",
    "bl.p2": "Fahr über die Blume oder kipp dein Handy. Der Vordergrund wandert weiter als die Rückwand — so wird aus einem flachen Foto ein Raum, in den du dich hineinlehnst.",
    "bl.k3": "Und darunter",
    "bl.h3": "Oder schau dir einfach die Bilder an.",
    "bl.p3": "Niemand bucht ein Bett aus einer Blume heraus. Die normale Galerie steht direkt darunter — Raster, große Bilder, ein Klick zum Vergrößern.",

    "gal.eyebrow": "Drinnen bei Be Free",
    "gal.h": "Die Farben von Be Free",
    "gal.lede": "Ein Blick auf Atmosphäre, Zimmer und Lebensgefühl im Be Free Hostel Wien — bunt, gesellig und für moderne Reisende gemacht.",

    "rul.eyebrow": "Gut zu wissen",
    "rul.h": "Das Ehrliche",
    "rul.lede": "Besser hier gelesen als um zwei Uhr nachts entdeckt. Das ist ein echtes Hostel in einem echten Altbau — und das heißt Folgendes.",
    "rul.c1k": "Ruhezeiten", "rul.c1t": "Es ist ein Altbau",
    "rul.c1d": "Im Stiegenhaus trägt der Schall, die Küche hallt. Ruhezeiten werden eingehalten — und wer leicht aufwacht, nimmt ein Capsule-Bett, die ruhigste Variante im Haus.",
    "rul.c2k": "Bäder", "rul.c2t": "Duschen und WCs werden geteilt",
    "rul.c2d": "Auf jedem Stock, täglich gereinigt. Es gibt im ganzen Haus keine eigenen Bäder — auch deshalb bleibt der Preis, wo er ist.",
    "rul.c3k": "Küche", "rul.c3t": "Koch, wann du willst",
    "rul.c3d": "Die Gästeküche im Erdgeschoss ist rund um die Uhr offen. Bitte selbst abwaschen und beschriften, was im Kühlschrank bleibt.",
    "rul.c4k": "Zeiten", "rul.c4t": "Check-in ab 15:00",
    "rul.c4d": "Danach kannst du jederzeit ankommen, Tag oder Nacht. Sprich uns wegen des Gepäcks an, wenn du früher da bist oder später abreist.",
    "rul.c5k": "Self-Service", "rul.c5t": "Es gibt keine Rezeption",
    "rul.c5d": "Niemand sitzt in einer Lobby und wartet auf dich. Genau das ist der Sinn des Hauses — aber ans Telefon geht immer jemand, du bist nie allein.",
    "rul.c6k": "Gruppen", "rul.c6t": "Schulklassen und Teams willkommen",
    "rul.c6d": "Schreib uns Termin und Personenzahl, dann stellen wir ein Angebot für die ganze Gruppe zusammen.",

    "grp.eyebrow": "Gruppen",
    "grp.h": "Gruppenreservierung —<br />mit Frühstück.",
    "grp.lede": "Schulklassen, Teams, Chöre, Vereine. Sag uns Termin und Personenzahl, und wir stellen ein Angebot für die ganze Gruppe zusammen.",
    "grp.c1k": "Frühstück", "grp.c1t": "Serviert in der Felberstraße 20",
    "grp.c1d": "Gruppen frühstücken in unserem Schwesterhaus Do Step Inn Home — drei Gehminuten von der Haustür. Schlafen bei Be Free, essen ums Eck.",
    "grp.c2k": "Ein Ansprechpartner", "grp.c2t": "Ein Angebot, eine Rechnung",
    "grp.c2d": "Betten, Frühstück und Zusatzleistungen kommen auf einem Angebot, damit niemand einzelnen Buchungen hinterherlaufen muss.",
    "grp.c3k": "Sag uns", "grp.c3t": "Was wir wissen müssen",
    "grp.c3d": "Termin, Personenzahl, gewünschte Zimmeraufteilung und ob Frühstück für alle sein soll. Mehr brauchen wir für den Preis nicht.",
    "grp.s1": "Frühstück Felberstraße 20", "grp.s2": "3 Gehminuten", "grp.s3": "Ein Angebot für alle",
    "grp.cta": "Gruppenanfrage senden", "grp.route": "Route zur Felberstraße 20",

    "bk.eyebrow": "Aufenthalt buchen",
    "bk.h": "Be Free. Be You.<br />Be Here.",
    "bk.lede": "Termin wählen, online zahlen, und dein Schlüssel kommt aufs Handy. Mehr ist es nicht.",
    "bk.note": "Die Live-Buchungsstrecke hängt noch nicht dran — bis dahin schreib oder ruf uns an, dann bestätigen wir dein Bett persönlich.",

    "ct.eyebrow": "Kontakt",
    "ct.h": "Schreib uns.",
    "ct.lede": "Fragen, Buchungen oder sonst etwas? Melde dich direkt, wir helfen schnell und unkompliziert.",
    "ct.c1t": "E-Mail schreiben", "ct.c1b": "E-Mail öffnen",
    "ct.c2t": "Anrufen", "ct.c2b": "Jetzt anrufen",

    "ft.claim": "Bleib frei. Triff Leute. Sammle Erinnerungen.",
    "ft.claimshort": "Be Free. Be You. Be Here.",
    "ft.house": "Das Haus", "ft.reach": "Kontakt",
    "ft.visit": "Auf der Seite", "ft.legal": "Rechtliches", "ft.country": "Österreich",

    "lb.prev": "← Zurück", "lb.next": "Weiter →", "lb.close": "Schließen",
    "gal.enlarge": "größer ansehen"
  };

  var EN_FALLBACK = { "gal.enlarge": "enlarge" };
  var EN = null;          /* filled from the DOM on first run */
  var lang = "en";

  function harvestEnglish() {
    EN = {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      EN[el.getAttribute("data-i18n")] = el.textContent;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      EN[el.getAttribute("data-i18n-html")] = el.innerHTML;
    });
    Object.keys(EN_FALLBACK).forEach(function (k) { EN[k] = EN_FALLBACK[k]; });
  }

  function t(key) {
    if (lang === "de" && DE[key] != null) return DE[key];
    return EN && EN[key] != null ? EN[key] : "";
  }

  function setLang(next, remember) {
    lang = next === "de" ? "de" : "en";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n-html"));
      if (v) el.innerHTML = v;
    });

    var en = document.getElementById("lang-en"), de = document.getElementById("lang-de");
    if (en) en.setAttribute("aria-pressed", String(lang === "en"));
    if (de) de.setAttribute("aria-pressed", String(lang === "de"));

    relabelGallery();
    syncWidgetLanguage();
    if (lightbox.isOpen()) lightbox.refresh();

    if (remember) { try { localStorage.setItem("befree-lang", lang); } catch (e) {} }
  }

  /* ═══ 2. GALLERY DATA ═════════════════════════════════════════════ */

  var PHOTOS = [
    { f: "gallery-01-room",     en: "A room with a mural",   de: "Zimmer mit Mural",        tEn: "Sleep",   tDe: "Schlafen" },
    { f: "gallery-02-capsule",  en: "Capsule beds",          de: "Kapsel-Betten",           tEn: "Capsule", tDe: "Kapsel" },
    { f: "gallery-03-foosball", en: "Foosball in the lounge",de: "Wuzzeln im Aufenthalt",   tEn: "Play",    tDe: "Spielen" },
    { f: "gallery-04-arrival",  en: "Finding your room",     de: "Das Zimmer finden",       tEn: "Check-in",tDe: "Check-in" },
    { f: "gallery-05-hangout",  en: "An evening in",         de: "Abend im Zimmer",         tEn: "Hang out",tDe: "Chillen" },
    { f: "gallery-06-bathroom", en: "Shared bathrooms",      de: "Gemeinschaftsbäder",      tEn: "Wash",    tDe: "Waschen" },
    { f: "gallery-07-lounge",   en: "The common room",       de: "Der Aufenthaltsraum",     tEn: "Lounge",  tDe: "Lounge" },
    { f: "gallery-08-morning",  en: "Morning at the mirrors",de: "Morgens am Spiegel",      tEn: "Morning", tDe: "Morgens" },
    { f: "gallery-09-corridor", en: "The corridor",          de: "Der Gang",                tEn: "Inside",  tDe: "Drinnen" },
    { f: "gallery-10-mood",     en: "A good day",            de: "Ein guter Tag",           tEn: "Mood",    tDe: "Stimmung" },
    { f: "gallery-11-mirror",   en: "Getting ready",         de: "Fertigmachen",            tEn: "Morning", tDe: "Morgens" },
    { f: "gallery-12-evening",  en: "Snacks and stories",    de: "Snacks und Geschichten",  tEn: "Evening", tDe: "Abends" }
  ];
  var WIDE = { 0: 1, 5: 1, 8: 1 }, TALL = { 2: 1, 9: 1 };

  function label(p) { return lang === "de" ? p.de : p.en; }
  function tagOf(p) { return lang === "de" ? p.tDe : p.tEn; }
  function srcOf(p) { return "assets/img/" + p.f + ".jpg"; }

  function buildGallery() {
    var grid = document.getElementById("galgrid");
    if (!grid) return;
    PHOTOS.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gal__item" + (WIDE[i] ? " wide" : "") + (TALL[i] ? " tall" : "");
      b.dataset.i = i;

      var im = document.createElement("img");
      im.src = srcOf(p); im.alt = label(p);
      im.loading = i < 4 ? "eager" : "lazy";
      im.decoding = "async";
      im.width = 1400; im.height = 1000;

      var tg = document.createElement("span");
      tg.className = "gal__tag"; tg.textContent = tagOf(p);

      b.append(im, tg);
      b.addEventListener("click", function () { lightbox.open(i); });
      grid.appendChild(b);
    });
    relabelGallery();
  }

  function relabelGallery() {
    var items = document.querySelectorAll(".gal__item");
    items.forEach(function (b) {
      var p = PHOTOS[+b.dataset.i];
      if (!p) return;
      b.querySelector("img").alt = label(p);
      b.querySelector(".gal__tag").textContent = tagOf(p);
      b.setAttribute("aria-label", label(p) + " — " + t("gal.enlarge"));
    });
  }

  /* ═══ 3. LIGHTBOX ═════════════════════════════════════════════════ */

  var lightbox = (function () {
    var box, img, cap, at = 0, opener = null;

    function show(i) {
      at = (i + PHOTOS.length) % PHOTOS.length;
      var p = PHOTOS[at];
      img.src = srcOf(p);
      img.alt = label(p);
      cap.textContent = label(p) + "  ·  " + (at + 1) + "/" + PHOTOS.length;
    }
    return {
      init: function () {
        box = document.getElementById("lb");
        if (!box) return;
        img = document.getElementById("lb-img");
        cap = document.getElementById("lb-cap");

        document.getElementById("lb-x").addEventListener("click", this.close);
        document.getElementById("lb-prev").addEventListener("click", function () { show(at - 1); });
        document.getElementById("lb-next").addEventListener("click", function () { show(at + 1); });
        box.addEventListener("click", function (e) { if (e.target === box) lightbox.close(); });

        window.addEventListener("keydown", function (e) {
          if (!box.hasAttribute("open")) return;
          if (e.key === "Escape") lightbox.close();
          else if (e.key === "ArrowLeft") show(at - 1);
          else if (e.key === "ArrowRight") show(at + 1);
        });
      },
      open: function (i) {
        opener = document.activeElement;
        show(i);
        box.setAttribute("open", "");
        document.body.style.overflow = "hidden";
        document.getElementById("lb-x").focus();
      },
      close: function () {
        box.removeAttribute("open");
        document.body.style.overflow = "";
        if (opener && opener.focus) opener.focus();
      },
      isOpen: function () { return box && box.hasAttribute("open"); },
      refresh: function () { show(at); }
    };
  })();

  /* ═══ 4. HERO FLOWER FIELD — 2D, the same drawing as the logo ═════ */

  var PAL = ["#FF3D9A", "#4FC3CE", "#E4B430", "#E8871F", "#B444E0", "#57D96B", "#E8404C"];
  var RGB = PAL.map(function (h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  });
  function mix(x) {
    var n = RGB.length, s = ((x % n) + n) % n, i = Math.floor(s), f = s - i;
    var a = RGB[i], b = RGB[(i + 1) % n];
    return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * f) + "," +
                    Math.round(a[1] + (b[1] - a[1]) * f) + "," +
                    Math.round(a[2] + (b[2] - a[2]) * f) + ")";
  }

  function drawFlower(ctx, x, y, r, petals, rot, open, fill, core) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.strokeStyle = "#0B0B0C"; ctx.lineWidth = Math.max(1.5, r * 0.13);

    var pr = r * 0.62 * open, pw = r * 0.40 * (0.75 + open * 0.35);
    for (var i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate((i / petals) * Math.PI * 2);
      ctx.translate(0, -r * 0.52);
      ctx.beginPath(); ctx.ellipse(0, 0, pw, pr, 0, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(-pw * 0.30, -pr * 0.34, pw * 0.26, pr * 0.26, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.30, 0, Math.PI * 2);
    ctx.fillStyle = core; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 0.10, -r * 0.11, r * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fill();
    ctx.restore();
  }

  function heroField() {
    var cvs = document.getElementById("petals");
    if (!cvs) return;
    var ctx = cvs.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, buds = [], raf = 0, t0 = 0;

    function seed() {
      var n = window.innerWidth < 700 ? 11 : 20;
      buds = [];
      for (var i = 0; i < n; i++) {
        buds.push({
          x: Math.random(), y: Math.random(),
          r: 16 + Math.random() * 46,
          p: [5, 6, 7, 8][Math.floor(Math.random() * 4)],
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.32,
          hue: Math.random() * RGB.length,
          hs: 0.12 + Math.random() * 0.28,
          ph: Math.random() * Math.PI * 2,
          drift: 0.10 + Math.random() * 0.24
        });
      }
    }
    function size() {
      var b = cvs.getBoundingClientRect();
      W = Math.max(1, b.width); H = Math.max(1, b.height);
      cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function paint(t) {
      ctx.clearRect(0, 0, W, H);
      buds.forEach(function (f) {
        var px = f.x * W + Math.sin(t * f.drift + f.ph) * W * 0.022;
        var py = f.y * H + Math.cos(t * f.drift * 0.8 + f.ph) * H * 0.028;
        var br = 1 + Math.sin(t * 0.85 + f.ph) * 0.09;
        var hue = f.hue + t * f.hs;
        drawFlower(ctx, px, py, f.r * br, f.p, f.rot + t * f.spin, 0.9,
                   mix(hue), mix(hue + 2.2));
      });
    }
    function frame(ts) {
      if (!t0) t0 = ts;
      paint((ts - t0) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && !RM) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; t0 = 0; } }

    seed(); size();
    if (RM) paint(0); else start();

    window.addEventListener("resize", function () {
      size(); seed(); if (RM) paint(0);
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    if ("IntersectionObserver" in window && !RM) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0 }).observe(cvs);
    }
  }

  /* ═══ 5. SMALL PARTS ══════════════════════════════════════════════ */

  function ticker() {
    var row = document.getElementById("ticker");
    if (!row) return;
    var words = ["TOP DESTINATION", "VIENNA", "BEINGASSE 13", "BE FREE HOSTEL",
                 "NO RECEPTION", "NO CURFEW"];
    var html = "";
    for (var k = 0; k < 2; k++)
      for (var i = 0; i < words.length; i++) html += "<span>" + words[i] + "</span>";
    row.innerHTML = html;
  }

  function reveals() {
    var els = [].slice.call(document.querySelectorAll("[data-reveal]"));
    if (!els.length) return;
    if (RM || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sibs = [].slice.call(e.target.parentNode.children);
        setTimeout(function () { e.target.classList.add("in"); },
                   Math.min(sibs.indexOf(e.target), 5) * 110);
        io.unobserve(e.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Booking. The form shows immediately — it is useful on its own and
     leaves no empty frame — and the UP Hotel widget takes over only once
     the browser confirms <ibe-up> is really defined. That covers a missing
     key, a blocked script, an ad-blocker and a dead network with one path
     instead of four guesses. */
  function bookingWidget() {
    var hosts = [].slice.call(document.querySelectorAll("[data-ibe-host]"));
    if (!hosts.length) return;

    function show(useWidget) {
      hosts.forEach(function (host) {
        var w = host.querySelector(".ibe"), f = host.querySelector("[data-ibe-form]");
        if (w) w.hidden = !useWidget;
        if (f) f.hidden = useWidget;
      });
      if (useWidget) syncWidgetLanguage();
    }

    show(false);
    bookingForm();

    var el = document.querySelector("[data-ibe-host] ibe-up");
    var key = el && el.getAttribute("ibe-key");
    if (!key || !key.trim() || !window.customElements) return;

    if (customElements.get("ibe-up")) { show(true); return; }
    customElements.whenDefined("ibe-up").then(function () { show(true); });
  }

  /* The IBE reads its language attribute once, when it initialises, so a
     language switch needs a fresh element rather than a changed attribute. */
  function syncWidgetLanguage() {
    [].forEach.call(document.querySelectorAll("[data-ibe-host] .ibe"), function (box) {
      if (box.hidden) return;
      var el = box.querySelector("ibe-up");
      if (!el || el.getAttribute("language") === lang) return;
      var fresh = document.createElement("ibe-up");
      fresh.setAttribute("ibe-key", el.getAttribute("ibe-key"));
      fresh.setAttribute("language", lang);
      el.parentNode.replaceChild(fresh, el);
    });
  }

  /* Dates cannot be in the past, check-out cannot precede check-in, and a
     submitted form becomes a mail we can answer by hand. */
  function bookingForm() {
    var iso = function (d) { return d.toISOString().slice(0, 10); };
    var today = iso(new Date());

    [].forEach.call(document.querySelectorAll("[data-ibe-form]"), function (form) {
      var inp = form.querySelector('input[name="in"]'),
          out = form.querySelector('input[name="out"]');
      inp.min = out.min = today;

      inp.addEventListener("change", function () {
        var next = new Date(inp.value);
        next.setDate(next.getDate() + 1);
        out.min = iso(next);
        if (out.value && out.value <= inp.value) out.value = iso(next);
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var pax = form.querySelector('select[name="pax"]').value;
        var subject = lang === "de" ? "Anfrage Be Free Hostel" : "Booking request — Be Free Hostel";
        var body = lang === "de"
          ? "Anreise: " + inp.value + "\nAbreise: " + out.value + "\nGäste: " + pax + "\n\n"
          : "Check-in: " + inp.value + "\nCheck-out: " + out.value + "\nGuests: " + pax + "\n\n";
        location.href = "mailto:befree-hostel@dostepinn.at?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      });
    });
  }

  /* The nav's booking pill is hidden on narrow screens, so a floating one
     takes over — but only between the hero and the booking section, so it
     never covers the thing it points at. One shared state, because two
     observers toggling the same class fight each other. */
  function bookingFab() {
    var fab  = document.getElementById("bookfab"),
        hero = document.getElementById("top"),
        book = document.getElementById("book");
    if (!fab || !hero || !("IntersectionObserver" in window)) return;

    var heroVisible = true, bookVisible = false;
    function update() { fab.classList.toggle("in", !heroVisible && !bookVisible); }

    function watch(el, set) {
      new IntersectionObserver(function (es) {
        set(es[0].isIntersecting);
        update();
      }, { threshold: 0 }).observe(el);
    }
    watch(hero, function (v) { heroVisible = v; });
    if (book) watch(book, function (v) { bookVisible = v; });
  }

  function menu() {
    var b = document.getElementById("burger"), l = document.getElementById("navlinks");
    if (!b || !l) return;
    b.addEventListener("click", function () {
      var open = l.classList.toggle("open");
      b.setAttribute("aria-expanded", String(open));
    });
    l.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        l.classList.remove("open");
        b.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ═══ 6. GO ═══════════════════════════════════════════════════════ */

  harvestEnglish();
  buildGallery();
  lightbox.init();
  ticker();
  heroField();
  reveals();
  menu();

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  document.getElementById("lang-en").addEventListener("click", function () { setLang("en", true); });
  document.getElementById("lang-de").addEventListener("click", function () { setLang("de", true); });

  /* ?lang=de wins, then a remembered choice, then the browser's own */
  var q = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("befree-lang"); } catch (e) {}
  var auto = (navigator.language || "en").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  setLang(q || saved || auto, false);
  bookingWidget();
  bookingFab();

  /* the 3D flower asks whether it may run */
  window.BeFree = { reducedMotion: RM, photos: PHOTOS, palette: PAL };
})();
