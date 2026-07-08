import { useState } from "react";
import { Compiler } from "mind-ar/src/image-target/compiler.js";
import cardUrl from "../assets/marker/card.jpg?url";

export default function CompileMarker() {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleCompile = async () => {
    setStatus("loading-image");
    setError(null);
    setProgress(0);

    try {
      const img = await loadImage(cardUrl);

      setStatus("compiling");
      const compiler = new Compiler();
      await compiler.compileImageTargets([img], (percent) => {
        setProgress(percent);
      });

      const buffer = compiler.exportData();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "target.mind";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus("done");
    } catch (err) {
      console.error(err);
      setError(err?.message || String(err));
      setStatus("error");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-white p-6 text-center">
      <h1 className="text-2xl font-bold">Compile Marker</h1>
      <img
        src={cardUrl}
        alt="card"
        className="max-w-xs rounded-lg border border-slate-700"
      />
      <button
        type="button"
        onClick={handleCompile}
        disabled={status === "loading-image" || status === "compiling"}
        className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 font-semibold"
      >
        {status === "idle" && "Compile card.jpg -> target.mind"}
        {status === "loading-image" && "Loading image..."}
        {status === "compiling" && `Compiling... ${progress.toFixed(0)}%`}
        {status === "done" && "Done! Downloaded target.mind"}
        {status === "error" && "Failed, try again"}
      </button>
      {error && <p className="text-red-400 text-sm max-w-sm">{error}</p>}
      {status === "done" && (
        <p className="text-emerald-400 text-sm max-w-sm">
          Check your Downloads folder for target.mind
        </p>
      )}
    </div>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
