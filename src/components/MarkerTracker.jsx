import { useEffect, useRef } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import * as THREE from "three";
import { buildModel, animateModel } from "./ModelViewer";

export default function MarkerTracker({
  containerRef,
  imageTargetSrc,
  modelConfig,
  onTargetFound,
  onTargetLost,
  active,
}) {
  const mindarRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    let isCancelled = false;
    let mindarThree = null;
    let anchor = null;
    let modelObject = null;
    const clock = new THREE.Clock();

    const start = async () => {
      console.log("[MarkerTracker] Starting MindAR...");
      mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc,
      });
      mindarRef.current = mindarThree;
      const { renderer, scene, camera } = mindarThree;

      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(hemisphereLight, directionalLight);

      anchor = mindarThree.addAnchor(0);
      modelObject = await buildModel(modelConfig);
      if (isCancelled) return;

      console.log("[MarkerTracker] Model built, adding to anchor group");
      anchor.group.add(modelObject);
      anchor.group.visible = true;
      anchor.onTargetFound = () => onTargetFound?.();
      anchor.onTargetLost = () => onTargetLost?.();

      await mindarThree.start();
      if (isCancelled) return;

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        animateModel(modelObject, delta);
        renderer.render(scene, camera);
      });
    };

    start().catch((err) => {
      console.error("MindAR failed to start:", err);
      if (err?.message?.includes?.("fetch") || err?.message?.includes?.("load")) {
        console.error(
          "The .mind target file may be missing or empty. Run: npm run generate-marker"
        );
      }
    });

    return () => {
      isCancelled = true;
      if (mindarThree) {
        mindarThree.renderer?.setAnimationLoop(null);
        mindarThree.stop();
        mindarThree.renderer?.dispose();
      }
      mindarRef.current = null;
    };
  }, [active, imageTargetSrc]);

  return null;
}