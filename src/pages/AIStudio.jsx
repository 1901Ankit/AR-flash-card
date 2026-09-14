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
        backgroundColor: "#0d0f17",
      }}
      className="w-full min-h-screen text-slate-100 p-4 sm:p-8 relative overflow-x-hidden overflow-y-auto pb-16 selection:bg-violet-600 selection:text-white"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                sfx.playClick();
                onBack();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95 shadow-sm"
            >
              ← Back to Catalog
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold flex items-center gap-2 text-slate-50">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                <span>AI AR Production Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
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
            <div className="bg-[#141824] border border-slate-800 rounded-2xl p-6 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3.5">
                <Layers className="w-4 h-4 text-violet-400" /> 1. Select Product Format
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
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-violet-600/20 border-violet-500 text-violet-200 shadow-sm"
                          : "bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-violet-300" : "text-slate-400"}`} />
                        <span className="text-[9px] font-semibold uppercase opacity-60">{item.tag}</span>
                      </div>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Prompt / Topic Input */}
            <div className="bg-[#141824] border border-slate-800 rounded-2xl p-6 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2">
                <Wand2 className="w-4 h-4 text-violet-400" /> 2. Enter Topic or AI Prompt
              </label>
              <p className="text-xs text-slate-400 mb-3.5 leading-relaxed font-normal">
                Describe any character, planet, game scene, or story. The AI engine generates the 2D marker, 3D rig, voice narration, and printable layout.
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. Tyrannosaurus Rex, Solar System Saturn, Cyber Arena..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
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
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
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
                className="w-full mt-6 py-3.5 rounded-xl font-semibold text-white text-sm bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Synthesizing AR Experience with AI…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate AR Experience with AI</span>
                  </>
                )}
              </button>

              {/* Live progress status */}
              {isGenerating && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-violet-500/40 text-xs text-violet-300 font-mono flex items-center gap-2">
                  <Radio className="w-4 h-4 text-violet-400 animate-pulse" />
                  <span>{generationStep}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Generated Output Preview */}
          <div className="lg:col-span-7">
            {generatedItem ? (
              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 animate-fade-in">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-800 pb-5">
                  <div>
                    <div className="inline-block px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-violet-300 border border-slate-700 mb-1.5">
                      {generatedItem.category.replace("_", " ")}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                      {generatedItem.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{generatedItem.tagline}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sfx.playClick();
                        setShowPrintModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <Printer className="w-4 h-4 text-slate-400" /> Print Sheet
                    </button>
                    <button
                      onClick={() => onLaunchAR(generatedItem)}
                      className="px-5 py-2 rounded-xl font-semibold text-white text-xs bg-violet-600 hover:bg-violet-500 active:bg-violet-700 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-white" /> Test in AR
                    </button>
                  </div>
                </div>

                {/* Marker Image & AI Quality Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[4/5] bg-slate-900 shadow-sm group">
                    <img
                      src={generatedItem.markerPreview}
                      alt={generatedItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-sm text-[10px] font-medium text-slate-200 border border-slate-700">
                      AI AR Marker Art
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {/* Quality badge */}
                    {markerQuality && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-slate-400 font-medium">AR Tracking Stability</span>
                          <span className="text-xs font-bold text-violet-400">
                            {markerQuality.score}% ({markerQuality.rating})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                          <div
                            className="h-full bg-violet-500"
                            style={{ width: `${markerQuality.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{markerQuality.message}</p>
                      </div>
                    )}

                    {/* AI Narration Audio Preview */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">AI Voice Narration</span>
                        <button
                          onClick={handlePlayVoice}
                          className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-700 transition-colors"
                        >
                          {isPlayingVoice ? <VolumeX className="w-3.5 h-3.5 text-slate-300" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
                          <span>{isPlayingVoice ? "Mute" : "Listen Voice"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 italic line-clamp-3 leading-relaxed font-normal">
                        "{generatedItem.audio.script}"
                      </p>
                    </div>

                    {/* 3D Geometry Spec */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                      <span className="font-medium">3D Geometry Engine</span>
                      <span className="font-mono text-violet-400 font-bold uppercase">
                        {generatedItem.model.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[440px] bg-[#141824] border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-violet-400 mb-4">
                  <Cpu className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">
                  Autonomous AI Generator Ready
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed font-normal">
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
