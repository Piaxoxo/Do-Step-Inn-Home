/* ═══════════════════════════════════════════════════════════════════
   The photo flower — eight petals, each one a photograph with its own
   depth map, opening as you scroll. Drawn the way the logo draws its
   flowers: thick black rim, glossy highlight, a cycling colour halo.

   Degrades quietly: no WebGL, low memory or reduced motion and the
   whole section steps aside — the plain gallery below carries the
   same photographs.
   ═══════════════════════════════════════════════════════════════════ */

import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Shape, ShapeGeometry,
  CircleGeometry, MeshBasicMaterial, ShaderMaterial, TextureLoader, CanvasTexture,
  Vector2, Color, DoubleSide, SRGBColorSpace, LinearFilter, ClampToEdgeWrapping
} from "../vendor/three.module.min.js";

const section = document.querySelector(".bloom");
const canvas  = document.getElementById("flower");
if (!section || !canvas) throw new Error("no flower stage");

const RM = window.BeFree ? window.BeFree.reducedMotion
                         : matchMedia("(prefers-reduced-motion: reduce)").matches;

/* the section only earns its three screens of scroll if it can actually draw */
function standDown() { section.style.display = "none"; }

if (navigator.deviceMemory && navigator.deviceMemory < 2) standDown();
else {

let renderer;
try {
  renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true,
                                 powerPreference: "high-performance" });
} catch (e) { renderer = null; }

if (!renderer) standDown();
else {

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene  = new Scene();
const camera = new PerspectiveCamera(42, 1, 0.1, 100);
const CAM_FAR = 7.4, CAM_NEAR = 6.4;
camera.position.z = CAM_FAR;

const PAL = [0xFF3D9A, 0x4FC3CE, 0xE4B430, 0xE8871F, 0xB444E0, 0x57D96B, 0xE8404C];

const PETALS = [
  "petal-1-capsule", "petal-2-room",     "petal-3-arrival", "petal-4-lounge",
  "petal-5-people",  "petal-6-bathroom", "petal-7-mirror",  "petal-8-hangout"
];

/* ── petal outline ────────────────────────────────────────────────── */
function petalShape(w, h) {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-w * 0.42, h * 0.12, -w * 0.60, h * 0.66, 0, h);
  s.bezierCurveTo( w * 0.60, h * 0.66,  w * 0.42, h * 0.12, 0, 0);
  return s;
}
/* ShapeGeometry writes raw XY into the UVs — remap onto the bounding box
   so the photograph fills the petal instead of being cropped to a sliver */
function remapUV(geo) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox, uv = geo.attributes.uv;
  const dx = bb.max.x - bb.min.x, dy = bb.max.y - bb.min.y;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - bb.min.x) / dx, (uv.getY(i) - bb.min.y) / dy);
  }
  uv.needsUpdate = true;
  return geo;
}

const PW = 1.66, PH = 2.95;
const petalGeo = remapUV(new ShapeGeometry(petalShape(PW, PH), 26));
const rimGeo   = new ShapeGeometry(petalShape(PW * 1.055, PH * 1.030), 26);
const haloGeo  = new ShapeGeometry(petalShape(PW * 1.165, PH * 1.095), 26);

/* ── parallax shader ──────────────────────────────────────────────── */
const VERT = `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

const FRAG = `
uniform sampler2D uMap, uDepth;
uniform vec2  uShift;
uniform float uAmt, uTint;
uniform vec3  uCol;
varying vec2  vUv;

