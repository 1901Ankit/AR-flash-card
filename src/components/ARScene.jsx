import { useRef, useState } from "react";
import CameraView from "./CameraView";
import MarkerTracker from "./MarkerTracker";

export default function ARScene({ imageTargetSrc, modelConfig, onExit }) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isTargetFound, setIsTargetFound] = useState(false);

  const handleExit = () => {
    cleanupRef.current?.();
    onExit?.();
  };

  return (
    <div className="relative w-screen overflow-hidden bg-black" style={{ height: "100dvh" }}>
      <CameraView ref={containerRef} />
      <MarkerTracker
        containerRef={containerRef}
        imageTargetSrc={imageTargetSrc}
        modelConfig={modelConfig}
        active
        onCleanupRef={cleanupRef}
        onTargetFound={() => setIsTargetFound(true)}
        onTargetLost={() => setIsTargetFound(false)}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <div className="relative w-full aspect-square" style={{ maxWidth: "min(78vw, 360px)" }}>
          {[
            "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
            "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute ${cls} transition-colors duration-300`}
              style={{
                width: "clamp(32px, 10vw, 48px)",
                height: "clamp(32px, 10vw, 48px)",
                borderColor: isTargetFound ? "#5EEAD4" : "rgba(255,255,255,0.6)",
              }}
            />
          ))}
          {!isTargetFound && (
            <div
              className="absolute left-0 right-0 h-[2px] animate-[scanline_2.2s_ease-in-out_infinite]"
              style={{ background: "linear-gradient(90deg, transparent, #5EEAD4, transparent)" }}
            />
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 flex justify-center px-4"
        style={{ top: "max(env(safe-area-inset-top), 20px)" }}
      >
        <div
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(0.8rem, 3vw, 1rem)" }}
          className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium backdrop-blur-md border text-center transition-colors ${isTargetFound
              ? "bg-[#5EEAD4]/15 border-[#5EEAD4]/60 text-[#5EEAD4]"
              : "bg-white/10 border-white/20 text-white"
            }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isTargetFound ? "bg-[#5EEAD4]" : "bg-white/70 animate-pulse"}`} />
          {isTargetFound ? "Flash Card Detected" : "Searching for Flash Card…"}
        </div>
      </div>

      <button
        type="button"
        onClick={handleExit}
        className="absolute z-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
        style={{
          top: "max(env(safe-area-inset-top), 16px)",
          right: "max(env(safe-area-inset-right), 16px)",
          width: "48px",
          height: "48px",
        }}
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