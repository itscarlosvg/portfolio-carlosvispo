// Habilidades: la botella se aprieta, echa salsa y sus tecnologías salen flotando.
import * as THREE from 'three';
import { scene, camera } from '../core/motor.js';
import { S, reduce } from '../config.js';
import { E } from '../estado.js';
import { SALSAS } from '../datos/habilidades.js';
import { salsas, botellas, gotas } from '../escena/carrito.js';

/* ---------- burbujas ---------- */
const burbujas = [];

function texturaBurbuja(texto, color) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const font = '700 44px "Space Mono"';
  g.font = font;
  const H = 88, W = Math.ceil(g.measureText(texto).width + 64);
  c.width = W; c.height = H; g.font = font;
  g.fillStyle = 'rgba(14,9,28,.9)'; g.beginPath(); g.roundRect(5, 5, W - 10, H - 10, (H - 10) / 2); g.fill();
  g.save(); g.strokeStyle = color; g.shadowColor = color; g.shadowBlur = 12; g.lineWidth = 4; g.stroke(); g.restore();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(texto, W / 2, H / 2 + 2);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return { tx, asp: W / H };
}

export function killChips() {
  burbujas.forEach((b) => { if (!b.dying) { b.dying = true; b.dieT = E.t; } });
}

/** Crea las burbujas de una salsa, colocadas en filas justo encima de las botellas. */
export function spawnChips(i) {
  killChips();
  const sa = SALSAS[i], piv = botellas[i].piv;
  piv.updateWorldMatrix(true, false);
  const inicio = piv.localToWorld(new THREE.Vector3(0, 0.46, 0));
  const sc = innerHeight / innerWidth, hN = E.portrait ? 0.066 : 0.062, gap = 0.03, maxW = 1.8;

  const nuevas = sa.items.map((texto, j) => {
    const { tx, asp } = texturaBurbuja(texto, sa.color);
    const mat = new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92), opacity: 0 });
    const spr = new THREE.Sprite(mat);
    spr.renderOrder = 20; spr.scale.set(0.001, 0.001, 1);
    scene.add(spr);
    return { spr, mat, asp, hN, inicio: inicio.clone(), born: E.t, delay: 0.45 + j * 0.17, dying: false, ox: 0, oy: 0, j };
  });

  // filas de abajo hacia arriba
  let y = 0, fila = [], filaW = 0;
  const cerrarFila = () => {
    let x = -filaW / 2;
    fila.forEach((b) => { const w = b.hN * b.asp * sc; b.ox = x + w / 2; b.oy = y + hN / 2; x += w + gap; });
    y += hN + 0.028; fila = []; filaW = 0;
  };
  nuevas.forEach((b) => {
    const w = b.hN * b.asp * sc;
    if (fila.length && filaW + gap + w > maxW) cerrarFila();
    filaW += (fila.length ? gap : 0) + w;
    fila.push(b);
  });
  if (fila.length) cerrarFila();
  burbujas.push(...nuevas);
}

const vN = new THREE.Vector3(), vF = new THREE.Vector3(), vS = new THREE.Vector3(), vA = new THREE.Vector3();
function actualizarBurbujas() {
  if (!burbujas.length) return;
  camera.updateMatrixWorld(); camera.getWorldDirection(vF);
  salsas.updateWorldMatrix(true, false); vA.set(0, 0.5, 0); salsas.localToWorld(vA);
  const D = Math.max(0.3, vS.copy(vA).sub(camera.position).dot(vF) * 0.85);
  vN.copy(vA).project(camera);
  const bx = THREE.MathUtils.clamp(vN.x, -0.3, 0.3), by = vN.y + 0.04;
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), now = E.t;

  for (let j = burbujas.length - 1; j >= 0; j--) {
    const b = burbujas[j];
    if (b.dying) {
      const f = 1 - (now - b.dieT) / 0.35;
      if (f <= 0) { scene.remove(b.spr); b.mat.map.dispose(); b.mat.dispose(); burbujas.splice(j, 1); continue; }
      b.mat.opacity = Math.min(b.mat.opacity, f);
      continue;
    }
    const pr = THREE.MathUtils.clamp((now - b.born - b.delay) / 0.9, 0, 1), e = reduce ? 1 : 1 - Math.pow(1 - pr, 3);
    vN.set(bx + b.ox, by + b.oy + Math.sin(now * 1.4 + b.j * 0.7) * 0.004, 0.5).unproject(camera).sub(camera.position).normalize();
    vS.copy(camera.position).addScaledVector(vN, D / vN.dot(vF));
    b.spr.position.lerpVectors(b.inicio, vS, e);
    b.spr.position.y += Math.sin(pr * Math.PI) * 0.05;
    const s = b.hN * D * tanH * (0.35 + 0.65 * e);
    b.spr.scale.set(s * b.asp, s, 1);
    b.mat.opacity = Math.min(1, pr * 1.8);
  }
}

/* ---------- botellas y gotas ---------- */
let emitAcc = 0;
const ALTURA_MOSTRADOR = S + 1.415;

export function actualizarHabilidades(dt, t) {
  const kb = 1 - Math.exp(-dt * 6);
  botellas.forEach((b, i) => {
    const on = i === E.selSalsa && E.state === 'servicios', hov = i === E.hoverSalsa;
    b.lift += ((on ? 0.05 : hov ? 0.03 : 0) - b.lift) * kb;
    b.piv.position.y = b.lift;
    const pulso = on && t < E.squirtEnd ? Math.max(0, Math.sin(t * 9)) : 0;
    b.sq += (pulso - b.sq) * (1 - Math.exp(-dt * 18));
    b.piv.scale.set(1 - 0.16 * b.sq, 1 + 0.04 * b.sq, 1 - 0.16 * b.sq);
  });

  // chorro hacia arriba mientras se aprieta
  if (E.selSalsa >= 0 && E.state === 'servicios' && t < E.squirtEnd && botellas[E.selSalsa].sq > 0.45) {
    emitAcc += dt;
    while (emitAcc > 0.028) {
      emitAcc -= 0.028;
      const gt = gotas.find((x) => !x.on);
      if (!gt) break;
      const piv = botellas[E.selSalsa].piv;
      piv.updateWorldMatrix(true, false);
      gt.m.position.set(0, 0.42, 0); piv.localToWorld(gt.m.position);
      gt.v.set((Math.random() - 0.5) * 0.35, 1.5 + Math.random() * 0.6, (Math.random() - 0.5) * 0.35);
      gt.on = true; gt.life = 1.4; gt.m.visible = true; gt.m.scale.setScalar(1);
    }
  }
  gotas.forEach((gt) => {
    if (!gt.on) return;
    gt.life -= dt;
    if (gt.m.position.y > ALTURA_MOSTRADOR) {
      gt.v.y -= 9.8 * dt;
      gt.m.position.addScaledVector(gt.v, dt);
      if (gt.m.position.y <= ALTURA_MOSTRADOR) { gt.m.position.y = ALTURA_MOSTRADOR; gt.m.scale.set(1.6, 0.35, 1.6); }
    }
    if (gt.life <= 0 || (E.selSalsa < 0 && gt.life < 1.2)) { gt.on = false; gt.m.visible = false; }
  });

  actualizarBurbujas();
}
