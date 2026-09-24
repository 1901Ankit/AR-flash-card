import * as THREE from "three";

function createCube({ scale = 0.5, targetHeight } = {}) {
  const finalScale = targetHeight ? targetHeight * 0.7 : scale;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.3,
    metalness: 0.4,
    roughness: 0.2,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0);
  cube.scale.setScalar(finalScale);
  cube.userData.isAnimatedCube = true;

  const wrapper = new THREE.Group();
  wrapper.position.set(0, 0, 0.25);
  wrapper.add(cube);
  return wrapper;
}

function createProceduralArena(config = {}) {
  const group = new THREE.Group();

  const baseGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.06, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.rotation.x = Math.PI / 2.5;
  group.add(base);

  const ringGeo = new THREE.TorusGeometry(0.65, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  group.add(ring);

  const gridHelper = new THREE.GridHelper(1.0, 8, 0x5eead4, 0x3b82f6);
  gridHelper.rotation.x = Math.PI / 2.5;
  group.add(gridHelper);

  const coreGeo = new THREE.OctahedronGeometry(0.24, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0xa855f7,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.9,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 0, 0.15);
  group.add(core);

  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(0, 0, 0.15);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const pGeo = new THREE.TetrahedronGeometry(0.06, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x2dd4bf,
      emissiveIntensity: 0.9,
    });
    const p = new THREE.Mesh(pGeo, pMat);
    p.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0);
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

  const scale = config.targetHeight ? config.targetHeight * 0.85 : 0.6;
  group.scale.setScalar(scale);

  const wrapper = new THREE.Group();
  wrapper.position.set(0, 0, 0.2);
  wrapper.add(group);
  return wrapper;
}

function createProceduralPortal(config = {}) {
  const group = new THREE.Group();

  const ringGeo = new THREE.TorusGeometry(0.55, 0.05, 16, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  const arch = new THREE.Mesh(ringGeo, ringMat);
  group.add(arch);

  const vortexGeo = new THREE.CircleGeometry(0.48, 32);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    wireframe: true,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const vortex = new THREE.Mesh(vortexGeo, vortexMat);
  group.add(vortex);

  const pedGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.1, 16);
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const ped = new THREE.Mesh(pedGeo, pedMat);
  ped.rotation.x = Math.PI / 2;
  ped.position.set(0, -0.5, -0.05);
  group.add(ped);

  const sparkGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const sGeo = new THREE.DodecahedronGeometry(0.04);
    const sMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const s = new THREE.Mesh(sGeo, sMat);
    const rad = 0.35 + Math.random() * 0.25;
    const ang = (i / 6) * Math.PI * 2;
    s.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, (Math.random() - 0.5) * 0.2);
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

  const scale = config.targetHeight ? config.targetHeight * 0.9 : 0.65;
  group.scale.setScalar(scale);

  const wrapper = new THREE.Group();
  wrapper.position.set(0, 0, 0.2);
  wrapper.add(group);
  return wrapper;
}

function createProceduralSolar(config = {}) {
  const group = new THREE.Group();

  const planetGeo = new THREE.SphereGeometry(0.35, 32, 32);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0xb45309,
    emissiveIntensity: 0.25,
  });
  const planet = new THREE.Mesh(planetGeo, planetMat);
  group.add(planet);

  const ringGeo = new THREE.RingGeometry(0.45, 0.75, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  const moonGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const mGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const mMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const moon = new THREE.Mesh(mGeo, mMat);
    const dist = 0.85 + i * 0.2;
    const ang = (i / 3) * Math.PI * 2;
    moon.position.set(Math.cos(ang) * dist, Math.sin(ang) * dist * 0.6, Math.sin(ang) * 0.3);
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

  const scale = config.targetHeight ? config.targetHeight * 0.85 : 0.6;
  group.scale.setScalar(scale);

  const wrapper = new THREE.Group();
  wrapper.position.set(0, 0, 0.2);
  wrapper.add(group);
  return wrapper;
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
        if (child.material) {
          child.material.side = THREE.DoubleSide;
          if (child.material.map) child.material.map.needsUpdate = true;
        }
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

    if (config.rotationX) model.rotation.x = config.rotationX;
    if (config.rotationY) model.rotation.y = config.rotationY;
    if (config.rotationZ) model.rotation.z = config.rotationZ;

    model.updateMatrixWorld(true);

    const initialBox = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    initialBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

   
    const targetHeight = config.targetHeight ?? 0.8;
    const autoScale = config.scale ?? (maxDim > 0 ? targetHeight / maxDim : 0.8);

    model.scale.setScalar(autoScale);
    model.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);
    const scaledSize = new THREE.Vector3();
    scaledBox.getSize(scaledSize);

    const xOffset = config.xOffset || 0;
    const yOffset = config.yOffset || 0;
    const zOffset = config.zOffset || 0;

    const zBaseOffset = -scaledBox.min.z + 0.05;

    model.position.set(
      -scaledCenter.x + xOffset,
      -scaledCenter.y + yOffset,
      zBaseOffset + zOffset
    );

    const wrapper = new THREE.Group();
    wrapper.add(model);

    wrapper.userData = {
      isArModel: true,
      mixer,
      baseScale: autoScale,
      rotationSpeed: 0, 
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

  if (object.userData?.rotationSpeed && !object.userData?.isArModel) {
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
      if (orbitGroup) orbitGroup.rotation.z -= deltaSeconds * 1.5;
      if (ring) ring.rotation.z += deltaSeconds * 0.5;
    } else if (type === "portal") {
      if (vortex) vortex.rotation.z += deltaSeconds * 2.0;
      if (sparkGroup) sparkGroup.rotation.z += deltaSeconds * 0.8;
    } else if (type === "solar") {
      if (planet) planet.rotation.y += deltaSeconds * 0.9;
      if (moonGroup) moonGroup.rotation.z += deltaSeconds * 0.6;
    }
  }
}