// Nevera, cornetas, poste con guacamayo, araguaney y el carro que pasa por la calle.
import * as THREE from 'three';
import { scene, camera } from '../core/motor.js';
import { C, S, reduce } from '../config.js';
import { E } from '../estado.js';
import { std, neon, mesh, box, cyl, glowPool } from '../core/utilidades.js';
import { controls, cam } from '../core/camara.js';

/* ---------- nevera ---------- */
{
  const nev = new THREE.Group(); nev.position.set(-1.6, S, 1.15); nev.rotation.y = 0.25; scene.add(nev);
  box(0.74, 0.44, 0.46, std('#1f4fd6', 0.45), 0, 0.22, 0, nev);
  box(0.78, 0.07, 0.5, std('#f2f2f6', 0.5), 0, 0.475, 0, nev);
  for (const x of [-0.12, 0.06]) {
    cyl(0.035, 0.035, 0.2, std('#2a1708', 0.15, 0.1, { transparent: true, opacity: 0.92 }), x, 0.61, 0.05, nev, 14);
    cyl(0.012, 0.03, 0.07, std('#2a1708', 0.15), x, 0.745, 0.05, nev, 12);
    cyl(0.015, 0.015, 0.015, std('#e8c33a', 0.4, 0.6), x, 0.785, 0.05, nev, 10);
  }
}

/* ---------- cornetas (sonido) ---------- */
export const cornetas = new THREE.Group();
cornetas.position.set(1.9, S, 1.0);
cornetas.rotation.y = -0.4;
scene.add(cornetas);
const conos = [];
{
  box(0.44, 0.74, 0.38, std('#0e0d13', 0.55), 0, 0.37, 0, cornetas);
  [[0.52, 0.12], [0.2, 0.09]].forEach(([y, r]) => {
    const c = cyl(r, r, 0.03, std('#24222c', 0.5), 0, y, 0.19, cornetas, 28);
    c.rotation.x = Math.PI / 2; conos.push(c);
    mesh(new THREE.TorusGeometry(r + 0.02, 0.008, 8, 40), neon(C.azul, 3), 0, y, 0.2, cornetas);
  });
}

/* ---------- poste de luz y guacamayo ---------- */
let guacaCab, alaI, alaD;
{
  const poste = new THREE.Group(); poste.position.set(-4.6, S, -1.1); scene.add(poste);
  const pm = std('#3b3a48', 0.5, 0.6);
  cyl(0.07, 0.09, 4.4, pm, 0, 2.2, 0, poste, 14);
  cyl(0.04, 0.04, 1.2, pm, 0.6, 4.3, 0, poste, 10).rotation.z = Math.PI / 2;
  box(0.5, 0.1, 0.26, pm, 1.2, 4.26, 0, poste);
  mesh(new THREE.PlaneGeometry(0.44, 0.2), neon(C.sodio, 3.2), 1.2, 4.205, 0, poste).rotation.x = Math.PI / 2;
  const sp = new THREE.SpotLight(C.sodio, 55, 14, 0.75, 0.55, 2);
  sp.position.set(1.2, 4.2, 0); poste.add(sp);
  sp.target.position.set(1.8, 0, 0.8); poste.add(sp.target);
  glowPool(C.sodio, 5, -3.2, -0.4, 0.3);

  const guaca = new THREE.Group(); guaca.position.set(0.02, 4.42, 0); guaca.rotation.y = 0.9; guaca.scale.setScalar(1.15); poste.add(guaca);
  const rojo = std('#e0202f', 0.55), azul = std('#1f5fe0', 0.5), amar = std('#ffcf1f', 0.5);
  mesh(new THREE.CapsuleGeometry(0.075, 0.14, 6, 12), rojo, 0, 0.15, 0, guaca).rotation.x = 0.25;
  guacaCab = new THREE.Group(); guacaCab.position.set(0, 0.3, 0.04); guaca.add(guacaCab);
  mesh(new THREE.SphereGeometry(0.07, 16, 12), rojo, 0, 0, 0, guacaCab);
  for (const s of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.03, 10, 8), std('#f5f2ea', 0.6), s * 0.052, 0, 0.03, guacaCab);
    mesh(new THREE.SphereGeometry(0.011, 8, 6), std('#0b0b0b', 0.2), s * 0.068, 0.008, 0.035, guacaCab);
  }
  mesh(new THREE.ConeGeometry(0.035, 0.09, 10), std('#ece4cf', 0.5), 0, -0.025, 0.08, guacaCab).rotation.x = Math.PI / 2 + 0.9;
  alaI = new THREE.Group(); alaD = new THREE.Group();
  [[alaI, -1], [alaD, 1]].forEach(([a, s]) => {
    a.position.set(s * 0.07, 0.2, 0); guaca.add(a);
    box(0.025, 0.2, 0.12, azul, 0, -0.08, -0.02, a);
    box(0.027, 0.07, 0.1, amar, 0, 0.02, 0, a);
  });
  const cola = new THREE.Group(); cola.position.set(0, 0.04, -0.07); cola.rotation.x = 0.35; guaca.add(cola);
  box(0.05, 0.38, 0.02, azul, 0, -0.19, 0, cola);
  box(0.03, 0.32, 0.022, rojo, 0, -0.16, -0.004, cola);
  for (const s of [-1, 1]) box(0.02, 0.04, 0.03, std('#666', 0.7), s * 0.03, 0.01, 0.02, guaca);
}

