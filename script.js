/* ==========================================================================
   ꓘRSO — script.js
   Organizado en el mismo orden en que aparecen las secciones en index.html:
   1. Cursor personalizado
   2. Fondo de partículas (Three.js)
   4. Diagrama de red / pills de stack (sección "proyectos")

   ========================================================================== */

'use strict';

/* -------------------------------------------------------------------------
   1. CURSOR PERSONALIZADO
   ------------------------------------------------------------------------- */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

/* -------------------------------------------------------------------------
   2. FONDO DE PARTÍCULAS (Three.js)
   ------------------------------------------------------------------------- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

const PARTICLE_COUNT = 8000;
const MOUSE_RADIUS = 2.5;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);

// Distribución en esfera hueca para más profundidad
for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const distance = 8 + Math.random() * 2;

    positions[i3] = distance * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = distance * Math.cos(phi);

    originalPositions[i3] = positions[i3];
    originalPositions[i3 + 1] = positions[i3 + 1];
    originalPositions[i3 + 2] = positions[i3 + 2];

    sizes[i] = Math.random() * 1.5;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const material = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const points = new THREE.Points(geometry, material);
scene.add(points);

camera.position.z = 12;

const mouse = new THREE.Vector3(-100, -100, 0);

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Proyectar la posición del mouse al plano Z=0 de la escena
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    mouse.copy(camera.position).add(dir.multiplyScalar(distance));
});

function animateParticles() {
    requestAnimationFrame(animateParticles);

    const posAttr = points.geometry.attributes.position;
    const time = Date.now() * 0.0005;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // 1. Ruido sutil de flotación
        const noiseX = Math.sin(time + originalPositions[i3]) * 0.002;
        const noiseY = Math.cos(time + originalPositions[i3 + 1]) * 0.002;

        // 2. Interacción con el mouse (repulsión)
        // Se compara primero la distancia al cuadrado para evitar el costo
        // de Math.sqrt() en las partículas que están fuera de rango (la
        // mayoría en cada frame, con 8000 partículas esto es relevante).
        const dx = posAttr.array[i3] - mouse.x;
        const dy = posAttr.array[i3 + 1] - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < MOUSE_RADIUS_SQ) {
            const dist = Math.sqrt(distSq);
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            velocities[i3] += dx * force * 0.02;
            velocities[i3 + 1] += dy * force * 0.02;
        }

        // 3. Retorno a la posición original (elasticidad)
        velocities[i3] += (originalPositions[i3] - posAttr.array[i3]) * 0.005;
        velocities[i3 + 1] += (originalPositions[i3 + 1] - posAttr.array[i3 + 1]) * 0.005;
        velocities[i3 + 2] += (originalPositions[i3 + 2] - posAttr.array[i3 + 2]) * 0.005;

        // 4. Fricción y aplicación del movimiento
        velocities[i3] *= 0.92;
        velocities[i3 + 1] *= 0.92;
        velocities[i3 + 2] *= 0.92;

        posAttr.array[i3] += velocities[i3] + noiseX;
        posAttr.array[i3 + 1] += velocities[i3 + 1] + noiseY;
        posAttr.array[i3 + 2] += velocities[i3 + 2];
    }

    posAttr.needsUpdate = true;
    points.rotation.y += 0.0005;
    points.rotation.x += 0.0002;

    renderer.render(scene, camera);
}

animateParticles();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* -------------------------------------------------------------------------
   7. CARRUSEL DE CERTIFICACIONES (CORREGIDO)
   ------------------------------------------------------------------------- */
