import * as THREE from "three";
/**
 * ModelViewer
 * -----------
 * Factory helpers that build the actual AR content (the thing shown on top
 * of a detected flash card) and update it every frame.
 *
 * This is intentionally decoupled from MindAR/React: it just receives a
 * `config` object describing what to render and returns a plain THREE.Object3D
 * that can be attached to a MindAR anchor group.
 *
 * MVP supports a "cube" type. Future types (glb, video, image, audio) can be
 * added here without touching the AR tracking logic in `MarkerTracker.jsx`.
 */
/**
 * @typedef {Object} ModelConfig
 * @property {"cube" | "glb"} type
 * @property {string} [url] - required for type "glb"
 * @property {number} [scale]
 */
/**
 * Creates the default placeholder object: a rotating, colored cube.
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
/**
 * Loads a GLB model asynchronously and centers it above the marker.
 */
async function createGlb(config) {
  console.log("[ModelViewer] Loading GLB model from:", config.url);
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(config.url);
  console.log("[ModelViewer] GLB loaded successfully");
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);
  console.log("[ModelViewer] Model size:", size, "center:", center);
  // Center horizontally and place the bottom of the model on the card.
  model.position.x = -center.x;
  model.position.y = -box.min.y;
  model.position.z = -center.z;

  // Move model closer to camera to ensure visibility
  model.position.z += 0.5;

  if (config.scale) {
    model.scale.setScalar(config.scale);
  } else {
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitScale = maxDim > 0 ? 1.5 / maxDim : 1;
    model.scale.setScalar(fitScale);
  }
  console.log("[ModelViewer] Final model position:", model.position, "scale:", model.scale);
  model.userData.isArModel = true;
  return model;
}
/**
 * Builds the THREE.Object3D for a given model config. Falls back to the
 * default cube if the type is unknown or not yet implemented.
 * @param {ModelConfig} config
 * @returns {Promise<THREE.Object3D>}
 */
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
/**
 * Adds a light rotation animation to any object flagged as an animated cube.
 * Called every frame from the MindAR render loop.
 * @param {THREE.Object3D} object
 * @param {number} deltaSeconds
 */
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
