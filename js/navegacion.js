// Secciones: a dónde va la cámara en cada una, cómo se entra y cómo se sale.
import * as THREE from 'three';
import { canvas, camera } from './core/motor.js';
import { $, C, S } from './config.js';
import { E } from './estado.js';
import { mesh } from './core/utilidades.js';
import { cam, goal, controls, homePose, pose, takeOver, flyTo } from './core/camara.js';
import { blip } from './audio.js';
import { SALSAS } from './datos/habilidades.js';
import { salsas, botellas, gotaMat } from './escena/carrito.js';
import { cornetas } from './escena/decorado.js';
import { rocola, botones } from './escena/rocola.js';
import { pizarra, pizFront, goPiz } from './secciones/proyectos.js';
import { mesa, fichaPiv, fichaLista } from './secciones/sobreMi.js';
import { moto, caja, bolsaLista } from './secciones/contacto.js';
import { spawnChips, killChips } from './secciones/habilidades.js';

const tagEl = $('#tag');
const volver = $('#back2');

/**
 * Objetos interactivos.
 * pose/medio: funciones que devuelven { pos, tgt }. medio = plano medio antes del primer plano.
 * tgt/pos: puntos fijos. ring: [x, z, radio] del anillo en el suelo.
 */
export const HOT = {
  proyectos: {
    root: pizarra, color: C.rosa, label: 'Proyectos', anchor: [-0.7, 1.62, 1.75], ring: [-0.7, 1.75, 0.6],
    pose: () => pose(pizFront, [0, 0, 0], 1.75),
  },
  servicios: {
    root: salsas, color: C.amarillo, label: 'Habilidades', anchor: [0.8, 2.15, 0.06],
    tgt: [0.8, 2.15, 0.1], pos: [0.9, 2.35, 1.8],
  },
  sobre: {
    root: mesa, color: C.azul, label: 'Sobre mí', anchor: [2.95, 1.35, 1.45], ring: [2.95, 1.45, 0.95],
    pose: () => {
      fichaPiv.updateWorldMatrix(true, false);
      const tgt = fichaPiv.localToWorld(new THREE.Vector3(0, 0.006, 0));
      return { tgt, pos: tgt.clone().add(new THREE.Vector3(0, 0.148, 0.063)) };
    },
    medio: () => {
      fichaPiv.updateWorldMatrix(true, false);
      const tgt = fichaPiv.localToWorld(new THREE.Vector3(0, 0.03, -0.05)), f = E.portrait ? 1.35 : 1;
      return { tgt, pos: tgt.clone().add(new THREE.Vector3(0.05, 0.62 * f, 0.62 * f)) };
    },
  },
  contacto: {
    root: moto, color: C.rojo, label: 'Contacto', anchor: [-3.35, 1.75, 4.5], ring: [-3.35, 4.5, 0.95],
    pose: () => pose(caja, [0, 0.32, 0.1], 0.43, 0.04, false),
    medio: () => pose(caja, [0, 0.12, 0], 1.7, 0.75),
  },
  sonido: {
    root: cornetas, color: C.azul, label: 'Sonido', anchor: [1.9, 1.2, 1.0], ring: [1.9, 1.0, 0.42],
  },
  rocola: {
    root: rocola, color: C.rosa, label: 'Rocola', anchor: [-2.75, 2.45, 0.85], ring: [-2.75, 0.85, 0.78],
    tgt: [-2.75, 1.02, 0.85], pos: [-1.86, 1.32, 3.29],
  },
};

/* ---------- anillos de neón en el suelo ---------- */
const anillos = [];
for (const [k, h] of Object.entries(HOT)) {
  h.root.traverse((o) => { if (!o.userData.boton) o.userData.hot = k; });
  h.root.userData.base = h.root.scale.x;
  h.hs = 1;
  if (h.ring) {
    const [x, z, r] = h.ring;
    const m = mesh(new THREE.RingGeometry(r * 0.9, r, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(h.color).multiplyScalar(1.1), transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }), x, (x < -3 && z > 3 ? 0 : S) + 0.035, z);
    m.rotation.x = -Math.PI / 2; m.userData.k = k;
    anillos.push(m);
  }
}
{ // halo sobre el mostrador para las salsas
  const m = mesh(new THREE.RingGeometry(0.54, 0.57, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.amarillo).multiplyScalar(1.1), transparent: true, opacity: 0.6, toneMapped: false, depthWrite: false }), 0.8, S + 1.415, 0.06);
  m.rotation.x = -Math.PI / 2; m.scale.set(1, 0.38, 1); m.userData.k = 'servicios';
  anillos.push(m);
}

export const hotRoots = [...Object.values(HOT).map((h) => h.root), ...botones];

