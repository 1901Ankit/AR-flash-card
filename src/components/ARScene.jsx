import { useRef, useState } from "react";
import CameraView from "./CameraView";
import MarkerTracker from "./MarkerTracker";

export default function ARScene({ imageTargetSrc, modelConfig, onExit }) {
  const containerRef = useRef(null);
  const [isTargetFound, setIsTargetFound] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <CameraView ref={containerRef} />
      <MarkerTracker
        containerRef={containerRef}
        imageTargetSrc={imageTargetSrc}
        modelConfig={modelConfig}
        active
        onTargetFound={() => setIsTargetFound(true)}
        onTargetLost={() => setIsTargetFound(false)}
      />

      {/* Viewfinder corner brackets — Scan Portal, camera version */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-[70vw] max-w-[360px] aspect-square">
          {["top-0 left-0 border-t-2 border-l-2 rounded-tl-xl", "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl"].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-10 h-10 sm:w-12 sm:h-12 ${cls} transition-colors duration-300`}
              style={{ borderColor: isTargetFound ? "#5EEAD4" : "rgba(255,255,255,0.6)" }}
            />
          ))}
          {!isTargetFound && (
            <div className="absolute left-0 right-0 h-[2px] animate-[scanline_2.2s_ease-in-out_infinite]" style={{ background: "linear-gradient(90deg, transparent, #5EEAD4, transparent)" }} />
          )}
        </div>
      </div>

      {/* status badge */}
      <div className="pointer-events-none absolute top-0 inset-x-0 flex justify-center pt-5 sm:pt-8">
        <div
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-medium backdrop-blur-md border transition-colors ${isTargetFound
              ? "bg-[#5EEAD4]/15 border-[#5EEAD4]/60 text-[#5EEAD4]"
              : "bg-white/10 border-white/20 text-white"
            }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isTargetFound ? "bg-[#5EEAD4]" : "bg-white/70 animate-pulse"}`}
          />
          {isTargetFound ? "Flash Card Detected" : "Searching for Flash Card…"}
        </div>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-12 h-12 sm:w-11 sm:h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
        aria-label="Close camera"
      >
        &times;
      </button>

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