// Renderer, escena, cámara y postprocesado.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { $, C, isTouch } from '../config.js';

export const canvas = $('#c');

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

export const scene = new THREE.Scene();
scene.background = new THREE.Color('#07040e');
scene.fog = new THREE.FogExp2('#07040e', 0.03);

export const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.04, 300);

// Entorno para que el metal refleje las luces de neón
{
  const pm = new THREE.PMREMGenerator(renderer);
  const es = new THREE.Scene();
  es.background = new THREE.Color('#06030c');
  const add = (c, k, p, s) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...s), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) }));
    m.position.set(...p);
    es.add(m);
  };
  add(C.rosa, 2.2, [0, 6, 7], [10, 2, 1]);
  add(C.azul, 1.8, [-9, 3, -3], [1, 6, 9]);
  add(C.sodio, 2.4, [8, 5, 0], [1, 4, 5]);
  add('#2b1a55', 1, [0, -6, 0], [40, 1, 40]);
  add(C.amarillo, 1.2, [0, 8, -8], [6, 1, 3]);
  scene.environment = pm.fromScene(es, 0.04).texture;
}

export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.35, 0.92));
composer.addPass(new OutputPass());
