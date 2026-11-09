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
];
