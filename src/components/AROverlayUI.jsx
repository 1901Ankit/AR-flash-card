import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, HelpCircle, BookOpen, Layers, Check, X, RotateCw, Plus, Minus, Play, SkipForward, SkipBack } from "lucide-react";
import { tts } from "../services/ttsService";

export default function AROverlayUI({
  item,
  isTargetFound,
  activeHotspot,
  onCloseHotspot,
  videoMuted,
  videoNeedsGesture,
  onToggleVideoMute,
  onPlayVideo,
  onExit,
  stage,
  onNext,
  onPrev,
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [activeStoryPage, setActiveStoryPage] = useState(0);
  const [scaleMult, setScaleMult] = useState(1);
  const lastSpokenRef = useRef(null);

  const hasVideoTarget =
    item?.targets?.some((t) => t.type === "video") || !!item?.video;

  // Scale +/- adjusts a multiplier on the model's default baseline scale
  // (window.__arBaseScale, set by MarkerTracker) — clamped so the model can
  // never go invisible or absurdly huge
  const SCALE_STEP = 0.1;
  const SCALE_MIN = 0.5;
  const SCALE_MAX = 3.0;
  const handleScaleModel = (dir) => {
    const next = Math.min(
      SCALE_MAX,
      Math.max(SCALE_MIN, +(scaleMult + dir * SCALE_STEP).toFixed(2))
    );
    setScaleMult(next);
    window.__arScaleMult = next;
    const base = window.__arBaseScale ?? 1;
    window.__arCurrentModel?.scale.setScalar(base * next);
  };

  const handleRotateModel = () => {
    if (window.__arCurrentModel) {
      window.__arCurrentModel.rotation.y += Math.PI / 4;
    }
  };

  useEffect(() => {
    tts.onStateChange = (state) => setIsPlayingAudio(state);
    return () => {
      tts.stop();
    };
  }, []);

  // When target is detected for the first time, auto-narrate.
  // Sequenced items hold narration until the model stage so TTS doesn't
  // talk over the card video.
  useEffect(() => {
    if (isTargetFound && item?.audio?.script && stage !== "video") {
      tts.speak(item.audio.script, {
        pitch: item.audio.pitch || 1.0,
        rate: item.audio.rate || 1.0,
      });
    } else {
      tts.stop();
    }
  }, [isTargetFound, item, stage]);

  // When a planet/hotspot is tapped, narrate its script exactly once per selection
  // (selId guards against StrictMode double-effects; a deliberate re-tap gets a new selId)
  useEffect(() => {
    if (activeHotspot?.script && activeHotspot.selId !== lastSpokenRef.current) {
      lastSpokenRef.current = activeHotspot.selId;
      tts.speak(activeHotspot.script, {
        pitch: item?.audio?.pitch || 1.0,
        rate: item?.audio?.rate || 1.0,
      });
    }
  }, [activeHotspot]);

  const toggleSpeech = () => {
    const script = activeHotspot?.script || item?.audio?.script;
    if (!script) return;
    if (isPlayingAudio) {
      tts.stop();
    } else {
      tts.speak(script, {
        pitch: item.audio?.pitch || 1.0,
        rate: item.audio?.rate || 1.0,
      });
    }
  };

  const handlePageChange = (index) => {
    setActiveStoryPage(index);
    if (item?.pages && item.pages[index]) {
      const pageScript = `${item.pages[index].title}. ${item.pages[index].text}`;
      tts.speak(pageScript);
    }
  };

  return (
    <div
      style={{
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        paddingLeft: "max(env(safe-area-inset-left), 12px)",
        paddingRight: "max(env(safe-area-inset-right), 12px)",
      }}
      className="pointer-events-none absolute inset-0 flex flex-col justify-between z-20 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="relative z-50 flex items-center justify-between w-full gap-2">
        {/* Status Badge */}
        <div
          className={`pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium backdrop-blur-md border text-[11px] sm:text-xs transition-all truncate max-w-[60vw] ${
            isTargetFound
              ? "bg-[#141824]/90 border-slate-700 text-violet-200"
              : "bg-[#141824]/90 border-slate-700/80 text-slate-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isTargetFound ? "bg-emerald-400" : "bg-slate-400"
            }`}
          />
          <span className="truncate">{isTargetFound ? item.title : "Point Camera at Marker…"}</span>
        </div>

        {/* Action buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          {(item?.audio || activeHotspot) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSpeech();
              }}
              style={{ touchAction: "manipulation" }}
              className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                isPlayingAudio
                  ? "bg-violet-600 text-white border-violet-500 shadow-sm"
                  : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
              title={isPlayingAudio ? "Mute Narration" : "Play Narration"}
            >
              {isPlayingAudio ? (
                <Volume2 className="w-4 h-4 text-white" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          {item?.quiz && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuiz(true);
              }}
              style={{ touchAction: "manipulation" }}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md transition-colors cursor-pointer shadow-sm"
              title="Interactive Quiz"
            >
              <HelpCircle className="w-4 h-4 text-violet-400" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onExit();
            }}
            style={{ touchAction: "manipulation" }}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-red-900/80 text-slate-200 hover:text-white border border-slate-700 backdrop-blur-md active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Exit AR"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Scanning Box Reticle */}
      <div className="pointer-events-none flex items-center justify-center my-auto">
        <div
          className="relative w-full aspect-square transition-all duration-300"
          style={{ width: "min(68vw, 36vh, 300px)" }}
        >
          {[
            "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
            "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute ${cls} transition-colors duration-300`}
              style={{
                width: "clamp(24px, 8vw, 38px)",
                height: "clamp(24px, 8vw, 38px)",
                borderColor: isTargetFound ? "#8B5CF6" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
          {!isTargetFound && (
            <div
              className="absolute left-0 right-0 h-[2px] animate-[scanline_2s_ease-in-out_infinite]"
              style={{ background: "linear-gradient(90deg, transparent, #8B5CF6, transparent)" }}
            />
          )}
        </div>
      </div>

      {/* Storybook Page Switcher (if physical/digital story) */}
      {item?.pages && item.pages.length > 0 && (
        <div className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2 mb-2 flex-wrap px-2">
          {item.pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx)}
              className={`px-3 py-1 rounded-xl text-[11px] sm:text-xs font-medium backdrop-blur-md border transition-all ${
                activeStoryPage === idx
                  ? "bg-violet-600 text-white border-violet-500 shadow-sm"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Page {p.page}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Floating Info Card & 3D Controls */}
      <div
        className={`pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg flex flex-col gap-2 px-1 transition-opacity transition-transform duration-500 ease-out ${
          isTargetFound || activeHotspot
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ willChange: "opacity, transform" }}
      >
        {/* Tap hint for interactive models */}
        {isTargetFound && item?.hotspots && !activeHotspot && (
          <div className="self-center px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] sm:text-[11px] text-violet-300 backdrop-blur-md">
            Tap a planet to hear its story
          </div>
        )}

        {/* 3D Quick Adjust Controls — model items only; video cards get Mute */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {stage === "model" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.stop();
                onPrev?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              title="Back to Video"
            >
              <SkipBack className="w-3.5 h-3.5 text-slate-300" /> Prev
            </button>
          )}
          {stage === "video" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.stop();
                onNext?.();
              }}
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 backdrop-blur-md border border-violet-400 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              title="Show 3D Model"
            >
              Next <SkipForward className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {item?.model && stage !== "video" && (
            <>
              <button
                onClick={() => handleScaleModel(1)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                title="Scale Up"
              >
                <Plus className="w-3.5 h-3.5 text-slate-300" /> Scale +
              </button>
              <button
                onClick={() => handleScaleModel(-1)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                title="Scale Down"
              >
                <Minus className="w-3.5 h-3.5 text-slate-300" /> Scale -
              </button>
              <button
                onClick={handleRotateModel}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                title="Rotate 3D Model"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-300" /> Rotate
              </button>
            </>
          )}
          {hasVideoTarget && stage !== "model" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVideoMute?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
              title={videoMuted ? "Unmute video" : "Mute video"}
            >
              {videoMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-violet-300" />
              )}
              {videoMuted ? "Unmute" : "Mute"}
            </button>
          )}
        </div>

        {activeHotspot ? (
          /* Selected planet info panel */
          <div className="bg-[#141824]/95 backdrop-blur-md border border-violet-700/60 rounded-2xl p-3.5 sm:p-4 text-slate-100 shadow-xl max-h-[34vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold uppercase bg-violet-900/60 text-violet-200 border border-violet-700 shrink-0">
                  {activeHotspot.type || "Object"}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate">
                  {activeHotspot.title}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  tts.stop();
                  onCloseHotspot?.();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Close planet info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(activeHotspot.distance || activeHotspot.size) && (
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                {activeHotspot.distance && (
                  <div className="bg-slate-900/70 border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] uppercase tracking-wide text-slate-500">
                      Distance
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-200 font-medium leading-snug">
                      {activeHotspot.distance}
                    </div>
                  </div>
                )}
                {activeHotspot.size && (
                  <div className="bg-slate-900/70 border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] uppercase tracking-wide text-slate-500">
                      Size
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-200 font-medium leading-snug">
                      {activeHotspot.size}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeHotspot.script && (
              <p className="text-[11px] sm:text-xs text-slate-400 mt-2 leading-relaxed">
                {activeHotspot.script}
              </p>
            )}

            {activeHotspot.facts?.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {activeHotspot.facts.map((fact, i) => (
                  <li
                    key={i}
                    className="text-[11px] sm:text-xs text-slate-300 flex gap-1.5 leading-snug"
                  >
                    <span className="text-violet-400 shrink-0">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="bg-[#141824]/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 sm:p-4 text-slate-100 shadow-xl max-h-[28vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold uppercase bg-slate-800 text-violet-300 border border-slate-700">
                    {item.category.replace("_", " ")}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-slate-100">
                    {item.pages ? item.pages[activeStoryPage]?.title : item.title}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                  {item.pages ? item.pages[activeStoryPage]?.text : item.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Autoplay-blocked fallback: tap to start the card video */}
      {hasVideoTarget && videoNeedsGesture && stage !== "model" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayVideo?.();
            }}
            style={{ touchAction: "manipulation" }}
            className="pointer-events-auto px-4 py-2.5 rounded-xl bg-violet-600/95 hover:bg-violet-500 text-white border border-violet-400 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xl active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4" /> Tap to play video
          </button>
        </div>
      )}

      {/* Interactive Quiz Popup Modal */}
      {showQuiz && item?.quiz && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#141824] border border-slate-700 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-semibold text-violet-300 flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-violet-400" /> AR Knowledge Quiz
              </span>
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setSelectedQuizAnswer(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h4 className="text-sm font-semibold mb-4 text-slate-100">{item.quiz.question}</h4>
            <div className="flex flex-col gap-2">
              {item.quiz.options.map((option, idx) => {
                const isSelected = selectedQuizAnswer === idx;
                const isCorrect = idx === item.quiz.answer;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuizAnswer(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      selectedQuizAnswer === null
                        ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200"
                        : isSelected && isCorrect
                        ? "bg-emerald-950/60 border-emerald-600 text-emerald-300"
                        : isSelected && !isCorrect
                        ? "bg-red-950/60 border-red-600 text-red-300"
                        : isCorrect
                        ? "bg-emerald-950/60 border-emerald-600 text-emerald-300"
                        : "opacity-40 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span>{option}</span>
                    {selectedQuizAnswer !== null && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
            {selectedQuizAnswer !== null && (
              <p className="text-xs text-center mt-4 font-semibold text-violet-300">
                {selectedQuizAnswer === item.quiz.answer
                  ? "🎉 Correct! Super job!"
                  : "💡 Keep learning! Check the facts again."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
