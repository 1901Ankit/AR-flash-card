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
 * Loads a GLB model asynchronously. Placeholder for future scope - requires
 * `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader.js`.
 */
async function createGlb(config) {
  const { GLTFLoader } = await import(
    "three/examples/jsm/loaders/GLTFLoader.js"
  );
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(config.url);
  const model = gltf.scene;
  if (config.scale) {
    model.scale.setScalar(config.scale);
  }
  return model;
}

/**
 * Builds the THREE.Object3D for a given model config. Falls back to the
 * default cube if the type is unknown or not yet implemented.
 * @param {ModelConfig} config
 * @returns {Promise<THREE.Object3D>}
 */
export async function buildModel(config = { type: "cube" }) {
  switch (config.type) {
    case "glb":
      return createGlb(config);
    case "cube":
    default:
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
}
