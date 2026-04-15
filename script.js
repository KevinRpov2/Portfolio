const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const count = 12000;
const geometry = new THREE.BufferGeometry();
const pArr = new Float32Array(count * 3);
const oArr = new Float32Array(count * 3);
const vArr = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) { pArr[i] = oArr[i] = (Math.random() - 0.5) * 20; }
geometry.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
const pts = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.012, color: 0x00ffaa, transparent: true, opacity: 0.25 }));
scene.add(pts);
camera.position.z = 8;

const mouse = new THREE.Vector2(-100, -100);
document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    const pos = pts.geometry.attributes.position.array;
    const r = new THREE.Raycaster(); r.setFromCamera(mouse, camera);
    const mw = new THREE.Vector3(); r.ray.at(8, mw);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        let d = mw.distanceTo(new THREE.Vector3(pos[i3], pos[i3 + 1], pos[i3 + 2]));
        if (d < 1.6) {
            vArr[i3] += (pos[i3] - mw.x) * 0.01;
            vArr[i3 + 1] += (pos[i3 + 1] - mw.y) * 0.01;
        }
        vArr[i3] += (oArr[i3] - pos[i3]) * 0.01;
        vArr[i3 + 1] += (oArr[i3 + 1] - pos[i3 + 1]) * 0.01;
        vArr[i3] *= 0.9; vArr[i3 + 1] *= 0.9;
        pos[i3] += vArr[i3]; pos[i3 + 1] += vArr[i3 + 1];
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += 0.0003;
    renderer.render(scene, camera);
}
animate();

VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 10, speed: 400 });

gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('section').forEach(s => {
    gsap.from(s, { scrollTrigger: s, opacity: 0, y: 30, duration: 0.8 });
});