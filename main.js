import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;


// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5baadf);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.0032);

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 900);
camera.position.set(0, 45, 100);

// ── Controls ──────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 165;
controls.maxPolarAngle = Math.PI / 2.1;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.25;



// ── Lighting ──────────────────────────────────────────────────────────────────
// Softer ambient so the GLB model's own colors/textures aren't washed out
scene.add(new THREE.AmbientLight(0xd0e8ff, 1.2));

const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.0);
sunLight.position.set(-140, 120, -300);
sunLight.castShadow = true;
scene.add(sunLight);

// Fill light from the opposite side to reduce harsh shadows on the model
const fillLight = new THREE.DirectionalLight(0xc8d8ff, 0.8);
fillLight.position.set(140, 80, 300);
scene.add(fillLight);

// Dedicated trophy lights
const trophyLight1 = new THREE.PointLight(0xfff5d0, 8, 30);
trophyLight1.position.set(0, 14, 8);
scene.add(trophyLight1);
const trophyLight2 = new THREE.PointLight(0xffe0a0, 5, 25);
trophyLight2.position.set(6, 10, -6);
scene.add(trophyLight2);

// ── Stadium model (field.glb) — loaded below after goals ─────────────────────

// ── Goals ─────────────────────────────────────────────────────────────────────
function makeGoal(zPos) {
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.92, roughness: 0.15 });
  const netMat  = new THREE.LineBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.28 });

  // Posts & crossbar
  [-3.5, 3.5].forEach(x => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), postMat);
    post.position.set(x, 1.25, 0);
    post.castShadow = true;
    group.add(post);
  });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.16, 8), postMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 2.5;
  bar.castShadow = true;
  group.add(bar);

  // Net direction: extend away from field center
  const nd = zPos < 0 ? -1 : 1;
  const nd2 = 2.8; // net depth

  // Vertical lines along net
  for (let i = 0; i <= 14; i++) {
    const x = -3.5 + (i / 14) * 7;
    const pts = [
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(x, 2.5, 0),
      new THREE.Vector3(x, 2.5, nd * nd2),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), netMat));
  }
  // Horizontal front rows
  for (let j = 0; j <= 5; j++) {
    const y = j * 0.5;
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.5, y, 0), new THREE.Vector3(3.5, y, 0)]),
      netMat
    ));
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.5, y, nd * nd2), new THREE.Vector3(3.5, y, nd * nd2)]),
      netMat
    ));
  }
  // Top horizontal rows
  for (let k = 0; k <= 5; k++) {
    const z = nd * (k / 5) * nd2;
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.5, 2.5, z), new THREE.Vector3(3.5, 2.5, z)]),
      netMat
    ));
  }

  group.position.set(0, 0, zPos);
  scene.add(group);
  return group;
}

const goalFar  = makeGoal(-30); // Canada's goal (far, z=-30)
const goalNear = makeGoal(30);  // Bosnia's goal (near, z=+30)

// ── Trophy (OBJ model) ────────────────────────────────────────────────────────
// placeholder so animation loop refs are always valid
let trophy = new THREE.Group();
trophy.position.set(0, 0.01, 0);
scene.add(trophy);
const trophyMeshes = [];

const trophyTex = new THREE.TextureLoader().load('tex/texture0.jpg', tex => {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
});

new OBJLoader().load(
  'FIFA World Cup Trophy 2.obj',
  obj => {
    obj.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: trophyTex,
        });
        child.castShadow = true;
        trophyMeshes.push(child);
      }
    });

    trophy.add(obj);

    // Scale and centre after adding to scene so matrices are current
    requestAnimationFrame(() => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const scale = 14 / size.y; // always scale by height so proportions are preserved
      obj.scale.setScalar(scale);

      requestAnimationFrame(() => {
        const box2 = new THREE.Box3().setFromObject(obj);
        const centre = box2.getCenter(new THREE.Vector3());
        // Centre on XZ, sit base on ground
        obj.position.set(-centre.x, -box2.min.y, -centre.z);
      });
    });
  },
  null,
  err => console.error('OBJ load error:', err)
);

