class TTSService {
  constructor() {
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.onStateChange = null;
  }

  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  speak(text, { voiceName = "en-US", rate = 1.0, pitch = 1.0, onStart, onEnd } = {}) {
    if (!this.synth) {
      console.warn("Speech synthesis not supported in this environment.");
      return;
    }

    this.stop();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voices = this.getVoices();
    if (voices.length > 0) {
      const selectedVoice = voices.find(
        (v) => v.name.includes(voiceName) || v.lang.includes(voiceName)
      ) || voices[0];
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      if (onStart) onStart();
      if (this.onStateChange) this.onStateChange(true);
    };

    utterance.onend = () => {
      this.isPlaying = false;
      if (onEnd) onEnd();
      if (this.onStateChange) this.onStateChange(false);
    };

    utterance.onerror = (e) => {
      console.error("TTS error:", e);
      this.isPlaying = false;
      if (this.onStateChange) this.onStateChange(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange(false);
  }

  toggle(text, options = {}) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.speak(text, options);
    }
  }
}

export const tts = new TTSService();
