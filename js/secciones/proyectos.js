// Proyectos: la pizarra del menú funciona como una pantalla con dos páginas (lista y ficha).
import * as THREE from 'three';
import { scene } from '../core/motor.js';
import { S } from '../config.js';
import { std, box, glow, wrapText, easeInOut } from '../core/utilidades.js';
import { PROYECTOS } from '../datos/proyectos.js';
import { blip } from '../audio.js';

/* ---------- ilustraciones de respaldo (mientras carga la captura) ---------- */
function palo(g, s, x, y, r, c) {
  g.save(); g.fillStyle = c; g.strokeStyle = c; g.lineWidth = r * 0.18; g.lineCap = 'round';
  if (s === 'O') { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x, y, r * 0.6, 0, 7); g.stroke(); }
  if (s === 'C') { g.beginPath(); g.moveTo(x - r, y - r * 0.8); g.lineTo(x + r, y - r * 0.8); g.lineTo(x + r * 0.45, y + r * 0.2); g.lineTo(x - r * 0.45, y + r * 0.2); g.closePath(); g.fill(); g.fillRect(x - r * 0.12, y + r * 0.2, r * 0.24, r * 0.6); g.fillRect(x - r * 0.5, y + r * 0.78, r, r * 0.2); }
  if (s === 'E') { g.beginPath(); g.moveTo(x, y - r * 1.2); g.lineTo(x, y + r * 0.9); g.stroke(); g.beginPath(); g.moveTo(x - r * 0.55, y + r * 0.45); g.lineTo(x + r * 0.55, y + r * 0.45); g.stroke(); }
  if (s === 'B') { g.lineWidth = r * 0.42; g.beginPath(); g.moveTo(x - r * 0.4, y + r); g.lineTo(x + r * 0.4, y - r); g.stroke(); g.beginPath(); g.arc(x + r * 0.42, y - r * 1.02, r * 0.3, 0, 7); g.fill(); }
  g.restore();
}

const ILUSTRACIONES = {
  trivilin(g, x, y, w, h) {
    const gr = g.createRadialGradient(x + w / 2, y + h * 0.6, 10, x + w / 2, y + h / 2, w * 0.7);
    gr.addColorStop(0, '#1a8a52'); gr.addColorStop(1, '#05301b');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    const ch = h * 0.6, cw = ch * 0.66, cx = x + w / 2, cy = y + h * 0.6;
    [['O', '#e8b30f', '1'], ['C', '#d0202e', '7'], ['E', '#2f6bff', '10'], ['B', '#2e9b4b', '12'], ['O', '#e8b30f', '3']].forEach(([s, c, n], k) => {
      g.save(); g.translate(cx, cy + ch * 0.9); g.rotate((k - 2) * 0.2); g.translate(0, -ch * 0.9);
      g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 12; g.fillStyle = '#fbf8f1';
      g.beginPath(); g.roundRect(-cw / 2, -ch / 2, cw, ch, cw * 0.1); g.fill(); g.shadowBlur = 0;
      g.strokeStyle = '#c9b98f'; g.lineWidth = 2; g.stroke();
      palo(g, s, 0, 0, cw * 0.2, c);
      g.fillStyle = c; g.font = `800 ${Math.round(cw * 0.2)}px "Bricolage Grotesque"`; g.textAlign = 'left'; g.textBaseline = 'top';
      g.fillText(n, -cw / 2 + cw * 0.08, -ch / 2 + cw * 0.06);
      g.restore();
    });
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${Math.round(h * 0.1)}px Bungee`;
    glow(g, 'RESKTA TRIVILÍN', x + w / 2, y + h * 0.13, '#ffd23f', '#fff6cf');
  },
  hotel(g, x, y, w, h) {
    const bh = h * 0.11;
    g.fillStyle = '#2a2440'; g.fillRect(x, y, w, bh);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(x + 22 + i * 22, y + bh / 2, 6, 0, 7); g.fill(); });
    const hy = y + bh, hh = h - bh;
    const sky = g.createLinearGradient(0, hy, 0, hy + hh * 0.62); sky.addColorStop(0, '#7fb6e0'); sky.addColorStop(1, '#f2d6a2');
    g.fillStyle = sky; g.fillRect(x, hy, w, hh);
    g.fillStyle = '#3c78ad'; g.fillRect(x, hy + hh * 0.6, w, hh * 0.14);
    g.fillStyle = '#3f8a4a'; g.fillRect(x, hy + hh * 0.72, w, hh * 0.28);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#ffffff';
    g.font = `800 ${Math.round(hh * 0.13)}px "Bricolage Grotesque"`;
    g.fillText('HOTEL', x + w * 0.06, hy + hh * 0.28); g.fillText('O CASTRO', x + w * 0.06, hy + hh * 0.42);
  },
};

/* ---------- capturas ---------- */
const fotos = PROYECTOS.map((p) => {
  const f = { img: null };
  const im = new Image();
  im.onload = () => { f.img = im; if (piz.p >= 1) renderPiz(1); };
  im.src = p.imagen;
  return f;
});

/* ---------- canvas de la pizarra ---------- */
const PW = 900, PH = 1260;
const lienzo = document.createElement('canvas');
lienzo.width = PW; lienzo.height = PH;
const pg = lienzo.getContext('2d');
const pizTex = new THREE.CanvasTexture(lienzo);
pizTex.colorSpace = THREE.SRGBColorSpace;
pizTex.anisotropy = 8;

// fondo de tiza (se pinta una vez)
const fondo = document.createElement('canvas');
fondo.width = PW; fondo.height = PH;
{
  const g = fondo.getContext('2d');
  g.fillStyle = '#16131c'; g.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`; g.fillRect(Math.random() * PW, Math.random() * PH, 3, 2); }
}