// ── (procedural trophy helpers kept for globe texture — no longer used) ───────
function makeGlobeTex() {
  const W = 256, H = 128;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#1a4a8a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1e6e1e';
  // Rough continent blobs
  [
    [55, 40, 22, 26, -0.3],  // N America
    [75, 78, 13, 20,  0.2],  // S America
    [128, 36, 10, 14,  0  ], // Europe
    [130, 65, 15, 27,  0.1], // Africa
    [178, 36, 38, 20,  0.1], // Asia
    [197, 82, 14,  9,  0.2], // Australia
  ].forEach(([x, y, rx, ry, rot]) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
  });
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTrophy() {
  const group = new THREE.Group();
  const gold     = new THREE.MeshStandardMaterial({ color: 0xd4a820, metalness: 0.97, roughness: 0.10 });
  const dkGold   = new THREE.MeshStandardMaterial({ color: 0x8b6410, metalness: 0.93, roughness: 0.25 });
  const malamat  = new THREE.MeshStandardMaterial({ color: 0x1a5c1a, metalness: 0.25, roughness: 0.75 });
  const figureMat= new THREE.MeshStandardMaterial({ color: 0xc89010, metalness: 0.98, roughness: 0.08 });

  // ── Octagonal malachite base ─────────────────────────────────────
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.05, 0.20, 8), dkGold);  b1.position.y = 0.10;
  const m1 = new THREE.Mesh(new THREE.CylinderGeometry(1.80, 1.85, 0.20, 8), malamat); m1.position.y = 0.40;
  const g1 = new THREE.Mesh(new THREE.CylinderGeometry(1.70, 1.80, 0.08, 8), gold);    g1.position.y = 0.64;
  const m2 = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.70, 0.20, 8), malamat); m2.position.y = 0.78;
  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(1.20, 1.58, 0.18, 8), dkGold); b2.position.y = 1.06;
  // Narrowing pedestal
  const ped= new THREE.Mesh(new THREE.CylinderGeometry(0.52, 1.20, 0.28, 16), gold);  ped.position.y = 1.29;
  group.add(b1, m1, g1, m2, b2, ped);

  // ── Two human figures ────────────────────────────────────────────
  const FY = 1.43; // figure base y
  [-1, 1].forEach(s => {
    // Body: feet → hips → torso → shoulders
    const bodyPts = [
      new THREE.Vector3(s * 0.22, FY + 0.00, 0),
      new THREE.Vector3(s * 0.40, FY + 0.35, 0),
      new THREE.Vector3(s * 0.58, FY + 0.80, 0),
      new THREE.Vector3(s * 0.68, FY + 1.30, 0), // widest
      new THREE.Vector3(s * 0.60, FY + 1.80, 0),
      new THREE.Vector3(s * 0.42, FY + 2.20, 0), // shoulders
    ];
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bodyPts), 20, 0.115, 8),
      figureMat
    ));
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 10), figureMat);
    head.position.set(s * 0.58, FY + 1.55, 0);
    group.add(head);
    // Arms reaching up to globe
    const armPts = [
      new THREE.Vector3(s * 0.42, FY + 2.20, 0),
      new THREE.Vector3(s * 0.28, FY + 2.55, 0),
      new THREE.Vector3(s * 0.14, FY + 2.82, 0),
    ];
    group.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(armPts), 10, 0.075, 8),
      figureMat
    ));
  });

  // ── Globe ────────────────────────────────────────────────────────
  const GY = FY + 3.08;
  const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.065, 8, 32), gold);
  ringMesh.position.y = GY - 0.12;
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.54, 28, 28),
    new THREE.MeshStandardMaterial({ map: makeGlobeTex(), metalness: 0.3, roughness: 0.5 })
  );
  globe.position.y = GY;
  group.add(ringMesh, globe);

  // ── Glow aura ────────────────────────────────────────────────────
  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xd4a820, transparent: true, opacity: 0.032, side: THREE.BackSide })
  );
  aura.position.y = 2.5;
  group.add(aura);

  group.scale.setScalar(1.55);
  group.position.set(0, 0.01, 0);
  scene.add(group);
  return group;
}

// trophy + trophyMeshes defined above with OBJLoader

// ── Stadium (field.glb) ───────────────────────────────────────────────────────
new GLTFLoader().load(
  'field.glb',
  gltf => {
    const model = gltf.scene;

    // Auto-scale: fit longest ground dimension to ~70 units
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 70 / Math.max(size.x, size.z);
    model.scale.setScalar(scale);

    // Re-measure after scale, then centre on origin and sit on y=0
    const box2  = new THREE.Box3().setFromObject(model);
    const centre = box2.getCenter(new THREE.Vector3());
    model.position.set(-centre.x, -box2.min.y, -centre.z);

    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          m.side             = THREE.DoubleSide;
          // Tone down metalness/roughness so base colors show under direct lights
          if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
            m.envMapIntensity = 0;
            m.metalness       = Math.min(m.metalness, 0.3);
          }
        });
      }
    });

    scene.add(model);

    // Centre trophy on the field surface after the model is placed
    const fieldBox = new THREE.Box3().setFromObject(model);
    const fieldCentre = fieldBox.getCenter(new THREE.Vector3());
    trophy.position.x = fieldCentre.x;
    trophy.position.z = fieldCentre.z;
    // y stays driven by the bob animation; set base to ground level
    trophy.position.y = 0;
  },
  null,
  err => console.error('field.glb load error:', err)
);

// ── Soccer Ball ───────────────────────────────────────────────────────────────
function makeBallTexture() {
  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = 512;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 512, 512);

  const patches = [
    [256, 256], [256, 128], [370, 186], [330, 330],
    [182, 330], [142, 186], [256, 390], [400, 270],
    [112, 270], [370, 120],
  ];
  ctx.fillStyle = '#111';
  patches.forEach(([cx, cy]) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + 44 * Math.cos(a), y = cy + 44 * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });

  return new THREE.CanvasTexture(cvs);
}

const ball = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 32, 32),
  new THREE.MeshStandardMaterial({ map: makeBallTexture(), roughness: 0.55 })
);
ball.castShadow = true;
ball.visible = false;
scene.add(ball);

