import "./style.css";
import gsap from "gsap";
import data from "./data.json";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmosphereVertexShader from "./shaders/atmosphereVertex.glsl";
import atmosphereFragmentShader from "./shaders/atmosphereFragment.glsl";
import { DoubleSide } from "three";
console.log(data);
//textureloader
const textureLoader = new THREE.TextureLoader();
// Canvas
const canvas = document.querySelector("canvas.webgl");
const popupElement = document.querySelector("#popup");
const populationTitle = document.querySelector("#population");
const populationValue = document.querySelector("#populationValue");

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
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.rotateSpeed = 0.4;
controls.dampingFactor = 0.05;
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
		side: DoubleSide,
		vertexShader,
		fragmentShader,
		uniforms: {
			globeTexture: {
				value: textureLoader.load("./img/globe.jpg"),
			},
		},
	})
);
sphere.rotation.y = -Math.PI * 0.5;
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
	const z = (Math.random() - 0.5) * 2000;
	starVertices.push(x, y, z);
}

starGeometry.setAttribute(
	"position",
	new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

function createBoxes({ countries }) {
	countries.forEach((country) => {
		const scale = country.population / 1000000000;
		const zScale = 1 * scale;
		const box = new THREE.Mesh(
			new THREE.BoxBufferGeometry(
				Math.max(0.1, 0.2 * scale),
				Math.max(0.1, 0.2 * scale),
				Math.max(zScale, Math.random() * 0.5 + 0.1)
			),
			new THREE.MeshBasicMaterial({
				color: "#3BF7FF",
				opacity: 0.4,
				transparent: true,
			})
		);

		const latitude = (country.latlng[0] / 180) * Math.PI;
		const longitude = (country.latlng[1] / 180) * Math.PI;
		const radius = 5;
		const x = radius * Math.cos(latitude) * Math.sin(longitude);
		const y = radius * Math.sin(latitude);
		const z = radius * Math.cos(latitude) * Math.cos(longitude);

		box.country = country.name.common;
		box.population = new Intl.NumberFormat().format(country.population);
		box.position.set(x, y, z);
		box.geometry.applyMatrix4(
			new THREE.Matrix4().makeTranslation(0, 0, -zScale / 2)
		);
		box.lookAt(0, 0, 0);
		group.add(box);
		// gsap.fromTo(
		// 	box.scale,
		// 	{ z: 0.4 },
		// 	{
		// 		z: 1.5,
		// 		duration: 2,
		// 		yoyo: true,
		// 		repeat: -1,
		// 		ease: "linear",
		// 		delay: Math.random(),
		// 	}
		// );
	});
}

createBoxes({ countries: data });

// const ambientLight = new THREE.AmbientLight("#ffffff", 1);
// scene.add(ambientLight);
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (e) => {
	mouse.x = (e.clientX / innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / innerHeight) * 2 + 1;

	gsap.set(popupElement, { x: e.clientX, y: e.clientY });
});

//Raycaster
const raycaster = new THREE.Raycaster();

//Animate
const clock = new THREE.Clock();
const displaySetter = gsap.quickSetter(popupElement, "display");
function animate() {
	const elapsedTime = clock.getElapsedTime();
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(
		group.children.filter((mesh) => {
			return mesh.geometry.type === "BoxGeometry";
		})
	);

	group.children.forEach((mesh) => {
		mesh.material.opacity = 0.4;
	});

	// popupElement.style.display = "none";
	// gsap.set(popupElement, { display: "none" });
	displaySetter("none");
	for (const intersect of intersects) {
		// gsap.set(popupElement, { display: "block" });

		displaySetter("block");
		populationTitle.innerHTML = intersect.object.country;
		populationValue.innerHTML = intersect.object.population;
		intersect.object.material.opacity = 1;
		// console.log(intersect);
	}

	// console.log(elapsedTime);
	//Update controls
	controls.update();
	// group.rotation.y += 0.002;
	// gsap.to(group.rotation, { y: mouse.x * 1.5, x: -mouse.y * 1.5, duration: 2 });

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

animate();
