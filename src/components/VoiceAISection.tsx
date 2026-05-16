"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ────────────────────────────────────────────────── */
/* ─── Web Speech API Types (browser built-in, no package needed) ─── */
interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionResultItem;
  readonly length: number;
  readonly isFinal: boolean;
}
interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

type Phase =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

type LangCode = "en-IN" | "hi-IN" | "kn-IN";

/* ─── Language Detection ───────────────────────────────────── */
function detectLang(text: string): LangCode {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  return "en-IN";
}

const LANG_LABELS: Record<LangCode, string> = {
  "en-IN": "English",
  "hi-IN": "Hindi / हिंदी",
  "kn-IN": "Kannada / ಕನ್ನಡ",
};

const FALLBACK: Record<LangCode, string> = {
  "en-IN": "Sorry, I couldn't connect. Please try again.",
  "hi-IN": "क्षमा करें, कनेक्शन विफल हुआ। कृपया पुनः प्रयास करें।",
  "kn-IN": "ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕ ವಿಫಲವಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
};

const PLACEHOLDERS: Record<LangCode, string> = {
  "en-IN": "Tap the orb and ask about your crops…",
  "hi-IN": "ओर्ब दबाएं और अपनी फसल के बारे में पूछें…",
  "kn-IN": "ಆರ್ಬ್ ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ…",
};

/* ─── TTS helper ───────────────────────────────────────────── */
function speak(text: string, lang: LangCode, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.95;
  utt.pitch = 1;
  utt.onend = onEnd;
  utt.onerror = onEnd;
  window.speechSynthesis.speak(utt);
}

/* ─── Waveform bars ────────────────────────────────────────── */
function Waveform({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 5, 9, 6, 4, 7, 5, 3];
  return (
    <div className="flex items-end gap-[3px] h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-green-400"
          animate={
            active
              ? { scaleY: [1, h / 3, 1], opacity: [0.6, 1, 0.6] }
              : { scaleY: 0.25, opacity: 0.3 }
          }
          transition={{
            duration: 0.6 + i * 0.07,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay: i * 0.06,
          }}
          style={{ height: `${h * 3}px`, originY: 1 }}
        />
      ))}
    </div>
  );
}

/* ─── Language badge ────────────────────────────────────────── */
function LangBadge({ lang }: { lang: LangCode | null }) {
  if (!lang) return null;
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                 border border-green-400/30 bg-green-400/10
                 text-green-300 text-xs tracking-widest uppercase"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      {LANG_LABELS[lang]}
    </motion.span>
  );
}

