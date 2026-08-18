/* ═══════════════════════════════════════════════════════════════════════
   SCENE — "Vienna from above"
   A real 3D St. Stephen's Cathedral (Stephansdom) in the 1st district,
   seen from a slow bird's-eye orbit at golden hour.
   Gated for performance; falls back to the static warm hero if WebGL /
   the CDN is unavailable, or on mobile / reduced-motion.
   ═══════════════════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;
const smallScreen = window.innerWidth < 900;
const lowCores = (navigator.hardwareConcurrency || 4) < 4;

window.Scene = { dropPins() {} };

if (!reduceMotion && !coarse && !smallScreen && !lowCores) {
  const boot = () => init().catch(() => {});
  if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 1500 });
  else window.addEventListener("load", boot);
}

/* deterministic pseudo-random (Math.random is unavailable in some contexts) */
let _seed = 20260818;
const rnd = () => { _seed = (_seed * 16807) % 2147483647; return _seed / 2147483647; };

async function init() {
  const mount = document.getElementById("scene-mount");
  if (!mount) return;
  const THREE = await import("three");

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe9d9bd, 26, 62);

  const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 200);

  // ── Golden-hour light ───────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x6a5a44, 1.05));
  const sun = new THREE.DirectionalLight(0xffdca8, 2.2);
  sun.position.set(-14, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
  sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
  sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffe9cc, 0.5));

  const city = new THREE.Group();
  scene.add(city);

  // ── Ground (old-town cobble) ───────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(60, 64),
    new THREE.MeshStandardMaterial({ color: 0xbca988, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  city.add(ground);

  // ── Materials ───────────────────────────────────────────────────────
  const stone = new THREE.MeshStandardMaterial({ color: 0xd9cdb4, roughness: .85 });
  const stoneWarm = new THREE.MeshStandardMaterial({ color: 0xcdbb98, roughness: .9 });

  // Iconic chevron roof texture (Habsburg-style zig-zag tiles)
  function roofTexture() {
    const c = document.createElement("canvas"); c.width = 128; c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = "#3f6b4e"; x.fillRect(0, 0, 128, 128);
    const cols = ["#c8a24b", "#e8dcc0", "#8d3b2e", "#3f6b4e"];
    for (let r = 0; r < 8; r++) for (let cc = 0; cc < 8; cc++) {
      x.fillStyle = cols[(r + cc) % cols.length];
      x.beginPath(); x.moveTo(cc*16, r*16); x.lineTo(cc*16+8, r*16+8);
      x.lineTo(cc*16, r*16+16); x.closePath(); x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2);
    return t;
  }
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTexture(), roughness: .7 });
  const roofPlain = new THREE.MeshStandardMaterial({ color: 0x6b4a34, roughness: .9 });

  // ── STEPHANSDOM ─────────────────────────────────────────────────────
  const dom = new THREE.Group();
  city.add(dom);

  // Nave
  const nave = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3, 8.5), stone);
  nave.position.y = 1.5; nave.castShadow = nave.receiveShadow = true;
  dom.add(nave);

  // Steep chevron roof (triangular prism via extruded triangle)
  const triShape = new THREE.Shape();
  triShape.moveTo(-1.75, 0); triShape.lineTo(1.75, 0); triShape.lineTo(0, 3.1); triShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(triShape, { depth: 8.5, bevelEnabled: false });
  roofGeo.translate(0, 0, -4.25);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 3; roof.castShadow = true;
  dom.add(roof);

  // South Tower "Steffl" — the tall tapering gothic spire
  const steffl = new THREE.Group();
  steffl.position.set(0, 0, -4.4);
  const towerBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 6, 1.7), stone);
  towerBase.position.y = 3; towerBase.castShadow = true; steffl.add(towerBase);
  const taper = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 1.15, 5, 4), stoneWarm);
  taper.position.y = 8.5; taper.rotation.y = Math.PI / 4; taper.castShadow = true; steffl.add(taper);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.34, 4.5, 6), roofPlain);
  spire.position.y = 13; spire.castShadow = true; steffl.add(spire);
  dom.add(steffl);

  // North Tower — shorter, green renaissance dome
  const north = new THREE.Group();
  north.position.set(0, 0, 4.4);
  const nBase = new THREE.Mesh(new THREE.BoxGeometry(1.7, 5, 1.7), stone);
  nBase.position.y = 2.5; nBase.castShadow = true; north.add(nBase);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.05, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x4a6b52, roughness: .5, metalness: .3 }));
  dome.position.y = 5; dome.castShadow = true; north.add(dome);
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0xc8a24b, metalness: .6, roughness: .3 }));
  lantern.position.y = 6.1; north.add(lantern);
  dom.add(north);

  // ── First district around it (instanced blocks with warm facades) ───
  const COUNT = 120;
  const bgeo = new THREE.BoxGeometry(1, 1, 1);
  const bmat = new THREE.MeshStandardMaterial({ color: 0xcbb897, roughness: .9, vertexColors: false });
  const blocks = new THREE.InstancedMesh(bgeo, bmat, COUNT);
  blocks.castShadow = blocks.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const palette = [0xd8c6a4, 0xcbb897, 0xc3ad86, 0xd0be9c, 0xe0d2b4];
  const col = new THREE.Color();
  let n = 0;
  for (let i = 0; i < 600 && n < COUNT; i++) {
    const x = (rnd() - 0.5) * 46;
    const z = (rnd() - 0.5) * 46;
    if (Math.hypot(x, z) < 8) continue;          // keep the cathedral square clear
    const w = 1.6 + rnd() * 2.4, d = 1.6 + rnd() * 2.4;
    const h = 2 + rnd() * (Math.hypot(x, z) > 18 ? 3 : 4.5);
    dummy.position.set(x, h / 2, z);
    dummy.scale.set(w, h, d);
    dummy.rotation.y = Math.round(rnd() * 4) * Math.PI / 2;
    dummy.updateMatrix();
    blocks.setMatrixAt(n, dummy.matrix);
    col.setHex(palette[(n * 7) % palette.length]);
    blocks.setColorAt(n, col);
    n++;
  }
  blocks.count = n;
  city.add(blocks);

  // Simple pitched roofs on the nearer blocks
  const rgeo = new THREE.ConeGeometry(1.15, 1, 4);
  const rInst = new THREE.InstancedMesh(rgeo, roofPlain, n);
  for (let i = 0; i < n; i++) {
    blocks.getMatrixAt(i, dummy.matrix);
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    const top = dummy.position.y + dummy.scale.y / 2;
    const rw = Math.max(dummy.scale.x, dummy.scale.z) * 0.62;
    dummy.position.y = top + 0.35; dummy.scale.set(rw, 0.9, rw);
    dummy.rotation.set(0, Math.PI / 4, 0); dummy.updateMatrix();
    rInst.setMatrixAt(i, dummy.matrix);
  }
  rInst.castShadow = true;
  city.add(rInst);

  // ── Concierge pins (glow markers dropped by the chatbot) ───────────
  const pins = new THREE.Group(); city.add(pins);
  const pinGeo = new THREE.SphereGeometry(0.22, 14, 14);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xc8a24b, emissive: 0xc8a24b, emissiveIntensity: 1.5 });
  window.Scene.dropPins = (k = 3) => {
    for (let i = 0; i < k; i++) {
      const p = new THREE.Mesh(pinGeo, pinMat);
      const a = rnd() * Math.PI * 2, r = 9 + rnd() * 12;
      p.position.set(Math.cos(a) * r, 10, Math.sin(a) * r);
      p.userData = { ty: 5 + rnd() * 4, t: rnd() * 6 };
      pins.add(p);
    }
    while (pins.children.length > 12) pins.remove(pins.children[0]);
  };

  // ── Interaction & animation ─────────────────────────────────────────
  let mx = 0, my = 0, scrollN = 0;
  window.addEventListener("pointermove", e => {
    mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  window.addEventListener("scroll", () => {
    scrollN = Math.min(window.scrollY / (window.innerHeight || 1), 1.3);
  }, { passive: true });

  const onResize = () => {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onResize);

  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });

  let frame = 0;
  function loop() {
    if (!running) return;
    frame++;
    const t = frame * 0.0016;
    // slow bird's-eye orbit
    const radius = 20 - scrollN * 4;
    const ang = t + mx * 0.5;
    camera.position.set(Math.sin(ang) * radius, 15 + scrollN * 6 - my * 2, Math.cos(ang) * radius);
    camera.lookAt(0, 3.5, 0);

    pins.children.forEach(p => {
      if (p.position.y > p.userData.ty) p.position.y += (p.userData.ty - p.position.y) * 0.08;
      p.userData.t += 0.05;
      p.material.emissiveIntensity = 1.3 + Math.sin(p.userData.t * 2) * 0.4;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  // fade the static fallback out once GL is live
  const fb = document.querySelector(".hero__fallback");
  if (fb) { fb.style.transition = "opacity 1.4s ease"; fb.style.opacity = "0"; }
}
