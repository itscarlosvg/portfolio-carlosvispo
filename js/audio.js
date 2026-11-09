// Música generada en el navegador: maracas, bombo y cuatro sobre el chisporroteo de la plancha.
import { $ } from './config.js';
import { E } from './estado.js';

let actx = null, master = null, ruido = null, nextT = 0, paso = 0;
const boton = $('#snd');

function iniciar() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
    const len = actx.sampleRate * 2;
    ruido = actx.createBuffer(1, len, actx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // plancha: ruido filtrado continuo
    const src = actx.createBufferSource(); src.buffer = ruido; src.loop = true;
    const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2800;
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    const sg = actx.createGain(); sg.gain.value = 0.035;
    src.connect(hp).connect(lp).connect(sg).connect(master);
    src.start();
    setInterval(programar, 30);
  } catch (e) {
    actx = null;
  }
}

function maraca(t, v) {
  const s = actx.createBufferSource(); s.buffer = ruido;
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6200; bp.Q.value = 1.2;
  const g = actx.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.11 * v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);
  s.connect(bp).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + 0.09);
}

function bombo(t) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
  g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.32);
  setTimeout(() => { E.beat = 1; }, Math.max(0, (t - actx.currentTime) * 1000)); // late con las cornetas
}

function cuatro(t, notas) {
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(master);
  notas.forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain(), tt = t + i * 0.012;
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.045, tt + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, tt + 0.45);
    o.connect(g).connect(lp); o.start(tt); o.stop(tt + 0.5);
  });
}

const ACORDES = [
  [293.66, 369.99, 440, 587.33],
  [277.18, 329.63, 440, 554.37],
  [246.94, 293.66, 369.99, 493.88],
  [220, 277.18, 329.63, 440],
];

/** Compás de 6/8 programado por adelantado. */
function programar() {
  if (!actx || !E.soundOn) return;
  while (nextT < actx.currentTime + 0.15) {
    maraca(nextT, [1, 0.35, 0.6, 0.9, 0.35, 0.6][paso % 6]);
    if (paso % 6 === 0 || paso % 6 === 3) bombo(nextT);
    if (paso % 3 === 0) cuatro(nextT, ACORDES[Math.floor(paso / 12) % 4]);
    if (Math.random() < 0.05) maraca(nextT + 0.09, 0.25);
    nextT += 0.19;
    paso = (paso + 1) % 48;
  }
}

export function setSound(on) {
  iniciar();
  if (!actx) return;
  E.soundOn = on;
  if (actx.state === 'suspended') actx.resume();
  master.gain.cancelScheduledValues(actx.currentTime);
  master.gain.linearRampToValueAtTime(on ? 0.8 : 0, actx.currentTime + 0.4);
  if (on) nextT = actx.currentTime + 0.08;
  boton.setAttribute('aria-pressed', String(on));
}

export const toggleSound = () => setSound(!E.soundOn);

/** Sonido corto de interfaz. */
export function blip(f) {
  if (!actx || !E.soundOn) return;
  const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.08);
  g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g).connect(master); o.start(t); o.stop(t + 0.16);
}

boton.addEventListener('click', toggleSound);
