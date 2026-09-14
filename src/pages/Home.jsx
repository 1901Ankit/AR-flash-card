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
        backgroundColor: "#0d0f17",
        minHeight: "100dvh",
        WebkitOverflowScrolling: "touch",
      }}
      className="relative w-full text-slate-100 flex flex-col justify-between selection:bg-violet-600 selection:text-white"
    >
      {/* Top Eye-Friendly Dark Navbar */}
      <header className="relative z-20 w-full border-b border-slate-800/80 bg-[#111420]/95 backdrop-blur-md sticky top-0 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sky-400">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-wider uppercase text-slate-100">
                  MAGIC AR
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-violet-300 border border-slate-700">
                  3D Explorer
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-normal">
                Flashcards • Game Boxes • Fun Storybooks
              </p>
            </div>
          </div>

          {/* Quick AI Studio Button */}
          <button
            onClick={() => {
              sfx.playClick();
              setShowStudio(true);
            }}
            className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-medium text-xs sm:text-sm active:scale-95 transition-all shadow-sm whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
            <span className="hidden sm:inline">AI Magic Studio</span>
            <span className="sm:hidden">AI Studio</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 md:py-10 flex-1 flex flex-col justify-start">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center mb-8 sm:mb-10">
          {/* Left Hero Details */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] sm:text-xs font-medium text-violet-300 mb-3">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Interactive 3D World
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-normal text-slate-50">
              Bring Your Cards & Toys To Life In{" "}
              <span className="text-violet-400 font-black">
                Magical 3D!
              </span>
            </h1>

            <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Point your camera at flashcards and toy boxes to see characters jump right out! Listen to cool voices, play fun quizzes, and explore science.
            </p>

            {/* CTA Buttons */}
            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleStartScanning(selectedItem)}
                disabled={status === CAMERA_STATUS.REQUESTING}
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-white text-xs sm:text-sm bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>
                  {status === CAMERA_STATUS.REQUESTING
                    ? "Starting Camera…"
                    : `Scan & Play: ${selectedItem.title}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setPrintItem(selectedItem);
                }}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Get Printable Card & QR</span>
              </button>
            </div>

            {/* Camera error messages */}
            {status === CAMERA_STATUS.DENIED && (
              <p className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                Camera access was blocked. Please allow camera permissions in browser settings.
              </p>
            )}
            {status === CAMERA_STATUS.UNSUPPORTED && (
              <p className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                {error || "Camera access unsupported."}
              </p>
            )}
          </div>

          {/* Right Hero Card Preview */}
          <div className="lg:col-span-5 flex justify-center mt-2 lg:mt-0">
            <div className="relative group w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl p-1 bg-slate-800/50 border border-slate-700/80 shadow-md">
              <div className="w-full h-full rounded-xl bg-[#141824] p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden relative">
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-violet-300 border border-slate-700 flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-sky-400" /> SELECTED 3D HERO
                  </span>
                  <button
                    onClick={() => setPreviewMarkerItem(selectedItem)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                    title="Fullscreen Marker"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Image Texture */}
                <div className="relative my-2.5 sm:my-3.5 aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                  <img
                    src={selectedItem.markerPreview}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[11px] text-sky-300 font-mono font-medium">
                    <span>AR: READY</span>
                    <span>3D: {selectedItem.model?.type || "GLB"}</span>
                  </div>
                </div>

                {/* Card Title & Audio Quote */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">{selectedItem.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">{selectedItem.tagline}</p>

                  <div className="mt-2 p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <p className="text-[10px] sm:text-[11px] text-slate-300 italic truncate">
                      "{selectedItem.audio?.script}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-8">
          {[
            { icon: Zap, label: "Instant Play", desc: "No App Download Needed" },
            { icon: Cpu, label: "AI Magic Pipeline", desc: "Create Any Character" },
            { icon: Volume2, label: "Fun Voice Stories", desc: "Talking 3D Heroes" },
            { icon: ShieldCheck, label: "Kid-Safe & Friendly", desc: "Cards, Books & Games" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-xl bg-[#141824] border border-slate-800 flex items-center gap-2.5 sm:gap-3 transition-colors hover:border-slate-700"
              >
                <div className="p-2 sm:p-2.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-200">{item.label}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" /> Magical AR Cards & Stories
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Tap any card to launch AR or get printable sheets</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sfx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-violet-600 border-violet-500 text-white shadow-sm"
                    : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                    ? "bg-[#161b2a] border-violet-500/80 ring-1 ring-violet-500/40"
                    : "bg-[#141824] border-slate-800 hover:border-slate-700 hover:bg-[#161b2a]"
                }`}
              >
                {/* Marker Image */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800">
                  <img
                    src={item.markerPreview}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-slate-900/90 backdrop-blur-sm text-slate-200 border border-slate-700">
                    {item.category.replace("_", " ")}
                  </div>

                  {/* Fullscreen Marker View Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMarkerItem(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700"
                    title="View Fullscreen Marker"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-bold text-base text-slate-100 group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sfx.playClick();
                      setPrintItem(item);
                    }}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                    title="Print Marker & QR Sheet"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Print / QR</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartScanning(item);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all active:scale-95 ${
                      isSelected
                        ? "bg-violet-600 border-violet-500 text-white shadow-sm"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 hover:text-white"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 text-slate-200" />
                    <span>Play AR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-slate-800 text-xs text-slate-500 bg-[#111420]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Hyper-AR Suite • ANKIT Production</p>
          <div className="flex items-center gap-4 text-slate-500">
            {/* <span>MindAR Three.js Engine</span>
            <span>•</span>
            <span>Multi-Modal AI Pipeline</span> */}
          </div>
        </div>
      </footer>

      {/* Print Exporter Modal */}
      {printItem && <PrintExporter item={printItem} onClose={() => setPrintItem(null)} />}

      {/* Fullscreen Marker Preview Modal */}
      {previewMarkerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-[#141824] border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-slate-100 mb-1">{previewMarkerItem.title}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Point your phone camera at this image on screen to summon the 3D AR model!
            </p>
            <div className="rounded-xl overflow-hidden border border-slate-700 p-2 bg-slate-900">
              <img
                src={previewMarkerItem.markerPreview}
                alt={previewMarkerItem.title}
                className="w-full h-64 object-cover rounded-lg"
                crossOrigin="anonymous"
              />
            </div>
            <button
              onClick={() => setPreviewMarkerItem(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-all"
            >
              Close Marker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}