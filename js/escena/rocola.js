// La rocola: cuatro teclas de neón que llevan a cada sección, y el letrero de créditos detrás.
import * as THREE from 'three';
import { scene } from '../core/motor.js';
import { C, S, reduce } from '../config.js';
import { E } from '../estado.js';
import { std, neon, mesh, box, cyl, tex, glow, smoothTube, glowPool } from '../core/utilidades.js';

export const rocola = new THREE.Group();
rocola.position.set(-2.75, S, 0.85);
rocola.rotation.y = 0.35;
scene.add(rocola);

/** Teclas de la rocola: [sección, código, texto, color, altura] */
const TECLAS = [
  ['proyectos', 'A1', 'Proyectos', C.rosa, 1.0],
  ['servicios', 'A2', 'Habilidades', C.amarillo, 0.78],
  ['sobre', 'B1', 'Trayectoria', C.azul, 0.56],
  ['contacto', 'B2', 'Sobre mí', C.rojo, 0.34],
];

export const botones = [];
let disco;

{
  const laca = std('#2a1240', 0.3, 0.4), madera = std('#6b3a1f', 0.55, 0.1);
  box(1.0, 1.5, 0.5, laca, 0, 0.8, 0, rocola);
  for (const x of [-0.51, 0.51]) box(0.06, 1.5, 0.54, madera, x, 0.8, 0, rocola);
  mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.54, 40, 1, false, Math.PI / 2, Math.PI), madera, 0, 1.55, 0, rocola).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.5, 40, 1, false, Math.PI / 2, Math.PI), laca, 0, 1.55, 0.025, rocola).rotation.x = Math.PI / 2;
  for (const x of [-0.4, 0.4]) for (const z of [-0.18, 0.18]) cyl(0.03, 0.02, 0.06, std('#c9ccd8', 0.3, 0.9), x, 0.03, z, rocola, 10);

  // arco de neón tricolor
  [[0.43, C.amarillo], [0.39, '#2f6bff'], [0.35, C.rojo]].forEach(([r, c]) => {
    const pts = [new THREE.Vector3(-r, 1.12, 0.292)];
    for (let i = 0; i <= 32; i++) { const a = Math.PI - Math.PI * i / 32; pts.push(new THREE.Vector3(Math.cos(a) * r, 1.55 + Math.sin(a) * r, 0.292)); }
    pts.push(new THREE.Vector3(r, 1.12, 0.292));
    rocola.add(smoothTube(pts, 0.012, neon(c, 2.6), false));
  });

  // ventana con el disco girando
  mesh(new THREE.CircleGeometry(0.29, 40), std('#0a0614', 0.08, 0.6), 0, 1.5, 0.282, rocola);
  disco = new THREE.Group(); disco.position.set(0, 1.5, 0.288); rocola.add(disco);
  cyl(0.25, 0.25, 0.008, std('#0b0b0f', 0.2, 0.3), 0, 0, 0, disco, 48).rotation.x = Math.PI / 2;
  cyl(0.075, 0.075, 0.01, std('#e0283a', 0.5), 0, 0, 0.002, disco, 32).rotation.x = Math.PI / 2;
  box(0.06, 0.012, 0.004, std('#ffd23f', 0.5), 0.035, 0, 0.009, disco);

  const rejilla = tex(256, 64, (g, w, h) => { g.fillStyle = '#120a1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2350'; for (let x = 8; x < w; x += 14) g.fillRect(x, 6, 6, h - 12); });
  mesh(new THREE.PlaneGeometry(0.84, 0.2), std('#ffffff', 0.6, 0, { map: rejilla }), 0, 0.16, 0.252, rocola);

  // teclas
  const tecla = (code, label, color) => tex(512, 112, (g, w, h) => {
    g.fillStyle = '#120a20'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 18); g.fill();
    g.save(); g.strokeStyle = color; g.shadowColor = color; g.lineWidth = 5; g.shadowBlur = 12; g.stroke(); g.restore();
    g.textBaseline = 'middle'; g.textAlign = 'left'; g.font = '700 34px "Space Mono"'; g.fillStyle = '#ffd23f'; g.fillText(code, 30, h / 2 + 2);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(100, 24, 2, h - 48);
    g.textAlign = 'center';
    let fs = 48; g.font = fs + 'px Bungee';
    while (g.measureText(label).width > 360 && fs > 20) { fs -= 2; g.font = fs + 'px Bungee'; }
    glow(g, label, 300, h / 2 + 3, color, '#ffffff');
  });
  TECLAS.forEach(([k, code, label, color, y]) => {
    const bg = new THREE.Group(); bg.position.set(0, y, 0.25); rocola.add(bg);
    box(0.86, 0.19, 0.04, std('#0e0818', 0.5), 0, 0, 0, bg);
    mesh(new THREE.PlaneGeometry(0.84, 0.184), new THREE.MeshBasicMaterial({ map: tecla(code, label, color), transparent: true, toneMapped: false }), 0, 0, 0.021, bg);
    bg.traverse((o) => { o.userData.hot = k; o.userData.boton = true; });
    bg.userData.k = k; bg.userData.hs = 1; bg.userData.press = 0;
    botones.push(bg);
  });

  const l = new THREE.PointLight(C.rosa, 3, 4, 2); l.position.set(0, 1.3, 0.8); rocola.add(l);
  glowPool(C.rosa, 2.6, -2.6, 1.15, 0.2);
}

/* ---------- créditos en la parte trasera de la rocola ---------- */
{
  const creditos = new THREE.Group(); creditos.position.set(0, 1.2, -0.253); creditos.rotation.y = Math.PI; rocola.add(creditos);
  const t = tex(1024, 196, (g, w, h) => {
    g.textBaseline = 'middle';
    g.font = '700 46px "Space Mono"'; const a = 'Inspired by ';
    g.font = '64px Bungee'; const b = '@jessezhou';
    g.font = '700 46px "Space Mono"'; const wa = g.measureText(a).width;
    g.font = '64px Bungee'; const wb = g.measureText(b).width;
    const x0 = (w - wa - wb) / 2;
    g.textAlign = 'left';
    g.font = '700 46px "Space Mono"'; glow(g, a, x0, h / 2 + 4, '#b39cff', '#efe8ff');
    g.font = '64px Bungee'; glow(g, b, x0 + wa, h / 2 + 4, '#7fd6ff', '#e8f8ff');
  });
  mesh(new THREE.PlaneGeometry(0.92, 0.176), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, color: new THREE.Color(0.85, 0.85, 0.85) }), 0, 0, 0, creditos);
}

/* ---------- animación ---------- */
export function actualizarRocola(dt) {
  botones.forEach((bg) => {
    const u = bg.userData;
    u.hs += ((u.k === E.hovered ? 1.05 : 1) - u.hs) * (1 - Math.exp(-dt * 9));
    u.press *= Math.exp(-dt * 7);
    bg.scale.setScalar(u.hs);
    bg.position.z = 0.25 - u.press * 0.03;
  });
  if (!reduce) disco.rotation.z -= dt * (E.soundOn ? 3.4 : 0.6);
}
