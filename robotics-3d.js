import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function initRobotics3D() {
  const container = document.getElementById('robotics-canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Better lighting for complex models
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const topLight = new THREE.DirectionalLight(0xffffff, 2);
  topLight.position.set(5, 10, 5);
  scene.add(topLight);

  const sideLight = new THREE.DirectionalLight(0xffffff, 1);
  sideLight.position.set(-5, 5, 5);
  scene.add(sideLight);

  const loader = new GLTFLoader();
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  loader.load('./teal_v.2(1).glb', (gltf) => {
    const model = gltf.scene;
    
    // Ensure all world transforms are up to date
    model.updateMatrixWorld(true);

    // Calculate the bounding box of the actual geometry
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Log for debugging (visible in browser console)
    console.log('Model Bounds Center:', center);
    console.log('Model Size:', size);

    // Center the model's "Center of Mass" (Volume Center) at (0,0,0)
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;
    
    modelGroup.add(model);
    
    // Scale based on the largest dimension to fit the view
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 8.0 / maxDim; 
    modelGroup.scale.set(scale, scale, scale);
    
  }, 
  (xhr) => {
    if (xhr.total > 0) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }
  },
  (error) => {
    console.error('Error loading 3D model:', error);
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0); // Force rotation around the center
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    initRobotics3D();
    observer.disconnect();
  }
}, { threshold: 0.1 });

const target = document.getElementById('robotics-canvas-container');
if (target) observer.observe(target);
