// Configuración del Cursor
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

// --- MOTOR DE PARTÍCULAS AVANZADO ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

const count = 8000; // Optimizado para conexiones
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
const originalPositions = new Float32Array(count * 3);
const velocities = new Float32Array(count * 3);
const sizes = new Float32Array(count);

for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Distribución en esfera hueca para más profundidad
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

// Líneas de conexión (Efecto Red)
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.5 });
const lineGeometry = new THREE.BufferGeometry();
const linePoints = new THREE.Points(lineGeometry, lineMaterial);
// Nota: Por rendimiento, las conexiones se limitan a un subconjunto en el loop

camera.position.z = 12;

const mouse = new THREE.Vector3(-100, -100, 0);
const raycaster = new THREE.Raycaster();

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Proyectar mouse al plano Z=0
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    mouse.copy(camera.position).add(dir.multiplyScalar(distance));
});

function animate() {
    requestAnimationFrame(animate);

    const posAttr = points.geometry.attributes.position;
    const time = Date.now() * 0.0005;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // 1. Ruido sutil de flotación
        const noiseX = Math.sin(time + originalPositions[i3]) * 0.002;
        const noiseY = Math.cos(time + originalPositions[i3 + 1]) * 0.002;

        // 2. Interacción con el mouse (Repulsión)
        const dx = posAttr.array[i3] - mouse.x;
        const dy = posAttr.array[i3 + 1] - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2.5) {
            const force = (2.5 - dist) / 2.5;
            velocities[i3] += dx * force * 0.02;
            velocities[i3 + 1] += dy * force * 0.02;
        }

        // 3. Retorno a posición original (Elasticidad)
        velocities[i3] += (originalPositions[i3] - posAttr.array[i3]) * 0.005;
        velocities[i3 + 1] += (originalPositions[i3 + 1] - posAttr.array[i3 + 1]) * 0.005;
        velocities[i3 + 2] += (originalPositions[i3 + 2] - posAttr.array[i3 + 2]) * 0.005;

        // 4. Aplicar fricción y movimiento
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

animate();

// Adaptabilidad
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Inits de UI
VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    max: 8,
    speed: 1000,
    glare: true,
    "max-glare": 0.2
});

gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('section').forEach(s => {
    gsap.from(s, {
        scrollTrigger: {
            trigger: s,
            start: "top 85%",
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power4.out"
    });
});