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
    let modelObject = null;
    const clock = new THREE.Clock();

    // Fully stop everything: render loop, MindAR, and the raw camera stream.
    const hardStop = (instance) => {
      if (!instance) return;
      try {
        instance.renderer?.setAnimationLoop(null);
      } catch {}
      try {
        instance.stop();
      } catch {}
      // Explicitly kill the camera track — mindarThree.stop() sometimes
      // leaves the getUserMedia stream alive, which is what causes the
      // camera/scan effect to keep "running" after exiting.
      try {
        const video = instance.video;
        const stream = video?.srcObject;
        if (stream?.getTracks) {
          stream.getTracks().forEach((track) => track.stop());
        }
        if (video) video.srcObject = null;
      } catch {}
      try {
        instance.renderer?.dispose();
      } catch {}
    };

    const start = async () => {
      mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc,
      });
      mindarRef.current = mindarThree;

      // If exit was clicked while MindAR was still initializing, bail out
      // immediately instead of continuing to build the scene.
      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      const { renderer, scene, camera } = mindarThree;
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(hemisphereLight, directionalLight);

      const anchor = mindarThree.addAnchor(0);
      modelObject = await buildModel(modelConfig);

      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      anchor.group.add(modelObject);
      anchor.group.visible = true;
      anchor.onTargetFound = () => onTargetFound?.();
      anchor.onTargetLost = () => onTargetLost?.();

      await mindarThree.start();

      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        animateModel(modelObject, delta);
        renderer.render(scene, camera);
      });
    };

    start().catch((err) => {
      console.error("MindAR failed to start:", err);
    });

    return () => {
      isCancelled = true;
      hardStop(mindarRef.current);
      mindarRef.current = null;
    };
  }, [active, imageTargetSrc]);

  return null;
}