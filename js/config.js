// Ajustes globales de la escena.

export const $ = (selector) => document.querySelector(selector);

export const isTouch = matchMedia('(pointer: coarse)').matches;
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Paleta de neón. */
export const C = {
  rosa: '#ff2f7a',
  amarillo: '#ffd23f',
  azul: '#4d86ff',
  rojo: '#ff3b4e',
  blanco: '#eef3ff',
  sodio: '#ffb15c',
};

/** Altura de la acera: todo lo que está sobre ella parte de aquí. */
export const S = 0.16;
