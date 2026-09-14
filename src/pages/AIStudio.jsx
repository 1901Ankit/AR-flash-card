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
  Wand2,
} from "lucide-react";
import { generateAIARExperience } from "../services/aiGeneratorService";
import { analyzeMarkerQuality } from "../services/markerCompiler";
import { tts } from "../services/ttsService";
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
    setIsGenerating(true);
    setGeneratedItem(null);
    setMarkerQuality(null);

    try {
      const item = await generateAIARExperience({
        topic,
        category,
        onProgress: (step) => setGenerationStep(step),
      });

      // Analyze marker trackability
      const quality = await analyzeMarkerQuality(item.markerPreview);
      setMarkerQuality(quality);
      setGeneratedItem(item);
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
      tts.speak(generatedItem.audio.script, {
        onEnd: () => setIsPlayingVoice(false),
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#090919] text-white p-4 sm:p-8 font-['Inter'] relative overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#5EEAD4]/10 via-[#8B5CF6]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5EEAD4]" /> AI AR Automated Studio
              </h1>
              <p className="text-xs sm:text-sm text-[#A8A3C7]">
                Zero-Designer 100% Automated 2D, 3D, Audio & Print Pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Studio Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Creator Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Step 1: Select Format */}
            <div className="bg-[#10102B] border border-white/10 rounded-2xl p-5 shadow-xl">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5EEAD4] flex items-center gap-1.5 mb-3">
                <Layers className="w-4 h-4" /> 1. Select Product Format
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "flashcard", label: "Flashcard", icon: Layers },
                  { id: "gamebox", label: "Game Box", icon: Box },
                  { id: "physical_story", label: "Storybook", icon: BookOpen },
                  { id: "digital_story", label: "Digital Story", icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[#5EEAD4]/20 border-[#5EEAD4] text-[#5EEAD4] shadow-md shadow-[#5EEAD4]/10"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Prompt / Topic Input */}
            <div className="bg-[#10102B] border border-white/10 rounded-2xl p-5 shadow-xl">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5EEAD4] flex items-center gap-1.5 mb-2">
                <Wand2 className="w-4 h-4" /> 2. Enter Topic or AI Prompt
              </label>
              <p className="text-xs text-[#A8A3C7] mb-3">
                Describe anything. The AI pipeline will autonomously build the 2D marker, 3D model, voice script, and print layout.
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Tyrannosaurus Rex, Solar System Saturn, Cyber Arena..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#5EEAD4] transition-colors"
                />
              </div>

              {/* Quick Preset Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {PRESET_IDEAS.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(idea.topic);
                      setCategory(idea.cat);
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition-colors"
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
                className="w-full mt-6 py-4 rounded-xl font-bold text-[#0B0B1E] text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Autonomous AI Generation in Progress…</span>
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
                <div className="mt-4 p-3 rounded-xl bg-black/50 border border-[#5EEAD4]/30 text-xs text-[#5EEAD4] animate-pulse">
                  ⚙️ {generationStep}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Generated Output Preview */}
          <div className="lg:col-span-7">
            {generatedItem ? (
              <div className="bg-[#10102B] border border-[#5EEAD4]/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-[#5EEAD4]/20 text-[#5EEAD4] mb-1">
                      {generatedItem.category.replace("_", " ")}
                    </div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
                      {generatedItem.title}
                    </h2>
                    <p className="text-xs text-[#A8A3C7]">{generatedItem.tagline}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Print Sheet
                    </button>
                    <button
                      onClick={() => onLaunchAR(generatedItem)}
                      style={{
                        background: "linear-gradient(135deg, #5EEAD4, #8B5CF6)",
                      }}
                      className="px-5 py-2 rounded-xl font-bold text-[#0B0B1E] text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Eye className="w-4 h-4" /> Test in AR
                    </button>
                  </div>
                </div>

                {/* Marker Image & AI Quality Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="relative rounded-xl overflow-hidden border border-white/15 aspect-[4/5] bg-black">
                    <img
                      src={generatedItem.markerPreview}
                      alt={generatedItem.title}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-[#5EEAD4]">
                      AI AR Marker Art
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Quality badge */}
                    {markerQuality && (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/70">AR Tracking Stability</span>
                          <span className="text-xs font-bold text-[#5EEAD4]">
                            {markerQuality.score}% ({markerQuality.rating})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-[#5EEAD4] to-[#8B5CF6]"
                            style={{ width: `${markerQuality.score}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#A8A3C7]">{markerQuality.message}</p>
                      </div>
                    )}

                    {/* AI Narration Audio Preview */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/90">AI Voiceover Narration</span>
                        <button
                          onClick={handlePlayVoice}
                          className="px-3 py-1 rounded-full bg-[#5EEAD4]/20 border border-[#5EEAD4]/40 text-[#5EEAD4] text-xs font-semibold flex items-center gap-1 hover:bg-[#5EEAD4]/30 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isPlayingVoice ? "Stop Voice" : "Listen Voice"}</span>
                        </button>
                      </div>
                      <p className="text-xs text-white/80 italic line-clamp-3">
                        "{generatedItem.audio.script}"
                      </p>
                    </div>

                    {/* 3D Geometry Spec */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white/80 flex items-center justify-between">
                      <span>3D Model Geometry</span>
                      <span className="font-mono text-[#5EEAD4] font-semibold">
                        {generatedItem.model.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[420px] bg-[#10102B]/60 border border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-white/5 border border-white/10 text-[#5EEAD4] mb-4">
                  <Cpu className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                  Autonomous AI Generator Idle
                </h3>
                <p className="text-xs text-[#A8A3C7] max-w-sm mt-1 leading-relaxed">
                  Choose a format and topic on the left. The AI pipeline will construct the complete AR experience without requiring any manual graphic designer work.
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
