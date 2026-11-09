// Sobre mí: mesa de dominó con una ficha que se levanta y se da la vuelta.
import * as THREE from 'three';
import { scene } from '../core/motor.js';
import { C, S } from '../config.js';
import { E } from '../estado.js';
import { std, box, cyl, tex, wrapText, easeInOut, glowPool } from '../core/utilidades.js';
import { NOMBRE, PUESTO, RESUMEN, IDIOMAS, EXPERIENCIA, FORMACION } from '../datos/perfil.js';

export const mesa = new THREE.Group();
mesa.position.set(2.95, S, 1.45);
scene.add(mesa);

/* ---------- mesa, sillas y partida ---------- */
{
  const plast = std('#ece8f2', 0.55);
  cyl(0.5, 0.5, 0.04, plast, 0, 0.72, 0, mesa, 36);
  for (const x of [-0.28, 0.28]) for (const z of [-0.28, 0.28]) box(0.05, 0.7, 0.05, plast, x, 0.35, z, mesa);

  for (const a of [-0.25, -1.7, 3.4]) {
    const silla = new THREE.Group();
    silla.position.set(Math.cos(a) * 0.78, 0, Math.sin(a) * 0.78);
    silla.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    mesa.add(silla);
    box(0.44, 0.04, 0.42, plast, 0, 0.45, 0, silla);
    box(0.44, 0.42, 0.035, plast, 0, 0.7, -0.21, silla).rotation.x = -0.14;
    for (const x of [-0.19, 0.19]) for (const z of [-0.18, 0.18]) cyl(0.018, 0.022, 0.45, plast, x * 1.06, 0.225, z * 1.06, silla, 8);
    // fichas en la mano de cada jugador
    for (let k = 0; k < 4; k++) {
      const f = box(0.05, 0.1, 0.014, std('#f6f3ea', 0.35), 0, 0.79, 0, mesa);
      f.position.set(Math.cos(a) * 0.36 + Math.sin(a) * (k - 1.5) * 0.06, 0.79, Math.sin(a) * 0.36 - Math.cos(a) * (k - 1.5) * 0.06);
      f.rotation.y = silla.rotation.y;
    }
  }

  const PIPS = {
    0: [], 1: [[0.5, 0.5]], 2: [[0.25, 0.25], [0.75, 0.75]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.25, 0.2], [0.75, 0.2], [0.25, 0.5], [0.75, 0.5], [0.25, 0.8], [0.75, 0.8]],
  };
  const caraFicha = (a, b) => tex(64, 128, (g) => {
    g.fillStyle = '#f7f4ec'; g.fillRect(0, 0, 64, 128);
    g.fillStyle = '#18141f'; g.fillRect(8, 63, 48, 2);
    [[a, 0], [b, 64]].forEach(([n, oy]) => PIPS[n].forEach(([px, py]) => { g.beginPath(); g.arc(px * 64, oy + py * 64, 5.5, 0, 7); g.fill(); }));
  });
  const lado = std('#f6f3ea', 0.35);
  const cadena = [[6, 6], [6, 3], [3, 1], [1, 5], [5, 5], [5, 2], [2, 4], [4, 0], [0, 6]];
  let x = -0.4;
  cadena.forEach(([a, b], i) => {
    const doble = a === b;
    const f = box(0.05, 0.012, 0.1, [lado, lado, std('#ffffff', 0.35, 0, { map: caraFicha(a, b) }), lado, lado, lado], 0, 0.746, 0, mesa);
    if (doble) { f.position.x = x + 0.025; x += 0.055; } else { f.rotation.y = Math.PI / 2; f.position.x = x + 0.05; x += 0.102; }
    f.position.z = 0.02 + Math.sin(i) * 0.01;
  });

  for (const [bx, bz] of [[0.3, 0.26], [-0.28, -0.22]]) {
    cyl(0.03, 0.03, 0.16, std('#3a1f0a', 0.15, 0.1, { transparent: true, opacity: 0.9 }), bx, 0.82, bz, mesa, 14);
    cyl(0.01, 0.028, 0.06, std('#3a1f0a', 0.15), bx, 0.93, bz, mesa, 12);
  }
  glowPool(C.azul, 2.6, 2.95, 1.45, 0.18);
}

