"use client";

import { motion } from "framer-motion";

export default function Navbar() {

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-black/30 border-b border-green-500/10"
    >

      {/* Glow Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <motion.h1
          whileHover={{ scale: 1.05 }}
          className="text-2xl md:text-3xl font-black tracking-[0.2em] text-green-400 cursor-pointer drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]"
          onClick={() => scrollToSection("hero")}
        >
          AGRIVERSE AI
        </motion.h1>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-300">

          <button
            onClick={() => scrollToSection("hero")}
            className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection("ai-detector")}
            className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          >
            Pest Doctor
          </button>

          <button
            onClick={() => scrollToSection("crop-shop")}
            className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          >
            Market AI
          </button>

          <button
            onClick={() => scrollToSection("robotics")}
            className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          >
            Robotics
          </button>

          <button
            onClick={() => scrollToSection("voice-ai")}
            className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
          >
            Voice AI
          </button>

        </div>

        {/* CTA */}
        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={() => scrollToSection("ai-detector")}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-full shadow-[0_0_35px_rgba(34,197,94,0.6)] transition-all duration-300"
        >
          Launch AI
        </motion.button>

      </div>
    </motion.nav>
  );
}