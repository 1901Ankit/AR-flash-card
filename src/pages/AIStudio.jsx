import { useState } from "react";
import {
  Sparkles,
  Layers,
  Box,
  BookOpen,
  Smartphone,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Printer,
  Eye,
  RefreshCw,
  Volume2,
  VolumeX,
  Wand2,
  Zap,
  ShieldCheck,
  Radio,
  Sliders,
} from "lucide-react";
import { generateAIARExperience } from "../services/aiGeneratorService";
import { analyzeMarkerQuality } from "../services/markerCompiler";
import { tts } from "../services/ttsService";
import { sfx } from "../services/soundEffects";
import PrintExporter from "../components/PrintExporter";

const PRESET_IDEAS = [
  { topic: "Solar System: Jupiter", cat: "flashcard" },
  { topic: "Tyrannosaurus Rex", cat: "flashcard" },
  { topic: "Mystic Realm: Dragon Dungeon", cat: "gamebox" },
  { topic: "The Little Astronaut's Journey", cat: "physical_story" },
  { topic: "Cyber City Chronicles", cat: "digital_story" },
];

export default function AIStudio({ onLaunchAR, onAddToCatalog, onBack }) {
  const [category, setCategory] = useState("flashcard");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedItem, setGeneratedItem] = useState(null);
  const [markerQuality, setMarkerQuality] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    sfx.playClick();
    setIsGenerating(true);
    setGeneratedItem(null);
    setMarkerQuality(null);

    try {
      const item = await generateAIARExperience({
        topic,
        category,
        onProgress: (step) => {
          sfx.playBeep(900, "sine", 0.03);
          setGenerationStep(step);
        },
      });

      // Analyze marker trackability
      const quality = await analyzeMarkerQuality(item.markerPreview);
      setMarkerQuality(quality);
      setGeneratedItem(item);
      sfx.playSuccess();
      if (onAddToCatalog) onAddToCatalog(item);
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayVoice = () => {
    if (!generatedItem?.audio?.script) return;
    if (isPlayingVoice) {
      tts.stop();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      sfx.playClick();
      tts.speak(generatedItem.audio.script, {
        pitch: generatedItem.audio.pitch || 1.0,
        rate: generatedItem.audio.rate || 1.0,
        onEnd: () => setIsPlayingVoice(false),
      });
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        background:
          "radial-gradient(ellipse at 50% 0%, #17153a 0%, #0c0a21 40%, #060511 100%)",
      }}
      className="w-full min-h-screen text-white p-4 sm:p-8 relative overflow-x-hidden overflow-y-auto pb-16 selection:bg-[#5EEAD4] selection:text-black"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#5EEAD4]/10 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                sfx.playClick();
                onBack();
              }}
              className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
            >
              ← Back to Catalog
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#5EEAD4]" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#5EEAD4] to-[#C084FC]">
                  AI AR Production Studio
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#A8A3C7]">
                Autonomous 2D Marker, 3D Geometry, Voice Narration & Packaging Generator
              </p>
            </div>
          </div>
        </div>

        {/* Studio Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Creator Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Step 1: Select Format */}
            <div className="bg-[#0f0d26]/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <label className="text-xs font-black uppercase tracking-wider text-[#5EEAD4] flex items-center gap-2 mb-3.5">
                <Layers className="w-4 h-4" /> 1. Select Product Format
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "flashcard", label: "Flashcard", icon: Layers, tag: "Card Deck" },
                  { id: "gamebox", label: "Game Box", icon: Box, tag: "Packaging" },
                  { id: "physical_story", label: "Storybook", icon: BookOpen, tag: "Print Book" },
                  { id: "digital_story", label: "Digital Story", icon: Smartphone, tag: "Screen AR" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        setCategory(item.id);
                      }}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-[#5EEAD4]/20 border-[#5EEAD4] text-white shadow-lg shadow-[#5EEAD4]/15 scale-[1.02]"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#5EEAD4]" : "text-white/60"}`} />
                        <span className="text-[9px] font-bold uppercase opacity-60">{item.tag}</span>
                      </div>
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Prompt / Topic Input */}
            <div className="bg-[#0f0d26]/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <label className="text-xs font-black uppercase tracking-wider text-[#5EEAD4] flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4" /> 2. Enter Topic or AI Prompt
              </label>
              <p className="text-xs text-[#A8A3C7] mb-3.5 leading-relaxed font-normal">
                Describe any character, planet, game scene, or story. The AI engine generates the 2D marker, 3D rig, voice narration, and printable layout.
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. Tyrannosaurus Rex, Solar System Saturn, Cyber Arena..."
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/20 rounded-2xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#5EEAD4] transition-colors"
                />
              </div>

              {/* Quick Preset Badges */}
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {PRESET_IDEAS.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sfx.playClick();
                      setTopic(idea.topic);
                      setCategory(idea.cat);
                    }}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all hover:scale-105 active:scale-95"
                  >
                    + {idea.topic}
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                style={{
                  background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
                }}
                className="w-full mt-6 py-4 rounded-2xl font-black text-[#080718] text-sm shadow-2xl shadow-[#5EEAD4]/20 hover:shadow-[#5EEAD4]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing AR Experience with AI…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AR Experience with AI</span>
                  </>
                )}
              </button>

              {/* Live progress status */}
              {isGenerating && (
                <div className="mt-4 p-3.5 rounded-2xl bg-black/60 border border-[#5EEAD4]/40 text-xs text-[#5EEAD4] font-mono flex items-center gap-2 animate-pulse">
                  <Radio className="w-4 h-4 text-[#5EEAD4] animate-ping" />
                  <span>{generationStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Generated Output Preview */}
          <div className="lg:col-span-7">
            {generatedItem ? (
              <div className="bg-[#0f0d26]/80 border border-[#5EEAD4]/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6 animate-fade-in">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-white/10 pb-5">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#5EEAD4]/20 text-[#5EEAD4] border border-[#5EEAD4]/30 mb-1.5">
                      {generatedItem.category.replace("_", " ")}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {generatedItem.title}
                    </h2>
                    <p className="text-xs text-[#A8A3C7] mt-0.5">{generatedItem.tagline}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sfx.playClick();
                        setShowPrintModal(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Printer className="w-4 h-4 text-[#5EEAD4]" /> Print Sheet
                    </button>
                    <button
                      onClick={() => onLaunchAR(generatedItem)}
                      style={{
                        background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
                      }}
                      className="px-5 py-2.5 rounded-2xl font-black text-[#080718] text-xs flex items-center gap-1.5 shadow-lg shadow-[#5EEAD4]/25 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Eye className="w-4 h-4" /> Test in AR
                    </button>
                  </div>
                </div>

                {/* Marker Image & AI Quality Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                  <div className="relative rounded-2xl overflow-hidden border border-white/20 aspect-[4/5] bg-black shadow-xl group">
                    <img
                      src={generatedItem.markerPreview}
                      alt={generatedItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#5EEAD4] border border-[#5EEAD4]/30">
                      AI AR Marker Art
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {/* Quality badge */}
                    {markerQuality && (
                      <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-white/70 font-semibold">AR Tracking Stability</span>
                          <span className="text-xs font-black text-[#5EEAD4]">
                            {markerQuality.score}% ({markerQuality.rating})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-[#5EEAD4] to-[#8B5CF6]"
                            style={{ width: `${markerQuality.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#A8A3C7] leading-relaxed">{markerQuality.message}</p>
                      </div>
                    )}

                    {/* AI Narration Audio Preview */}
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/90">AI Voice Narration</span>
                        <button
                          onClick={handlePlayVoice}
                          className="px-3 py-1.5 rounded-full bg-[#5EEAD4]/20 border border-[#5EEAD4]/40 text-[#5EEAD4] text-xs font-bold flex items-center gap-1.5 hover:bg-[#5EEAD4]/30 transition-colors"
                        >
                          {isPlayingVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isPlayingVoice ? "Mute" : "Listen Voice"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-white/80 italic line-clamp-3 leading-relaxed font-normal">
                        "{generatedItem.audio.script}"
                      </p>
                    </div>

                    {/* 3D Geometry Spec */}
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-white/80 flex items-center justify-between">
                      <span className="font-semibold">3D Geometry Engine</span>
                      <span className="font-mono text-[#5EEAD4] font-bold uppercase">
                        {generatedItem.model.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[440px] bg-[#0f0d26]/60 border border-dashed border-white/15 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[#5EEAD4] mb-4 shadow-lg shadow-[#5EEAD4]/10">
                  <Cpu className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Autonomous AI Generator Ready
                </h3>
                <p className="text-xs text-[#A8A3C7] max-w-sm mt-1.5 leading-relaxed font-normal">
                  Select a category and topic on the left. The automated multi-modal pipeline will build the 3D model, marker, audio narration, and printable layout in seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Sheet Modal */}
      {showPrintModal && generatedItem && (
        <PrintExporter item={generatedItem} onClose={() => setShowPrintModal(false)} />
      )}
    </div>
  );
}
