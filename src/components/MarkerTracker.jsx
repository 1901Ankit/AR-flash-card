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
  onCleanupRef,
}) {
  const mindarRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return undefined;

    let isCancelled = false;
    let mindarThree = null;
    let modelObject = null;
    const clock = new THREE.Clock();

    const hardStop = (instance) => {
      if (!instance) return;
      try {
        instance.renderer?.setAnimationLoop(null);
      } catch {}
      try {
        instance.stop();
      } catch {}
      try {
        const video = instance.video || videoRef.current;
        if (video) {
          videoRef.current = video;
          const stream = video.srcObject;
          if (stream?.getTracks) {
            stream.getTracks().forEach((track) => track.stop());
          }
          video.srcObject = null;
          video.pause();
        }
      } catch {}
      try {
        instance.renderer?.dispose();
      } catch {}
    };

    const stopAllCameraTracks = () => {
      try {
        const mediaDevices = navigator.mediaDevices;
        if (!mediaDevices) return;
        document.querySelectorAll("video").forEach((video) => {
          const stream = video.srcObject;
          if (stream?.getTracks) {
            stream.getTracks().forEach((track) => track.stop());
          }
          video.srcObject = null;
          video.remove();
        });
      } catch {}
    };

    const handleResize = () => {
      if (mindarThree?.renderer && mindarThree?.camera) {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;
        mindarThree.renderer.setSize(width, height);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const cleanup = () => {
      console.log("[MarkerTracker] Cleanup called, stopping camera...");
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      hardStop(mindarThree);
      stopAllCameraTracks();
      mindarRef.current = null;
      window.__arCurrentModel = null;

      // Specifically remove the MindAR video element using stored reference
      if (videoRef.current) {
        console.log("[MarkerTracker] Removing stored video element");
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.remove();
        videoRef.current = null;
      }

      // Also remove any remaining video elements & MindAR injected overlays
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.srcObject = null;
        video.remove();
      });

      document.querySelectorAll(".mindar-ui-overlay, .mindar-ui-scanning, .mindar-ui-loading").forEach((el) => {
        el.remove();
      });

      console.log("[MarkerTracker] Cleanup complete");
    };

    if (onCleanupRef) {
      onCleanupRef.current = cleanup;
    }

    const start = async () => {
      mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc,
        uiScanning: "no",
        uiLoading: "no",
      });
      mindarRef.current = mindarThree;
      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      const { renderer, scene, camera } = mindarThree;
      renderer.setClearColor(0x000000, 0);

      // Balanced natural lighting setup (preserves true texture colors and prevents white washout)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.65);
      mainLight.position.set(1, 2, 2);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
      fillLight.position.set(-1, -1, 1);
      scene.add(ambientLight, mainLight, fillLight);

      const anchor = mindarThree.addAnchor(0);
      modelObject = await buildModel(modelConfig);

      if (isCancelled) {
        hardStop(mindarThree);
        return;
      }

      anchor.group.add(modelObject);
      anchor.group.visible = true;
      window.__arCurrentModel = modelObject;
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

    return cleanup;
  }, [active, imageTargetSrc]);

  return null;
}