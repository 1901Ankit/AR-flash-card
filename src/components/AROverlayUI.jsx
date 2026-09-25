import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  Check,
  X,
  RotateCw,
  Plus,
  Minus,
  Play,
  SkipForward,
  SkipBack,
  Star,
} from "lucide-react";
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

  const closeQuiz = () => {
    setShowQuiz(false);
    setSelectedQuizAnswer(null);
  };

  const quizIsCorrect =
    selectedQuizAnswer !== null && selectedQuizAnswer === item?.quiz?.answer;

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
          className={`pointer-events-auto flex items-center gap-2 pl-2.5 pr-3.5 sm:pl-3 sm:pr-4 py-1.5 sm:py-2 rounded-full font-medium backdrop-blur-md border text-[11px] sm:text-xs transition-all duration-300 truncate max-w-[62vw] shadow-[0_2px_16px_rgba(0,0,0,0.35)] ${
            isTargetFound
              ? "bg-gradient-to-r from-violet-950/90 to-[#141824]/90 border-violet-700/60 text-violet-100"
              : "bg-[#0f1220]/85 border-white/10 text-slate-300"
          }`}
        >
          {isTargetFound ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          ) : (
            <span className="relative w-2 h-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-slate-400/70 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-slate-400" />
            </span>
          )}
          <span className="truncate">
            {isTargetFound ? item.title : "Point camera at the marker…"}
          </span>
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
              aria-label={isPlayingAudio ? "Mute narration" : "Play narration"}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all duration-200 cursor-pointer active:scale-90 ${
                isPlayingAudio
                  ? "bg-violet-600 text-white border-violet-400 shadow-[0_0_0_4px_rgba(139,92,246,0.18)]"
                  : "bg-[#0f1220]/85 text-slate-300 border-white/10 hover:border-white/25"
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
              aria-label="Open quiz"
              className="p-2.5 rounded-full bg-[#0f1220]/85 hover:border-white/25 text-amber-300 border border-white/10 backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-90"
              title="Interactive Quiz"
            >
              <HelpCircle className="w-4 h-4" />
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
            aria-label="Exit AR"
            className="p-2.5 rounded-full bg-[#0f1220]/85 hover:bg-red-900/60 text-slate-300 hover:text-white border border-white/10 hover:border-red-700/50 backdrop-blur-md active:scale-90 transition-all duration-200 cursor-pointer"
            title="Exit AR"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Scanning Box Reticle */}
      <div className="pointer-events-none flex items-center justify-center my-auto">
        <div
          className="relative flex items-center justify-center w-full aspect-square transition-all duration-500"
          style={{ width: "min(68vw, 36vh, 300px)" }}
        >
          {!isTargetFound && (
            <div className="absolute inset-[18%] rounded-full bg-slate-100/[0.03] blur-xl" />
          )}
          {isTargetFound && (
            <div className="absolute inset-[10%] rounded-full bg-violet-500/10 blur-2xl animate-pulse" />
          )}

          {[
            "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl",
            "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl",
            "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
            "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute ${cls} transition-all duration-500`}
              style={{
                width: "clamp(24px, 8vw, 38px)",
                height: "clamp(24px, 8vw, 38px)",
                borderColor: isTargetFound ? "#A78BFA" : "rgba(255,255,255,0.35)",
                filter: isTargetFound
                  ? "drop-shadow(0 0 6px rgba(167,139,250,0.7))"
                  : "none",
              }}
            />
          ))}

          {!isTargetFound && (
            <div
              className="absolute left-0 right-0 h-[2px] animate-[scanline_2s_ease-in-out_infinite]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #A78BFA, transparent)",
              }}
            />
          )}
        </div>
      </div>

      {/* Storybook Page Switcher (if physical/digital story) */}
      {item?.pages && item.pages.length > 0 && (
        <div className="pointer-events-auto flex items-center justify-center gap-1.5 mb-2.5 flex-wrap px-2">
          {item.pages.map((p, idx) => {
            const isActive = activeStoryPage === idx;
            return (
              <button
                key={idx}
                onClick={() => handlePageChange(idx)}
                aria-current={isActive}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-md border transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? "bg-violet-600 text-white border-violet-400 scale-110 shadow-[0_0_0_4px_rgba(139,92,246,0.2)]"
                    : "bg-[#0f1220]/80 text-slate-400 border-white/10 hover:text-slate-200 hover:border-white/25"
                }`}
                title={`Page ${p.page}`}
              >
                {p.page}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Floating Info Card & 3D Controls */}
      <div
        className={`pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg flex flex-col items-center gap-2.5 px-1 transition-all duration-500 ease-out ${
          isTargetFound || activeHotspot
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ willChange: "opacity, transform" }}
      >
        {/* Tap hint for interactive models */}
        {isTargetFound && item?.hotspots && !activeHotspot && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f1220]/80 border border-white/10 text-[10px] sm:text-[11px] text-violet-300 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Tap a planet to hear its story
          </div>
        )}

        {/* 3D Quick Adjust Controls — model items only; video cards get Mute */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap bg-[#0f1220]/70 border border-white/10 backdrop-blur-md rounded-2xl px-1.5 py-1.5 shadow-lg">
          {stage === "model" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.stop();
                onPrev?.();
              }}
              className="px-3 py-1.5 rounded-xl hover:bg-white/5 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
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
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              title="Show 3D Model"
            >
              Next <SkipForward className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {item?.model && stage !== "video" && (
            <>
              <div className="flex items-center rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => handleScaleModel(-1)}
                  aria-label="Scale down"
                  className="px-2.5 py-1.5 hover:bg-white/5 text-slate-300 active:scale-95 transition-all"
                  title="Scale Down"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[10px] font-mono text-slate-400 min-w-[2.5rem] text-center tabular-nums">
                  {Math.round(scaleMult * 100)}%
                </span>
                <button
                  onClick={() => handleScaleModel(1)}
                  aria-label="Scale up"
                  className="px-2.5 py-1.5 hover:bg-white/5 text-slate-300 active:scale-95 transition-all"
                  title="Scale Up"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleRotateModel}
                className="px-3 py-1.5 rounded-xl hover:bg-white/5 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
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
              className="px-3 py-1.5 rounded-xl hover:bg-white/5 text-slate-200 text-[11px] sm:text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
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
          <div className="w-full bg-gradient-to-b from-[#171b2c]/95 to-[#0f1220]/95 backdrop-blur-md border border-violet-700/40 rounded-2xl p-3.5 sm:p-4 text-slate-100 shadow-2xl max-h-[36vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-violet-900/50 text-violet-200 border border-violet-700/50 shrink-0">
                  {activeHotspot.type || "Object"}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-50 truncate">
                  {activeHotspot.title}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  tts.stop();
                  onCloseHotspot?.();
                }}
                aria-label="Close planet info"
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                title="Close planet info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(activeHotspot.distance || activeHotspot.size) && (
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                {activeHotspot.distance && (
                  <div className="bg-black/25 border border-white/5 rounded-xl px-2.5 py-1.5">
                    <div className="text-[9px] text-slate-500 font-medium">
                      Distance from Sun
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-200 font-semibold leading-snug">
                      {activeHotspot.distance}
                    </div>
                  </div>
                )}
                {activeHotspot.size && (
                  <div className="bg-black/25 border border-white/5 rounded-xl px-2.5 py-1.5">
                    <div className="text-[9px] text-slate-500 font-medium">
                      Size
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-200 font-semibold leading-snug">
                      {activeHotspot.size}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeHotspot.script && (
              <p className="text-[11px] sm:text-xs text-slate-400 mt-2.5 leading-relaxed">
                {activeHotspot.script}
              </p>
            )}

            {activeHotspot.facts?.length > 0 && (
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {activeHotspot.facts.map((fact, i) => (
                  <li
                    key={i}
                    className="text-[11px] sm:text-xs text-slate-300 flex gap-2 leading-snug"
                  >
                    <Star className="w-3 h-3 text-amber-300 shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="w-full bg-gradient-to-b from-[#171b2c]/95 to-[#0f1220]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 sm:p-4 text-slate-100 shadow-2xl max-h-[28vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-white/5 text-violet-300 border border-white/10">
                {item.category.replace("_", " ")}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-50">
                {item.pages ? item.pages[activeStoryPage]?.title : item.title}
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
              {item.pages ? item.pages[activeStoryPage]?.text : item.description}
            </p>
          </div>
        )}
      </div>

      {/* Autoplay-blocked fallback: tap to start the card video */}
      {hasVideoTarget && videoNeedsGesture && stage !== "model" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30 bg-black/20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayVideo?.();
            }}
            style={{ touchAction: "manipulation" }}
            className="pointer-events-auto px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/60 text-sm font-semibold flex items-center gap-2 shadow-2xl active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-white" /> Tap to play video
          </button>
        </div>
      )}

      {/* Interactive Quiz Popup Modal */}
      {showQuiz && item?.quiz && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-gradient-to-b from-[#191d2f] to-[#0f1220] border border-white/10 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Quick Quiz
              </span>
              <button
                onClick={closeQuiz}
                aria-label="Close quiz"
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-base font-semibold mb-4 text-slate-50 leading-snug">
              {item.quiz.question}
            </h4>

            <div className="flex flex-col gap-2">
              {item.quiz.options.map((option, idx) => {
                const isSelected = selectedQuizAnswer === idx;
                const isCorrect = idx === item.quiz.answer;
                const answered = selectedQuizAnswer !== null;

                let stateClasses =
                  "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 text-slate-200";
                if (answered) {
                  if (isSelected && isCorrect) {
                    stateClasses =
                      "bg-emerald-500/15 border-emerald-500/60 text-emerald-200";
                  } else if (isSelected && !isCorrect) {
                    stateClasses =
                      "bg-rose-500/15 border-rose-500/60 text-rose-200";
                  } else if (isCorrect) {
                    stateClasses =
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-300/80";
                  } else {
                    stateClasses =
                      "bg-transparent border-white/5 text-slate-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => answered ? null : setSelectedQuizAnswer(idx)}
                    disabled={answered}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-sm font-medium text-left transition-all duration-200 ${stateClasses} ${
                      !answered ? "active:scale-[0.98]" : ""
                    }`}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {answered && isSelected && !isCorrect && (
                      <X className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedQuizAnswer !== null && (
              <div
                className={`flex items-center justify-center gap-2 mt-4 py-2.5 rounded-2xl text-sm font-semibold ${
                  quizIsCorrect
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-amber-500/10 text-amber-300"
                }`}
              >
                {quizIsCorrect ? (
                  <>
                    <Star className="w-4 h-4 fill-emerald-300" /> Correct! Great job.
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Not quite — take another look at
                    the facts.
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}