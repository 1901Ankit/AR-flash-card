import { useRef, useState } from "react";
import CameraView from "./CameraView";
import MarkerTracker from "./MarkerTracker";
import AROverlayUI from "./AROverlayUI";

export default function ARScene({ item, imageTargetSrc, modelConfig, onExit }) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isTargetFound, setIsTargetFound] = useState(false);

  const activeItem = item || {
    title: "AR Flashcard",
    category: "flashcard",
    description: "Scan the card marker to view 3D model",
  };

  const handleExit = () => {
    cleanupRef.current?.();
    onExit?.();
  };

  return (
    <div className="relative w-screen overflow-hidden bg-black" style={{ height: "100dvh" }}>
      <CameraView ref={containerRef} />
      <MarkerTracker
        containerRef={containerRef}
        imageTargetSrc={imageTargetSrc || activeItem.markerUrl}
        modelConfig={modelConfig || activeItem.model}
        active
        onCleanupRef={cleanupRef}
        onTargetFound={() => setIsTargetFound(true)}
        onTargetLost={() => setIsTargetFound(false)}
      />

      {/* Interactive AR Overlay HUD */}
      <AROverlayUI item={activeItem} isTargetFound={isTargetFound} onExit={handleExit} />

      <style>{`
        @keyframes scanline {
          0% { top: 6%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 94%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}