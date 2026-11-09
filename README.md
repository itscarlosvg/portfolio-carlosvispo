<div align="center">

# Perros Carlos Vispo

**Portfolio 3D interactivo con forma de carrito de perros calientes venezolano, de noche, bajo el Ávila.**

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

</div>

---

## Sobre el proyecto

Mi portfolio no es una página con secciones: es un puesto de perros en una calle de noche. Cada objeto del carrito guarda una parte de mí, y toda la información aparece dentro de la escena, sin paneles ni ventanas encima.

## Recorrido

| Objeto | Sección | Qué pasa |
| --- | --- | --- |
| **Pizarra del menú** | Proyectos | La pizarra pasa de página como un menú y muestra cada proyecto con su captura, cómo se hizo y su enlace |
| **Salsas** | Habilidades | La botella se aprieta, echa salsa hacia arriba y las tecnologías salen flotando de la boquilla |
| **Mesa de dominó** | Sobre mí | Una ficha de la mesa se levanta, se da la vuelta y muestra mi experiencia y formación |
| **Moto de delivery** | Contacto | Se abre la caja, sube la bolsa del pedido y el ticket trae mi presentación y mis redes |
| **Rocola** | Navegación | Cuatro teclas de neón llevan a cada sección con un vuelo de cámara |
| **Cornetas** | Sonido | Maracas, cuatro y la plancha chisporroteando |

## Detalles de la escena

- Letrero de neón con las **siete estrellas** y un perro caliente luminoso
- **Guacamayo** en el poste, **araguaney** soltando flores y carros que pasan por la calle
- **El Ávila** al fondo con el hotel iluminado en la cima, la cruz, el teleférico en marcha y las luces de los barrios
- Pantalla de carga con un perro preparándose en tiempo real

## Controles

| Acción | Ratón | Táctil |
| --- | --- | --- |
| Girar alrededor del carrito | Arrastrar | Arrastrar con un dedo |
| Acercar o alejar | Rueda | Pellizcar |
| Abrir una sección | Clic en el objeto | Tocar el objeto |
| Volver | Botón «Volver» o `Esc` | Botón «Volver» |

## Tecnología

- **Three.js** para toda la escena 3D, construida con geometría propia, sin modelos externos
- **Postprocesado** con bloom para el neón
- **Canvas 2D** para los textos dentro de la escena (pizarra, ficha y ticket)
- **Web Audio API** para la música y los efectos, generados en el navegador
- **Módulos ES nativos**, sin empaquetador ni dependencias que instalar

## Estructura

```
perros-carlos-vispo/
├── index.html                 Página y pantalla de carga
├── css/
│   └── estilos.css            Estilos de la interfaz
├── assets/
│   ├── favicon.svg
│   └── img/                   Capturas de los proyectos
└── js/
    ├── main.js                Punto de entrada: carga y fuentes
    ├── app.js                 Monta la escena y el bucle de animación
    ├── config.js              Paleta y ajustes globales
    ├── estado.js              Estado compartido
    ├── audio.js               Música y efectos
    ├── navegacion.js          Secciones, vuelos de cámara y hover
    ├── interaccion.js         Ratón, toque y zonas táctiles de la escena
    ├── core/
    │   ├── motor.js           Renderer, escena, cámara y bloom
    │   ├── camara.js          Órbita y vuelos suaves
    │   └── utilidades.js      Materiales, mallas, texturas y curvas
    ├── escena/
    │   ├── entorno.js         Cielo, Ávila, barrios, calle y luces
    │   ├── carrito.js         Carrito, salsas, toldo y letrero
    │   ├── decorado.js        Nevera, cornetas, guacamayo, araguaney y carro
    │   └── rocola.js          Rocola y letrero de créditos
    ├── secciones/
    │   ├── proyectos.js       Pizarra con páginas
    │   ├── habilidades.js     Botellas, chorro y burbujas
    │   ├── sobreMi.js         Mesa y ficha de dominó
    │   └── contacto.js        Moto, bolsa y ticket
    └── datos/
        ├── proyectos.js       Textos de los proyectos
        ├── habilidades.js     Grupos de tecnologías
        └── perfil.js          Presentación, experiencia y redes
```

Para cambiar el contenido basta con editar los archivos de `js/datos/`.

## Ejecutarlo en local

Los módulos ES necesitan servirse por HTTP (no funcionan abriendo el archivo con doble clic):

```bash
npx serve .
```

También vale la extensión **Live Server** de VS Code.

## Créditos

Inspirado en el portfolio de [Jesse Zhou](https://www.jesse-zhou.com).

## Autor

**Carlos Vispo** · Desarrollador FullStack

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/carlosvispo)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/itscarlosvg)

## Licencia

© 2026 Carlos Adolfo Vispo González. Todos los derechos reservados. Consulta [LICENSE](LICENSE).
