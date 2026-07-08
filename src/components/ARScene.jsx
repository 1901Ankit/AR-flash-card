import { useRef, useState } from "react";
import CameraView from "./CameraView";
import MarkerTracker from "./MarkerTracker";

export default function ARScene({ imageTargetSrc, modelConfig, onExit }) {
  const containerRef = useRef(null);
  const [isTargetFound, setIsTargetFound] = useState(false);

  return (
    <div className="relative w-screen h-screen">
      <CameraView ref={containerRef} />

      <MarkerTracker
        containerRef={containerRef}
        imageTargetSrc={imageTargetSrc}
        modelConfig={modelConfig}
        active
        onTargetFound={() => setIsTargetFound(true)}
        onTargetLost={() => setIsTargetFound(false)}
      />

      {/* Top status bar */}
      <div className="pointer-events-none absolute top-0 inset-x-0 flex justify-center pt-4 sm:pt-6">
        <div
          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium shadow-lg backdrop-blur-md transition-colors ${
            isTargetFound
              ? "bg-emerald-500/80 text-white"
              : "bg-black/50 text-white"
          }`}
        >
          {isTargetFound ? "Flash Card Detected \u2705" : "Searching for Flash Card..."}
        </div>
      </div>

      {/* Exit button */}
      <button
        type="button"
        onClick={onExit}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-black/50 text-white text-xl sm:text-lg flex items-center justify-center backdrop-blur-md"
        aria-label="Close camera"
      >
        &times;
      </button>
    </div>
  );
}
