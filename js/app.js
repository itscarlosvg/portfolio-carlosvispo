// Monta la escena completa y arranca el bucle de animación.
import * as THREE from 'three';
import { renderer, scene, camera, composer } from './core/motor.js';
import { $, reduce } from './config.js';
import { E } from './estado.js';
import { actualizarCamara, flyTo, homePose } from './core/camara.js';
import { setSound } from './audio.js';
import { actualizarEntorno } from './escena/entorno.js';
import { actualizarCarrito } from './escena/carrito.js';
import { actualizarDecorado } from './escena/decorado.js';
import { actualizarRocola } from './escena/rocola.js';
import { actualizarProyectos } from './secciones/proyectos.js';
import { actualizarHabilidades } from './secciones/habilidades.js';
import { actualizarSobreMi } from './secciones/sobreMi.js';
import { actualizarContacto } from './secciones/contacto.js';
import { HOT, actualizarNavegacion, camaraLlego } from './navegacion.js';
import { actualizarEnlaces } from './interaccion.js';

const reloj = new THREE.Clock();

function frame() {
  const dt = Math.min(reloj.getDelta(), 0.05);
  E.t += dt;
  const t = E.t;

  actualizarCamara(dt, !!HOT[E.state]);
  if (!reduce) {
    actualizarEntorno(dt, t);
    actualizarCarrito(dt, t);
  }
  actualizarDecorado(dt, t);
  actualizarRocola(dt);
  actualizarHabilidades(dt, t);
  actualizarProyectos(dt);
  const llego = camaraLlego();
  actualizarSobreMi(dt, llego);
  actualizarContacto(dt, llego);
  actualizarNavegacion(dt, t);
  actualizarEnlaces();

  composer.render(dt);
  requestAnimationFrame(frame);
}

/** Prepara los shaders, deja listo el botón de entrada y empieza a animar. */
export function arrancar(setPct, botonEntrar) {
  renderer.compile(scene, camera);
  setPct(100);
  botonEntrar.addEventListener('click', () => {
    $('#loader').classList.add('gone');
    flyTo(homePose(), reduce ? 20 : 1.4);
    setSound(true);
  });
  frame();
}