function initCertCarousel() {
    const track = document.querySelector('.cert-track');
    if (!track) return;

    const prevBtn = document.querySelector('.cert-nav.prev');
    const nextBtn = document.querySelector('.cert-nav.next');
    const caption = document.getElementById('cert-caption');

    const originalCards = Array.from(track.children);
    if (originalCards.length === 0) return;

    // Medir ancho una vez cargado el DOM de imágenes
    let singleSetWidth = track.scrollWidth;

    // Clona el set original las veces necesarias
    const targetWidth = singleSetWidth + window.innerWidth * 2;
    while (track.scrollWidth < targetWidth && singleSetWidth > 0) {
        originalCards.forEach((card) => track.appendChild(card.cloneNode(true)));
    }

    const cards = Array.from(track.querySelectorAll('.cert-card'));
    let lastActiveName = null;

    function updateTransforms() {
        const trackRect = track.getBoundingClientRect();
        const center = trackRect.left + trackRect.width / 2;
        let activeCard = null;
        let smallestDelta = Infinity;

        cards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const delta = (cardCenter - center) / (trackRect.width || 1);
            const absDelta = Math.abs(delta);

            const rotateY = Math.max(-50, Math.min(50, delta * 110));
            const scale = 1 - Math.min(absDelta * 0.55, 0.4);
            const translateZ = -absDelta * 220;
            const translateY = Math.min(absDelta, 1) * 18;
            const opacity = 1 - Math.min(absDelta * 0.9, 0.65);

            card.style.transform =
                `translateZ(${translateZ}px) translateY(${translateY}px) rotateY(${-rotateY}deg) scale(${scale})`;
            card.style.opacity = opacity;
            card.style.zIndex = Math.round((1 - Math.min(absDelta, 1)) * 100);

            const isActive = absDelta < 0.08;
            card.classList.toggle('is-active', isActive);

            if (absDelta < smallestDelta) {
                smallestDelta = absDelta;
                activeCard = card;
            }
        });

        if (activeCard && caption) {
            const name = activeCard.dataset.name || '';
            if (name !== lastActiveName) {
                caption.style.opacity = 0;
                setTimeout(() => {
                    caption.textContent = name;
                    caption.style.opacity = 1;
                }, 120);
                lastActiveName = name;
            }
        }
    }

    // Recalcular dimensiones si las imágenes tardan en cargar
    window.addEventListener('load', () => {
        singleSetWidth = track.scrollWidth / (track.children.length / originalCards.length);
        updateTransforms();
    });

    track.addEventListener('scroll', () => {
        if (singleSetWidth > 0) {
            if (track.scrollLeft >= singleSetWidth) {
                track.scrollLeft -= singleSetWidth;
            } else if (track.scrollLeft <= 0) {
                track.scrollLeft += singleSetWidth;
            }
        }
        requestAnimationFrame(updateTransforms);
    });

    window.addEventListener('resize', updateTransforms);

    // --- Autoplay ---
    const AUTOPLAY_SPEED = 0.7;
    let isPaused = false;

    function step() {
        if (!isPaused) {
            track.scrollLeft += AUTOPLAY_SPEED;
        }
        requestAnimationFrame(step);
    }

    function pause() { isPaused = true; }
    function resume() { isPaused = false; }

    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', resume);
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', () => setTimeout(resume, 2500), { passive: true });

    function scrollByCard(direction) {
        const cardWidth = cards[0].getBoundingClientRect().width || 300;
        track.scrollBy({ left: direction * cardWidth * 1.5, behavior: 'smooth' });
    }

    prevBtn?.addEventListener('click', () => {
        pause();
        scrollByCard(-1);
        setTimeout(resume, 3000);
    });
    nextBtn?.addEventListener('click', () => {
        pause();
        scrollByCard(1);
        setTimeout(resume, 3000);
    });

    // --- Drag & Drop ---
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;

    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.pageX;
        dragStartScroll = track.scrollLeft;
        pause();
        track.classList.add('is-dragging');
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = e.pageX - dragStartX;
        track.scrollLeft = dragStartScroll - delta;
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');
        setTimeout(resume, 2000);
    });

    track.scrollLeft = 1;
    updateTransforms();
    requestAnimationFrame(step);
}

/* -------------------------------------------------------------------------
   INICIALIZACIÓN LIMPIA (UNIFICADA)
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initStackFilter();
    initCertCarousel();
});

/* -------------------------------------------------------------------------
   4. DIAGRAMA DE RED / PILLS DE STACK
   ------------------------------------------------------------------------- */
function initStackFilter() {
    const pills = document.querySelectorAll('.pill-btn');
    const wires = document.querySelectorAll('.wire');
    const nodes = document.querySelectorAll('.node');

    function handleFilter(filterCategory) {
        if (filterCategory === 'all') {
            resetHighlight();
            return;
        }

        // Iluminar las conexiones ligadas a la tecnología seleccionada
        wires.forEach((wire) => {
            const techs = wire.dataset.tech ? wire.dataset.tech.split(' ') : [];
            wire.classList.toggle('active-wire', techs.includes(filterCategory));
        });

        // Iluminar los nodos relevantes (por data-tags, no por texto)
        // El matching por texto plano generaba falsos positivos: p. ej. un
        // filtro "ia" resaltaba de forma incorrecta nodos como "Audiencia"
        // solo por contener esa subcadena.
        nodes.forEach((node) => {
            const tags = node.dataset.tags ? node.dataset.tags.split(' ') : [];
            node.classList.toggle('highlight', tags.includes(filterCategory));
        });
    }

    function resetHighlight() {
        wires.forEach((wire) => wire.classList.remove('active-wire'));
        nodes.forEach((node) => node.classList.remove('highlight'));
    }

    pills.forEach((pill) => {
        pill.addEventListener('mouseenter', () => handleFilter(pill.dataset.filter));
        pill.addEventListener('mouseleave', resetHighlight);

        pill.addEventListener('click', () => {
            pills.forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            handleFilter(pill.dataset.filter);
        });
    });
}



/* -------------------------------------------------------------------------
   INICIALIZACIÓN
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initStackFilter();
    initKpiCounters();
});
