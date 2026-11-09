// Cielo, el Ávila (hotel, cruz y teleférico), luces de los barrios, calle, acera y luces generales.
import * as THREE from 'three';
import { scene } from '../core/motor.js';
import { C, S, isTouch } from '../config.js';
import { std, nf, mesh, box, cyl, tex } from '../core/utilidades.js';

/* ---------- cielo y estrellas ---------- */
{
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color('#03020a') },
      mid: { value: new THREE.Color('#1a0b3a') },
      low: { value: new THREE.Color('#4a1550') },
      oscuro: { value: new THREE.Color('#07040e') },
    },
    vertexShader: 'varying vec3 v; void main(){ v = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    // El resplandor del horizonte solo aparece detrás del Ávila (hacia -z)
    fragmentShader: 'uniform vec3 top,mid,low,oscuro; varying vec3 v; void main(){ float y=v.y; float f=pow(clamp(-v.z*1.3,0.,1.),1.4); vec3 m=mix(oscuro,mid,.25+.75*f); vec3 l=mix(oscuro,low,f); vec3 c = y>0.12? mix(m,top,smoothstep(.12,.6,y)) : mix(l,m,smoothstep(-.05,.12,y)); gl_FragColor=vec4(c,1.); }',
  }));
  sky.userData.noPick = true;
  scene.add(sky);

  const n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = Math.random() * Math.PI * 2, ph = Math.random() * 1.2;
    pos.set([Math.sin(ph) * Math.cos(th) * 150, Math.cos(ph) * 150 + 10, Math.sin(ph) * Math.sin(th) * 150 - 20], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#cfd8ff', size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));
}

/* ---------- montañas ---------- */
/** Silueta de montaña que se vuelve transparente hacia los extremos. */
function ridge(z, x0, x1, base, f, color, line, fade) {
  const N = 220, pos = [], idx = [], top = [], cols = [], lcols = [];
  const c0 = new THREE.Color(color), osc = new THREE.Color('#07040e'), k = new THREE.Color();
  const lc = line ? new THREE.Color(line).multiplyScalar(1.6) : null;
  for (let i = 0; i <= N; i++) {
    const x = x0 + (x1 - x0) * i / N, y = f(x), fa = THREE.MathUtils.smoothstep(Math.abs(x), fade[0], fade[1]);
    pos.push(x, base, z, x, y, z);
    top.push(new THREE.Vector3(x, y, z));
    const al = 1 - fa;
    k.copy(c0).lerp(osc, fa * 0.5);
    cols.push(k.r, k.g, k.b, al, k.r, k.g, k.b, al);
    if (lc) lcols.push(lc.r, lc.g, lc.b, al * 0.55);
    if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 4));
  g.setIndex(idx);
  scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, side: THREE.DoubleSide, fog: false })));
  if (lc) {
    const lg = new THREE.BufferGeometry().setFromPoints(top);
    lg.setAttribute('color', new THREE.Float32BufferAttribute(lcols, 4));
    scene.add(new THREE.Line(lg, new THREE.LineBasicMaterial({ vertexColors: true, toneMapped: false, fog: false, transparent: true })));
  }
}

const avila = (x) => 7 + 9 * Math.exp(-x * x / 1800) + 1.8 * Math.sin(x * 0.13 + 0.7) + Math.sin(x * 0.37 + 2) + 2 * Math.sin(x * 0.05 + 2.5) * (1 - Math.exp(-x * x / 900));
const lomas = (x) => 6.5 + 2.2 * Math.sin(x * 0.09 + 0.5) + 1.4 * Math.sin(x * 0.23 + 1.7) + 0.6 * Math.sin(x * 0.7);
ridge(-70, -140, 140, -2, avila, '#0d0722', C.azul, [25, 85]);
ridge(-34, -80, 80, -2, lomas, '#0a0518', null, [14, 50]);

/* ---------- el Ávila: hotel en la cima, cruz y teleférico ---------- */
const telef = [];
let luzRoja;
const telA = new THREE.Vector3(-26, 3.5, -52), telB = new THREE.Vector3(-1.3, avila(0) + 0.15, -69.2);
{
  const hx = 0, hy = avila(0) - 0.25, hz = -69.4;
  const oscuro = new THREE.MeshBasicMaterial({ color: '#0e0822', fog: false });
  box(2.9, 0.8, 1.7, oscuro, hx, hy + 0.3, hz);
  const ventanas = tex(512, 256, (g, w, h) => {
    g.fillStyle = '#0e0822'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 13; r++) for (let c = 0; c < 32; c++) {
      if (Math.random() < 0.74) { g.fillStyle = Math.random() < 0.25 ? '#fff0c8' : '#ffbe62'; g.fillRect(c * 16 + 4, r * 19 + 6, 8, 10); }
    }
  });
  mesh(new THREE.CylinderGeometry(0.79, 0.79, 3.25, 40, 1, true), new THREE.MeshBasicMaterial({ map: ventanas, fog: false, toneMapped: false, color: new THREE.Color(1.05, 1.05, 1.05) }), hx, hy + 0.7 + 1.625, hz);
  cyl(0.82, 0.82, 0.16, oscuro, hx, hy + 0.7 + 3.33, hz, scene, 40);
  const an = mesh(new THREE.TorusGeometry(0.83, 0.03, 6, 56), nf('#ffd49a', 2.2), hx, hy + 0.7 + 3.24, hz);
  an.rotation.x = Math.PI / 2;
  luzRoja = mesh(new THREE.SphereGeometry(0.1, 10, 8), nf('#ff2a2a', 4), hx, hy + 0.7 + 3.5, hz);

  // la cruz
  const cm = nf('#fff2c8', 2.2), cx = 3.2, cy = avila(3.2) + 1.0, cz = -69.5;
  box(0.22, 2.3, 0.12, cm, cx, cy, cz);
  box(1.3, 0.22, 0.12, cm, cx, cy + 0.52, cz);

  // cables y cabinas del teleférico
  for (const off of [-0.7, 0.7]) {
    const g = new THREE.BufferGeometry().setFromPoints([telA.clone().add(new THREE.Vector3(0, 0, off)), telB.clone().add(new THREE.Vector3(0, 0, off))]);
    scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#9a90bd', fog: false, transparent: true, opacity: 0.55 })));
  }
  for (let k = 0; k < 6; k++) {
    const cab = new THREE.Group(); cab.scale.setScalar(0.55); scene.add(cab);
    box(0.04, 0.55, 0.04, oscuro, 0, 0.28, 0, cab);
    box(0.95, 0.7, 0.7, oscuro, 0, -0.25, 0, cab);
    box(0.8, 0.22, 0.72, nf(k % 2 ? '#ffd49a' : '#9fd0ff', 1.8), 0, -0.15, 0, cab);
    telef.push({ g: cab, u: k / 6, dir: k % 2 ? 1 : -1, off: k % 2 ? 0.7 : -0.7 });
  }
}

