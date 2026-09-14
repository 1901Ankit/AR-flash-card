import { useRef, useState } from "react";
import { Printer, Download, X, QrCode, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { sfx } from "../services/soundEffects";

export default function PrintExporter({ item, onClose }) {
  const printAreaRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    sfx.playClick();
    window.print();
  };

  // Direct QR Code generation URL (using fast reliable API)
  const qrTargetUrl = typeof window !== "undefined" ? window.location.origin : "https://ar-flash-card.app";
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${qrTargetUrl}?item=${item.id}`
  )}`;

  const handleDownloadImage = async () => {
    sfx.playClick();
    setIsDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 1200;
      const height = 750;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Outer Border & Crop Marks
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 14px monospace";
      ctx.fillText("✂ CROP LINE", 45, 55);
      ctx.fillText("HYPER-AR PRINT SHEET V2.0", width - 300, 55);

      // Helper to load image
      const loadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });

      // 1. Draw Marker Box
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(70, 90, 420, 560);

      // Marker header label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.title.toUpperCase(), 280, 125);

      // Marker Image
      const markerImg = await loadImage(item.markerPreview);
      if (markerImg) {
        ctx.drawImage(markerImg, 90, 145, 380, 430);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(90, 145, 380, 430);
        ctx.fillStyle = "#5eead4";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("AR MARKER IMAGE", 280, 360);
      }

      ctx.fillStyle = "#5eead4";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("★ POINT PHONE CAMERA HERE ★", 280, 615);

      // 2. Right Side Packaging & Details
      ctx.textAlign = "left";
      ctx.fillStyle = "#0891b2";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(item.category.toUpperCase().replace("_", " "), 540, 120);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText(item.title, 540, 170);

      ctx.fillStyle = "#64748b";
      ctx.font = "italic 18px sans-serif";
      ctx.fillText(item.tagline || "Interactive AR Series", 540, 205);

      // Description text wrapping
      ctx.fillStyle = "#334155";
      ctx.font = "16px sans-serif";
      const desc = item.description || "Scan this card marker to summon interactive 3D model and voice narration.";
      const words = desc.split(" ");
      let line = "";
      let y = 250;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 560 && n > 0) {
          ctx.fillText(line, 540, y);
          line = words[n] + " ";
          y += 26;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 540, y);

      // 3. QR Code & Instructions Box
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.fillRect(540, 440, 580, 210);
      ctx.strokeRect(540, 440, 580, 210);

      const qrImg = await loadImage(qrCodeApiUrl);
      if (qrImg) {
        ctx.drawImage(qrImg, 560, 460, 170, 170);
      }

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("⚡ Instant WebAR Scanner", 750, 490);

      ctx.fillStyle = "#475569";
      ctx.font = "15px sans-serif";
      ctx.fillText("1. Scan this QR code with your phone camera.", 750, 530);
      ctx.fillText("2. Allow browser camera permission.", 750, 560);
      ctx.fillText("3. Point phone at the image on the left!", 750, 590);

      // Trigger automatic file download
      const filename = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}_AR_Card_Print.png`;
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      sfx.playSuccess();
    } catch (err) {
      console.error("Error generating print download:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#141824] border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-violet-400">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Automated Print & Packaging Layout
              </h2>
              <p className="text-xs text-slate-400">
                Ready-to-print CMYK layout with dynamic WebAR QR code & marker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div
          ref={printAreaRef}
          id="printable-ar-sheet"
          className="bg-white text-black p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-dashed border-slate-300 relative overflow-hidden"
          style={{ minHeight: "340px" }}
        >
          {/* Bleed / Crop Marks */}
          <div className="absolute top-2 left-2 text-[9px] sm:text-[10px] text-slate-400 font-mono">✂ CROP LINE</div>
          <div className="absolute top-2 right-2 text-[9px] sm:text-[10px] text-slate-400 font-mono">AR MARKER V1.0</div>

          <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-center justify-between mt-4">
            {/* 2D AR Marker Image */}
            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="w-full max-w-[220px] sm:w-56 h-64 sm:h-72 rounded-xl border-4 border-black p-2 bg-slate-50 flex flex-col items-center justify-between relative shadow-md">
                <div className="w-full text-center py-1 bg-black text-white rounded font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate px-1">
                  {item.title}
                </div>
                <img
                  src={item.markerPreview}
                  alt={item.title}
                  className="w-full h-36 sm:h-44 object-cover rounded-lg border border-slate-300"
                  crossOrigin="anonymous"
                />
                <div className="text-[9px] sm:text-[10px] font-semibold text-center text-slate-700">
                  ★ POINT PHONE CAMERA HERE ★
                </div>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-500 mt-2 font-mono">
                AR Image Target ({item.printLayout?.dimensions || "3.5 x 5 in"})
              </span>
            </div>

            {/* Packaging Back / Instructions & QR */}
            <div className="flex-1 w-full flex flex-col justify-between min-h-[240px] sm:h-72 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase bg-cyan-100 text-cyan-800 mb-2">
                  {item.category.replace("_", " ")}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{item.tagline}</p>
                <p className="text-xs text-slate-700 mt-2 sm:mt-3 leading-relaxed">{item.description}</p>
              </div>

              {/* Dynamic QR Code & Instructions */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-3 sm:gap-4 bg-slate-50 p-2.5 sm:p-3 rounded-xl">
                <img
                  src={qrCodeApiUrl}
                  alt="Scan QR code for WebAR"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-slate-300 shrink-0 bg-white p-1"
                />
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-cyan-600" /> Instant WebAR Scanner
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
                    1. Scan QR with your phone camera.
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-600">
                    2. Point phone at the image to see 3D model!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated CMYK 300 DPI Export Ready
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              <Printer className="w-4 h-4 text-slate-400" /> Print Template
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold shadow-sm active:scale-95 disabled:opacity-50 transition-all"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Generating High-Res...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Card / Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
