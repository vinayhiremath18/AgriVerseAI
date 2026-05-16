"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceAISection() {
  const [listening, setListening] = useState(false);

  const [text, setText] = useState(
    "Tap the AI orb and speak in English, Hindi, or Kannada..."
  );

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
      setText("🎤 Listening...");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[0][0].transcript;

      setText(transcript);

      speakResponse(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const speakResponse = (message: string) => {
    let response =
      "Your crop looks healthy.";

    let lang = "en-IN";

    const lower = message.toLowerCase();

    // Kannada
    if (/[\u0C80-\u0CFF]/.test(message)) {
      lang = "kn-IN";

      response =
        "ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ.";

      if (message.includes("ನೀರು")) {
        response =
          "ಮಣ್ಣಿನಲ್ಲಿ ತೇವಾಂಶ ಕಡಿಮೆ ಇದೆ. ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ.";
      }

      if (message.includes("ರೋಗ")) {
        response =
          "ಬೆಳೆಯಲ್ಲಿ ರೋಗದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ.";
      }
    }

    // Hindi
    else if (/[\u0900-\u097F]/.test(message)) {
      lang = "hi-IN";

      response =
        "आपकी फसल स्वस्थ दिख रही है।";

      if (message.includes("पानी")) {
        response =
          "मिट्टी में नमी कम है। सिंचाई की आवश्यकता है।";
      }

      if (message.includes("बीमारी")) {
        response =
          "फसल में बीमारी के लक्षण पाए गए हैं।";
      }
    }

    // English
    else {
      if (lower.includes("water")) {
        response =
          "Soil moisture is low. Irrigation recommended.";
      }

      if (lower.includes("disease")) {
        response =
          "Possible crop infection detected.";
      }

      if (lower.includes("weather")) {
        response =
          "Rain expected tomorrow.";
      }
    }

    const speech =
      new SpeechSynthesisUtterance(response);

    speech.lang = lang;

    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.start();
  };

  return (
    <section
      id="voice-ai"
      className="relative py-28 overflow-hidden bg-black"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,120,0.12),transparent_70%)]" />

      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-20">

          <p className="uppercase tracking-[0.4em] text-green-400 mb-4">
            AI Voice Assistant
          </p>

          <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
            SPEAK TO
            <br />

            <span className="text-green-400">
              YOUR FARM
            </span>
          </h2>

          <p className="mt-6 text-zinc-400 max-w-2xl mx-auto">
            Multilingual AI assistant supporting English,
            Hindi, and Kannada.
          </p>

        </div>

        <div className="flex flex-col items-center justify-center">

          <motion.button
            onClick={startListening}
            animate={{
              scale: listening
                ? [1, 1.1, 1]
                : 1,
            }}
            transition={{
              duration: 1.2,
              repeat: listening ? Infinity : 0,
            }}
            className="relative w-56 h-56 rounded-full bg-gradient-to-br from-green-400/30 to-green-600/10 border border-green-400/40 flex items-center justify-center shadow-[0_0_80px_rgba(0,255,100,0.35)]"
          >

            {listening && (
              <>
                <span className="absolute inset-0 rounded-full border border-green-400 animate-ping" />

                <span className="absolute inset-5 rounded-full border border-green-400/40 animate-ping" />
              </>
            )}

            <svg
              width="90"
              height="90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-green-300"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />

              <path d="M19 10v2a7 7 0 01-14 0v-2" />

              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>

          </motion.button>

          <div className="mt-12 max-w-3xl w-full">

            <div className="rounded-3xl border border-green-500/20 bg-black/40 backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(0,255,100,0.08)]">

              <p className="text-green-400 text-sm uppercase tracking-[0.3em] mb-4 text-center">
                LIVE AI RESPONSE
              </p>

              <h3 className="text-2xl md:text-3xl text-white font-bold text-center leading-relaxed">
                {text}
              </h3>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}