/** page: 'lista' o índice del proyecto. p: progreso de la transición (0 → 1). */
export const piz = { page: 'lista', from: null, p: 1, dir: 1, regions: [] };

function tarjeta(g, x, y, w, h) {
  g.save(); g.fillStyle = 'rgba(255,255,255,.05)'; g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 2;
  g.beginPath(); g.roundRect(x, y, w, h, 20); g.fill(); g.stroke(); g.restore();
}
function cubrir(g, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  g.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function foto(g, i, x, y, w, h) {
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 16); g.clip();
  if (fotos[i].img) cubrir(g, fotos[i].img, x, y, w, h);
  else ILUSTRACIONES[PROYECTOS[i].ilustracion](g, x, y, w, h);
  g.restore();
}

function pintarLista(g) {
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '96px Bungee';
  glow(g, 'MENÚ', PW / 2, 120, '#ffd23f', '#fff6cf');
  PROYECTOS.forEach((pr, i) => {
    const y = 240 + i * 250;
    tarjeta(g, 60, y, 780, 210);
    g.textAlign = 'left'; g.textBaseline = 'middle';
    let fs = 62; g.font = `800 ${fs}px "Bricolage Grotesque"`;
    while (g.measureText(pr.nombre).width > 600 && fs > 30) { fs -= 2; g.font = `800 ${fs}px "Bricolage Grotesque"`; }
    g.fillStyle = '#f7f2ff'; g.fillText(pr.nombre, 96, y + 86);
    g.font = '700 30px "Space Mono"'; g.fillStyle = '#9fb8ff'; g.fillText(pr.tipo.toUpperCase(), 98, y + 148);
    g.textAlign = 'right'; g.font = '90px Bungee'; glow(g, '›', 812, y + 108, '#ff2f7a', '#ffd9e8');
  });
}

function pintarFicha(g, i) {
  const pr = PROYECTOS[i];
  // fila superior: miniatura + captura
  tarjeta(g, 60, 60, 230, 360);
  foto(g, i, 76, 76, 198, 220);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = '#f7f2ff'; g.font = '800 30px "Bricolage Grotesque"';
  wrapText(g, pr.nombre, 80, 340, 190, 34);
  g.font = '700 20px "Space Mono"'; g.fillStyle = '#9fb8ff'; g.fillText(pr.tipo.toUpperCase(), 80, 404);
  tarjeta(g, 310, 60, 530, 360);
  foto(g, i, 326, 76, 498, 328);

  // cómo se hizo
  tarjeta(g, 60, 450, 780, 520);
  g.textBaseline = 'middle';
  let fs = 52; g.font = fs + 'px Bungee';
  while (g.measureText(pr.nombre).width > 560 && fs > 28) { fs -= 2; g.font = fs + 'px Bungee'; }
  glow(g, pr.nombre, 92, 516, '#ffd23f', '#fff6cf');
  g.font = '700 22px "Space Mono"';
  const st = pr.estado.toUpperCase(), tw = g.measureText(st).width + 32, col = pr.estado === 'Servido' ? '#7dffb0' : '#ffd23f';
  g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); g.roundRect(808 - tw, 494, tw, 44, 10); g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.fillText(st, 808 - tw / 2, 517);
  g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.font = '600 31px "Bricolage Grotesque"'; g.fillStyle = '#ece6f7';
  const yFin = wrapText(g, pr.descripcion, 92, 590, 716, 43);
  g.textBaseline = 'middle'; g.font = '700 22px "Space Mono"';
  const sw = g.measureText('SKILLS').width + 24, sy = Math.min(yFin + 26, 920);
  g.fillStyle = '#f7f2ff'; g.beginPath(); g.roundRect(92, sy - 20, sw, 40, 6); g.fill();
  g.fillStyle = '#16131c'; g.fillText('SKILLS', 104, sy + 1);
  g.fillStyle = '#c9bfe0'; g.font = '700 24px "Space Mono"';
  wrapText(g, pr.skills, 92 + sw + 16, sy + 1, 808 - (92 + sw + 16), 34);

  // botones
  tarjeta(g, 60, 1000, 370, 190);
  g.textAlign = 'left'; g.font = '40px Bungee'; g.fillStyle = '#f7f2ff'; g.fillText('VOLVER', 92, 1060);
  flechaBoton(g, 380, 1140, Math.PI, '#ff2f7a', '#16131c');
  g.save();
  const gr = g.createLinearGradient(0, 1000, 0, 1190); gr.addColorStop(0, '#ff2f7a'); gr.addColorStop(1, '#b0124d');
  g.fillStyle = gr; g.shadowColor = '#ff2f7a'; g.shadowBlur = 22; g.beginPath(); g.roundRect(450, 1000, 390, 190, 20); g.fill();
  g.restore();
  g.textAlign = 'left'; g.font = '40px Bungee'; g.fillStyle = '#ffffff'; g.fillText(pr.boton, 482, 1060);
  flechaBoton(g, 790, 1140, -Math.PI / 4, '#ffffff', '#c21658');
}

