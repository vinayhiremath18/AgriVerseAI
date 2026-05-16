"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  const scrollToDetector = () => {
    document
      .getElementById("ai-detector")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center bg-gradient-to-b from-black via-green-950 to-black">

      {/* Background Glow */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-green-500/10 blur-3xl" />

      <div className="absolute top-20 right-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),transparent_65%)]" />

      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,20,0,0.75)), url('/images/farm.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,1)]"
            animate={{
              y: [0, -120, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 4 + (i % 5),
              repeat: Infinity,
            }}
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 text-center px-6"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="uppercase tracking-[0.4em] text-green-400 mb-4 text-sm"
        >
          AI Powered Agriculture
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-8xl font-black leading-none"
        >
          THE FUTURE OF
          <br />
          <span className="text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
            SMART FARMING
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 max-w-2xl mx-auto text-zinc-300 text-lg leading-relaxed"
        >
          Immersive AI ecosystem combining crop intelligence,
          robotics, voice assistants, disease detection,
          and futuristic agriculture analytics.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col md:flex-row justify-center gap-4"
        >
          <button
            onClick={scrollToDetector}
            className="px-8 py-4 bg-green-500 hover:bg-green-400 transition-all duration-300 rounded-full text-black font-bold shadow-[0_0_40px_rgba(34,197,94,0.7)] hover:scale-105"
          >
            Launch AI Detector
          </button>

          <button
            className="px-8 py-4 border border-green-500 rounded-full hover:bg-green-500/10 transition-all duration-300 hover:scale-105"
          >
            Watch Demo
          </button>
        </motion.div>
      </motion.div>

    </section>
  );
}