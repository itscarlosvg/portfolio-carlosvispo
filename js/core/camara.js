// Cámara: órbita libre alrededor del carrito y vuelos suaves entre puntos de vista.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { canvas, renderer, camera, composer } from './motor.js';
import { isTouch } from '../config.js';
import { E, mouse } from '../estado.js';

const centro = new THREE.Vector3(0, 2.0, 0);

/** Posición actual animada (cam), punto intermedio suavizado (mid) y destino (goal). */
export const cam = { pos: new THREE.Vector3(9, 13, 30), tgt: new THREE.Vector3(0, 3, 0) };
export const goal = { pos: cam.pos.clone(), tgt: cam.tgt.clone() };
const mid = { pos: cam.pos.clone(), tgt: cam.tgt.clone() };

camera.position.copy(cam.pos);
camera.lookAt(cam.tgt);

export const controls = new OrbitControls(camera, canvas);
Object.assign(controls, {
  enableDamping: true, dampingFactor: 0.07,
  enablePan: false, zoomToCursor: false,
  rotateSpeed: 0.55, zoomSpeed: 0.8,
  minDistance: 4.5, maxDistance: 16,
  minPolarAngle: 0.45, maxPolarAngle: 1.45,
  enabled: false,
});
controls.target.copy(cam.tgt);

/** Vista general del puesto. */
export function homePose() {
  const r = 10.6 * (E.portrait ? 1.55 : 1), th = 0.12, ph = 1.46, t0 = centro.clone();
  if (E.portrait) t0.y = 2.3;
  return { tgt: t0, pos: new THREE.Vector3(Math.sin(ph) * Math.sin(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.cos(th) * r).add(t0) };
}

/** Vista frontal de un objeto: mira el punto c (local) desde dist a lo largo de su eje z. */
export function pose(obj, c, dist, lift = 0, escala = true) {
  obj.updateWorldMatrix(true, false);
  const tgt = obj.localToWorld(new THREE.Vector3(...c));
  const n = new THREE.Vector3(0, 0, 1).transformDirection(obj.matrixWorld);
  const pos = tgt.clone().addScaledVector(n, dist * (escala && E.portrait ? 1.5 : 1));
  pos.y += lift;
  return { pos, tgt };
}

/** La animación toma el control desde donde esté la cámara. */
export function takeOver() {
  if (E.state === 'free') {
    cam.pos.copy(camera.position); cam.tgt.copy(controls.target);
    mid.pos.copy(cam.pos); mid.tgt.copy(cam.tgt);
  }
  controls.enabled = false;
}

/** Devuelve el control al usuario. */
export function handOver() {
  E.state = 'free';
  camera.position.copy(cam.pos);
  camera.lookAt(cam.tgt);
  controls.target.copy(cam.tgt);
  controls.enabled = true;
  controls.update();
}

export function flyTo(destino, velocidad = 1.8) {
  E.pendingGoal = null;
  takeOver();
  goal.pos.copy(destino.pos); goal.tgt.copy(destino.tgt);
  E.state = 'fly';
  E.speed = velocidad;
}

// si el usuario toca mientras la cámara vuela, el control es suyo al instante
const tomar = () => { if (E.state === 'fly') handOver(); };
canvas.addEventListener('pointerdown', tomar, { capture: true });
canvas.addEventListener('wheel', tomar, { capture: true, passive: true });

export function resize() {
  const w = innerWidth, h = innerHeight;
  E.portrait = w / h < 0.85;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  controls.maxDistance = E.portrait ? 24 : 16;
  controls.minDistance = E.portrait ? 6 : 4.5;
}
addEventListener('resize', resize);
resize();

/** enFoco: la cámara está dentro de una sección. */
export function actualizarCamara(dt, enFoco) {
  const km = 1 - Math.exp(-dt * 2.2);
  mouse.sx += (mouse.x - mouse.sx) * km;
  mouse.sy += (mouse.y - mouse.sy) * km;

  if (E.state === 'free') {
    controls.update();
    controls.target.lerp(homePose().tgt, 1 - Math.exp(-dt * 3)); // el carrito siempre es el centro
  } else {
    if (E.state === 'intro') { goal.pos.set(9, 13, 30); goal.tgt.set(0, 3, 0); }
    if (E.pendingGoal && cam.pos.distanceTo(goal.pos) < 1.3) {
      goal.pos.copy(E.pendingGoal.pos); goal.tgt.copy(E.pendingGoal.tgt);
      E.pendingGoal = null; E.speed = 1.8;
    }
    // doble suavizado: arranca y frena sin tirones
    const k = 1 - Math.exp(-dt * E.speed), k2 = 1 - Math.exp(-dt * E.speed * 1.7);
    mid.pos.lerp(goal.pos, k); mid.tgt.lerp(goal.tgt, k);
    cam.pos.lerp(mid.pos, k2); cam.tgt.lerp(mid.tgt, k2);
    camera.position.copy(cam.pos);
    if (enFoco && !isTouch) {
      const pf = Math.min(1, cam.pos.distanceTo(cam.tgt) / 3);
      camera.position.x += mouse.sx * 0.08 * pf;
      camera.position.y -= mouse.sy * 0.05 * pf;
    }
    camera.lookAt(cam.tgt);
    if (E.state === 'fly' && cam.pos.distanceTo(goal.pos) < 0.12 && cam.tgt.distanceTo(goal.tgt) < 0.08) handOver();
  }
}
