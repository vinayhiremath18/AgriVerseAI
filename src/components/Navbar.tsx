"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const NAV_LINKS = [
    { id: "hero", label: "Home" },
    { id: "ai-detector", label: "Pest Doctor" },
    { id: "crop-shop", label: "Market AI" },
    { id: "robotics", label: "Robotics" },
    { id: "voice-ai", label: "Voice AI" },
    { id: "farm-advisor", label: "Farm Advisor" },
    { id: "fertilizer-calc", label: "NPK Calc" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-black/30 border-b border-green-500/10"
      >
        {/* Glow Line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-lg sm:text-2xl md:text-3xl font-black tracking-[0.15em] sm:tracking-[0.2em] text-green-400 cursor-pointer drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]"
            onClick={() => scrollToSection("hero")}
          >
            AGRIVERSE AI
          </motion.h1>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm text-zinc-300">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* CTA — hidden on very small screens */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection("ai-detector")}
              className="hidden sm:block bg-green-500 hover:bg-green-400 text-black font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-[0_0_35px_rgba(34,197,94,0.6)] transition-all duration-300 text-xs sm:text-sm"
            >
              Launch AI
            </motion.button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-green-500/20 bg-green-500/5"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-green-400 mb-1.5 origin-center transition-all"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-5 h-0.5 bg-green-400 mb-1.5"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-green-400 origin-center transition-all"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-72 sm:w-80 bg-gradient-to-b from-black via-green-950/30 to-black border-l border-green-500/15 flex flex-col pt-20 px-6"
            >
              {/* Glow */}
              <div className="absolute top-20 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => scrollToSection(link.id)}
                  className="relative text-left py-4 text-lg font-medium text-zinc-300 hover:text-green-400 border-b border-green-500/10 transition-all duration-300 group"
                >
                  <span className="relative z-10">{link.label}</span>
                  <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
                </motion.button>
              ))}

              {/* Mobile CTA */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => scrollToSection("ai-detector")}
                className="mt-8 bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-2xl shadow-[0_0_35px_rgba(34,197,94,0.6)] transition-all duration-300 text-sm"
              >
                🚀 Launch AI
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}