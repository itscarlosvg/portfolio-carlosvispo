// Proyectos que se muestran en la pizarra del menú.
// estado: 'Servido' (publicado) o 'En la plancha' (en desarrollo)

export const PROYECTOS = [
  {
    nombre: 'Reskta Trivilín',
    tipo: 'Videojuego',
    estado: 'Servido',
    descripcion:
      'Juego de cartas multijugador en el navegador e instalable como app. Mundo 3D con Three.js, partidas online por ' +
      'WebRTC (PeerJS), cuentas con Netlify Identity, rankings, notificaciones push y correos con funciones serverless.',
    skills: 'JavaScript · Three.js · GSAP · PeerJS · Netlify Functions · Google AdSense',
    boton: 'JUGAR',
    href: 'https://reskta-trivilin.netlify.app',
    imagen: 'assets/img/reskta-trivilin.jpg',
    ilustracion: 'trivilin',
  },
  {
    nombre: 'Hotel O Castro',
    tipo: 'Web',
    estado: 'En la plancha',
    descripcion:
      'Web multipágina sin framework, hecha con Vite. Fondos generativos con shaders de Three.js (la ría al atardecer ' +
      'y la huerta), animaciones con GSAP y transiciones entre páginas con un router propio.',
    skills: 'JavaScript · Vite · Three.js · GSAP · CSS',
    boton: 'VER WEB',
    href: 'https://hotel-o-castro-preview.netlify.app',
    imagen: 'assets/img/hotel-o-castro.jpg',
    ilustracion: 'hotel',
  },
  {
    nombre: 'Vispo & Co.',
    tipo: 'Web',
    estado: 'Servido',
    descripcion:
      'Web de mi marca con calculadora de presupuesto, envío por Netlify Forms y reservas con la API de Cal.com. ' +
      'Hero 3D con Three.js y un build propio en Node que une el código en un HTML autocontenido, con tests E2E en Playwright.',
    skills: 'JavaScript · Three.js · Node.js · Netlify Forms · Cal.com API · Playwright',
    boton: 'VER WEB',
    href: 'https://vispoandco.netlify.app',
    imagen: 'assets/img/vispo-and-co.jpg',
    ilustracion: 'vispo',
  },
];