/* ---------- la ficha con mi información ---------- */
export let fichaPiv;
let fichaMesh, fichaT = 0;
{
  const cara = tex(800, 1600, (g, w) => {
    g.fillStyle = '#f4efe3'; g.fillRect(0, 0, w, 1600);
    [['#ff2f7a', 80], ['#ffd23f', 140], ['#4d86ff', 200]].forEach(([c, x]) => { g.fillStyle = c; g.beginPath(); g.arc(w - x, 86, 20, 0, 7); g.fill(); });
    g.fillStyle = '#1b1622'; g.fillRect(60, 798, w - 120, 6);
    g.fillStyle = '#b8a97f'; g.beginPath(); g.arc(w / 2, 801, 16, 0, 7); g.fill();

    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    const [nombre, apellido] = NOMBRE.toUpperCase().split(' ');
    g.fillStyle = '#1b1622'; g.font = '120px Bungee'; g.fillText(nombre, 64, 240); g.fillText(apellido, 64, 360);
    g.font = '800 46px "Bricolage Grotesque"'; g.fillStyle = '#e3256b'; g.fillText(PUESTO, 66, 440);
    g.font = '600 36px "Bricolage Grotesque"'; g.fillStyle = '#3a3346'; wrapText(g, RESUMEN, 66, 510, w - 132, 48);
    g.font = '700 24px "Space Mono"'; g.fillStyle = '#8a7f98'; g.fillText('IDIOMAS', 66, 668);
    g.font = '700 34px "Bricolage Grotesque"'; g.fillStyle = '#1b1622'; g.fillText(IDIOMAS, 66, 716);

    const seccion = (titulo, y0, filas) => {
      g.font = '700 24px "Space Mono"'; g.fillStyle = '#8a7f98'; g.fillText(titulo, 66, y0);
      filas.forEach(([a, b, c], i) => {
        const yy = y0 + 72 + i * 110;
        g.font = '700 28px "Space Mono"'; g.fillStyle = '#4d86ff'; g.fillText(a, 66, yy);
        g.font = '800 38px "Bricolage Grotesque"'; g.fillStyle = '#1b1622'; g.fillText(b, 250, yy);
        g.font = '600 28px "Bricolage Grotesque"'; g.fillStyle = '#6a6078'; g.fillText(c, 250, yy + 40);
      });
    };
    seccion('EXPERIENCIA', 900, EXPERIENCIA);
    seccion('FORMACIÓN', 1290, FORMACION);
  });
  const lado = std('#efe9db', 0.4);
  const frente = std('#ffffff', 0.55, 0, { map: cara, emissive: '#ffffff', emissiveMap: cara, emissiveIntensity: 0.38 });
  fichaPiv = new THREE.Group(); fichaPiv.position.set(0.04, 0.752, 0.22); fichaPiv.rotation.y = -0.06; mesa.add(fichaPiv);
  fichaMesh = box(0.05, 0.012, 0.1, [lado, lado, frente, lado, lado, lado], 0, 0, 0, fichaPiv);
  fichaMesh.rotation.z = Math.PI; // empieza boca abajo
}

/** true cuando la ficha ya terminó de darse la vuelta. */
export const fichaLista = () => fichaT >= 1;

/** llego: la cámara ya está en el plano medio. */
export function actualizarSobreMi(dt, llego) {
  const on = E.state === 'sobre' && (E.fase === 2 || llego);
  fichaT = THREE.MathUtils.clamp(fichaT + (on ? dt / 1.1 : -dt / 0.5), 0, 1);
  const e = easeInOut(fichaT);
  fichaMesh.rotation.z = Math.PI * (1 - e);
  fichaPiv.position.y = 0.752 + Math.sin(Math.PI * e) * 0.035;
}