/* ---------- araguaney ---------- */
let petalos;
const petData = [];
{
  const arbol = new THREE.Group(); arbol.position.set(5.0, S, -2.5); scene.add(arbol);
  const corteza = std('#3a2a22', 0.9);
  cyl(0.11, 0.17, 2.6, corteza, 0, 1.3, 0, arbol, 10).rotation.z = 0.04;
  [[0.5, 2.4, 0.2, -0.7], [-0.45, 2.3, -0.1, 0.8], [0.1, 2.6, -0.4, -0.2]].forEach(([x, y, z, rz]) => { cyl(0.04, 0.07, 1.2, corteza, x, y, z, arbol, 8).rotation.z = rz; });

  const n = 300;
  const flores = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.15, 0), std('#ffffff', 0.55, 0, { emissive: '#7a5200', emissiveIntensity: 0.7 }), n);
  const d = new THREE.Object3D(), centros = [[0, 3.3, 0, 1.3], [0.9, 3.0, 0.1, 0.9], [-0.85, 2.95, -0.1, 0.9], [0.2, 3.9, -0.2, 0.9]];
  for (let i = 0; i < n; i++) {
    const [cx, cy, cz, r] = centros[i % 4];
    const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * r);
    d.position.set(cx + v.x, cy + v.y * 0.65, cz + v.z);
    d.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    d.scale.setScalar(0.6 + Math.random() * 0.7);
    d.updateMatrix(); flores.setMatrixAt(i, d.matrix);
    flores.setColorAt(i, new THREE.Color().setHSL(0.12 + Math.random() * 0.03, 1, 0.5 + Math.random() * 0.12));
  }
  arbol.add(flores);

  const np = 70;
  petalos = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.05), std('#ffd21f', 0.6, 0, { side: THREE.DoubleSide, emissive: '#6a4800' }), np);
  arbol.add(petalos);
  for (let i = 0; i < np; i++) petData.push({ p: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 4, (Math.random() - 0.5) * 2.4), s: 0.25 + Math.random() * 0.35, r: Math.random() * 6, w: Math.random() * 6 });
  glowPool('#ffc916', 3.5, 5, -2.3, 0.15);
}

/* ---------- carro que pasa ---------- */
const carro = new THREE.Group();
carro.position.set(500, 0, 6);
scene.add(carro);
{
  box(3.8, 0.62, 1.7, std('#211a3a', 0.3, 0.7), 0, 0.52, 0, carro);
  box(2.0, 0.5, 1.5, std('#0b0a14', 0.1, 0.6), -0.2, 1.06, 0, carro);
  for (const z of [-0.6, 0.6]) {
    box(0.04, 0.14, 0.3, neon('#fff6e6', 5), 1.9, 0.6, z, carro);
    box(0.04, 0.1, 0.34, neon(C.rojo, 4), -1.9, 0.62, z, carro);
  }
  const l = new THREE.PointLight('#fff1d6', 14, 12, 2); l.position.set(2.6, 0.6, 0); carro.add(l);
}
let carroOn = false, carroT = 4, carroDir = 1;

/* ---------- animación ---------- */
const dObj = new THREE.Object3D();
export function actualizarDecorado(dt, t) {
  // las cornetas laten con el bombo aunque el movimiento esté reducido
  E.beat *= Math.exp(-dt * 8);
  conos.forEach((c, i) => { c.scale.y = 1 + E.beat * (i ? 2.5 : 4); });
  if (reduce) return;

  guacaCab.rotation.y = Math.sin(t * 0.9) * 0.5 + (Math.sin(t * 0.23) > 0.9 ? Math.sin(t * 9) * 0.2 : 0);
  guacaCab.rotation.x = Math.max(0, Math.sin(t * 2.3)) * 0.15;
  const flap = (t % 7) < 0.6 ? Math.sin(t * 28) * 0.7 : 0;
  alaI.rotation.z = -flap; alaD.rotation.z = flap;

  petData.forEach((p, i) => {
    p.p.y -= p.s * dt; p.p.x += Math.sin(t * 1.3 + p.w) * dt * 0.25; p.r += dt * 2;
    if (p.p.y < 0.02) p.p.set((Math.random() - 0.5) * 2.8, 3.2 + Math.random(), (Math.random() - 0.5) * 2.2);
    dObj.position.copy(p.p); dObj.rotation.set(p.r, p.r * 0.7, p.r * 0.3); dObj.updateMatrix();
    petalos.setMatrixAt(i, dObj.matrix);
  });
  petalos.instanceMatrix.needsUpdate = true;

  // el carro solo pasa cuando se mira el puesto de frente y la cámara está lejos de la calle
  const lt = E.state === 'free' ? controls.target : cam.tgt;
  const az = Math.atan2(camera.position.x - lt.x, camera.position.z - lt.z);
  const seguro = Math.cos(az) > 0.85 && camera.position.z > 9.5;
  if (E.state === 'free' && !carroOn) {
    carroT -= dt;
    if (carroT < 0 && seguro) {
      carroDir = Math.random() < 0.5 ? 1 : -1; carroOn = true;
      carro.position.set(-carroDir * 60, 0, carroDir > 0 ? 5.6 : 7.2);
      carro.rotation.y = carroDir > 0 ? 0 : Math.PI;
    }
  }
  if (carroOn && !(camera.position.z > 8.8)) { carroOn = false; carro.position.x = 500; carroT = 4; }
  if (carroOn) {
    carro.position.x += carroDir * 15 * dt;
    if (Math.abs(carro.position.x) > 62) { carroOn = false; carro.position.x = 500; carroT = 7 + Math.random() * 8; }
  }
}
