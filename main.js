import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Renderer ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ── Scene ─────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5baadf);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.004);

// ── Camera ────────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 900);
camera.position.set(0, 30, 55);

// ── Controls ──────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 120;
controls.maxPolarAngle = Math.PI / 2.1;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.25;



// ── Lighting ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xd0e8ff, 3.5));

const sunLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
sunLight.position.set(-140, 120, -300);
sunLight.castShadow = true;
scene.add(sunLight);

const floodPositions = [[-26, 28, -36], [26, 28, -36], [-26, 28, 36], [26, 28, 36]];
floodPositions.forEach(([x, y, z]) => {
  const spot = new THREE.SpotLight(0xfff3d0, 12, 140, Math.PI / 5.5, 0.35, 1.2);
  spot.position.set(x, y, z);
  spot.target.position.set(0, 0, 0);
  spot.castShadow = true;
  spot.shadow.mapSize.set(512, 512);
  scene.add(spot, spot.target);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.85, roughness: 0.4 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, y * 0.92, 6), poleMat);
  pole.position.set(x, y * 0.46, z);
  pole.castShadow = true;
  scene.add(pole);

  const housing = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.9), poleMat);
  housing.position.set(x, y, z);
  scene.add(housing);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff3d0, transparent: true, opacity: 0.9 })
  );
  glow.position.set(x, y + 0.3, z);
  scene.add(glow);
});

// ── Pitch ─────────────────────────────────────────────────────────────────────
function makePitchTexture() {
  const W = 512, H = 768;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');

  // Alternating grass stripes
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1a7c1a' : '#1e8e1e';
    ctx.fillRect(0, i * (H / 10), W, H / 10);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth = 3.5;

  const mx = 22, my = 18;
  const fw = W - mx * 2, fh = H - my * 2; // field width/height in canvas px

  // Boundary
  ctx.strokeRect(mx, my, fw, fh);

  // Halfway line
  ctx.beginPath(); ctx.moveTo(mx, H / 2); ctx.lineTo(W - mx, H / 2); ctx.stroke();

  // Center circle (radius ~9.15m / 68m * fw)
  const cr = fw * 0.135;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, cr, 0, Math.PI * 2); ctx.stroke();

  // Center dot
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 5, 0, Math.PI * 2); ctx.fill();

  // Penalty boxes (40.32m wide / 68m * fw, 16.5m deep / 105m * fh)
  const pbW = fw * 0.593, pbD = fh * 0.157;
  const pbX = mx + (fw - pbW) / 2;
  ctx.strokeRect(pbX, my, pbW, pbD);
  ctx.strokeRect(pbX, H - my - pbD, pbW, pbD);

  // 6-yard boxes (18.32m / 68m * fw, 5.5m / 105m * fh)
  const sbW = fw * 0.269, sbD = fh * 0.052;
  const sbX = mx + (fw - sbW) / 2;
  ctx.strokeRect(sbX, my, sbW, sbD);
  ctx.strokeRect(sbX, H - my - sbD, sbW, sbD);

  // Penalty spots (11m / 105m * fh from goal line)
  const psD = fh * 0.105;
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(W / 2, my + psD, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W / 2, H - my - psD, 5, 0, Math.PI * 2); ctx.fill();

  // Penalty arcs
  ctx.beginPath(); ctx.arc(W / 2, my + psD, cr, Math.PI * 0.32, Math.PI * 0.68); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H - my - psD, cr, -Math.PI * 0.68, -Math.PI * 0.32); ctx.stroke();

  // Corner arcs
  const co = 12;
  [[mx, my, 0, Math.PI / 2], [W - mx, my, Math.PI / 2, Math.PI],
   [mx, H - my, -Math.PI / 2, 0], [W - mx, H - my, Math.PI, Math.PI * 1.5]
  ].forEach(([cx, cy, a0, a1]) => {
    ctx.beginPath(); ctx.arc(cx, cy, co, a0, a1); ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Field: 40 wide (x), 60 long (z)
const field = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 60),
  new THREE.MeshStandardMaterial({ map: makePitchTexture(), roughness: 0.88, metalness: 0 })
);
field.rotation.x = -Math.PI / 2;
field.receiveShadow = true;
scene.add(field);

// Dark border surround
const border = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 70),
  new THREE.MeshStandardMaterial({ color: 0x041004, roughness: 1 })
);
border.rotation.x = -Math.PI / 2;
border.position.y = -0.01;
scene.add(border);

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

// ── Trophy ────────────────────────────────────────────────────────────────────
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

const trophy = makeTrophy();
// Collect trophy meshes for raycasting
const trophyMeshes = [];
trophy.traverse(c => { if (c.isMesh) trophyMeshes.push(c); });

// ── Team Flag Badges ──────────────────────────────────────────────────────────
const texLoader = new THREE.TextureLoader();

function makeFlag(flagUrl, xPos, accentColor) {
  const group = new THREE.Group();

  // Backing glow disc
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(3.8, 64),
    new THREE.MeshBasicMaterial({
      color: accentColor, transparent: true, opacity: 0.06, side: THREE.DoubleSide,
    })
  );

  // Flag plane
  const flagMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.75 });
  texLoader.load(flagUrl, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    flagMat.map = tex;
    flagMat.needsUpdate = true;
  });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.5), flagMat);
  flag.position.z = 0.05;

  // Border ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.1, 8, 64),
    new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.5 })
  );

  group.add(disc, flag, ring);
  group.position.set(xPos, 7, -4);
  group.rotation.y = xPos < 0 ? 0.25 : -0.25;
  scene.add(group);
  return group;
}

const canadaFlag = makeFlag('https://flagcdn.com/w320/ca.png', -24, 0xff3333);
const bosniaFlag = makeFlag('https://flagcdn.com/w320/ba.png',  24, 0x4477ff);

// ── Crowd Particles ───────────────────────────────────────────────────────────
function makeCrowd() {
  const count = 4000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 44 + Math.random() * 28;
    pos[i * 3]     = Math.cos(angle) * r;
    pos[i * 3 + 1] = 4 + Math.random() * 22;
    pos[i * 3 + 2] = Math.sin(angle) * r;

    const t = Math.random();
    if (t < 0.35)      { col[i*3]=1;    col[i*3+1]=0.12; col[i*3+2]=0.12; } // red (Canada)
    else if (t < 0.65) { col[i*3]=0.12; col[i*3+1]=0.28; col[i*3+2]=1;    } // blue (Bosnia)
    else               { col[i*3]=1;    col[i*3+1]=1;    col[i*3+2]=1;    } // white
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  return new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.4, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true,
  }));
}
const crowd = makeCrowd();
scene.add(crowd);

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

  // Flag badges float
  canadaFlag.position.y = 7 + Math.sin(t * 0.75) * 0.35;
  bosniaFlag.position.y = 7 + Math.sin(t * 0.75 + Math.PI) * 0.35;
  canadaFlag.rotation.y = 0.25 + Math.sin(t * 0.3) * 0.04;
  bosniaFlag.rotation.y = -0.25 - Math.sin(t * 0.3 + 1) * 0.04;

  // Crowd shimmer
  crowd.rotation.y = t * 0.035;
  crowd.material.opacity = 0.65 + Math.sin(t * 3) * 0.08;

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
