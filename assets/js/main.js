/* ═══════════════════════════════════════════════════════════════════════
   MAIN — interactions, reveals, booking, chat orchestration
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.getElementById("year"); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Nav: scroll state + mobile menu (skipped if header is absent) ──── */
  const nav = $("#nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = $("[data-toggle-menu]");
    if (burger) {
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("is-menu-open");
        burger.setAttribute("aria-expanded", String(open));
      });
    }
    $$(".nav__links a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-menu-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    }));
  }

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

  /* ── Parallax (viewport-relative, rAF, reduced-motion aware) ───────── */
  (function parallax() {
    const els = $$("[data-parallax]");
    if (reduce || !els.length) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight || 1;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const offset = center - vh / 2;               // +below / -above viewport centre
        const shift = Math.max(-140, Math.min(140, -offset * speed));
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  })();

  /* ── Scroll progress bar ───────────────────────────────────────────── */
  (function progress() {
    const bar = $("#scrollbar");
    if (!bar) return;
    const upd = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd, { passive: true });
    upd();
  })();

  /* ── Horizontal-scroll gallery (pinned; vertical scroll → sideways) ── */
  (function hGallery() {
    const sec = $("#chapter-gallery");
    const track = $("#hgtrack");
    if (!sec || !track) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse || window.innerWidth < 760) { sec.classList.add("is-static"); return; }

    let maxX = 0, start = 0, ticking = false;
    const measure = () => {
      maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      sec.style.height = (window.innerHeight + maxX) + "px";
      start = sec.offsetTop;
    };
    const update = () => {
      const x = Math.max(0, Math.min(maxX, window.scrollY - start));
      track.style.transform = `translate3d(${-x}px,0,0)`;
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } };
    measure(); update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { measure(); update(); }, { passive: true });
    window.addEventListener("load", () => { measure(); update(); });
    // remeasure once images have loaded (widths are fixed, but be safe)
    track.querySelectorAll("img").forEach(img => img.addEventListener("load", () => { measure(); update(); }, { once: true }));
  })();

  /* ── 3D tilt on cards (pointer-driven) ─────────────────────────────── */
  (function tilt() {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    $$(".hg-item, .guide-card, .group-card").forEach(el => el.setAttribute("data-tilt", ""));
    $$("[data-tilt]").forEach(el => {
      let raf = null;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
        });
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  })();

  /* ── Word-by-word heading reveal ───────────────────────────────────── */
  (function words() {
    let wi = 0;
    const split = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          if (!child.textContent.trim()) return;
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(tok => {
            if (tok === "") return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
            const s = document.createElement("span");
            s.className = "word"; s.style.setProperty("--wd", wi++); s.textContent = tok;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          split(child);
        }
      });
    };
    $$(".section__title, .book__title").forEach(t => { wi = 0; split(t); });
  })();

  /* ── Sticky story: reveal lines as you scroll through ──────────────── */
  (function story() {
    const sec = $("#chapter-story");
    if (!sec) return;
    const lines = $$(".story__line", sec);
    const fill = $("#story-fill");
    if (reduce) { lines.forEach(l => l.classList.add("is-lit")); return; }
    let ticking = false;
    const update = () => {
      const total = sec.offsetHeight - window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, -sec.getBoundingClientRect().top / total));
      lines.forEach((l, i) => l.classList.toggle("is-lit", p >= i / lines.length));
      if (fill) fill.style.width = (p * 100) + "%";
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  })();

  /* ── 3D fly-through of the five houses ─────────────────────────────── */
  (function fly() {
    const sec = $("#chapter-family");
    const space = $("#flyspace");
    if (!sec || !space) return;
    if (reduce || window.matchMedia("(pointer: coarse)").matches) { sec.classList.add("is-static"); return; }
    const panels = $$(".fly__panel", sec);
    const gap = 900, n = panels.length;
    let ticking = false;
    const update = () => {
      const total = sec.offsetHeight - window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, -sec.getBoundingClientRect().top / total));
      const cam = p * (n + 1) * gap;
      space.style.transform = `translateZ(${cam}px)`;
      panels.forEach((pan, i) => {
        const eff = cam - (i + 1) * gap;
        let op;
        if (eff < -1400 || eff > 780) op = 0;
        else if (eff > 500) op = Math.max(0, (780 - eff) / 280);
        else if (eff < -900) op = Math.max(0, (eff + 1400) / 500);
        else op = 1;
        pan.style.opacity = op.toFixed(2);
        pan.style.pointerEvents = op > 0.5 ? "auto" : "none";
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  })();

  /* ── Group booking request → email to reservierung@dostepinn.at ────── */
  const groupForm = $("#group-form");
  if (groupForm) {
    groupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = groupForm;
      const val = (n) => (f.elements[n]?.value || "").trim();
      const name = val("name"), email = val("email"), people = val("people");
      if (!name || !email || !people) {
        [["name", name], ["email", email], ["people", people]].forEach(([n, v]) => {
          if (!v && f.elements[n]) { f.elements[n].style.borderColor = "#b4462f"; }
        });
        return;
      }
      const rooms = [...f.querySelectorAll('input[name="rooms"]:checked')].map(x => x.value).join(", ") || "—";
      const board = f.querySelector('input[name="board"]:checked')?.value || "—";
      const lines = [
        "Group booking request", "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Organisation / school: ${val("org") || "—"}`,
        `Phone: ${val("phone") || "—"}`,
        `Check-in: ${val("checkin") || "—"}`,
        `Check-out: ${val("checkout") || "—"}`,
        `Number of people: ${people}`,
        `Gender split: ${val("genders") || "—"}`,
        `Preferred room split: ${rooms}`,
        `Board: ${board}`, "",
        "Message:", (val("message") || "—"), "",
        "— sent from dostepinn.at",
      ];
      const subject = `Group booking request — ${people} people`;
      const href = `mailto:reservierung@dostepinn.at?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      const ok = $("#group-ok");
      if (ok) ok.hidden = false;
      // open the guest's email client with everything pre-filled
      window.location.href = href;
    });
  }

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
    if (opener) {
      e.preventDefault();
      const target = document.getElementById("book-top") || document.getElementById("chapter-book");
      if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
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
