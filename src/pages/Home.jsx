import { useState, useEffect } from "react";
import ARScene from "../components/ARScene";
import useCamera, { CAMERA_STATUS } from "../hooks/useCamera";
import { INITIAL_CATALOG, CATEGORIES } from "../data/arCatalog";
import PrintExporter from "../components/PrintExporter";
import AIStudio from "./AIStudio";
import { sfx } from "../services/soundEffects";
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
  Cpu,
  Volume2,
  Scan,
  Maximize2,
  Zap,
  ShieldCheck,
  Radio,
} from "lucide-react";

export default function Home() {
  const { status, error, requestCameraPermission } = useCamera();
  const [catalog, setCatalog] = useState(INITIAL_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(INITIAL_CATALOG[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [printItem, setPrintItem] = useState(null);
  const [previewMarkerItem, setPreviewMarkerItem] = useState(null);

  // Check URL query params for direct item link (e.g. ?item=goku-flashcard)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const itemId = params.get("item");
      if (itemId) {
        const found = catalog.find((i) => i.id === itemId);
        if (found) setSelectedItem(found);
      }
    }
  }, [catalog]);

  const handleStartScanning = async (item = selectedItem) => {
    sfx.playClick();
    setSelectedItem(item);
    const granted = await requestCameraPermission();
    if (granted) {
      sfx.playLockOn();
      setIsScanning(true);
    }
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
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        background:
          "radial-gradient(ellipse at 50% 0%, #17153a 0%, #0c0a21 40%, #060511 100%)",
        minHeight: "100dvh",
      }}
      className="relative w-full overflow-x-hidden overflow-y-auto text-white flex flex-col justify-between selection:bg-[#5EEAD4] selection:text-black"
    >
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#5EEAD4]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-[#8B5CF6]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[400px] bg-[#06b6d4]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#5EEAD4 1px, transparent 1px), linear-gradient(90deg, #5EEAD4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Glass Navbar */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#0c0a21]/60 backdrop-blur-2xl sticky top-0 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with live status ping */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-[#5EEAD4]/20 via-[#8B5CF6]/20 to-transparent border border-[#5EEAD4]/40 shadow-lg shadow-[#5EEAD4]/10">
              <Sparkles className="w-5 h-5 text-[#5EEAD4] animate-spin" style={{ animationDuration: "12s" }} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5EEAD4] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5EEAD4]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#5EEAD4] to-[#A78BFA]">
                  HYPER-AR
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/30">
                  v2.0 NEXT-GEN
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#A8A3C7] font-medium tracking-wide">
                Flashcards • Game Boxes • Physical & Digital Stories
              </p>
            </div>
          </div>

          {/* Quick AI Studio Button */}
          <button
            onClick={() => {
              sfx.playClick();
              setShowStudio(true);
            }}
            style={{
              background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
            }}
            className="group relative flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[#080718] font-extrabold text-xs sm:text-sm shadow-xl shadow-[#5EEAD4]/20 hover:shadow-[#5EEAD4]/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Wand2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">AI Automated Studio</span>
            <span className="sm:hidden">AI Studio</span>
          </button>
        </div>
      </header>

      {/* Hero Hologram Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 md:py-12 flex-1 flex flex-col justify-start">
        {/* Holographic Portal Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center mb-8 sm:mb-12">
          {/* Left Hero Details */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#5EEAD4]/15 to-[#8B5CF6]/15 border border-[#5EEAD4]/30 text-[11px] sm:text-xs font-bold text-[#5EEAD4] mb-3 backdrop-blur-md">
              <Zap className="w-3 h-3" /> 100% Zero-Designer Automated AR Pipeline
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Bring Physical Objects To Life In{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#5EEAD4] via-[#93C5FD] to-[#C084FC]">
                Holographic 3D
              </span>
            </h1>

            <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm md:text-base text-[#A8A3C7] leading-relaxed max-w-xl font-normal">
              Scan flashcards, game box packaging, and storybook pages straight from your phone browser. Experience synchronized voice narrations, 3D animations, and smart quizzes.
            </p>

            {/* CTA Buttons */}
            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleStartScanning(selectedItem)}
                disabled={status === CAMERA_STATUS.REQUESTING}
                style={{
                  background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
                }}
                className="group relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-[#080718] text-xs sm:text-sm shadow-xl shadow-[#5EEAD4]/25 hover:shadow-[#5EEAD4]/40 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5"
              >
                <div className="p-1 rounded-full bg-black/20 text-black">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span>
                  {status === CAMERA_STATUS.REQUESTING
                    ? "Launching Camera…"
                    : `Scan & Launch: ${selectedItem.title}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setPrintItem(selectedItem);
                }}
                className="px-5 sm:px-6 py-3 sm:py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 backdrop-blur-md hover:border-[#5EEAD4]/50 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-[#5EEAD4]" />
                <span>Get Print & QR Sheet</span>
              </button>
            </div>

            {/* Camera error messages */}
            {status === CAMERA_STATUS.DENIED && (
              <p className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                Camera access was blocked. Please allow camera permissions in browser settings.
              </p>
            )}
            {status === CAMERA_STATUS.UNSUPPORTED && (
              <p className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error || "Camera access unsupported."}
              </p>
            )}
          </div>

          {/* Right Hero Hologram Card Preview */}
          <div className="lg:col-span-5 flex justify-center mt-2 lg:mt-0">
            <div className="relative group w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-[#5EEAD4]/40 via-[#8B5CF6]/30 to-transparent shadow-xl shadow-[#5EEAD4]/10 transition-transform duration-500">
              <div className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-[#0d0b24] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative border border-white/10">
                {/* Cyber corner accents */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-[#5EEAD4]" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-[#5EEAD4]" />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-[#5EEAD4]" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-[#5EEAD4]" />

                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase bg-[#5EEAD4]/20 text-[#5EEAD4] border border-[#5EEAD4]/30 flex items-center gap-1.5">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE SELECTED ASSET
                  </span>
                  <button
                    onClick={() => setPreviewMarkerItem(selectedItem)}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    title="Fullscreen Marker"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Image Hologram Texture */}
                <div className="relative my-2.5 sm:my-3.5 aspect-video rounded-xl overflow-hidden border border-white/20 bg-black/60 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={selectedItem.markerPreview}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-[#5EEAD4] font-mono">
                    <span>TRACKING: READY</span>
                    <span>3D RIG: {selectedItem.model?.type || "GLB"}</span>
                  </div>
                </div>

                {/* Card Title & Audio Quote */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">{selectedItem.title}</h3>
                  <p className="text-[11px] sm:text-xs text-[#A8A3C7] mt-0.5 line-clamp-1">{selectedItem.tagline}</p>

                  <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
                    <p className="text-[10px] sm:text-[11px] text-white/80 italic truncate">
                      "{selectedItem.audio?.script}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-10">
          {[
            { icon: Zap, label: "Zero App Download", desc: "Runs in Web Browser" },
            { icon: Cpu, label: "AI Automated Engine", desc: "No Designer Required" },
            { icon: Volume2, label: "AI Voice Narration", desc: "Multi-character Audio" },
            { icon: ShieldCheck, label: "Multi-Surface AR", desc: "Cards, Boxes & Books" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center gap-2.5 sm:gap-3 hover:border-[#5EEAD4]/30 transition-colors"
              >
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/20 shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-white">{item.label}</h4>
                  <p className="text-[9px] sm:text-[11px] text-[#A8A3C7]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#5EEAD4]" /> AR Asset Catalog
            </h2>
            <p className="text-xs text-[#A8A3C7]">Select any card to launch AR or download print sheets</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sfx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-[#5EEAD4] border-[#5EEAD4] text-[#080718] shadow-lg shadow-[#5EEAD4]/20 scale-105"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  sfx.playClick();
                  setSelectedItem(item);
                }}
                className={`group relative rounded-2xl overflow-hidden border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#18143d] border-[#5EEAD4] shadow-2xl shadow-[#5EEAD4]/20 scale-[1.02]"
                    : "bg-[#0f0d26]/80 border-white/10 hover:border-white/30 hover:bg-[#151236]"
                }`}
              >
                {/* Marker Image with Cyber scanline overlay on hover */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-black/60 border border-white/10 group-hover:border-[#5EEAD4]/40 transition-colors">
                  <img
                    src={item.markerPreview}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-black/80 backdrop-blur-md text-[#5EEAD4] border border-[#5EEAD4]/30">
                    {item.category.replace("_", " ")}
                  </div>

                  {/* Fullscreen Marker View Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMarkerItem(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors"
                    title="View Fullscreen Marker"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#5EEAD4] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#A8A3C7] mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sfx.playClick();
                      setPrintItem(item);
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                    title="Print Marker & QR Sheet"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#5EEAD4]" />
                    <span className="hidden sm:inline">Print / QR</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartScanning(item);
                    }}
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, #5EEAD4, #8B5CF6)"
                        : "rgba(255,255,255,0.1)",
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 active:scale-95 ${
                      isSelected ? "text-[#080718]" : "text-white hover:bg-white/20"
                    }`}
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

      {/* Futuristic Footer */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-white/10 text-xs text-[#A8A3C7] bg-[#080718]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p> 2026 Hyper-AR Suite • 100% Automated Zero-Designer AR Production</p>
          <div className="flex items-center gap-4 text-white/60">
            <span>MindAR Three.js Engine</span>
            <span>•</span>
            <span>Multi-Modal AI Pipeline</span>
          </div>
        </div>
      </footer>

      {/* Print Exporter Modal */}
      {printItem && <PrintExporter item={printItem} onClose={() => setPrintItem(null)} />}

      {/* Fullscreen Marker Preview Modal (For scanning off another screen) */}
      {previewMarkerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="relative max-w-md w-full bg-[#0d0b24] border border-[#5EEAD4]/40 rounded-3xl p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-white mb-1">{previewMarkerItem.title}</h3>
            <p className="text-xs text-[#A8A3C7] mb-4">
              Point your phone camera at this high-contrast image on screen to summon the 3D AR model!
            </p>
            <div className="rounded-2xl overflow-hidden border-4 border-white/20 p-2 bg-white">
              <img
                src={previewMarkerItem.markerPreview}
                alt={previewMarkerItem.title}
                className="w-full h-64 object-cover rounded-xl"
                crossOrigin="anonymous"
              />
            </div>
            <button
              onClick={() => setPreviewMarkerItem(null)}
              className="mt-6 w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
            >
              Close Marker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}