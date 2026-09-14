import { useRef } from "react";
import { Printer, Download, X, QrCode, Sparkles, CheckCircle2 } from "lucide-react";

export default function PrintExporter({ item, onClose }) {
  const printAreaRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  // Direct QR Code generation URL (using fast reliable API)
  const qrTargetUrl = typeof window !== "undefined" ? window.location.origin : "https://ar-flash-card.app";
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `${qrTargetUrl}?item=${item.id}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F0F26] border border-[#5EEAD4]/30 rounded-2xl shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#5EEAD4]/10 border border-[#5EEAD4]/30 text-[#5EEAD4]">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                Automated Print & Packaging Layout
              </h2>
              <p className="text-xs text-[#A8A3C7]">
                Ready-to-print CMYK layout with dynamic WebAR QR code & marker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div
          ref={printAreaRef}
          id="printable-ar-sheet"
          className="bg-white text-black p-6 rounded-xl shadow-lg border-2 border-dashed border-slate-300 relative overflow-hidden"
          style={{ minHeight: "380px" }}
        >
          {/* Bleed / Crop Marks */}
          <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">✂ CROP LINE</div>
          <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono">AR MARKER V1.0</div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mt-4">
            {/* 2D AR Marker Image */}
            <div className="flex flex-col items-center">
              <div className="w-56 h-72 rounded-lg border-4 border-black p-2 bg-slate-50 flex flex-col items-center justify-between relative shadow-md">
                <div className="w-full text-center py-1 bg-black text-white rounded font-bold text-xs uppercase tracking-wider">
                  {item.title}
                </div>
                <img
                  src={item.markerPreview}
                  alt={item.title}
                  className="w-full h-44 object-cover rounded border border-slate-300"
                  crossOrigin="anonymous"
                />
                <div className="text-[10px] font-semibold text-center text-slate-700">
                  ★ POINT PHONE CAMERA HERE ★
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-mono">
                AR Image Target ({item.printLayout?.dimensions || "3.5 x 5 in"})
              </span>
            </div>

            {/* Packaging Back / Instructions & QR */}
            <div className="flex-1 flex flex-col justify-between h-72 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-4 md:pt-0">
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-cyan-100 text-cyan-800 mb-2">
                  {item.category.replace("_", " ")}
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{item.tagline}</p>
                <p className="text-xs text-slate-700 mt-3 leading-relaxed">{item.description}</p>
              </div>

              {/* Dynamic QR Code & Instructions */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
                <img
                  src={qrCodeApiUrl}
                  alt="Scan QR code for WebAR"
                  className="w-20 h-20 rounded border border-slate-300 shrink-0 bg-white p-1"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-cyan-600" /> Instant WebAR Scanner
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    1. Scan QR with your phone camera.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    2. Point phone at the image on the left to see the 3D model!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-[#5EEAD4]">
            <CheckCircle2 className="w-4 h-4" /> Automated CMYK 300 DPI Export Ready
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all"
            >
              <Printer className="w-4 h-4" /> Print Template
            </button>
            <button
              onClick={handlePrint}
              style={{
                background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[#0B0B1E] text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" /> Save PDF / Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
