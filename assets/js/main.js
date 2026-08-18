/* ═══════════════════════════════════════════════════════════════════════
   MAIN — interactions, reveals, booking, chat orchestration
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ── Nav: scroll state ─────────────────────────────────────────────── */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Mobile menu ───────────────────────────────────────────────────── */
  const burger = $("[data-toggle-menu]");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-menu-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav__links a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-menu-open");
    burger.setAttribute("aria-expanded", "false");
  }));

  /* ── Reveal on scroll ──────────────────────────────────────────────── */
  const reveals = $$("[data-reveal]");
  reveals.forEach(el => { const d = el.dataset.delay; if (d) el.style.setProperty("--d", d); });
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(el => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
  }

  /* ── Sticky booking bar + FAB reveal after hero ────────────────────── */
  const sticky = $("#stickybar");
  const fab = $("#fab");
  const hero = $("#chapter-arrival");
  const bookCh = $("#chapter-book");
  if ("IntersectionObserver" in window) {
    const gate = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.target === hero) {
          const past = !e.isIntersecting && e.boundingClientRect.top < 0;
          sticky.classList.toggle("is-visible", past);
          fab.classList.toggle("is-visible", past);
          sticky.setAttribute("aria-hidden", String(!past));
        }
        // hide sticky bar over the final booking chapter (redundant there)
        if (e.target === bookCh && e.isIntersecting) {
          sticky.classList.remove("is-visible");
        }
      });
    }, { threshold: 0 });
    gate.observe(hero);
    gate.observe(bookCh);
  }

  /* ── Rooms tabs ────────────────────────────────────────────────────── */
  const tabs = $$("[data-room-tab]");
  const panels = $$("[data-room-panel]");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    const key = tab.dataset.roomTab;
    tabs.forEach(t => { const on = t === tab; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on)); });
    panels.forEach(p => {
      const on = p.dataset.roomPanel === key;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  }));

  /* ── Locations: real interactive map (Leaflet) ─────────────────────── */
  (function initLocMap() {
    const el = document.getElementById("loc-map");
    if (!el || typeof L === "undefined") return;   // CDN blocked → styled fallback stays
    const cards = $$("[data-loccard]");
    const pts = cards.map(c => ({
      key: c.dataset.loccard, lat: parseFloat(c.dataset.lat), lng: parseFloat(c.dataset.lng),
      name: c.querySelector("b").textContent,
      addr: c.querySelector(".loc-card__body span").textContent,
      href: c.getAttribute("href"), home: c.classList.contains("is-home"),
    })).filter(p => !isNaN(p.lat));
    if (!pts.length) return;

    const map = L.map(el, { scrollWheelZoom: false }).setView([48.190, 16.352], 13);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd",
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);

    const markers = {}, bounds = [];
    pts.forEach((p, i) => {
      const icon = L.divIcon({
        className: "", iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28],
        html: `<div class="loc-marker${p.home ? " is-home" : ""}"><span>${i + 1}</span></div>`,
      });
      const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
      m.bindPopup(`<div class="loc-pop"><b>${p.name}</b><span>${p.addr}</span><br><a href="${p.href}" target="_blank" rel="noopener">Route öffnen →</a></div>`);
      markers[p.key] = m; bounds.push([p.lat, p.lng]);
    });
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    cards.forEach(c => {
      const m = markers[c.dataset.loccard];
      if (m) c.addEventListener("mouseenter", () => m.openPopup());
    });
    setTimeout(() => map.invalidateSize(), 300);
  })();

  /* ── Parallax (lightweight, rAF, reduced-motion aware) ─────────────── */
  (function parallax() {
    const els = $$("[data-parallax]");
    if (reduce || !els.length) return;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ══ MODAL PLUMBING ════════════════════════════════════════════════ */
  let lastFocus = null;
  function openModal(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    const focusable = el.querySelector("input, button, select, [tabindex]");
    if (focusable) setTimeout(() => focusable.focus(), 60);
    document.addEventListener("keydown", escClose);
  }
  function closeModal(el) {
    el.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escClose);
    setTimeout(() => { el.hidden = true; }, 500);
    if (lastFocus) lastFocus.focus();
  }
  function escClose(e) { if (e.key === "Escape") { const open = $(".is-open"); if (open) closeModal(open); } }

  /* ── Booking modal ─────────────────────────────────────────────────── */
  const booking = $("#booking");
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-booking]");
    if (opener) { e.preventDefault(); openModal(booking); }
    if (e.target.closest("[data-close-booking]")) closeModal(booking);
  });
  // sensible default dates
  const ci = $('input[name="checkin"]'), co = $('input[name="checkout"]');
  if (ci && co) {
    const today = new Date(); const t = new Date(today); t.setDate(t.getDate() + 1);
    const fmt = (d) => d.toISOString().slice(0, 10);
    ci.value = fmt(today); ci.min = fmt(today);
    co.value = fmt(t); co.min = fmt(t);
    ci.addEventListener("change", () => { co.min = ci.value; if (co.value <= ci.value) { const n = new Date(ci.value); n.setDate(n.getDate() + 1); co.value = fmt(n); } });
  }
  $("#booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = "Taking you to booking…";
    // Placeholder: integrate the real booking engine URL here in Phase 3.
    setTimeout(() => { btn.textContent = "Search rooms"; closeModal(booking); }, 1100);
  });

  /* ══ CHAT ══════════════════════════════════════════════════════════ */
  const chat = $("#chat");
  const body = $("#chat-body");
  const promptsWrap = $("#chat-prompts");
  const form = $("#chat-form");
  const input = $("#chat-text");
  const disclaimer = $("#chat-disclaimer");
  const modeBtns = $$(".chat__mode");
  let mode = "vienna";
  const started = { vienna: false, home: false };

  function setMode(next, { greet = true } = {}) {
    mode = next;
    modeBtns.forEach(b => { const on = b.dataset.mode === next; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", String(on)); });
    disclaimer.innerHTML = window.Concierge.DISCLAIMER[next];
    input.placeholder = next === "vienna" ? "Ask about Vienna…" : "Ask about your stay…";
    renderPrompts();
    if (greet && !started[next]) { started[next] = true; addBot(window.Concierge.GREETING[next]); }
  }

  function renderPrompts() {
    promptsWrap.innerHTML = "";
    window.Concierge.PROMPTS[mode].forEach(p => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = p;
      b.addEventListener("click", () => submit(p));
      promptsWrap.appendChild(b);
    });
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addUser(text) {
    const el = document.createElement("div");
    el.className = "msg msg--user"; el.textContent = text;
    body.appendChild(el); scrollDown();
  }
  function addBot(html, pins) {
    const el = document.createElement("div");
    el.className = "msg msg--bot"; el.innerHTML = html;
    if (pins && pins.length) {
      const wrap = document.createElement("div"); wrap.className = "msg__pins";
      pins.forEach(p => { const pin = document.createElement("div"); pin.className = "msg__pin"; pin.textContent = p; wrap.appendChild(pin); });
      el.appendChild(wrap);
      if (window.Scene && window.Scene.dropPins) window.Scene.dropPins(pins.length);
    }
    body.appendChild(el); scrollDown();
  }
  function typing() {
    const el = document.createElement("div");
    el.className = "msg msg--bot typing"; el.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(el); scrollDown(); return el;
  }

  function submit(text) {
    text = (text || "").trim(); if (!text) return;
    addUser(text);
    const t = typing();
    const { html, pins } = window.Concierge.answer(mode, text);
    const delay = reduce ? 200 : 550 + Math.min(text.length * 8, 700);
    setTimeout(() => { t.remove(); addBot(html, pins); }, delay);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); submit(input.value); input.value = ""; });
  modeBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // Open chat from any [data-open-concierge]; optional data-prompt & mode
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open-concierge]");
    if (opener) {
      e.preventDefault();
      const wanted = opener.dataset.openConcierge || "vienna";
      const prompt = opener.dataset.prompt;
      if (wanted !== mode) setMode(wanted, { greet: true });
      else if (!started[mode]) setMode(mode, { greet: true });
      openModal(chat);
      if (prompt) setTimeout(() => submit(prompt), 400);
    }
    if (e.target.closest("[data-close-chat]")) closeModal(chat);
  });

  // initialise default mode greeting lazily on first open handled above
  setMode("vienna", { greet: false });
})();