/* ---------- hover ---------- */
export function setHover(h) {
  const k = h ? h.k : null;
  canvas.style.cursor = k ? 'pointer' : '';
  E.hoverSalsa = h && h.salsa != null ? h.salsa : null;
  if (k && !h.boton && !HOT[E.state] && E.hoverSalsa == null) {
    tagEl.textContent = HOT[k].label;
    tagEl.style.setProperty('--c', HOT[k].color);
    tagEl.classList.add('show');
  } else tagEl.classList.remove('show');
  E.hovered = k;
}

/* ---------- entrar y salir ---------- */
export function open(k) {
  const h = HOT[k];
  if (!h || !(h.tgt || h.pose)) return;
  if (E.state === 'free') E.saved = { pos: camera.position.clone(), tgt: controls.target.clone() };
  const prev = E.state;
  takeOver();
  E.state = k; E.speed = 1.9;
  E.fase = h.medio ? 1 : 2; E.faseT = 0;

  if (h.pose) { const ps = (h.medio || h.pose)(); goal.pos.copy(ps.pos); goal.tgt.copy(ps.tgt); }
  else {
    const f = E.portrait ? 1.5 : 1;
    goal.tgt.set(...h.tgt);
    goal.pos.set(...h.pos).sub(goal.tgt).multiplyScalar(f).add(goal.tgt);
  }

  E.pendingGoal = null;
  if (prev === 'rocola' && k !== 'rocola') {
    // desde la rocola, primero se aleja para que se vea a dónde va
    E.pendingGoal = { pos: goal.pos.clone(), tgt: goal.tgt.clone() };
    const hp = homePose();
    goal.pos.copy(hp.pos).lerp(hp.tgt, 0.12);
    goal.tgt.copy(hp.tgt).lerp(E.pendingGoal.tgt, 0.35);
    E.speed = 2.2;
  }
  if (prev !== k) {
    E.selSalsa = -1; killChips();
    if (k === 'proyectos') goPiz('lista', true);
  }
  volver.style.setProperty('--c', h.color);
  volver.classList.add('show');
  document.querySelectorAll('[data-go]').forEach((b) => b.classList.toggle('on', b.dataset.go === k));
  setHover(null);
  blip(660);
}

export function close() {
  if (!HOT[E.state]) return;
  E.selSalsa = -1; killChips();
  volver.classList.remove('show');
  flyTo(E.saved || homePose(), 1.8);
  document.querySelectorAll('[data-go]').forEach((b) => b.classList.remove('on'));
  blip(440);
}

export function showSalsa(i) {
  if (E.state !== 'servicios') open('servicios');
  E.selSalsa = i;
  E.squirtEnd = E.t + 2.4;
  gotaMat.color.set(SALSAS[i].color);
  spawnChips(i);
  blip(520 + i * 60);
}

document.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) open(g.dataset.go); });
volver.addEventListener('click', close);
$('#home').addEventListener('click', () => {
  if (HOT[E.state]) close();
  else if (E.state === 'free' || E.state === 'fly') { E.saved = null; flyTo(homePose(), 1.6); }
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

/* ---------- animación ---------- */
const tmp = new THREE.Vector3();
export function actualizarNavegacion(dt, t) {
  // plano medio → primer plano cuando termina la animación
  if (E.fase === 1 && HOT[E.state]) {
    const listo = (E.state === 'sobre' && fichaLista()) || (E.state === 'contacto' && bolsaLista());
    E.faseT = listo ? E.faseT + dt : 0;
    if (E.faseT > 0.45) {
      E.fase = 2;
      const ps = HOT[E.state].pose();
      goal.pos.copy(ps.pos); goal.tgt.copy(ps.tgt);
      E.speed = 1.5;
    }
  }

  anillos.forEach((m, i) => {
    const on = m.userData.k === E.hovered, s = 1 + Math.sin(t * 2.4 + i) * 0.06 + (on ? 0.1 : 0);
    m.scale.x = s;
    if (m.userData.k !== 'servicios') m.scale.y = s;
    m.material.opacity = HOT[E.state] ? 0.12 : (on ? 0.95 : 0.5);
  });

  for (const [k, h] of Object.entries(HOT)) {
    h.hs += ((k === E.hovered ? 1.035 : 1) - h.hs) * (1 - Math.exp(-dt * 7));
    h.root.scale.setScalar(h.root.userData.base * h.hs);
  }

  if (E.hovered) {
    if (E.hoverSalsa != null) { tmp.set(0, 0.48, 0); botellas[E.hoverSalsa].piv.localToWorld(tmp); }
    else tmp.set(...HOT[E.hovered].anchor);
    tmp.project(camera);
    tagEl.style.left = ((tmp.x + 1) / 2 * innerWidth) + 'px';
    tagEl.style.top = ((1 - tmp.y) / 2 * innerHeight) + 'px';
  }
}

/** La cámara ya está en su punto de destino (sin escalas pendientes). */
export const camaraLlego = () => !E.pendingGoal && cam.pos.distanceTo(goal.pos) < 0.35;
