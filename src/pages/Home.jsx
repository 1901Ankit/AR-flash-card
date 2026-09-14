import { useState, useEffect } from "react";
import ARScene from "../components/ARScene";
import useCamera, { CAMERA_STATUS } from "../hooks/useCamera";
import { INITIAL_CATALOG, CATEGORIES } from "../data/arCatalog";
import PrintExporter from "../components/PrintExporter";
import AIStudio from "./AIStudio";
import {
  Sparkles,
  Layers,
  Box,
  BookOpen,
  Smartphone,
  Printer,
  Camera,
  Play,
  Wand2,
} from "lucide-react";

export default function Home() {
  const { status, error, requestCameraPermission } = useCamera();
  const [catalog, setCatalog] = useState(INITIAL_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(INITIAL_CATALOG[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [printItem, setPrintItem] = useState(null);

  // Check URL query params for direct item link (e.g. ?item=goku-flashcard)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const itemId = params.get("item");
      if (itemId) {
        const found = catalog.find((i) => i.id === itemId);
        if (found) {
          setSelectedItem(found);
        }
      }
    }
  }, [catalog]);

  const handleStartScanning = async (item = selectedItem) => {
    setSelectedItem(item);
    const granted = await requestCameraPermission();
    if (granted) setIsScanning(true);
  };

  const handleAddItemToCatalog = (newItem) => {
    setCatalog((prev) => [newItem, ...prev]);
  };

  const filteredItems =
    selectedCategory === "all"
      ? catalog
      : catalog.filter((item) => item.category === selectedCategory);

  if (isScanning && selectedItem) {
    return (
      <ARScene
        item={selectedItem}
        imageTargetSrc={selectedItem.markerUrl || INITIAL_CATALOG[0].markerUrl}
        modelConfig={selectedItem.model}
        onExit={() => {
          navigator.mediaDevices
            ?.getUserMedia({ video: true })
            .then((stream) => {
              stream.getTracks().forEach((track) => track.stop());
            })
            .catch(() => {});
          setIsScanning(false);
        }}
      />
    );
  }

  if (showStudio) {
    return (
      <AIStudio
        onLaunchAR={(item) => {
          setShowStudio(false);
          handleStartScanning(item);
        }}
        onAddToCatalog={handleAddItemToCatalog}
        onBack={() => setShowStudio(false)}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background:
          "radial-gradient(ellipse at 50% 15%, #1a1a3d 0%, #0B0B1E 55%, #080815 100%)",
        minHeight: "100dvh",
      }}
      className="relative w-screen overflow-x-hidden text-white flex flex-col justify-between"
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#5EEAD4]/20 to-[#8B5CF6]/20 border border-[#5EEAD4]/40 shadow-lg shadow-[#5EEAD4]/10">
            <Sparkles className="w-6 h-6 text-[#5EEAD4]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5EEAD4] via-[#A78BFA] to-[#8B5CF6]">
                AR Universal Suite
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-[#A8A3C7]">
              Flashcards • Game Boxes • Storybooks
            </p>
          </div>
        </div>

        {/* AI Studio Trigger Button */}
        <button
          onClick={() => setShowStudio(true)}
          style={{
            background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[#0B0B1E] font-bold text-xs sm:text-sm shadow-lg shadow-[#5EEAD4]/25 hover:scale-105 active:scale-95 transition-all"
        >
          <Wand2 className="w-4 h-4" />
          <span className="hidden sm:inline">AI Automated Studio</span>
          <span className="sm:hidden">AI Studio</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 flex-1 flex flex-col justify-center">
        {/* Hero Title & Scanner CTA */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-['Space_Grotesk'] leading-tight">
            Point Your Camera. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5EEAD4] to-[#8B5CF6]">
              Watch Everything Come Alive.
            </span>
          </h2>
          <p className="mt-3 text-sm text-[#A8A3C7] leading-relaxed">
            Experience interactive 3D flashcards, game box packaging teasers, and voice-narrated storybooks directly in your browser.
          </p>

          <button
            type="button"
            onClick={() => handleStartScanning(selectedItem)}
            disabled={status === CAMERA_STATUS.REQUESTING}
            style={{
              background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
              boxShadow: "0 0 30px rgba(94,234,212,0.4)",
            }}
            className="mt-6 px-8 py-4 rounded-full font-bold text-[#0B0B1E] text-base hover:scale-105 active:scale-95 disabled:opacity-50 transition-all inline-flex items-center gap-2.5"
          >
            <Camera className="w-5 h-5" />
            <span>
              {status === CAMERA_STATUS.REQUESTING
                ? "Requesting Camera…"
                : `Scan & Launch: ${selectedItem.title}`}
            </span>
          </button>

          {status === CAMERA_STATUS.DENIED && (
            <p className="mt-3 text-red-400 text-xs">
              Camera permission was denied. Allow camera access in browser settings and try again.
            </p>
          )}
          {status === CAMERA_STATUS.UNSUPPORTED && (
            <p className="mt-3 text-red-400 text-xs">
              {error || "Your browser does not support camera access."}
            </p>
          )}
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                selectedCategory === cat.id
                  ? "bg-[#5EEAD4]/20 border-[#5EEAD4] text-[#5EEAD4] shadow-md shadow-[#5EEAD4]/10"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative rounded-2xl overflow-hidden border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#161638] border-[#5EEAD4] shadow-xl shadow-[#5EEAD4]/15 scale-[1.02]"
                    : "bg-[#10102B]/80 border-white/10 hover:border-white/30 hover:bg-[#141434]"
                }`}
              >
                {/* Marker thumbnail */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-black/50">
                  <img
                    src={item.markerPreview}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-[#5EEAD4]">
                    {item.category.replace("_", " ")}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-bold font-['Space_Grotesk'] text-base text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#A8A3C7] mt-1 line-clamp-2">{item.description}</p>
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrintItem(item);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    title="Print Marker & QR Sheet"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartScanning(item);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#5EEAD4]/20 hover:bg-[#5EEAD4]/30 border border-[#5EEAD4]/40 text-[#5EEAD4] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start AR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 border-t border-white/5 text-xs text-[#A8A3C7]">
        Automated AI AR Pipeline Engine • Flashcards, Packaging & Storybooks
      </footer>

      {/* Print Exporter Modal */}
      {printItem && <PrintExporter item={printItem} onClose={() => setPrintItem(null)} />}
    </div>
  );
}