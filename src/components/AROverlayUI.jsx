import { useState, useEffect } from "react";
import { Volume2, VolumeX, HelpCircle, BookOpen, Layers, Check, X, RotateCw } from "lucide-react";
import { tts } from "../services/ttsService";

export default function AROverlayUI({ item, isTargetFound, onExit }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [activeStoryPage, setActiveStoryPage] = useState(0);

  useEffect(() => {
    tts.onStateChange = (state) => setIsPlayingAudio(state);
    return () => {
      tts.stop();
    };
  }, []);

  // When target is detected for the first time, auto-narrate
  useEffect(() => {
    if (isTargetFound && item?.audio?.script) {
      tts.speak(item.audio.script, {
        pitch: item.audio.pitch || 1.0,
        rate: item.audio.rate || 1.0,
      });
    } else {
      tts.stop();
    }
  }, [isTargetFound, item]);

  const toggleSpeech = () => {
    if (!item?.audio?.script) return;
    if (isPlayingAudio) {
      tts.stop();
    } else {
      tts.speak(item.audio.script, {
        pitch: item.audio.pitch || 1.0,
        rate: item.audio.rate || 1.0,
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
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Status Badge */}
        <div
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full font-medium backdrop-blur-md border text-xs sm:text-sm transition-all shadow-lg ${
            isTargetFound
              ? "bg-[#5EEAD4]/20 border-[#5EEAD4]/60 text-[#5EEAD4]"
              : "bg-white/10 border-white/20 text-white"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isTargetFound ? "bg-[#5EEAD4] animate-ping" : "bg-white/60 animate-pulse"
            }`}
          />
          <span>{isTargetFound ? `AR Active: ${item.title}` : "Point Camera at Marker…"}</span>
        </div>

        {/* Action buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {item?.audio && (
            <button
              onClick={toggleSpeech}
              className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                isPlayingAudio
                  ? "bg-[#5EEAD4] text-[#0B0B1E] border-[#5EEAD4] shadow-lg shadow-[#5EEAD4]/40"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
              title={isPlayingAudio ? "Mute Narration" : "Play Narration"}
            >
              {isPlayingAudio ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            </button>
          )}

          {item?.quiz && (
            <button
              onClick={() => setShowQuiz(true)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-colors"
              title="Interactive Quiz"
            >
              <HelpCircle className="w-5 h-5 text-amber-300" />
            </button>
          )}

          <button
            onClick={onExit}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-colors"
            title="Exit AR"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Target Scanning Box Reticle */}
      <div className="pointer-events-none flex items-center justify-center my-auto">
        <div
          className="relative w-full aspect-square transition-all duration-300"
          style={{ maxWidth: "min(72vw, 320px)" }}
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
                width: "40px",
                height: "40px",
                borderColor: isTargetFound ? "#5EEAD4" : "rgba(255,255,255,0.7)",
              }}
            />
          ))}
          {!isTargetFound && (
            <div
              className="absolute left-0 right-0 h-[2px] animate-[scanline_2s_ease-in-out_infinite]"
              style={{ background: "linear-gradient(90deg, transparent, #5EEAD4, transparent)" }}
            />
          )}
        </div>
      </div>

      {/* Storybook Page Switcher (if physical/digital story) */}
      {item?.pages && item.pages.length > 0 && (
        <div className="pointer-events-auto flex items-center justify-center gap-2 mb-2">
          {item.pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all ${
                activeStoryPage === idx
                  ? "bg-[#5EEAD4] text-[#0B0B1E] border-[#5EEAD4]"
                  : "bg-black/40 text-white/80 border-white/20 hover:bg-black/60"
              }`}
            >
              Page {p.page}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Floating Info Card */}
      {isTargetFound && (
        <div className="pointer-events-auto mx-auto w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-white shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#5EEAD4]/20 text-[#5EEAD4] border border-[#5EEAD4]/30">
                  {item.category.replace("_", " ")}
                </span>
                <h3 className="font-bold text-base font-['Space_Grotesk'] text-white">
                  {item.pages ? item.pages[activeStoryPage]?.title : item.title}
                </h3>
              </div>
              <p className="text-xs text-[#A8A3C7] mt-1 leading-relaxed">
                {item.pages ? item.pages[activeStoryPage]?.text : item.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Popup Modal */}
      {showQuiz && item?.quiz && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0F0F26] border border-[#5EEAD4]/30 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-[#5EEAD4] flex items-center gap-1">
                <HelpCircle className="w-4 h-4" /> AR Knowledge Quiz
              </span>
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setSelectedQuizAnswer(null);
                }}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h4 className="text-sm font-semibold mb-4">{item.quiz.question}</h4>
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
                        ? "bg-white/5 border-white/10 hover:bg-white/10"
                        : isSelected && isCorrect
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : isSelected && !isCorrect
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : isCorrect
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "opacity-40 border-white/5"
                    }`}
                  >
                    <span>{option}</span>
                    {selectedQuizAnswer !== null && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
            {selectedQuizAnswer !== null && (
              <p className="text-xs text-center mt-4 font-semibold text-[#5EEAD4]">
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
