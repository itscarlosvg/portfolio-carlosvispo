// Contacto: la moto de delivery. Se abre la caja, sube la bolsa y el ticket trae la presentación y las redes.
import * as THREE from 'three';
import { scene } from '../core/motor.js';
import { C } from '../config.js';
import { E } from '../estado.js';
import { std, neon, mesh, box, cyl, tex, glow, wrapText, polyTube, roundRect, easeInOut } from '../core/utilidades.js';
import { acero } from '../escena/carrito.js';
import { NOMBRE, PUESTO, SOBRE_MI, REDES } from '../datos/perfil.js';

/* ---------- ticket ---------- */
const RW = 600, RH = 1080;
const lienzo = document.createElement('canvas');
lienzo.width = RW; lienzo.height = RH;
const rg = lienzo.getContext('2d');
const ticketTex = new THREE.CanvasTexture(lienzo);
ticketTex.colorSpace = THREE.SRGBColorSpace;
ticketTex.anisotropy = 8;

const ICONO_W = 230, ICONO_H = 160;
const ICONO_X = [60, 310];
let iconosY = 592; // se recalcula según lo largo que sea el texto

const GITHUB = new Path2D('M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z');

function pintarTicket() {
  const g = rg;
  g.clearRect(0, 0, RW, RH);
  // papel con borde dentado
  g.fillStyle = '#f7f4ee'; g.beginPath(); g.moveTo(0, 16);
  for (let x = 0; x <= RW; x += 25) g.lineTo(x, (x / 25) % 2 ? 2 : 16);
  g.lineTo(RW, RH - 16);
  for (let x = RW; x >= 0; x -= 25) g.lineTo(x, (x / 25) % 2 ? RH - 2 : RH - 16);
  g.closePath(); g.fill();
  const linea = (y) => { g.save(); g.setLineDash([10, 8]); g.strokeStyle = '#b9b0c4'; g.lineWidth = 2; g.beginPath(); g.moveTo(30, y); g.lineTo(RW - 30, y); g.stroke(); g.restore(); };

  g.fillStyle = '#1b1622'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '46px Bungee'; g.fillText('PEDIDO #001', RW / 2, 84);
  g.font = '700 24px "Space Mono"'; g.fillText(`${NOMBRE} · ${PUESTO.split(' ').pop()}`.toUpperCase(), RW / 2, 134);
  linea(172);

  g.textAlign = 'left'; g.font = '700 22px "Space Mono"'; g.fillStyle = '#8a7f98'; g.fillText('SOBRE MÍ', 44, 212);
  g.font = '600 26px "Bricolage Grotesque"'; g.fillStyle = '#1b1622';
  const yFin = wrapText(g, SOBRE_MI, 44, 252, RW - 88, 35);
  linea(yFin + 2);

  g.font = '700 22px "Space Mono"'; g.fillStyle = '#8a7f98'; g.fillText('REDES', 44, yFin + 38);
  iconosY = yFin + 60;
  REDES.forEach((r, i) => {
    const x = ICONO_X[i], y = iconosY, cx = x + ICONO_W / 2, cy = y + 68;
    g.fillStyle = 'rgba(27,22,34,.05)'; g.beginPath(); g.roundRect(x, y, ICONO_W, ICONO_H, 18); g.fill();
    if (r.id === 'in') {
      g.fillStyle = '#0a66c2'; g.beginPath(); g.roundRect(cx - 42, cy - 42, 84, 84, 16); g.fill();
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 54px "Bricolage Grotesque"'; g.fillText('in', cx + 2, cy + 2);
    } else {
      g.save(); g.translate(cx - 42, cy - 42); g.scale(84 / 16, 84 / 16); g.fillStyle = '#1b1622'; g.fill(GITHUB); g.restore();
    }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 20px "Space Mono"'; g.fillStyle = '#8a7f98';
    g.fillText(r.label.toUpperCase(), cx, y + 138);
  });

  const yb = iconosY + ICONO_H + 26;
  linea(yb);
  g.textAlign = 'center'; g.fillStyle = '#1b1622'; g.font = '30px Bungee'; g.fillText('¡GRACIAS POR SU PEDIDO!', RW / 2, yb + 48);
  for (let x = 96; x < RW - 96;) {
    const r = Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1, w = 2 + Math.floor(r * 6);
    g.fillRect(x, yb + 80, w, 64);
    x += w + 3 + (w % 3) * 2;
  }
  g.font = '700 20px "Space Mono"'; g.fillStyle = '#8a7f98'; g.fillText('★ ★ ★ ★ ★ ★ ★', RW / 2, yb + 176);
  ticketTex.needsUpdate = true;
}
pintarTicket();

/* ---------- moto ---------- */
export const moto = new THREE.Group();
moto.position.set(-3.35, 0, 4.5);
moto.rotation.y = 0.55;
scene.add(moto);

