/* ═══════════════════════════════════════════════════════════════════════
   SCENE — "Vienna Glass Map"
   A glowing golden-hour glass city; the hotel at the warm centre.
   Slow camera drift on scroll + mouse. Concierge tips land as glowing pins.
   Gated: skipped on mobile, low-power and reduced-motion — CSS hero remains.
   Fails silently to the static fallback if WebGL / the CDN is unavailable.
   ═══════════════════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const smallScreen = window.innerWidth < 900;
const lowCores = (navigator.hardwareConcurrency || 4) < 4;

// Expose a no-op by default so main.js can always call it safely.
window.Scene = { dropPins() {} };

if (!reduceMotion && !coarse && !smallScreen && !lowCores) {
  // Defer so it never blocks first paint or the booking CTA.
  const boot = () => init().catch(() => { /* keep the CSS fallback */ });
  if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 1200 });
  else window.addEventListener("load", boot);
}

async function init() {
  const mount = document.getElementById("scene-mount");
  if (!mount) return;

  const THREE = await import("three");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x120d08, 0.055);

  const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.1, 100);
  const camBase = new THREE.Vector3(0, 5.5, 13);
  camera.position.copy(camBase);
  camera.lookAt(0, 0.5, 0);

  // ── Lighting: warm golden hour ──────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x4a3b28, 1.1));
  const key = new THREE.DirectionalLight(0xffd9a0, 2.1);
  key.position.set(6, 9, 4); scene.add(key);
  const rim = new THREE.PointLight(0x6f8f76, 3, 40); // deep-green city glow
  rim.position.set(-8, 3, -6); scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  // ── The glass city: instanced blocks on a soft grid ────────────────
  const COUNT = 150;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a2118, roughness: 0.15, metalness: 0.1,
    transparent: true, opacity: 0.5,
    emissive: 0xc9a24b, emissiveIntensity: 0.12,
  });
  const city = new THREE.InstancedMesh(geo, mat, COUNT);
  const dummy = new THREE.Object3D();
  // deterministic pseudo-random (no Math.random dependency for stable frames)
  let seed = 1337;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const spread = 22;
  for (let i = 0; i < COUNT; i++) {
    const x = (rnd() - 0.5) * spread;
    const z = (rnd() - 0.5) * spread;
    const distToCenter = Math.hypot(x, z);
    const h = 0.6 + rnd() * (distToCenter < 4 ? 1.2 : 5.5); // shorter near the hotel
    dummy.position.set(x, h / 2, z);
    dummy.scale.set(0.5 + rnd() * 1.1, h, 0.5 + rnd() * 1.1);
    dummy.rotation.y = rnd() * Math.PI;
    dummy.updateMatrix();
    city.setMatrixAt(i, dummy.matrix);
  }
  group.add(city);

  // ── The hotel: a warm glowing beacon at the centre ─────────────────
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 2.4, 24),
    new THREE.MeshStandardMaterial({ color: 0xe0c078, emissive: 0xe0c078, emissiveIntensity: 1.4, roughness: 0.3 })
  );
  beacon.position.set(0, 1.2, 0);
  group.add(beacon);
  const halo = new THREE.PointLight(0xe0c078, 6, 14);
  halo.position.set(0, 2.4, 0); group.add(halo);

  // soft ground plane (glass reflection feel)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(16, 48),
    new THREE.MeshStandardMaterial({ color: 0x0e0a06, roughness: 0.4, metalness: 0.6, transparent: true, opacity: 0.85 })
  );
  ground.rotation.x = -Math.PI / 2; group.add(ground);

  // ── Floating city lights (particles) ───────────────────────────────
  const pCount = 260;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pos[i*3]   = (rnd() - 0.5) * spread * 1.4;
    pos[i*3+1] = rnd() * 8;
    pos[i*3+2] = (rnd() - 0.5) * spread * 1.4;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xe0c078, size: 0.06, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
  group.add(particles);

  // ── Concierge pins (added on demand by the chatbot) ─────────────────
  const pins = new THREE.Group(); group.add(pins);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x7fb08a, emissive: 0x7fb08a, emissiveIntensity: 1.6 });
  const pinGeo = new THREE.SphereGeometry(0.16, 16, 16);
  window.Scene.dropPins = (n = 3) => {
    for (let i = 0; i < n; i++) {
      const p = new THREE.Mesh(pinGeo, pinMat);
      const ang = rnd() * Math.PI * 2;
      const r = 2.5 + rnd() * 7;
      p.position.set(Math.cos(ang) * r, 6, Math.sin(ang) * r);
      p.userData.targetY = 0.6 + rnd() * 3;
      p.userData.t = 0;
      pins.add(p);
    }
    // keep the field tidy
    while (pins.children.length > 14) pins.remove(pins.children[0]);
  };

  // ── Interaction: scroll + mouse parallax ────────────────────────────
  let scrollN = 0, mx = 0, my = 0;
  window.addEventListener("scroll", () => {
    scrollN = Math.min(window.scrollY / (window.innerHeight || 1), 1.4);
  }, { passive: true });
  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  // ── Resize ──────────────────────────────────────────────────────────
  const onResize = () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onResize);

  // ── Pause when tab hidden (perf) ────────────────────────────────────
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });

  // ── Render loop ─────────────────────────────────────────────────────
  let frame = 0;
  function loop() {
    if (!running) return;
    frame++;
    const t = frame * 0.0045;

    group.rotation.y = t * 0.35 + mx * 0.4;
    // camera eases back + up as you scroll into the city
    camera.position.x = camBase.x + mx * 2.2;
    camera.position.y = camBase.y + scrollN * 3.5 - my * 1.2;
    camera.position.z = camBase.z + scrollN * 4.0;
    camera.lookAt(0, 0.6, 0);

    beacon.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.35;
    halo.intensity = 5 + Math.sin(t * 3) * 1.5;
    particles.rotation.y = -t * 0.15;

    // animate pins settling in
    pins.children.forEach(p => {
      if (p.position.y > p.userData.targetY) p.position.y += (p.userData.targetY - p.position.y) * 0.08;
      p.userData.t += 0.05;
      p.position.y += Math.sin(p.userData.t) * 0.004;
      p.material.emissiveIntensity = 1.3 + Math.sin(p.userData.t * 2) * 0.4;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  // Fade the CSS fallback out once GL is live (keeps LCP fast, no flash)
  const fb = document.querySelector(".hero__fallback");
  if (fb) { fb.style.transition = "opacity 1.2s ease"; fb.style.opacity = "0.35"; }
}
