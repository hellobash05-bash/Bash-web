import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function initPrinting3D() {
  const container = document.getElementById('printing-canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(8, 6, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(5, 10, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x86b6ff, 0.8);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  // Group for the entire printer
  const printerGroup = new THREE.Group();
  scene.add(printerGroup);

  // --- Materials ---
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.8 });
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6 });
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x6cf2cf, emissive: 0x6cf2cf, emissiveIntensity: 0.2 });
  const filamentMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.3 });

  // --- 1. Base Structure ---
  const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.6, 6.2), frameMat);
  baseFrame.position.y = 0.3;
  printerGroup.add(baseFrame);

  // --- 2. Print Bed ---
  const bedGroup = new THREE.Group();
  printerGroup.add(bedGroup);
  
  const bedPlate = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 4.2), bedMat);
  bedPlate.position.y = 0.65;
  bedGroup.add(bedPlate);

  // Grid on bed
  const grid = new THREE.GridHelper(4, 20, 0x444444, 0x222222);
  grid.position.y = 0.71;
  bedGroup.add(grid);

  // --- 3. Vertical Frame (Gantry) ---
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 0.4), frameMat);
  p1.position.set(-2.8, 3.8, 0);
  printerGroup.add(p1);
  
  const p2 = p1.clone();
  p2.position.set(2.8, 3.8, 0);
  printerGroup.add(p2);

  const topBar = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 0.4), frameMat);
  topBar.position.set(0, 7.1, 0);
  printerGroup.add(topBar);

  // Lead Screws
  const screw1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.5), rodMat);
  screw1.position.set(-2.4, 3.8, 0);
  printerGroup.add(screw1);

  // --- 4. X-Axis Gantry (Z-Movement) ---
  const gantryGroup = new THREE.Group();
  gantryGroup.position.y = 0.8;
  printerGroup.add(gantryGroup);

  const xRail = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.3, 0.3), frameMat);
  gantryGroup.add(xRail);

  // --- 5. Extruder Head (X-Movement) ---
  const headGroup = new THREE.Group();
  gantryGroup.add(headGroup);

  const headHousing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), headMat);
  headHousing.position.z = 0.4;
  headGroup.add(headHousing);

  // Stepper Motor on head
  const motor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.4), frameMat);
  motor.position.set(0, 0.4, 0.4);
  headGroup.add(motor);

  // Fan
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16), frameMat);
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, 0, 0.85);
  headGroup.add(fan);

  // Nozzle
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.15, 0.3), rodMat);
  nozzle.position.set(0, -0.4, 0.4);
  headGroup.add(nozzle);

  // Glow at nozzle
  const nozzleGlow = new THREE.PointLight(0xff6b35, 0.6, 2);
  nozzleGlow.position.set(0, -0.5, 0.4);
  headGroup.add(nozzleGlow);

  // --- 6. Filament Spool ---
  const spoolGroup = new THREE.Group();
  spoolGroup.position.set(-2, 7.8, 0);
  printerGroup.add(spoolGroup);

  const spoolFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 32), frameMat);
  spoolFrame.rotation.z = Math.PI / 2;
  spoolGroup.add(spoolFrame);

  const spoolFilament = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.5, 32), filamentMat);
  spoolFilament.rotation.z = Math.PI / 2;
  spoolGroup.add(spoolFilament);

  // --- 7. The Benchy (More Detailed) ---
  const printGroup = new THREE.Group();
  printGroup.position.y = 0.71;
  printerGroup.add(printGroup);

  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const benchyMat = new THREE.MeshStandardMaterial({ 
    color: 0xff6b35, 
    roughness: 0.4,
    clippingPlanes: [clippingPlane],
    side: THREE.DoubleSide
  });

  // Hull
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 1.2), benchyMat);
  hull.position.y = 0.35;
  printGroup.add(hull);

  // Bow
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 3, 1), benchyMat);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.z = Math.PI;
  bow.position.set(1.1, 0.35, 0);
  printGroup.add(bow);

  // Deck / Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.0), benchyMat);
  cabin.position.set(-0.2, 1.0, 0);
  printGroup.add(cabin);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.2), benchyMat);
  roof.position.set(-0.2, 1.55, 0);
  printGroup.add(roof);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6), benchyMat);
  chimney.position.set(0.3, 1.7, 0);
  printGroup.add(chimney);

  // --- Animation State ---
  printerGroup.position.y = -3;
  printerGroup.scale.set(0.9, 0.9, 0.9);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    const duration = 12; // Total print loop duration
    const progress = (elapsed % duration) / duration;
    
    // Print Phase
    if (progress < 0.8) {
      const p = progress / 0.8;
      const h = p * 2.1; // Max height
      
      // Z movement
      gantryGroup.position.y = 0.8 + h;
      clippingPlane.constant = 0.71 + h;

      // X/Y fast jitter (printing movement)
      headGroup.position.x = Math.sin(elapsed * 25) * 1.5;
      bedGroup.position.z = Math.cos(elapsed * 12) * 0.8;
      printGroup.position.z = bedGroup.position.z;

      // Pulse nozzle glow
      nozzleGlow.intensity = 0.5 + Math.random() * 0.5;
    } else {
      // Presentation Phase
      gantryGroup.position.y = 4.5;
      clippingPlane.constant = 5.0;
      headGroup.position.x = -2;
      bedGroup.position.z = 0;
      printGroup.position.z = 0;
      nozzleGlow.intensity = 0;
    }

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
    initPrinting3D();
    observer.disconnect();
  }
}, { threshold: 0.1 });

const target = document.getElementById('printing-canvas-container');
if (target) observer.observe(target);
