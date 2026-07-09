import * as THREE from "three";

/**
 * ModelViewer
 * -----------
 * Builds the AR content shown on top of a detected flash card,
 * and updates it every frame.
 */

function createCube({ scale = 0.3 } = {}) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.2,
    roughness: 0.4,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.5, 0);
  cube.scale.setScalar(scale);
  cube.userData.isAnimatedCube = true;
  return cube;
}

async function createGlb(config) {
  console.log("[ModelViewer] Loading GLB model from:", config.url);
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(config.url);
  console.log("[ModelViewer] GLB loaded successfully");
  const model = gltf.scene;

  // --- DEBUG: log every mesh separately to find what's inflating the box ---
  console.log("[ModelViewer] ---- Mesh breakdown ----");
  model.traverse((child) => {
    if (child.isMesh) {
      const meshBox = new THREE.Box3().setFromObject(child);
      const meshSize = new THREE.Vector3();
      meshBox.getSize(meshSize);
      console.log(
        `[ModelViewer] Mesh "${child.name || "(unnamed)"}" size:`,
        meshSize
      );
    }
  });
  console.log("[ModelViewer] ------------------------");

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  console.log("[ModelViewer] Raw model size:", size, "center:", center);

  model.position.set(-center.x, -box.min.y, -center.z);

  const targetHeight = config.targetHeight ?? 0.5;
  const maxDim = Math.max(size.x, size.y, size.z);
  const autoScale = config.scale ?? (maxDim > 0 ? targetHeight / maxDim : 1);
  model.scale.setScalar(autoScale);
  console.log("[ModelViewer] Applied scale:", autoScale, "targetHeight:", targetHeight);

  model.userData.isArModel = true;
  return model;
}

export async function buildModel(config = { type: "cube" }) {
  console.log("[ModelViewer] buildModel called with config:", config);
  switch (config.type) {
    case "glb":
      return createGlb(config);
    case "cube":
    default:
      console.log("[ModelViewer] Falling back to cube");
      return createCube(config);
  }
}

export function animateModel(object, deltaSeconds) {
  if (!object) return;
  if (object.userData.isAnimatedCube) {
    object.rotation.y += deltaSeconds * 1.2;
    object.rotation.x += deltaSeconds * 0.6;
  }
  if (object.userData.isArModel) {
    object.rotation.y += deltaSeconds * 0.5;
  }
}