/* ─── Status chip ───────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  Phase,
  { label: string; color: string }
> = {
  idle:       { label: "Ready",      color: "text-zinc-500"  },
  listening:  { label: "Listening…", color: "text-green-400" },
  processing: { label: "Thinking…",  color: "text-yellow-400" },
  speaking:   { label: "Speaking…",  color: "text-cyan-400"  },
  error:      { label: "Error",      color: "text-red-400"   },
};

/* ─── Main Component ────────────────────────────────────────── */
export default function VoiceAISection() {
  const [phase, setPhase]         = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [aiReply, setAiReply]     = useState("");
  const [detectedLang, setDetectedLang] = useState<LangCode | null>(null);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  /* Check browser support once */
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  /* ── Call Gemini Flash API ── */
  const askGemini = useCallback(
    async (text: string, lang: LangCode) => {
      setPhase("processing");
      try {
        const res = await fetch("/api/voice-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            detectedLang: lang,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        const reply: string = data.reply ?? FALLBACK[lang];
        setAiReply(reply);
        setPhase("speaking");
        speak(reply, lang, () => setPhase("idle"));
      } catch (err) {
        console.error("[VoiceAI]", err);
        const fallback = FALLBACK[lang];
        setAiReply(fallback);
        setPhase("error");
        speak(fallback, lang, () => setPhase("idle"));
      }
    },
    []
  );

  /* ── Start speech recognition ── */
  const startListening = useCallback(() => {
    if (phase !== "idle") return;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    // Stop any ongoing TTS
    window.speechSynthesis?.cancel();

    const rec = new SR();
    // Allow multi-language detection: browser will pick up script automatically
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setPhase("listening");
      setTranscript("");
      setAiReply("");
      setDetectedLang(null);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      const lang   = detectLang(result);
      setTranscript(result);
      setDetectedLang(lang);
      askGemini(result, lang);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[SpeechRecognition]", event.error);
      if (event.error !== "no-speech") {
        setPhase("error");
        setAiReply("Microphone error. Please allow mic access and retry.");
      } else {
        setPhase("idle");
      }
    };

    rec.onend = () => {
      // If still in listening phase (no result), reset
      setPhase((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setPhase("idle");
    }
  }, [phase, askGemini]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const { label: statusLabel, color: statusColor } =
    STATUS_CONFIG[phase];

  const isActive = phase === "listening" || phase === "speaking";
  const isLoading = phase === "processing";
  const canClick = phase === "idle" || phase === "error";

  return (
    <section
      id="voice-ai"
      className="relative py-28 overflow-hidden bg-black"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,120,0.12),transparent_70%)]" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-20">
          <p className="uppercase tracking-[0.4em] text-green-400 mb-4 text-sm">
            AI Voice Assistant
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
            SPEAK TO
            <br />
            <span className="text-green-400">YOUR FARM</span>
          </h2>
          <p className="mt-6 text-zinc-400 max-w-2xl mx-auto text-sm">
            Multilingual AI assistant — English, Hindi &amp; Kannada.
            Powered by Gemini Flash. Speak naturally; reply in your language.
          </p>

          {/* Language support chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(["en-IN", "hi-IN", "kn-IN"] as LangCode[]).map((l) => (
              <span
                key={l}
                className="px-3 py-1 rounded-full border border-green-500/20
                           bg-green-500/5 text-green-500/70 text-xs tracking-widest"
              >
                {LANG_LABELS[l]}
              </span>
            ))}
          </div>
        </div>

        {/* ── Main interactive area ── */}
        <div className="flex flex-col items-center justify-center gap-10">

          {/* Orb button */}
          <div className="relative">
            {/* Outer pulse rings */}
            <AnimatePresence>
              {isActive && (
                <>
                  <motion.span
                    key="ring1"
                    className="absolute inset-0 rounded-full border border-green-400/60"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    key="ring2"
                    className="absolute inset-0 rounded-full border border-green-400/40"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
                  />
                </>
              )}
            </AnimatePresence>

            <motion.button
              id="voice-ai-orb"
              onClick={startListening}
              disabled={!canClick || !supported}
              aria-label="Start voice input"
              animate={{
                scale: isActive ? [1, 1.05, 1] : 1,
                boxShadow: isActive
                  ? [
                      "0 0 60px rgba(0,255,100,0.3)",
                      "0 0 100px rgba(0,255,100,0.55)",
                      "0 0 60px rgba(0,255,100,0.3)",
                    ]
                  : "0 0 60px rgba(0,255,100,0.25)",
              }}
              transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
              className="relative w-52 h-52 rounded-full
                         bg-gradient-to-br from-green-400/30 via-green-600/10 to-transparent
                         border border-green-400/40
                         flex items-center justify-center
                         disabled:opacity-50 disabled:cursor-not-allowed
                         cursor-pointer transition-all"
            >
              {/* Processing spinner */}
              {isLoading ? (
                <motion.div
                  className="w-16 h-16 rounded-full border-2 border-green-400/30
                             border-t-green-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={
                    phase === "speaking"
                      ? "text-cyan-300"
                      : phase === "error"
                      ? "text-red-400"
                      : "text-green-300"
                  }
                >
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              )}
            </motion.button>
          </div>

          {/* Status row */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.span
                className={`w-2 h-2 rounded-full ${
                  phase === "error" ? "bg-red-400" : "bg-green-400"
                }`}
                animate={{
                  scale: isActive ? [1, 1.5, 1] : 1,
                  opacity: isActive ? [1, 0.5, 1] : 1,
                }}
                transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
              />
              <span className={`text-xs uppercase tracking-widest ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <LangBadge lang={detectedLang} />
          </div>

          {/* Waveform */}
          <Waveform active={phase === "listening" || phase === "speaking"} />

          {/* Not supported notice */}
          {!supported && (
            <p className="text-red-400/80 text-sm text-center max-w-sm">
              ⚠️ Your browser doesn&apos;t support Speech Recognition.
              Please use Chrome or Edge for voice features.
            </p>
          )}

          {/* Transcript + AI reply card */}
          <div className="w-full max-w-3xl">
            <div
              className="rounded-3xl border border-green-500/20
                         bg-black/40 backdrop-blur-xl p-8
                         shadow-[0_0_40px_rgba(0,255,100,0.08)]
                         space-y-6"
            >
              {/* You said */}
              <div>
                <p className="text-green-400 text-xs uppercase tracking-[0.3em] mb-2">
                  You Said
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={transcript || "placeholder"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-lg text-white leading-relaxed min-h-[28px] ${
                      !transcript ? "text-zinc-600 italic" : ""
                    }`}
                  >
                    {transcript ||
                      PLACEHOLDERS[detectedLang ?? "en-IN"]}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="border-t border-green-500/10" />

              {/* AI reply */}
              <div>
                <p className="text-green-400 text-xs uppercase tracking-[0.3em] mb-2">
                  AI Response
                </p>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 rounded-full bg-green-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                      <span className="text-zinc-500 text-sm ml-2">
                        AgriBot is thinking…
                      </span>
                    </motion.div>
                  ) : (
                    <motion.p
                      key={aiReply || "empty"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xl md:text-2xl font-bold leading-relaxed min-h-[36px] ${
                        phase === "error"
                          ? "text-red-400"
                          : phase === "speaking"
                          ? "text-cyan-300"
                          : aiReply
                          ? "text-white"
                          : "text-zinc-600 italic text-base font-normal"
                      }`}
                    >
                      {aiReply || "AgriBot reply will appear here…"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Hint */}
            {canClick && supported && (
              <p className="text-center text-zinc-600 text-xs mt-4 tracking-wide">
                Tap the orb → Speak → Get AI farming advice in your language
              </p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}