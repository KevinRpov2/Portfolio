# ꓘRSO — Portafolio

Sitio web personal de una sola página (landing) enfocado en ciberseguridad defensiva, arquitectura en la nube y automatización. Incluye un fondo interactivo de partículas 3D, un diagrama de red filtrable por tecnología y un dashboard de métricas animado.

## Demo

Publicado con GitHub Pages: `https://<tu-usuario>.github.io/<tu-repositorio>/`

## Características

- **Fondo de partículas en 3D** con Three.js: 8000 partículas en una esfera hueca que reaccionan al movimiento del mouse (repulsión) y regresan a su posición con un efecto de elasticidad.
- **Cursor personalizado** animado con GSAP.
- **Animaciones al hacer scroll** (`ScrollTrigger` de GSAP) y efecto *tilt* 3D en las tarjetas de proyectos (`VanillaTilt`).
- **Diagrama de red interactivo** en SVG: al pasar el cursor sobre una tecnología (pill) se resaltan las conexiones y nodos relacionados.
- **Dashboard de métricas (KPIs)** con contador animado que se dispara al hacer scroll hasta esa sección (`IntersectionObserver`).
- Totalmente responsive (breakpoint en 768px).

## Stack tecnológico

| Herramienta | Uso |
|---|---|
| HTML5 / CSS3 | Estructura y estilos |
| JavaScript (vanilla) | Interactividad |
| [Three.js](https://threejs.org/) r128 | Fondo de partículas 3D |
| [GSAP](https://gsap.com/) + ScrollTrigger | Animaciones y scroll reveal |
| [VanillaTilt](https://micku7zu.github.io/vanilla-tilt.js/) | Efecto tilt en tarjetas |
| [Font Awesome](https://fontawesome.com/) | Iconografía |
| Google Fonts (Plus Jakarta Sans, JetBrains Mono) | Tipografía |

Todas las librerías se cargan vía CDN, no requiere `npm install`.

## Estructura del proyecto

```
.
├── index.html      # Estructura y contenido del sitio
├── style.css       # Estilos (organizados en el mismo orden que las secciones del HTML)
├── script.js       # Lógica: partículas, cursor, filtros del diagrama, contador KPI
├── img/
│   └── f4vic0n.png # Favicon
└── README.md
```

El CSS y el JS están divididos en bloques comentados que siguen el mismo orden en que aparecen las secciones en `index.html` (Hero → Sobre mí → Proyectos → Servicios → Diagrama de red → KPIs → Newsletter → Contacto → Footer), para que sea fácil ubicar qué estilo o función corresponde a qué parte de la página.

## Cómo correrlo localmente

No requiere build ni dependencias. Basta con servir los archivos estáticos:

```bash
git clone https://github.com/<tu-usuario>/<tu-repositorio>.git
cd <tu-repositorio>

# Opción A: abrir directamente
open index.html          # macOS
xdg-open index.html      # Linux

# Opción B: levantar un servidor local (recomendado, evita bloqueos de CORS)
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

## Despliegue en GitHub Pages

1. Sube el contenido de este repositorio a la rama `main` (o `master`).
2. Ve a **Settings → Pages**.
3. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
4. Guarda; GitHub Pages publicará el sitio en unos minutos en `https://<tu-usuario>.github.io/<tu-repositorio>/`.

## Personalización

- **Colores:** todo el esquema de color vive en las variables `:root` al inicio de `style.css` (`--bg`, `--accent`, `--text`, `--text-dim`, etc.).
- **Proyectos:** edita las tarjetas dentro de `<section id="proyectos">` en `index.html`.
- **Diagrama de red / stack:** los nodos y conexiones están en el `<svg id="network-graph">`; cada conexión (`<path class="wire">`) tiene un atributo `data-tech` que la vincula con el filtro (`data-filter`) del botón correspondiente.
- **Métricas (KPIs):** cada número usa `data-target`, `data-suffix` y opcionalmente `data-decimals` sobre un `<span class="kpi-number">`; el conteo se anima automáticamente al hacer scroll.

## Licencia

© 2026 ꓘRSO Streams. Todos los derechos reservados.