/* ---------- luces de los barrios en las lomas ---------- */
const barrio = (() => {
  const n = isTouch ? 450 : 700, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), base = [];
  const pal = ['#ffb347', '#ffd27a', '#ffe9b8', '#ff9a4d', '#bfe0ff', '#fff2d6'];
  for (let i = 0; i < n; i++) {
    const x = (Math.random() * 2 - 1) * 30, h = lomas(x);
    const y = Math.min(-1 + Math.pow(Math.random(), 0.7) * (h + 0.6), h - 0.25);
    pos.set([x, y, -33.6], i * 3);
    const c = new THREE.Color(pal[(Math.random() * pal.length) | 0])
      .multiplyScalar((0.8 + Math.random() * 0.6) * (1 - THREE.MathUtils.smoothstep(Math.abs(x), 10, 30)));
    col.set([c.r, c.g, c.b], i * 3);
    base.push(c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: isTouch ? 2.2 : 2.6, sizeAttenuation: false, vertexColors: true, toneMapped: false, fog: false, transparent: true, opacity: 0.9 })));
  return { g, base, n };
})();

/* ---------- calle y acera ---------- */
{
  const asfalto = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#16121f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 14 + Math.random() * 26 | 0; g.fillStyle = `rgb(${v},${v - 2},${v + 8})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  asfalto.wrapS = asfalto.wrapT = THREE.RepeatWrapping;
  asfalto.repeat.set(30, 30);
  const suelo = mesh(new THREE.PlaneGeometry(240, 240), std('#2a2338', 0.7, 0.15, { map: asfalto, envMapIntensity: 0.5 }));
  suelo.rotation.x = -Math.PI / 2;

  const losa = tex(256, 256, (g, w, h) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = 52 + Math.random() * 14 | 0; g.fillStyle = `rgb(${v},${v - 6},${v + 18})`; g.fillRect(i * 64, j * 64, 64, 64); }
    g.strokeStyle = '#1c1628'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke();
    }
  });
  losa.wrapS = losa.wrapT = THREE.RepeatWrapping;
  losa.repeat.set(120, 16.55);
  box(240, S, 33.1, std('#ffffff', 0.75, 0, { map: losa }), 0, S / 2, -13.45);
  box(240, S + 0.02, 0.22, std('#c9a227', 0.7), 0, (S + 0.02) / 2, 3.2);

  const raya = std('#d8d4e6', 0.6, 0, { emissive: '#3a3650' });
  for (let x = -60; x <= 60; x += 4.5) box(2.2, 0.01, 0.14, raya, x, 0.005, 7.3);
}

/* ---------- luces generales ---------- */
scene.add(new THREE.HemisphereLight('#5a46a0', '#140b20', 0.5));
{
  const d = new THREE.DirectionalLight(C.azul, 0.9); d.position.set(-6, 8, -8); scene.add(d);
  const f = new THREE.DirectionalLight('#ff8fc0', 0.25); f.position.set(4, 5, 10); scene.add(f);
}

/* ---------- animación ---------- */
let twinkle = 0;
export function actualizarEntorno(dt, t) {
  twinkle += dt;
  if (twinkle > 0.12) {
    twinkle = 0;
    const ca = barrio.g.attributes.color;
    for (let j = 0; j < 6; j++) {
      const i = (Math.random() * barrio.n) | 0, b = barrio.base[i], f = Math.random() < 0.3 ? 0.15 : 1;
      ca.setXYZ(i, b.r * f, b.g * f, b.b * f);
    }
    ca.needsUpdate = true;
  }
  telef.forEach((c) => {
    c.u = (c.u + c.dir * dt * 0.018 + 1) % 1;
    c.g.position.lerpVectors(telA, telB, c.u);
    c.g.position.y -= 0.3;
    c.g.position.z += c.off;
    c.g.rotation.z = Math.sin(t * 1.3 + c.u * 20) * 0.05;
  });
  luzRoja.visible = (t % 1.6) < 0.3;
}
