import * as THREE from "three";

function createCube({ scale = 0.3 } = {}) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x5eead4,
    metalness: 0.3,
    roughness: 0.3,
    wireframe: false,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.5, 0);
  cube.scale.setScalar(scale);
  cube.userData.isAnimatedCube = true;
  return cube;
}

function createProceduralArena(config = {}) {
  const group = new THREE.Group();

  // Base holographic platform
  const baseGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.08, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.04;
  group.add(base);

  // Hologram outer ring
  const ringGeo = new THREE.TorusGeometry(0.75, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.1;
  group.add(ring);

  // Inner pulsing grid
  const gridHelper = new THREE.GridHelper(1.2, 8, 0x5eead4, 0x3b82f6);
  gridHelper.position.y = 0.09;
  group.add(gridHelper);

  // Hologram core crystal
  const coreGeo = new THREE.OctahedronGeometry(0.28, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0xa855f7,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.9,
    wireframe: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0.45;
  group.add(core);

  // Floating orbit particles
  const orbitGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const pGeo = new THREE.TetrahedronGeometry(0.08, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.9,
    });
    const p = new THREE.Mesh(pGeo, pMat);
    p.position.set(Math.cos(angle) * 0.5, 0.4, Math.sin(angle) * 0.5);
    orbitGroup.add(p);
  }
  group.add(orbitGroup);

  group.userData = {
    isProcedural: true,
    type: "arena",
    core,
    orbitGroup,
    ring,
    speed: config.rotationSpeed || 0.6,
  };

  group.scale.setScalar(config.targetHeight ? config.targetHeight * 0.8 : 1.0);
  return group;
}

function createProceduralPortal(config = {}) {
  const group = new THREE.Group();

  // Outer magical arch / ring
  const ringGeo = new THREE.TorusGeometry(0.65, 0.06, 16, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  const arch = new THREE.Mesh(ringGeo, ringMat);
  arch.position.y = 0.65;
  group.add(arch);

  // Inner energy portal vortex
  const vortexGeo = new THREE.CircleGeometry(0.58, 32);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const vortex = new THREE.Mesh(vortexGeo, vortexMat);
  vortex.position.y = 0.65;
  group.add(vortex);

  // Pedestal
  const pedGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.12, 16);
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const ped = new THREE.Mesh(pedGeo, pedMat);
  ped.position.y = 0.06;
  group.add(ped);

  // Magic floating sparks
  const sparkGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const sGeo = new THREE.DodecahedronGeometry(0.05);
    const sMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const s = new THREE.Mesh(sGeo, sMat);
    const rad = 0.4 + Math.random() * 0.3;
    const ang = (i / 6) * Math.PI * 2;
    s.position.set(Math.cos(ang) * rad, 0.3 + Math.random() * 0.6, Math.sin(ang) * rad);
    sparkGroup.add(s);
  }
  group.add(sparkGroup);

  group.userData = {
    isProcedural: true,
    type: "portal",
    vortex,
    sparkGroup,
    speed: config.rotationSpeed || 0.5,
  };

  group.scale.setScalar(config.targetHeight ? config.targetHeight * 0.8 : 1.0);
  return group;
}

function createProceduralSolar(config = {}) {
  const group = new THREE.Group();

  // Planet body
  const planetGeo = new THREE.SphereGeometry(0.4, 32, 32);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0xb45309,
    emissiveIntensity: 0.2,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  planet.position.y = 0.55;
  group.add(planet);

  // Planet rings
  const ringGeo = new THREE.RingGeometry(0.52, 0.85, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.3;
  ring.position.y = 0.55;
  group.add(ring);

  // Orbiting Moons
  const moonGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const mGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const mMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const moon = new THREE.Mesh(mGeo, mMat);
    const dist = 1.0 + i * 0.25;
    moon.position.set(dist, 0.55, 0);
    moonGroup.add(moon);
  }
  group.add(moonGroup);

  group.userData = {
    isProcedural: true,
    type: "solar",
    planet,
    ring,
    moonGroup,
    speed: config.rotationSpeed || 0.6,
  };

  group.scale.setScalar(config.targetHeight ? config.targetHeight * 0.8 : 1.0);
  return group;
}

async function createGlb(config) {
  try {
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(config.url);
    const model = gltf.scene;

    model.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = false;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    let mixer = null;
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }

    const targetHeight = config.targetHeight ?? 0.5;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3();
    model.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geom = child.geometry;
        if (!geom.boundingBox) geom.computeBoundingBox();
        const geomBox = geom.boundingBox.clone();
        geomBox.applyMatrix4(child.matrixWorld);
        box.union(geomBox);
      }
    });

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const autoScale = config.scale ?? (maxDim > 0 ? targetHeight / maxDim : 1);

    const wrapper = new THREE.Group();
    const xOffset = config.xOffset || 0;
    const yOffset = config.yOffset || 0;
    const zOffset = config.zOffset || 0;
    model.position.set(-center.x + xOffset, -center.y + yOffset, -center.z + zOffset);
    model.scale.setScalar(autoScale);
    model.rotation.set(0, 0, 0);
    wrapper.position.set(0, 0, 0.05);
    wrapper.add(model);

    wrapper.userData = {
      isArModel: true,
      mixer,
      rotationSpeed: config.rotationSpeed || 0,
    };
    return wrapper;
  } catch (err) {
    console.error("[ModelViewer] Error loading GLB, falling back to cube:", err);
    return createCube(config);
  }
}

export async function buildModel(config = { type: "cube" }) {
  switch (config.type) {
    case "glb":
      return createGlb(config);
    case "procedural_arena":
      return createProceduralArena(config);
    case "procedural_portal":
      return createProceduralPortal(config);
    case "procedural_solar":
      return createProceduralSolar(config);
    case "cube":
    default:
      return createCube(config);
  }
}

export function animateModel(object, deltaSeconds) {
  if (!object) return;

  if (object.userData?.mixer) {
    object.userData.mixer.update(deltaSeconds);
  }

  if (object.userData?.rotationSpeed) {
    object.rotation.y += deltaSeconds * object.userData.rotationSpeed;
  }

  if (object.userData?.isAnimatedCube) {
    object.rotation.y += deltaSeconds * 1.2;
    object.rotation.x += deltaSeconds * 0.6;
  }

  if (object.userData?.isProcedural) {
    const { type, core, orbitGroup, ring, vortex, sparkGroup, planet, moonGroup } = object.userData;

    if (type === "arena") {
      if (core) {
        core.rotation.y += deltaSeconds * 1.4;
        core.rotation.x += deltaSeconds * 0.8;
      }
      if (orbitGroup) orbitGroup.rotation.y -= deltaSeconds * 1.8;
      if (ring) ring.rotation.z += deltaSeconds * 0.5;
    } else if (type === "portal") {
      if (vortex) vortex.rotation.z += deltaSeconds * 2.0;
      if (sparkGroup) sparkGroup.rotation.y += deltaSeconds * 0.8;
    } else if (type === "solar") {
      if (planet) planet.rotation.y += deltaSeconds * 0.9;
      if (moonGroup) moonGroup.rotation.y += deltaSeconds * 0.6;
    }
  }
}