void main(){
  float d = texture2D(uDepth, vUv).r;          // 1 = far, 0 = near
  /* near surfaces travel further than the back wall — the whole trick */
  vec2 off = (0.5 - d) * uAmt * uShift;
  vec2 uv  = clamp(vUv + off, 0.002, 0.998);
  vec3 col = texture2D(uMap, uv).rgb;

  col = pow(col, vec3(0.90)) * 1.04;           // interiors shoot dark
  col = mix(col, uCol, uTint * 0.13);          // faint brand tint, photo stays honest

  float g = smoothstep(0.62, 0.02, distance(vUv, vec2(0.34, 0.74)));
  col += g * 0.16;                             // the logo's glossy highlight

  float e = smoothstep(0.0, 0.045, vUv.x) * smoothstep(1.0, 0.955, vUv.x)
          * smoothstep(0.0, 0.030, vUv.y) * smoothstep(1.0, 0.970, vUv.y);
  gl_FragColor = vec4(col, 0.35 + 0.65 * e);
}`;

const loader = new TextureLoader();
function tex(src, srgb) {
  const t = loader.load(src);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.generateMipmaps = false;
  t.wrapS = t.wrapT = ClampToEdgeWrapping;
  return t;
}

const flower = new Group();
scene.add(flower);
const petals = [];

PETALS.forEach((name, i) => {
  const arm = new Group();
  arm.rotation.z = (i / PETALS.length) * Math.PI * 2;
  flower.add(arm);

  const hinge = new Group();
  hinge.position.z = i * 0.004;        // keep touching haloes from z-fighting
  arm.add(hinge);

  const halo = new Mesh(haloGeo, new MeshBasicMaterial({
    color: PAL[i % PAL.length], transparent: true, opacity: 0.95, side: DoubleSide
  }));
  halo.position.z = -0.075;
  hinge.add(halo);

  const rim = new Mesh(rimGeo, new MeshBasicMaterial({
    color: 0x0B0B0C, transparent: true, opacity: 0.96, side: DoubleSide
  }));
  rim.position.z = -0.038;
  hinge.add(rim);

  const mat = new ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, side: DoubleSide,
    uniforms: {
      uMap:   { value: tex(`assets/img/${name}.jpg`, true) },
      uDepth: { value: tex(`assets/img/${name}-depth.png`, false) },
      uShift: { value: new Vector2() },
      uAmt:   { value: 0.052 },
      uTint:  { value: 1 },
      uCol:   { value: new Color(PAL[i % PAL.length]) }
    }
  });
  hinge.add(new Mesh(petalGeo, mat));

  petals.push({ hinge, mat, halo, hue: i });
});

/* ── flower centre, drawn once onto a canvas ──────────────────────── */
function centreTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  [[128, "#0B0B0C"], [118, "#E8871F"], [86, "#E4B430"],
   [54, "#F0F048"], [26, "#E8404C"]].forEach(([r, col]) => {
    x.beginPath(); x.arc(128, 128, r, 0, Math.PI * 2); x.fillStyle = col; x.fill();
  });
  x.beginPath(); x.arc(104, 100, 20, 0, Math.PI * 2);
  x.fillStyle = "rgba(255,255,255,.5)"; x.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
const centre = new Mesh(new CircleGeometry(0.76, 56),
                        new MeshBasicMaterial({ map: centreTexture(), transparent: true }));
centre.position.z = 0.10;
flower.add(centre);

/* ── scroll + pointer ─────────────────────────────────────────────── */
const FLOWER_R = 0.50 + PH * 1.10;
let fitScale = 1, viewW = 10, narrow = false;
let progress = 0;
const pointer = new Vector2(), target = new Vector2();

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  /* measure at the closest the camera ever gets, so the bloom can
     never push petals off-screen */
  const vh = 2 * Math.tan(camera.fov * Math.PI / 360) * CAM_NEAR;
  const vw = vh * camera.aspect;
  narrow = w < 700;
  viewW = vw;
  fitScale = (Math.min(vh, vw) * (narrow ? 0.97 : 0.93)) / (2 * FLOWER_R);
}

function readScroll() {
  const r = section.getBoundingClientRect();
  const span = r.height - innerHeight;
  progress = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
}

addEventListener("scroll", readScroll, { passive: true });
addEventListener("resize", () => { resize(); readScroll(); }, { passive: true });
addEventListener("pointermove", e => {
  const r = canvas.getBoundingClientRect();
  target.set((e.clientX - r.left) / r.width * 2 - 1,
             -((e.clientY - r.top) / r.height * 2 - 1));
}, { passive: true });
addEventListener("deviceorientation", e => {
  if (e.gamma == null) return;
  const c = (v) => Math.max(-1, Math.min(1, v));
  target.set(c(e.gamma / 32), c((e.beta - 45) / 32));
}, { passive: true });

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let raf = 0, t0 = 0;

function frame(ts) {
  if (!t0) t0 = ts;
  const t = (ts - t0) / 1000;

  pointer.lerp(target, 0.075);
  const bloom = ease(Math.min(1, progress / 0.42));
  const late  = Math.max(0, (progress - 0.42) / 0.58);

  petals.forEach((p, i) => {
    const s = ease(Math.min(1, Math.max(0, bloom * 1.5 - i * 0.045)));
    p.hinge.rotation.x = -1.02 * (1 - s) + 0.10 * s;
    p.hinge.rotation.y = Math.sin(t * 0.5 + i) * 0.05 * s;
    p.hinge.position.y = 0.20 + s * 0.30;

    p.mat.uniforms.uShift.value.set(pointer.x, pointer.y);
    p.mat.uniforms.uAmt.value = 0.052 * s;

    const h = (p.hue + t * 0.30) % PAL.length;
    const a = PAL[Math.floor(h)], b = PAL[(Math.floor(h) + 1) % PAL.length];
    p.mat.uniforms.uCol.value.set(a).lerp(new Color(b), h % 1);
    p.halo.material.color.copy(p.mat.uniforms.uCol.value);
  });

  centre.scale.setScalar(0.42 + bloom * 0.58);
  flower.scale.setScalar(fitScale * (0.54 + 0.46 * bloom));
  /* the bud waits beside the opening copy, then slides to centre */
  flower.position.x = (1 - bloom) * viewW * (narrow ? 0 : 0.30);
  flower.position.y = (1 - bloom) * (narrow ? 1.10 : 0);
  flower.rotation.z = t * 0.055 + late * 1.15;
  flower.rotation.x = pointer.y * 0.13;
  flower.rotation.y = pointer.x * 0.17;
  camera.position.z = CAM_FAR - bloom * (CAM_FAR - CAM_NEAR);

  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}

function start() { if (!raf && !RM) raf = requestAnimationFrame(frame); }
function stop()  { if (raf) { cancelAnimationFrame(raf); raf = 0; t0 = 0; } }

resize();
readScroll();

if (RM) {
  progress = 0.5;                 // one static, fully open frame
  frame(0); stop();
} else {
  new IntersectionObserver(es => es[0].isIntersecting ? start() : stop(),
                           { threshold: 0 }).observe(section);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  start();
}

}}
