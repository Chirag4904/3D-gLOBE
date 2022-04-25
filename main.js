import "./style.css";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";

//textureloader
const textureLoader = new THREE.TextureLoader();
// Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();

//Camera
const camera = new THREE.PerspectiveCamera(
	75,
	innerWidth / innerHeight,
	0.1,
	1000
);
camera.position.setZ(15);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

//Window resize
window.addEventListener("resize", () => {
	// Update camera
	camera.aspect = innerWidth / innerHeight;
	camera.updateProjectionMatrix();
	// Update renderer
	renderer.setSize(innerWidth, innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);

renderer.render(scene, camera);
//Sphere
const sphere = new THREE.Mesh(
	new THREE.SphereBufferGeometry(5, 50, 50),
	new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms: {
			globeTexture: {
				value: textureLoader.load("./img/globe.jpg"),
			},
		},
	})
);
scene.add(sphere);

const atmosphere = new THREE.Mesh(
	new THREE.SphereBufferGeometry(5, 50, 50),
	new THREE.ShaderMaterial({
		vertexShader: atmosphereVertexShader,
		fragmentShader: atmosphereFragmentShader,
		blending: THREE.AdditiveBlending,
		side: THREE.BackSide,
	})
);
atmosphere.scale.set(1.2, 1.2, 1.2);
scene.add(atmosphere);

const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
	size: 0.1,
	// sizeAttenuation: true,
	color: 0xffffff,
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
	const x = (Math.random() - 0.5) * 2000;
	const y = (Math.random() - 0.5) * 2000;
	const z = -Math.random() * 2000;
	starVertices.push(x, y, z);
}

starGeometry.setAttribute(
	"position",
	new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// const ambientLight = new THREE.AmbientLight("#ffffff", 1);
// scene.add(ambientLight);
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
	mouse.x = (e.clientX / innerWidth) * 2 - 1;
	mouse.y = (e.clientY / innerHeight) * 2 - 1;
});
//Animate
const clock = new THREE.Clock();

function animate() {
	const elapsedTime = clock.getElapsedTime();

	// console.log(elapsedTime);
	//Update controls
	// controls.update();
	sphere.rotation.y += 0.002;
	// group.rotation.y = mouse.x * 0.6;
	gsap.to(group.rotation, { y: mouse.x * 0.5, x: mouse.y * 0.5, duration: 2 });

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

animate();
