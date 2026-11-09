// Estado compartido entre módulos.
// state: 'intro' | 'fly' | 'free' | nombre de una sección ('proyectos', 'servicios', 'sobre', 'contacto', 'rocola')

export const E = {
  state: 'intro',
  speed: 1.4,          // velocidad del vuelo de cámara
  saved: null,         // pose de la cámara antes de entrar en una sección
  pendingGoal: null,   // destino final cuando la cámara pasa antes por un punto intermedio
  fase: 2,             // 1 = plano medio (se ve la animación), 2 = primer plano
  faseT: 0,
  hovered: null,
  hoverSalsa: null,
  selSalsa: -1,
  squirtEnd: 0,
  t: 0,
  portrait: innerWidth / innerHeight < 0.85,
  soundOn: false,
  beat: 0,
};

export const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