// ── Confetti ──────────────────────────────────────────────────────────────────
function burstConfetti(pos) {
  const count = 250;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i*3] = pos.x; positions[i*3+1] = pos.y; positions[i*3+2] = pos.z;
    velocities[i*3]   = (Math.random() - 0.5) * 6;
    velocities[i*3+1] = Math.random() * 8 + 2;
    velocities[i*3+2] = (Math.random() - 0.5) * 6;
    const t = Math.floor(Math.random() * 3);
    if (t === 0) { colors[i*3]=1; colors[i*3+1]=0.1; colors[i*3+2]=0.1; }
    else if (t === 1) { colors[i*3]=0.1; colors[i*3+1]=0.3; colors[i*3+2]=1; }
    else { colors[i*3]=1; colors[i*3+1]=colors[i*3+1]=0.9; colors[i*3+2]=0.2; }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  let life = 0;
  function updateConfetti() {
    life += 0.018;
    if (life > 3) { scene.remove(pts); return; }
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      p[i*3]   += velocities[i*3]   * 0.018;
      p[i*3+1] += velocities[i*3+1] * 0.018;
      p[i*3+2] += velocities[i*3+2] * 0.018;
      velocities[i*3+1] -= 12 * 0.018;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - life / 3);
    requestAnimationFrame(updateConfetti);
  }
  requestAnimationFrame(updateConfetti);
}

// ── Raycasting ────────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-9999, -9999);
let trophyHovered = false;

const tooltip   = document.getElementById('tooltip');
const infoPanel = document.getElementById('info-panel');
const panelClose = document.getElementById('panel-close');

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth)  *  2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * -2 + 1;
  tooltip.style.left = (e.clientX + 18) + 'px';
  tooltip.style.top  = (e.clientY - 10) + 'px';
});

window.addEventListener('click', () => {
  if (!trophyHovered) return;
  infoPanel.classList.toggle('visible');
  controls.autoRotate = false;
});

panelClose.addEventListener('click', () => {
  infoPanel.classList.remove('visible');
  controls.autoRotate = true;
});

// ── Ball Kick State ───────────────────────────────────────────────────────────
let kickActive = false;
let kickT = 0;
const kickStart = new THREE.Vector3(0, 0.9, 8);
const kickEnd   = new THREE.Vector3(-2, 0.5, -29.5); // far goal corner
const kickCtrl  = new THREE.Vector3(-1, 11, -10);    // Bezier control point

// Exposed for contact.js
window.triggerBallKick = function () {
  ball.position.copy(kickStart);
  ball.visible = true;
  kickActive = true;
  kickT = 0;
  controls.autoRotate = false;
};

// ── Animation ─────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();
let netShakeT = 0, netShaking = false;

function bezier3(p0, p1, p2, t, out) {
  const u = 1 - t;
  out.x = u*u*p0.x + 2*u*t*p1.x + t*t*p2.x;
  out.y = u*u*p0.y + 2*u*t*p1.y + t*t*p2.y;
  out.z = u*u*p0.z + 2*u*t*p1.z + t*t*p2.z;
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Trophy spin + bob
  trophy.rotation.y = t * 0.18;
  trophy.position.y = Math.sin(t * 0.65) * 0.2;

  // Trophy emissive pulse
  const pulse = 0.08 + Math.sin(t * 2.2) * 0.04;
  trophyMeshes.forEach(m => {
    if (m.material.metalness > 0.8) {
      m.material.emissive = new THREE.Color(0xd4a820).multiplyScalar(pulse);
      m.material.emissiveIntensity = 1;
    }
  });

  // Trophy hover
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(trophyMeshes);
  const isHit = hits.length > 0;
  if (isHit !== trophyHovered) {
    trophyHovered = isHit;
    tooltip.textContent = 'FIFA WORLD CUP 2026™';
    tooltip.classList.toggle('visible', isHit);
    document.body.style.cursor = isHit ? 'pointer' : 'default';
  }

  // Ball kick
  if (kickActive) {
    kickT += 0.016;
    const prog = Math.min(kickT / 1.8, 1);
    bezier3(kickStart, kickCtrl, kickEnd, prog, ball.position);
    ball.rotation.x = prog * Math.PI * 5;
    ball.rotation.z = prog * Math.PI * 3;

    if (prog >= 1) {
      kickActive = false;
      ball.visible = false;
      burstConfetti(new THREE.Vector3(-2, 3, -29));
      netShaking = true;
      netShakeT = 0;
      const toast = document.getElementById('success-toast');
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 3500);
      setTimeout(() => { controls.autoRotate = true; }, 4000);
    }
  }

  // Net shake on far goal
  if (netShaking) {
    netShakeT += 0.05;
    const shake = Math.sin(netShakeT * 18) * Math.exp(-netShakeT * 3);
    goalFar.scale.set(1, 1 + shake * 0.06, 1 + shake * 0.12);
    if (netShakeT > 2) { netShaking = false; goalFar.scale.set(1, 1, 1); }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