/** Círculo con flecha, igual en ambos botones; ang: dirección de la flecha. */
function flechaBoton(g, x, y, ang, fondoC, trazo) {
  g.save();
  g.fillStyle = fondoC; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill();
  g.translate(x, y); g.rotate(ang);
  g.strokeStyle = trazo; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.moveTo(2, -10); g.lineTo(12, 0); g.lineTo(2, 10); g.stroke();
  g.restore();
}

const pintarPagina = (g, page) => (page === 'lista' ? pintarLista(g) : pintarFicha(g, page));

/** Redibuja la pizarra. e: avance de la transición entre páginas (0 → 1). */
export function renderPiz(e) {
  pg.clearRect(0, 0, PW, PH);
  pg.drawImage(fondo, 0, 0);
  pg.save(); pg.beginPath(); pg.roundRect(28, 28, PW - 56, PH - 56, 22); pg.clip();
  if (piz.from != null && e < 1) {
    pg.save(); pg.translate(-piz.dir * e * PW, 0); pg.globalAlpha = 1 - e * 0.6; pintarPagina(pg, piz.from); pg.restore();
    pg.save(); pg.translate(piz.dir * (1 - e) * PW, 0); pintarPagina(pg, piz.page); pg.restore();
  } else pintarPagina(pg, piz.page);
  pg.restore();
  pg.save(); pg.strokeStyle = '#ff2f7a'; pg.shadowColor = '#ff2f7a'; pg.lineWidth = 6;
  for (const b of [26, 10]) { pg.shadowBlur = b; pg.beginPath(); pg.roundRect(22, 22, PW - 44, PH - 44, 26); pg.stroke(); }
  pg.restore();
  pizTex.needsUpdate = true;
}

/** Cambia de página con un deslizamiento (o al instante). */
export function goPiz(page, instant) {
  if (page === piz.page && !instant) return;
  piz.from = instant ? null : piz.page;
  piz.dir = page === 'lista' ? -1 : 1;
  piz.page = page;
  piz.p = instant ? 1 : 0;
  piz.regions = page === 'lista'
    ? PROYECTOS.map((_, i) => ({ x: 60, y: 240 + i * 250, w: 780, h: 210, id: i }))
    : [
      { x: 60, y: 1000, w: 370, h: 190, id: 'back' },
      { x: 450, y: 1000, w: 390, h: 190, id: 'link', href: PROYECTOS[page].href, label: PROYECTOS[page].boton },
    ];
  renderPiz(instant ? 1 : 0);
}

/* ---------- la pizarra en la escena ---------- */
export const pizarra = new THREE.Group();
pizarra.position.set(-0.7, S, 1.75);
pizarra.rotation.y = 0.1;
scene.add(pizarra);

export let pizFront;
{
  const madera = std('#5b3a24', 0.7);
  const tiza = new THREE.MeshBasicMaterial({ map: pizTex, color: new THREE.Color(0.84, 0.84, 0.84) });
  pizFront = box(0.8, 1.12, 0.04, [madera, madera, madera, madera, tiza, madera], 0, 0.56, 0.12, pizarra);
  pizFront.rotation.x = -0.17;
  box(0.8, 1.12, 0.04, madera, 0, 0.56, -0.12, pizarra).rotation.x = 0.17;
  goPiz('lista', true);
}

/** Zona táctil de la pizarra (cara delantera del tablero). */
export const pantallaProyectos = {
  get m() { return pizFront; },
  face: 4,
  state: 'proyectos',
  cw: PW, ch: PH,
  ready: () => piz.p >= 1,
  get regions() { return piz.regions; },
  toLocal: (px, py, v) => v.set((px / PW - 0.5) * 0.8, (0.5 - py / PH) * 1.12, 0.021),
  tap(r) {
    if (typeof r.id === 'number') { goPiz(r.id); blip(620); }
    else if (r.id === 'back') { goPiz('lista'); blip(480); }
  },
};

export function actualizarProyectos(dt) {
  if (piz.p < 1) { piz.p = Math.min(1, piz.p + dt / 0.45); renderPiz(easeInOut(piz.p)); }
}
