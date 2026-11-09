/* © 2026 Carlos Adolfo Vispo González. Todos los derechos reservados. Ver LICENSE. */
// Punto de entrada: pantalla de carga, espera a las fuentes y monta la escena.
import { $ } from './config.js';

const pctEl = $('#pct');
const botonEntrar = $('#go');

let mostrado = 0, real = 0;
const setPct = (p) => { real = Math.max(real, p); };

(function contador() {
  mostrado += (real - mostrado) * 0.12;
  const v = Math.min(100, Math.round(mostrado + (real >= 100 && mostrado > 98.5 ? 1 : 0)));
  pctEl.textContent = 'Cocinando ' + v + '%';
  if (v >= 100) {
    botonEntrar.disabled = false;
    pctEl.textContent = '¡Tu perro está listo!';
    return;
  }
  requestAnimationFrame(contador);
})();

// Los textos de la escena se dibujan en canvas: hay que esperar a que carguen las fuentes.
await Promise.race([
  Promise.all(['150px Bungee', '700 46px "Space Mono"', '800 40px "Bricolage Grotesque"', '600 30px "Bricolage Grotesque"'].map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 2500)),
]).catch(() => {});
setPct(25);

const { arrancar } = await import('./app.js');
setPct(85);
arrancar(setPct, botonEntrar);
