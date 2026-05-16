"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NPKSection, ScheduleTable, IrrigationSection, CostBreakdown } from "./FertilizerResults";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CROPS = [
  { name: "Rice", emoji: "🌾" }, { name: "Wheat", emoji: "🌿" },
  { name: "Sugarcane", emoji: "🎋" }, { name: "Cotton", emoji: "☁️" },
  { name: "Tomato", emoji: "🍅" }, { name: "Onion", emoji: "🧅" },
  { name: "Maize", emoji: "🌽" }, { name: "Potato", emoji: "🥔" },
  { name: "Soybean", emoji: "🫘" }, { name: "Groundnut", emoji: "🥜" },
];

const SOILS = ["Alluvial Soil", "Black Soil (Regur)", "Red Soil", "Laterite Soil", "Sandy Soil", "Clayey Soil", "Loamy Soil", "Saline Soil"];
const SEASONS = ["Kharif (June-Oct)", "Rabi (Nov-Mar)", "Zaid/Summer (Mar-Jun)"];
const TABS = [
  { id: "npk", label: "🧪 NPK" },
  { id: "schedule", label: "📅 Schedule" },
  { id: "irrigation", label: "💧 Irrigation" },
  { id: "cost", label: "💰 Cost & Schemes" },
];

export default function FertilizerCalcSection() {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("1");
  const [soil, setSoil] = useState("");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("npk");

  const handleCalc = useCallback(async () => {
    if (!crop.trim()) { setError("Please select a crop"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/fertilizer-calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crop: crop.trim(), area: parseFloat(area) || 1, soil, season }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error || "Calculation failed"); return; }
      setResult(json.data);
      setTab("npk");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [crop, area, soil, season]);

  return (
    <section id="fertilizer-calc"
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-gradient-to-b from-black via-emerald-950/10 to-black">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
      <div className="absolute top-32 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-32 left-10 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-12 sm:mb-16">
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <span className="text-xl">🧮</span>
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">
              AI Calculator
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">Fertilizer & </span>
            <span className="gradient-text">Irrigation</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2">
            Exact NPK calculations, irrigation schedule, cost breakdown in ₹, and government scheme discounts
          </p>
        </motion.div>

        {/* Input form */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-4 sm:p-6 md:p-10 mb-6 sm:mb-8">

          {/* Quick crops */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-3">Quick Select Crop</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {CROPS.map((c) => (
                <motion.button key={c.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setCrop(c.name)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border ${
                    crop === c.name
                      ? "bg-green-500/20 border-green-400/50 text-green-300 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                      : "bg-green-950/30 border-green-500/10 text-zinc-400 hover:border-green-500/30 hover:text-zinc-200"
                  }`}>{c.emoji} {c.name}</motion.button>
              ))}
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">🌱 Crop *</label>
              <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Rice, Wheat..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white placeholder-zinc-600 focus:border-green-400/50 focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.15)] transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">📐 Area (acres)</label>
              <input type="number" value={area} onChange={(e) => setArea(e.target.value)} min="0.1" step="0.5"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white focus:border-green-400/50 focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.15)] transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">🏔️ Soil Type</label>
              <select value={soil} onChange={(e) => setSoil(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white focus:border-green-400/50 focus:outline-none transition-all text-sm appearance-none cursor-pointer">
                <option value="" className="bg-black">Loamy (default)</option>
                {SOILS.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">🌤️ Season</label>
              <select value={season} onChange={(e) => setSeason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white focus:border-green-400/50 focus:outline-none transition-all text-sm appearance-none cursor-pointer">
                <option value="" className="bg-black">Kharif (default)</option>
                {SEASONS.map((s) => <option key={s} value={s} className="bg-black">{s}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleCalc} disabled={loading}
              className="relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-green-400 text-black font-bold rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm tracking-wide uppercase overflow-hidden group">
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <><motion.span animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block">⚙️</motion.span> Calculating...</>
                ) : (<>🧮 Calculate Now</>)}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16">
              <div className="relative w-20 h-20 mb-5">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-400/30" />
                <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-yellow-400 border-l-yellow-400/30" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl">🧪</motion.div>
              </div>
              <p className="text-emerald-400 text-sm tracking-widest uppercase font-semibold">Calculating NPK & costs...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>

              {/* Title bar */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 border border-emerald-500/20 flex items-center justify-center text-xl sm:text-2xl">🧮</div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{result.crop}</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm">
                      {result.area} • {result.soilType || soil || "Loamy"} • {result.season || season || "Kharif"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">Calculated</span>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {TABS.map((t) => (
                  <motion.button key={t.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold tracking-wide transition-all border ${
                      tab === t.id
                        ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        : "bg-black/40 border-green-500/10 text-zinc-500 hover:text-zinc-300 hover:border-green-500/20"
                    }`}>{t.label}</motion.button>
                ))}
              </div>

              {/* Tab content */}
              <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }} className="glass-card p-4 sm:p-6 md:p-8">
                {result.parseError ? (
                  <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{result.rawData}</div>
                ) : (
                  <>
                    {tab === "npk" && <NPKSection npk={result.npk} />}
                    {tab === "schedule" && <ScheduleTable schedule={result.applicationSchedule} />}
                    {tab === "irrigation" && <IrrigationSection irrigation={result.irrigation} />}
                    {tab === "cost" && (
                      <CostBreakdown cost={result.costBreakdown} govSchemes={result.govSchemes}
                        finalCost={result.finalCostAfterSubsidy} totalSavings={result.totalSavings} />
                    )}
                  </>
                )}
              </motion.div>

              {/* Reset */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="mt-6 sm:mt-8 text-center">
                <p className="text-zinc-600 text-xs mb-3">
                  Calculations are AI-generated estimates. Consult local agricultural officers for precision.
                </p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setResult(null); setCrop(""); setArea("1"); setSoil(""); setSeason(""); }}
                  className="px-6 py-3 rounded-xl border border-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/10 transition-all">
                  🔄 New Calculation
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