export let caja;
let ticket, tapaPiv, bolsa, tapaT = 0, bolT = 0;
{
  const neg = std('#151219', 0.4, 0.5), roj = std('#c8162b', 0.35, 0.3);
  for (const x of [-0.62, 0.62]) {
    mesh(new THREE.TorusGeometry(0.27, 0.07, 10, 28), std('#0d0c10', 0.85), x, 0.34, 0, moto);
    cyl(0.12, 0.12, 0.05, acero, x, 0.34, 0, moto, 16).rotation.x = Math.PI / 2;
  }
  box(0.95, 0.22, 0.22, neg, -0.05, 0.6, 0, moto);
  box(0.42, 0.2, 0.3, roj, 0.22, 0.78, 0, moto);
  box(0.55, 0.08, 0.28, std('#0b0a0e', 0.8), -0.24, 0.8, 0, moto);
  cyl(0.025, 0.025, 0.78, acero, 0.55, 0.7, 0, moto, 8).rotation.z = 0.42;
  cyl(0.018, 0.018, 0.62, acero, 0.4, 1.05, 0, moto, 8).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.07, 14, 10), neon('#fff1d6', 4), 0.5, 0.95, 0, moto);
  box(0.04, 0.05, 0.14, neon(C.rojo, 3), -0.6, 0.78, 0, moto);

  // caja de delivery con tapa
  caja = new THREE.Group(); caja.position.set(-0.5, 1.08, 0); moto.add(caja);
  const cm = std('#1a1426', 0.5), cin = std('#0b0810', 0.85);
  box(0.5, 0.02, 0.44, cin, 0, -0.2, 0, caja);
  box(0.5, 0.42, 0.02, cm, 0, 0, 0.21, caja);
  box(0.5, 0.42, 0.02, cm, 0, 0, -0.21, caja);
  box(0.02, 0.42, 0.44, cm, -0.24, 0, 0, caja);
  box(0.02, 0.42, 0.44, cm, 0.24, 0, 0, caja);
  tapaPiv = new THREE.Group(); tapaPiv.position.set(0, 0.21, -0.22); caja.add(tapaPiv);
  box(0.52, 0.03, 0.46, cm, 0, 0.015, 0.23, tapaPiv);
  box(0.12, 0.012, 0.03, std('#c9ccd8', 0.3, 0.9), 0, 0.036, 0.4, tapaPiv);

  // bolsa del pedido con el ticket pegado
  bolsa = new THREE.Group(); bolsa.position.set(0, -0.03, 0); caja.add(bolsa);
  box(0.3, 0.36, 0.2, std('#b98b58', 0.9), 0, 0, 0, bolsa);
  box(0.3, 0.07, 0.022, std('#a77a4b', 0.9), 0, 0.2, 0, bolsa).rotation.x = 0.25;
  ticket = mesh(new THREE.PlaneGeometry(0.13, 0.234), new THREE.MeshBasicMaterial({ map: ticketTex, transparent: true, alphaTest: 0.5, color: new THREE.Color(0.93, 0.93, 0.93) }), 0, 0.02, 0.1015, bolsa);
  box(0.06, 0.016, 0.003, std('#efe7c9', 0.35, 0, { transparent: true, opacity: 0.8 }), 0, 0.133, 0.104, bolsa);

  // rótulo DELIVERY a los dos lados
  const t = tex(512, 420, (g, w) => {
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '86px Bungee';
    glow(g, 'DELI', w / 2, 140, C.rojo, '#ffd7dc'); glow(g, 'VERY', w / 2, 250, C.rojo, '#ffd7dc');
    g.font = '700 34px "Space Mono"'; glow(g, '★ 24/7 ★', w / 2, 345, C.amarillo, '#fff6d0');
  });
  const tm = new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthWrite: false });
  for (const s of [-1, 1]) { const p = mesh(new THREE.PlaneGeometry(0.46, 0.38), tm, 0, 0, s * 0.222, caja); if (s < 0) p.rotation.y = Math.PI; }
  const borde = polyTube(roundRect(0.48, 0.4, 0.04), 0.008, neon(C.rojo, 3)); borde.position.z = 0.224; caja.add(borde);

  moto.rotation.z = 0.05;
  const pl = new THREE.PointLight(C.rojo, 4, 4, 2); pl.position.set(-0.5, 1.1, 0.6); moto.add(pl);
}

/** true cuando la bolsa ya salió de la caja. */
export const bolsaLista = () => bolT >= 1;

/** Zona táctil del ticket: los iconos de las redes. */
export const pantallaContacto = {
  get m() { return ticket; },
  face: null,
  state: 'contacto',
  cw: RW, ch: RH,
  ready: () => bolT > 0.97 && E.fase === 2,
  get regions() {
    return REDES.map((r, i) => ({ x: ICONO_X[i], y: iconosY, w: ICONO_W, h: ICONO_H, id: r.id, href: r.href, label: r.label }));
  },
  toLocal: (px, py, v) => v.set((px / RW - 0.5) * 0.13, (0.5 - py / RH) * 0.234, 0.002),
  tap() { /* los enlaces se abren con la capa HTML que se coloca encima */ },
};

/** llego: la cámara ya está en el plano medio. */
export function actualizarContacto(dt, llego) {
  const on = E.state === 'contacto' && (E.fase === 2 || llego);
  tapaT = THREE.MathUtils.clamp(tapaT + ((on || bolT > 0.25) ? dt / 0.7 : -dt / 0.5), 0, 1);
  bolT = THREE.MathUtils.clamp(bolT + ((on && tapaT > 0.7) ? dt / 0.9 : -dt / 0.5), 0, 1);
  tapaPiv.rotation.x = -1.95 * easeInOut(tapaT);
  bolsa.position.y = THREE.MathUtils.lerp(-0.03, 0.3, easeInOut(bolT));
}
