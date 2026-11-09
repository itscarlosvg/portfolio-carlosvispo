// Atajos para crear materiales, mallas, texturas de canvas y curvas.
import * as THREE from 'three';
import { scene } from './motor.js';
import { S } from '../config.js';

/* ---------- materiales ---------- */
export const std = (color, r = 0.6, m = 0, x = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m, envMapIntensity: 0.7, ...x });

/** Material de neón: no se ve afectado por la luz y alimenta el bloom. */
export const neon = (hex, k = 3) =>
  new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k * 0.5), toneMapped: false });

/** Neón que ignora la niebla (para el fondo lejano). */
export const nf = (hex, k) => { const m = neon(hex, k); m.fog = false; return m; };

/* ---------- mallas ---------- */
export function mesh(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
export const box = (w, h, d, mat, x, y, z, p) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p);
export const cyl = (rt, rb, h, mat, x, y, z, p, seg = 20) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, p);

/* ---------- canvas ---------- */
export function tex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Texto con brillo de neón. */
export function glow(g, text, x, y, color, core) {
  g.save();
  g.fillStyle = color; g.shadowColor = color;
  g.globalAlpha = 0.55; g.shadowBlur = 16; g.fillText(text, x, y);
  g.globalAlpha = 1; g.shadowBlur = 0; g.fillText(text, x, y);
  g.fillStyle = core; g.globalAlpha = 0.55; g.fillText(text, x, y);
  g.restore();
}

/** Escribe un texto con saltos de línea; devuelve la y siguiente. */
export function wrapText(g, text, x, y, maxW, lh) {
  let line = '';
  for (const w of text.split(' ')) {
    const tt = line ? line + ' ' + w : w;
    if (g.measureText(tt).width > maxW && line) { g.fillText(line, x, y); y += lh; line = w; } else line = tt;
  }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}

/* ---------- curvas y tubos ---------- */
export function stadium(w, h, n = 40) {
  const r = h / 2, L = w / 2 - r, p = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + Math.PI * i / (n - 1); p.push(new THREE.Vector3(L + r * Math.cos(a), r * Math.sin(a), 0)); }
  for (let i = 0; i < n; i++) { const a = Math.PI / 2 + Math.PI * i / (n - 1); p.push(new THREE.Vector3(-L + r * Math.cos(a), r * Math.sin(a), 0)); }
  return p;
}

export const smoothTube = (pts, rad, mat, closed = true) =>
  new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', 0.1), pts.length * 3, rad, 8, closed), mat);

export function polyTube(pts, rad, mat, closed = true) {
  const P = closed ? [...pts, pts[0]] : pts, path = new THREE.CurvePath();
  for (let i = 0; i < P.length - 1; i++) path.add(new THREE.LineCurve3(P[i], P[i + 1]));
  return new THREE.Mesh(new THREE.TubeGeometry(path, P.length * 10, rad, 6, false), mat);
}

export function starPts(r) {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
    p.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0));
  }
  return p;
}

export function roundRect(w, h, r, n = 8) {
  const p = [], cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, Math.PI * 1.5]];
  for (const [cx, cy, a0] of cs) for (let i = 0; i <= n; i++) { const a = a0 + Math.PI / 2 * i / n; p.push(new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), 0)); }
  return p;
}

/* ---------- animación ---------- */
export const easeOutBack = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Charco de luz en el suelo. */
export function glowPool(color, size, x, z, op = 0.5) {
  const t = tex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  });
  const m = mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }), x, S + 0.06, z);
  m.material.polygonOffset = true; m.material.polygonOffsetFactor = -4; m.material.polygonOffsetUnits = -4;
  m.renderOrder = 2;
  m.rotation.x = -Math.PI / 2;
  return m;
}
