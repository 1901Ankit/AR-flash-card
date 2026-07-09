import * as THREE from "three";
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

  console.log("[ModelViewer] ---- Mesh breakdown ----");
  model.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false; 
      const mat = child.material;
      const mats = Array.isArray(mat) ? mat : [mat];
      mats.forEach((m, i) => {
        console.log(
          `[ModelViewer] Mesh "${child.name}" material[${i}]:`,
          {
            type: m?.type,
            color: m?.color,
            map: m?.map ? "has texture" : "NO texture",
            opacity: m?.opacity,
            transparent: m?.transparent,
            visible: m?.visible,
          }
        );
      });
    }
  });

  console.log("[ModelViewer] Final model.visible:", model.visible);
  console.log("[ModelViewer] Final scale:", model.scale, "position:", model.position);
  console.log("[ModelViewer] ------------------------");

  const targetHeight = config.targetHeight ?? 0.5;

  // Compute precise bounding box from actual mesh vertices so the model
  // centers correctly even if the GLB origin is offset from its geometry.
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

  // Wrap model in a group centered on the marker.
  const wrapper = new THREE.Group();
  const xOffset = config.xOffset || 0;
  const yOffset = config.yOffset || 0;
  const zOffset = config.zOffset || 0;
  model.position.set(-center.x + xOffset, -box.min.y + yOffset, -center.z + zOffset);
  model.scale.setScalar(autoScale);
  wrapper.add(model);

  console.log("[ModelViewer] Bounding box size:", size, "center:", center);
  console.log("[ModelViewer] Auto scale:", autoScale, "targetHeight:", targetHeight);
  console.log("[ModelViewer] Final model position:", model.position, "scale:", model.scale);
  console.log("[ModelViewer] Wrapper position:", wrapper.position);

  wrapper.userData.isArModel = true;
  return wrapper;
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
  // Keep AR model static so it tracks smoothly with the card.
  // if (object.userData.isArModel) {
  //   object.rotation.y += deltaSeconds * 0.5;
  // }
}