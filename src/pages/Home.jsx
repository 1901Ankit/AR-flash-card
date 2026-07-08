import { useState } from "react";
import ARScene from "../components/ARScene";
import useCamera, { CAMERA_STATUS } from "../hooks/useCamera";
import targetMindUrl from "../assets/marker/target.mind?url";
import gokuModelUrl from "../assets/goku.glb?url";
const DEFAULT_TARGET_SRC = targetMindUrl;
const DEFAULT_MODEL_CONFIG = { type: "glb", url: gokuModelUrl, scale: 1.0 };

export default function Home() {
  const { status, error, requestCameraPermission } = useCamera();
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScanning = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setIsScanning(true);
    }
  };

  if (isScanning) {
    return (
      <ARScene
        imageTargetSrc={DEFAULT_TARGET_SRC}
        modelConfig={DEFAULT_MODEL_CONFIG}
        onExit={() => setIsScanning(false)}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">AR Flash Card</h1>
      <p className="text-slate-300 max-w-xs">
        Point your camera at a flash card to bring it to life.
      </p>

      <button
        type="button"
        onClick={handleStartScanning}
        disabled={status === CAMERA_STATUS.REQUESTING}
        className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-lg transition-colors"
      >
        {status === CAMERA_STATUS.REQUESTING ? "Requesting Camera..." : "Start Scanning"}
      </button>

      {status === CAMERA_STATUS.DENIED && (
        <p className="text-red-400 text-sm max-w-xs">
          Camera permission was denied. Please allow camera access in your
          browser settings and try again.
        </p>
      )}

      {status === CAMERA_STATUS.UNSUPPORTED && (
        <p className="text-red-400 text-sm max-w-xs">
          {error || "Your browser does not support camera access."}
        </p>
      )}
    </div>
  );
}
