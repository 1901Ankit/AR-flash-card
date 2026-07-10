import { useState } from "react";
import ARScene from "../components/ARScene";
import useCamera, { CAMERA_STATUS } from "../hooks/useCamera";
import targetMindUrl from "../assets/marker/target.mind?url";
import target1MindUrl from "../assets/marker/target1.mind?url";
import gokuModelUrl from "../assets/goku.glb?url";
import dragonModelUrl from "../assets/dragon.glb?url";

const CARDS = [
  {
    id: 1,
    name: "Goku",
    marker: targetMindUrl,
    model: {
      type: "glb",
      url: gokuModelUrl,
      targetHeight: 2.0,
      xOffset: -2.1,
    },
  },
  {
    id: 2,
    name: "Dragon",
    marker: target1MindUrl,
    model: {
      type: "glb",
      url: dragonModelUrl,
      targetHeight: 1.5,
      xOffset: 0,
    },
  },
];

export default function Home() {
  const { status, error, requestCameraPermission } = useCamera();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCard, setSelectedCard] = useState(CARDS[0]);

  const handleStartScanning = async () => {
    const granted = await requestCameraPermission();
    if (granted) setIsScanning(true);
  };

  if (isScanning) {
    return (
      <ARScene
        imageTargetSrc={selectedCard.marker}
        modelConfig={selectedCard.model}
        onExit={() => {
          // Aggressively stop all camera streams
          navigator.mediaDevices?.getUserMedia({ video: true }).then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
          }).catch(() => {});
          setIsScanning(false);
        }}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background:
          "radial-gradient(ellipse at 50% 20%, #1a1a3d 0%, #0B0B1E 55%, #08081566 100%)",
        minHeight: "100dvh",
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
        paddingLeft: "max(env(safe-area-inset-left), 20px)",
        paddingRight: "max(env(safe-area-inset-right), 20px)",
      }}
      className="relative w-screen overflow-hidden flex flex-col items-center justify-center text-white"
    >
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="relative mb-6 sm:mb-10 flex items-center justify-center"
        style={{ width: "clamp(120px, 32vw, 192px)", height: "clamp(120px, 32vw, 192px)" }}
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 animate-[spin_14s_linear_infinite]">
          <polygon
            points="100,10 175,55 175,145 100,190 25,145 25,55"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="2.5"
            strokeDasharray="18 14"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <svg viewBox="0 0 200 200" className="absolute inset-0 animate-[spin_9s_linear_infinite_reverse] opacity-40">
          <polygon points="100,30 155,65 155,135 100,170 45,135 45,65" fill="none" stroke="#5EEAD4" strokeWidth="1" />
        </svg>
        <div
          className="relative rounded-lg animate-[float_3.4s_ease-in-out_infinite]"
          style={{
            width: "clamp(56px, 15vw, 80px)",
            height: "clamp(70px, 19vw, 96px)",
            background: "linear-gradient(155deg, #2a2a55, #1a1a3d)",
            border: "1px solid rgba(94,234,212,0.5)",
            boxShadow: "0 0 30px rgba(94,234,212,0.35), 0 0 60px rgba(139,92,246,0.2)",
          }}
        >
          <div className="absolute inset-2 rounded-md" style={{ background: "linear-gradient(160deg, #5EEAD4aa, #8B5CF6aa)" }} />
        </div>
      </div>

      <h1
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2rem, 8vw, 3.75rem)" }}
        className="font-bold tracking-tight text-center leading-[1.05]"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5EEAD4] to-[#8B5CF6]">
          AR Flash Card
        </span>
      </h1>
      <p
        style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)" }}
        className="mt-3 sm:mt-4 text-[#A8A3C7] max-w-[min(90vw,420px)] text-center leading-relaxed"
      >
        Point your camera at the card. Watch it come alive.
      </p>

      <div className="mt-6 sm:mt-8 flex gap-3 justify-center flex-wrap max-w-[min(90vw,420px)]">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setSelectedCard(card)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCard.id === card.id
                ? "bg-[#5EEAD4]/20 border-[#5EEAD4] text-[#5EEAD4]"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              border: "1px solid",
            }}
          >
            {card.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleStartScanning}
        disabled={status === CAMERA_STATUS.REQUESTING}
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
          boxShadow: "0 0 25px rgba(94,234,212,0.45)",
          fontSize: "clamp(0.95rem, 3.2vw, 1.125rem)",
          minHeight: "56px",
        }}
        className="mt-8 sm:mt-10 px-8 sm:px-9 py-4 rounded-full font-semibold text-[#0B0B1E] disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95 min-w-[200px] sm:min-w-[220px] max-w-[90vw]"
      >
        {status === CAMERA_STATUS.REQUESTING ? "Requesting Camera…" : "Start Scanning"}
      </button>

      {status === CAMERA_STATUS.DENIED && (
        <p className="mt-4 text-red-400 text-sm max-w-[min(90vw,420px)] text-center">
          Camera permission was denied. Allow camera access in browser settings and try again.
        </p>
      )}
      {status === CAMERA_STATUS.UNSUPPORTED && (
        <p className="mt-4 text-red-400 text-sm max-w-[min(90vw,420px)] text-center">
          {error || "Your browser does not support camera access."}
        </p>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(8deg) rotateY(-8deg); }
          50% { transform: translateY(-10px) rotateX(4deg) rotateY(8deg); }
        }
      `}</style>
    </div>
  );
}