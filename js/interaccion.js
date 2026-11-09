// Ratón y toque: hover, clics sobre objetos y zonas táctiles dentro de la escena.
import * as THREE from 'three';
import { canvas, camera } from './core/motor.js';
import { isTouch } from './config.js';
import { E, mouse } from './estado.js';
import { toggleSound } from './audio.js';
import { botones } from './escena/rocola.js';
import { pantallaProyectos } from './secciones/proyectos.js';
import { pantallaContacto } from './secciones/contacto.js';
import { killChips } from './secciones/habilidades.js';
import { HOT, hotRoots, open, close, showSalsa, setHover } from './navegacion.js';

const pantallas = [pantallaProyectos, pantallaContacto];
const enlaces = [...document.querySelectorAll('#links a')];
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), tmp = new THREE.Vector3();

function setRay(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
}

/** Objeto interactivo bajo el puntero. */
function pick(cx, cy) {
  setRay(cx, cy);
  const hits = ray.intersectObjects(hotRoots, true);
  if (!hits.length) return null;
  let hit = hits[0];
  if (hit.object.userData.hot === 'servicios') { const b = hits.find((x) => x.object.userData.salsa != null); if (b) hit = b; }
  const u = hit.object.userData;
  return { k: u.hot, boton: !!u.boton, salsa: u.salsa ?? null };
}

/** Zona táctil de una pantalla de la escena (pizarra o ticket) bajo el puntero. */
function screenHit(cx, cy) {
  const activas = pantallas.filter((p) => p.state === E.state && p.ready());
  if (!activas.length) return null;
  setRay(cx, cy);
  for (const hit of ray.intersectObjects(activas.map((p) => p.m), false)) {
    const p = activas.find((q) => q.m === hit.object);
    if (p.face != null && hit.face.materialIndex !== p.face) continue;
    const px = hit.uv.x * p.cw, py = (1 - hit.uv.y) * p.ch;
    return { p, r: p.regions.find((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) || null };
  }
  return null;
}

/** Coloca enlaces HTML transparentes sobre los botones de enlace dibujados en la escena. */
export function actualizarEnlaces() {
  let n = 0;
  for (const p of pantallas) {
    if (p.state !== E.state || !p.ready()) continue;
    for (const r of p.regions) {
      if (!r.href || n >= enlaces.length) continue;
      const a = enlaces[n++];
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const [px, py] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) {
        p.toLocal(px, py, tmp); p.m.localToWorld(tmp); tmp.project(camera);
        const sx = (tmp.x + 1) / 2 * innerWidth, sy = (1 - tmp.y) / 2 * innerHeight;
        x0 = Math.min(x0, sx); y0 = Math.min(y0, sy); x1 = Math.max(x1, sx); y1 = Math.max(y1, sy);
      }
      if (a.getAttribute('href') !== r.href) a.href = r.href;
      a.setAttribute('aria-label', r.label || 'Abrir');
      Object.assign(a.style, { left: x0 + 'px', top: y0 + 'px', width: (x1 - x0) + 'px', height: (y1 - y0) + 'px' });
      a.hidden = false;
    }
  }
  for (; n < enlaces.length; n++) enlaces[n].hidden = true;
}

/* ---------- eventos ---------- */
let down = null;

canvas.addEventListener('pointerdown', (e) => {
  if (e.isPrimary) down = { x: e.clientX, y: e.clientY, moved: false, multi: false };
  else if (down) down.multi = true;
});

canvas.addEventListener('pointermove', (e) => {
  mouse.x = e.clientX / innerWidth * 2 - 1;
  mouse.y = e.clientY / innerHeight * 2 - 1;
  if (down && e.isPrimary && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) down.moved = true;
  if (isTouch || down) return;
  const sh = screenHit(e.clientX, e.clientY);
  if (sh) { setHover(null); canvas.style.cursor = sh.r ? 'pointer' : ''; }
  else if (['free', 'fly', 'servicios', 'rocola'].includes(E.state)) setHover(pick(e.clientX, e.clientY));
  else canvas.style.cursor = '';
});

canvas.addEventListener('pointerup', (e) => {
  if (!e.isPrimary || !down) return;
  const d = down; down = null;
  if (d.moved || d.multi || E.state === 'intro') return;

  const sh = screenHit(e.clientX, e.clientY);
  if (sh) { if (sh.r) sh.p.tap(sh.r); return; }

  const h = pick(e.clientX, e.clientY);
  if (h && h.k === 'sonido') { toggleSound(); return; }
  if (h) {
    if (h.boton) {
      // fuera de la rocola, tocarla primero acerca la cámara
      if (E.state === 'free' || E.state === 'fly') { open('rocola'); return; }
      const b = botones.find((x) => x.userData.k === h.k);
      if (b) b.userData.press = 1;
      setTimeout(() => open(h.k), 170);
      return;
    }
    if (h.salsa != null) { showSalsa(h.salsa); return; }
    if (h.k !== E.state) open(h.k);
    return;
  }
  // tocar fuera: recoger las burbujas o salir de la sección
  if (E.state === 'servicios' && E.selSalsa >= 0) { E.selSalsa = -1; killChips(); return; }
  if (HOT[E.state]) close();
});

canvas.addEventListener('pointercancel', () => { down = null; });
canvas.addEventListener('pointerleave', () => { if (!isTouch) setHover(null); });
