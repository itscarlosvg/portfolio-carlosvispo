// El carrito: estructura, plancha, perros, salsas, toldo, bombillo, letrero de neón y estrellas.
import * as THREE from 'three';
import { scene } from '../core/motor.js';
import { C, S } from '../config.js';
import { std, neon, mesh, box, cyl, tex, glow, stadium, smoothTube, polyTube, starPts, roundRect, glowPool } from '../core/utilidades.js';
import { SALSAS } from '../datos/habilidades.js';

export const acero = std('#c9ccd8', 0.3, 0.9);
export const aceroOsc = std('#7c8091', 0.4, 0.85);

export const cart = new THREE.Group();
cart.position.y = S;
scene.add(cart);

/* ---------- cuerpo ---------- */
{
  const goma = std('#111014', 0.85);
  for (const z of [-0.63, 0.63]) {
    cyl(0.32, 0.32, 0.1, goma, 0.55, 0.32, z, cart, 28).rotation.x = Math.PI / 2;
    cyl(0.15, 0.15, 0.11, acero, 0.55, 0.32, z, cart, 20).rotation.x = Math.PI / 2;
  }
  for (const z of [-0.45, 0.45]) box(0.06, 0.36, 0.06, aceroOsc, -1.05, 0.18, z, cart);
  box(2.4, 1.0, 1.1, acero, 0, 0.85, 0, cart);

  // rótulo pintado a mano
  const frente = tex(1024, 400, (g, w, h) => {
    g.fillStyle = '#f1eadb'; g.fillRect(0, 0, w, h);
    const franja = (y, hh) => [C.amarillo, '#1f45c9', '#d0202e'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, y + i * hh, w, hh); });
    franja(0, 16); franja(h - 48, 16);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '150px Bungee'; g.fillStyle = '#d0202e'; g.fillText('PERROS', w / 2, 168);
    g.font = '86px Bungee'; g.fillStyle = '#1f45c9'; g.fillText('CALIENTES', w / 2, 270);
    g.font = '700 30px "Space Mono"'; g.fillStyle = '#2a2233'; g.fillText('★  CON TODO  ★', w / 2, 324);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(80,60,40,${Math.random() * 0.12})`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1 + Math.random() * 2); }
  });
  mesh(new THREE.PlaneGeometry(2.3, 0.9), std('#ffffff', 0.45, 0, { map: frente }), 0, 0.85, 0.552, cart);
  mesh(new THREE.PlaneGeometry(2.3, 0.9), std('#ffffff', 0.45, 0, { map: frente }), 0, 0.85, -0.552, cart).rotation.y = Math.PI;
  box(2.62, 0.06, 1.32, acero, 0, 1.38, 0, cart);

  // plancha
  box(0.9, 0.04, 0.56, std('#1a181f', 0.45, 0.7), -0.65, 1.43, -0.05, cart);
  mesh(new THREE.PlaneGeometry(0.86, 0.01), neon('#ff6a1a', 2.2), -0.65, 1.41, 0.231, cart);
}

/* ---------- salchichas en la plancha ---------- */
const salchichas = [];
{
  const sm = std('#b0472a', 0.38, 0, { emissive: '#2a0700' });
  for (let i = 0; i < 6; i++) {
    const s = mesh(new THREE.CapsuleGeometry(0.042, 0.24, 6, 12), sm, -0.86 + (i % 3) * 0.2, 1.495, -0.2 + Math.floor(i / 3) * 0.22, cart);
    s.rotation.z = Math.PI / 2; s.rotation.y = 0.12; s.userData.ph = Math.random() * 6;
    salchichas.push(s);
  }
}

/** Un perro caliente servido, con salsas y papitas. */
function perro(parent, x, y, z, ry) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const pan = std('#d9944a', 0.7);
  for (const s of [-1, 1]) { const b = mesh(new THREE.CapsuleGeometry(0.04, 0.24, 6, 12), pan, 0, 0.03, s * 0.035, g); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.9); }
  mesh(new THREE.CapsuleGeometry(0.032, 0.28, 6, 12), std('#a8401f', 0.4), 0, 0.06, 0, g).rotation.z = Math.PI / 2;
  const zz = (c) => { const p = []; for (let i = 0; i <= 10; i++) p.push(new THREE.Vector3(-0.13 + i * 0.026, 0.095 + (c ? 0.006 : 0), (i % 2 ? 0.03 : -0.03) * (c ? -1 : 1))); return p; };
  g.add(smoothTube(zz(0), 0.008, std('#ff9ec0', 0.3), false), smoothTube(zz(1), 0.007, std('#ffc61a', 0.3), false));
  const pa = new THREE.InstancedMesh(new THREE.BoxGeometry(0.004, 0.004, 0.045), std('#ffcf3a', 0.6), 26), d = new THREE.Object3D();
  for (let i = 0; i < 26; i++) { d.position.set(-0.13 + Math.random() * 0.26, 0.1 + Math.random() * 0.02, (Math.random() - 0.5) * 0.07); d.rotation.set(Math.random() * 3, Math.random() * 3, 0); d.updateMatrix(); pa.setMatrixAt(i, d.matrix); }
  g.add(pa);
}
{
  cyl(0.26, 0.24, 0.015, std('#f4f1f8', 0.4), -0.08, 1.418, 0.33, cart, 32);
  perro(cart, -0.12, 1.43, 0.3, 0.2);
  perro(cart, -0.02, 1.43, 0.4, -0.15);
  // bol de papitas
  mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.12, 28, 1, true), std('#e63946', 0.45, 0, { side: THREE.DoubleSide }), 0.05, 1.47, -0.27, cart);
  cyl(0.16, 0.16, 0.01, std('#ffcf3a', 0.7), 0.05, 1.52, -0.27, cart, 28);
  const pa = new THREE.InstancedMesh(new THREE.BoxGeometry(0.006, 0.006, 0.06), std('#ffd545', 0.6, 0, { emissive: '#3a2600' }), 160), d = new THREE.Object3D();
  for (let i = 0; i < 160; i++) {
    const a = Math.random() * 7, r = Math.sqrt(Math.random()) * 0.15;
    d.position.set(0.05 + Math.cos(a) * r, 1.525 + Math.random() * 0.05 * (1 - r / 0.15), -0.27 + Math.sin(a) * r);
    d.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); d.updateMatrix(); pa.setMatrixAt(i, d.matrix);
  }
  cart.add(pa);
}

/* ---------- salsas (habilidades) ---------- */
export const salsas = new THREE.Group();
salsas.position.set(0.8, 1.41, 0.06);
cart.add(salsas);
export const botellas = [];
{
  SALSAS.forEach((sa, i) => {
    const b = new THREE.Group(); b.position.x = -0.39 + i * 0.156; salsas.add(b);
    const piv = new THREE.Group(); b.add(piv);
    cyl(0.062, 0.062, 0.28, std(sa.color, 0.25, 0, { emissive: new THREE.Color(sa.color).multiplyScalar(0.12) }), 0, 0.14, 0, piv, 24);
    const etiqueta = tex(512, 128, (g, w, h) => {
      g.fillStyle = '#f6f1e4'; g.fillRect(0, 0, w, h);
      g.fillStyle = sa.color; g.fillRect(0, 0, w, 12); g.fillRect(0, h - 12, w, 12);
      g.fillStyle = '#1a1424'; g.textAlign = 'center'; g.textBaseline = 'middle';
      let fs = 66; g.font = fs + 'px Bungee';
      while (g.measureText(sa.etiqueta).width > 175 && fs > 18) { fs -= 2; g.font = fs + 'px Bungee'; }
      g.fillText(sa.etiqueta, w / 2, h / 2 + 4);
    });
    mesh(new THREE.CylinderGeometry(0.0635, 0.0635, 0.12, 32, 1, true, -Math.PI, Math.PI * 2), std('#ffffff', 0.5, 0, { map: etiqueta }), 0, 0.15, 0, piv);
    cyl(0.036, 0.06, 0.055, std('#f7f7f7', 0.4), 0, 0.3, 0, piv, 16);
    cyl(0.005, 0.016, 0.09, std('#f7f7f7', 0.4), 0, 0.37, 0, piv, 10);
    piv.traverse((o) => { o.userData.salsa = i; });
    botellas.push({ g: b, piv, lift: 0, sq: 0 });
  });
  // caja invisible para que sea fácil tocar las salsas
  box(0.98, 0.5, 0.3, new THREE.MeshBasicMaterial({ visible: false }), 0, 0.2, 0, salsas);
}
export const gotaMat = std('#ffffff', 0.2, 0);
export const gotas = [];
for (let i = 0; i < 36; i++) {
  const m = mesh(new THREE.SphereGeometry(0.013, 8, 6), gotaMat, 0, -5, 0);
  m.visible = false;
  gotas.push({ m, v: new THREE.Vector3(), life: 0, on: false });
}

/* ---------- postes, techo y toldo ---------- */
{
  for (const x of [-1.24, 1.24]) for (const z of [-0.58, 0.58]) cyl(0.025, 0.025, 1.38, acero, x, 2.1, z, cart, 10);
  box(2.95, 0.07, 1.6, aceroOsc, 0, 2.82, 0, cart);
  const falda = tex(1024, 128, (g, w, h) => {
    const cols = [C.amarillo, '#2a55e0', '#e0283a'], sw = w / 15;
    for (let i = 0; i < 15; i++) { g.fillStyle = cols[i % 3]; g.fillRect(i * sw, 0, sw, h); }
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 15; i++) { g.beginPath(); g.ellipse(i * sw, h, sw * 0.5, 34, 0, 0, Math.PI * 2); g.fill(); }
  });
  const fm = std('#ffffff', 0.8, 0, { map: falda, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  mesh(new THREE.PlaneGeometry(2.95, 0.38), fm, 0, 2.62, 0.8, cart);
  for (const s of [-1, 1]) mesh(new THREE.PlaneGeometry(1.6, 0.38), fm, s * 1.475, 2.62, 0, cart).rotation.y = Math.PI / 2;
  mesh(new THREE.PlaneGeometry(2.95, 0.38), fm, 0, 2.62, -0.8, cart);
  box(2.8, 0.022, 0.022, neon(C.rosa, 2.6), 0, 2.41, 0.79, cart);
  box(2.8, 0.022, 0.022, neon(C.rosa, 2.6), 0, 2.41, -0.79, cart);
}

/* ---------- bombillo ---------- */
const bombillo = new THREE.Group();
bombillo.position.set(0, 2.78, 0.15);
cart.add(bombillo);
{
  cyl(0.004, 0.004, 0.42, std('#111', 0.8), 0, -0.21, 0, bombillo, 6);
  mesh(new THREE.SphereGeometry(0.06, 16, 12), neon('#ffd49a', 5), 0, -0.46, 0, bombillo);
  const l = new THREE.PointLight('#ffc27a', 9, 9, 2); l.position.set(0, -0.5, 0); bombillo.add(l);
}

/* ---------- letrero de neón ---------- */
let letreroMat;
{
  const letrero = new THREE.Group(); letrero.position.set(0, S + 3.36, 0); scene.add(letrero);
  box(2.75, 0.95, 0.08, std('#140b22', 0.45, 0.3), 0, 0, 0, letrero);
  for (const x of [-1, 1]) box(0.06, 0.12, 0.06, aceroOsc, x, -0.52, 0, letrero);
  const borde = polyTube(roundRect(2.62, 0.84, 0.12), 0.016, neon(C.azul, 3));
  borde.position.z = 0.05; letrero.add(borde);
  const borde2 = borde.clone(); borde2.position.z = -0.05; letrero.add(borde2);
  const t = tex(1024, 320, (g, w) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = 140; g.font = fs + 'px Bungee';
    while (g.measureText('CARLOS VISPO').width > 940 && fs > 40) { fs -= 4; g.font = fs + 'px Bungee'; }
    glow(g, 'CARLOS VISPO', w / 2, 128, '#ff2f7a', '#ffd9e8');
    g.font = '700 42px "Space Mono"';
    try { g.letterSpacing = '6px'; } catch (e) { /* navegadores sin letterSpacing */ }
    glow(g, 'DESARROLLADOR FULLSTACK', w / 2, 252, '#ffd23f', '#fff6d0');
  });
  letreroMat = new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false, color: new THREE.Color(1, 1, 1) });
  mesh(new THREE.PlaneGeometry(2.5, 0.78), letreroMat, 0, 0, 0.046, letrero);
  mesh(new THREE.PlaneGeometry(2.5, 0.78), letreroMat, 0, 0, -0.046, letrero).rotation.y = Math.PI;
  const l = new THREE.PointLight(C.rosa, 7, 8, 2); l.position.set(0, 0, 1); letrero.add(l);
}

/* ---------- perro de neón y siete estrellas ---------- */
const estrellas = [];
{
  const ic = new THREE.Group(); ic.position.set(0, S + 4.18, 0); ic.scale.setScalar(0.62); scene.add(ic);
  ic.add(smoothTube(stadium(1.5, 0.44), 0.028, neon('#ffae3b', 3)));
  const sal = smoothTube(stadium(1.78, 0.2), 0.028, neon(C.rojo, 3)); sal.position.set(0, 0.1, 0.02); ic.add(sal);
  const mz = []; for (let i = 0; i <= 12; i++) mz.push(new THREE.Vector3(-0.72 + i * 0.12, 0.1 + (i % 2 ? 0.07 : -0.05), 0.05));
  ic.add(polyTube(mz, 0.02, neon(C.amarillo, 3.2), false));
  const sm = neon(C.blanco, 2.6);
  for (let i = 0; i < 7; i++) {
    const a = THREE.MathUtils.degToRad(160 - i * (140 / 6));
    const st = polyTube(starPts(0.13), 0.018, sm.clone());
    st.position.set(Math.cos(a) * 1.45, S + 3.95 + Math.sin(a) * 1.45, 0);
    scene.add(st); estrellas.push(st);
  }
}
glowPool(C.rosa, 6, 0, 1.2, 0.35);
glowPool('#ffb070', 3.5, 0, 0.8, 0.35);

/* ---------- humo de la plancha ---------- */
const humo = [];
{
  const t = tex(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  });
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color: '#ffd9c0', transparent: true, opacity: 0, depthWrite: false }));
    s.userData.t = i / 14; cart.add(s); humo.push(s);
  }
}

/* ---------- animación ---------- */
let flick = 3, flickEnd = 0;
export function actualizarCarrito(dt, t) {
  salchichas.forEach((s, i) => {
    s.position.z = (-0.2 + Math.floor(i / 3) * 0.22) + Math.sin(t * 0.8 + s.userData.ph) * 0.012;
    s.rotation.x = t * 0.6 + s.userData.ph;
  });
  bombillo.rotation.z = Math.sin(t * 1.1) * 0.05;
  bombillo.rotation.x = Math.sin(t * 0.7) * 0.03;
  humo.forEach((s) => {
    s.userData.t = (s.userData.t + dt * 0.35) % 1;
    const u = s.userData.t;
    s.position.set(-0.65 + Math.sin(u * 6 + s.id) * 0.2, 1.5 + u * 1.0, -0.05 + Math.cos(u * 5 + s.id) * 0.1);
    s.scale.setScalar(0.15 + u * 0.5);
    s.material.opacity = Math.sin(u * Math.PI) * 0.22;
  });
  estrellas.forEach((s, i) => s.material.color.set(C.blanco).multiplyScalar(1.15 + Math.sin(t * 2 + i * 0.9) * 0.2));
  // parpadeo del letrero
  if (t > flick) { flickEnd = t + 0.5; flick = t + 5 + Math.random() * 7; }
  letreroMat.color.setScalar(t < flickEnd && Math.random() < 0.5 ? 0.25 : 1);
}
