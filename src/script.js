import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Models
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

gltfLoader.load(
    '/models/HollowKnight/scene.gltf',
    (gltf) => {
        scene.add(gltf.scene)

        mixer = new THREE.AnimationMixer(gltf.scene)
        let action
        action = mixer.clipAction(gltf.animations[0])
        action.play()
        // gltf.scene.scale.set(0.025, 0.025, 0.025)

        // When press arrow, run the 3rd animation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                if (!action || !action.isRunning()) {
                    action = mixer.clipAction(gltf.animations[3]);
                    action.play();
                }
            }
        });
    
        document.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                if (action && action.isRunning()) {
                    action.stop();
                }
            }
        });
    }, 
)

// Fonts
const loader = new FontLoader();
loader.load('/fonts/Trajan_Pro_Regular.json', (font) => {
    // Create "Happy" text
    const happyGeometry = new TextGeometry('Hollow', {
        font: font,
        size: 2,
        depth: 0.2,
        curveSegments: 15,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });

    const happyMaterial = new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide });
    const happyMesh = new THREE.Mesh(happyGeometry, happyMaterial);

    happyMesh.position.set(-7, 2, -5); // Adjust the position as needed
    scene.add(happyMesh);

    // Create "Holidays" text
    const holidaysGeometry = new TextGeometry('Christmas!', {
        font: font,
        size: 2,
        depth: 0.2,
        curveSegments: 15,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });

    const holidaysMaterial = new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide });
    const holidaysMesh = new THREE.Mesh(holidaysGeometry, holidaysMaterial);

    holidaysMesh.position.set(-10, 0, -5); // Adjust the position as needed
    scene.add(holidaysMesh);
});

// Create snow effect
const snowGeometry = new THREE.BufferGeometry();
const snowCount = 1000;
const snowPositions = new Float32Array(snowCount * 3);
const accumulatedSnowPositions = [];
const spreadRange = 25; // Adjust this value to control the spread

for (let i = 0; i < snowCount; i++) {
    snowPositions[i * 3] = Math.random() * spreadRange - spreadRange / 2; // x
    snowPositions[i * 3 + 1] = Math.random() * spreadRange - spreadRange / 2; // y
    snowPositions[i * 3 + 2] = Math.random() * spreadRange - spreadRange / 2; // z
}

snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

const snowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: Math.random() * 0.2,
    transparent: true,
    opacity: 0.8
});

const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snowParticles);

/**
 * Accumulated Snow Effect
 */
const accumulatedSnowGeometry = new THREE.BufferGeometry();
const accumulatedSnowMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
});
const accumulatedSnowParticles = new THREE.Points(accumulatedSnowGeometry, accumulatedSnowMaterial);
scene.add(accumulatedSnowParticles);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 10),
    new THREE.MeshStandardMaterial({
        color: 'black',
        metalness: 1,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    // Update snow particles
    const positions = snowGeometry.attributes.position.array;

    for (let i = 0; i < snowCount; i++) {
        positions[i * 3 + 1] -= 0.01; // Move snow down

        // Reset snow position when it falls below a certain point
        if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 0;
        }
    }
    snowGeometry.attributes.position.needsUpdate = true;

    // Update accumulated snow particles
    accumulatedSnowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(accumulatedSnowPositions), 3));
    accumulatedSnowGeometry.attributes.position.needsUpdate = true;

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    mixer?.update(deltaTime)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()