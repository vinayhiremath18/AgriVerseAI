"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getHistory,
  saveToHistory,
  deleteFromHistory,
  clearHistory,
  HistoryEntry,
} from "@/lib/history";
import HistoryPanel from "@/components/HistoryPanel";

/* ---------- types ---------- */
interface SowingTime {
  bestMonths: string;
  conditions: string;
  tips: string;
}
interface HarvestTime {
  expectedDuration: string;
  bestMonths: string;
  signs: string;
}
interface WeatherInfo {
  idealTemp: string;
  rainfall: string;
  warnings: string;
  actionPlan: string;
}
interface FertilizerInfo {
  basalDose: string;
  topDressing: string;
  organic: string;
  schedule: string;
}
interface SoilInfo {
  idealType: string;
  phRange: string;
  preparation: string;
  amendments: string;
}
interface IrrigationInfo {
  method: string;
  frequency: string;
  criticalStages: string;
}
interface PestDiseaseInfo {
  commonPests: string;
  commonDiseases: string;
  prevention: string;
}
interface AdvisoryData {
  crop: string;
  sowingTime: SowingTime;
  harvestTime: HarvestTime;
  weather: WeatherInfo;
  fertilizer: FertilizerInfo;
  soil: SoilInfo;
  irrigation: IrrigationInfo;
  pestDisease: PestDiseaseInfo;
  proTips: string[];
  rawAdvice?: string;
  parseError?: boolean;
}

/* ---------- constants ---------- */
const POPULAR_CROPS = [
  { name: "Rice", emoji: "🌾" },
  { name: "Wheat", emoji: "🌿" },
  { name: "Sugarcane", emoji: "🎋" },
  { name: "Cotton", emoji: "☁️" },
  { name: "Tomato", emoji: "🍅" },
  { name: "Onion", emoji: "🧅" },
  { name: "Maize", emoji: "🌽" },
  { name: "Potato", emoji: "🥔" },
  { name: "Soybean", emoji: "🫘" },
  { name: "Groundnut", emoji: "🥜" },
  { name: "Ragi", emoji: "🌱" },
  { name: "Turmeric", emoji: "✨" },
];

const SOIL_TYPES = [
  "Alluvial Soil",
  "Black Soil (Regur)",
  "Red Soil",
  "Laterite Soil",
  "Sandy Soil",
  "Clayey Soil",
  "Loamy Soil",
  "Saline Soil",
];

const REGIONS = [
  "Karnataka",
  "Maharashtra",
  "Punjab",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "West Bengal",
  "Kerala",
  "Bihar",
];

const TABS = [
  { id: "sowing", label: "🌱 Sowing", icon: "🌱" },
  { id: "harvest", label: "🌾 Harvest", icon: "🌾" },
  { id: "weather", label: "⛅ Weather", icon: "⛅" },
  { id: "fertilizer", label: "💧 Fertilizer", icon: "💧" },
  { id: "soil", label: "🏔️ Soil", icon: "🏔️" },
  { id: "irrigation", label: "💦 Irrigation", icon: "💦" },
  { id: "pest", label: "🐛 Pest & Disease", icon: "🐛" },
  { id: "tips", label: "💡 Pro Tips", icon: "💡" },
];

/* ---------- sub-components ---------- */

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group p-4 rounded-2xl border border-green-500/10 bg-gradient-to-br from-green-950/40 to-black/60 hover:border-green-400/30 transition-all duration-500"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <span className="text-xs uppercase tracking-widest text-green-400/70 font-semibold">
            {title}
          </span>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{value}</p>
      </div>
    </motion.div>
  );
}

function TabContent({
  tab,
  data,
}: {
  tab: string;
  data: AdvisoryData;
}) {
  switch (tab) {
    case "sowing":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon="📅"
            title="Best Months"
            value={data.sowingTime.bestMonths}
          />
          <InfoCard
            icon="🌡️"
            title="Ideal Conditions"
            value={data.sowingTime.conditions}
          />
          <InfoCard
            icon="💡"
            title="Sowing Tips"
            value={data.sowingTime.tips}
          />
        </div>
      );
    case "harvest":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon="⏱️"
            title="Duration"
            value={data.harvestTime.expectedDuration}
          />
          <InfoCard
            icon="📅"
            title="Best Months"
            value={data.harvestTime.bestMonths}
          />
          <InfoCard
            icon="👁️"
            title="Harvest Signs"
            value={data.harvestTime.signs}
          />
        </div>
      );
    case "weather":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon="🌡️"
            title="Ideal Temperature"
            value={data.weather.idealTemp}
          />
          <InfoCard
            icon="🌧️"
            title="Rainfall Needs"
            value={data.weather.rainfall}
          />
          <InfoCard
            icon="⚠️"
            title="Weather Warnings"
            value={data.weather.warnings}
          />
          <InfoCard
            icon="🛡️"
            title="Action Plan"
            value={data.weather.actionPlan}
          />
        </div>
      );
    case "fertilizer":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon="🧪"
            title="Basal Dose"
            value={data.fertilizer.basalDose}
          />
          <InfoCard
            icon="📊"
            title="Top Dressing"
            value={data.fertilizer.topDressing}
          />
          <InfoCard
            icon="🌿"
            title="Organic Options"
            value={data.fertilizer.organic}
          />
          <InfoCard
            icon="📅"
            title="Schedule"
            value={data.fertilizer.schedule}
          />
        </div>
      );
    case "soil":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon="🏔️"
            title="Ideal Soil Type"
            value={data.soil.idealType}
          />
          <InfoCard
            icon="⚗️"
            title="pH Range"
            value={data.soil.phRange}
          />
          <InfoCard
            icon="🔧"
            title="Soil Preparation"
            value={data.soil.preparation}
          />
          <InfoCard
            icon="➕"
            title="Soil Amendments"
            value={data.soil.amendments}
          />
        </div>
      );
    case "irrigation":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon="💦"
            title="Best Method"
            value={data.irrigation.method}
          />
          <InfoCard
            icon="⏰"
            title="Frequency"
            value={data.irrigation.frequency}
          />
          <InfoCard
            icon="🚨"
            title="Critical Stages"
            value={data.irrigation.criticalStages}
          />
        </div>
      );
    case "pest":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon="🐛"
            title="Common Pests"
            value={data.pestDisease.commonPests}
          />
          <InfoCard
            icon="🦠"
            title="Common Diseases"
            value={data.pestDisease.commonDiseases}
          />
          <InfoCard
            icon="🛡️"
            title="Prevention"
            value={data.pestDisease.prevention}
          />
        </div>
      );
    case "tips":
      return (
        <div className="space-y-3">
          {data.proTips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-green-500/10 bg-green-950/20 hover:border-green-400/30 transition-all duration-300"
            >
              <span className="text-green-400 font-bold text-lg mt-0.5">
                {i + 1}.
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {tip}
              </p>
            </motion.div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

/* ---------- main component ---------- */
export default function FarmAdvisorSection() {
  const [crop, setCrop] = useState("");
  const [soil, setSoil] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sowing");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setCrop(entry.crop);
    setSoil(entry.soil === "Auto-detected" ? "" : entry.soil);
    setRegion(entry.region === "General India" ? "" : entry.region);
    setAdvisory(entry.data as unknown as AdvisoryData);
    setActiveTab("sowing");
    setHistoryOpen(false);
  }, []);

  const handleDeleteHistory = useCallback(
    (id: string) => {
      deleteFromHistory(id);
      refreshHistory();
    },
    [refreshHistory]
  );

  const handleClearHistory = useCallback(() => {
    clearHistory();
    refreshHistory();
  }, [refreshHistory]);

  const handleSubmit = useCallback(async () => {
    if (!crop.trim()) {
      setError("Please enter a crop name");
      return;
    }

    setLoading(true);
    setError("");
    setAdvisory(null);

    try {
      const res = await fetch("/api/farm-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: crop.trim(),
          soil: soil.trim(),
          region: region.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to get advice");
        return;
      }

      setAdvisory(json.data);
      setActiveTab("sowing");

      // Save to history
      saveToHistory(crop.trim(), soil.trim(), region.trim(), json.data);
      refreshHistory();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error"
      );
    } finally {
      setLoading(false);
    }
  }, [crop, soil, region]);

  return (
    <section
      id="farm-advisor"
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden bg-gradient-to-b from-black via-green-950/20 to-black"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400/60 rounded-full"
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${(i * 11) % 100}%`,
              top: `${(i * 17) % 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-green-500/20 bg-green-500/5 mb-6"
          >
            <span className="text-xl">🧠</span>
            <span className="text-green-400 text-sm font-semibold tracking-widest uppercase">
              AI Farm Advisor
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">Smart </span>
            <span className="gradient-text">Farming Guide</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2">
            AI-powered personalized advice — when to sow, harvest,
            fertilize, and manage weather for any crop in any region
          </p>
        </motion.div>

        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-card p-4 sm:p-6 md:p-10 mb-6 sm:mb-8"
        >
          {/* Quick crop picks */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-3">
              Popular Crops — Quick Pick
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {POPULAR_CROPS.map((c) => (
                <motion.button
                  key={c.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCrop(c.name)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border ${
                    crop === c.name
                      ? "bg-green-500/20 border-green-400/50 text-green-300 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                      : "bg-green-950/30 border-green-500/10 text-zinc-400 hover:border-green-500/30 hover:text-zinc-200"
                  }`}
                >
                  {c.emoji} {c.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {/* Crop input */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">
                🌱 Crop Name *
              </label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Rice, Wheat, Sugarcane..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white placeholder-zinc-600 focus:border-green-400/50 focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.15)] transition-all duration-300 text-sm"
              />
            </div>

            {/* Soil select */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">
                🏔️ Soil Type
              </label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white focus:border-green-400/50 focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.15)] transition-all duration-300 text-sm appearance-none cursor-pointer"
              >
                <option value="" className="bg-black">
                  Auto-detect best soil
                </option>
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s} className="bg-black">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Region select */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-2">
                📍 Region / State
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-green-500/15 text-white focus:border-green-400/50 focus:outline-none focus:shadow-[0_0_20px_rgba(0,255,102,0.15)] transition-all duration-300 text-sm appearance-none cursor-pointer"
              >
                <option value="" className="bg-black">
                  General India
                </option>
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-black">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit + History buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm tracking-wide uppercase overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block"
                    >
                      ⚙️
                    </motion.span>
                    AI is Analyzing...
                  </>
                ) : (
                  <>🧠 Get AI Farm Advisory</>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setHistoryOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-2xl border border-green-500/20 text-green-400 text-xs sm:text-sm font-semibold hover:bg-green-500/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              📋 History
              {history.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs">
                  {history.length}
                </span>
              )}
            </motion.button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-24 h-24 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-400 border-r-green-400/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-400 border-l-cyan-400/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center text-3xl"
                >
                  🌱
                </motion.div>
              </div>
              <p className="text-green-400 text-sm tracking-widest uppercase font-semibold">
                Analyzing crop data...
              </p>
              <div className="flex gap-1 mt-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [8, 28, 8],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                    }}
                    className="w-1.5 rounded-full bg-green-400"
                    style={{ height: 8 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {advisory && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {/* Crop title bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/20 flex items-center justify-center text-2xl">
                    🌾
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {advisory.crop}
                    </h3>
                    <p className="text-zinc-500 text-sm">
                      {region || "General India"} •{" "}
                      {soil || "Auto-detected soil"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold tracking-widest uppercase">
                    AI Advisory Ready
                  </span>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-300 border ${
                      activeTab === tab.id
                        ? "bg-green-500/20 border-green-400/40 text-green-300 shadow-[0_0_20px_rgba(0,255,102,0.15)]"
                        : "bg-black/40 border-green-500/10 text-zinc-500 hover:text-zinc-300 hover:border-green-500/20"
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>

              {/* Tab content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-card p-4 sm:p-6 md:p-8"
              >
                {advisory.parseError && advisory.rawAdvice ? (
                  <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {advisory.rawAdvice}
                  </div>
                ) : (
                  <TabContent tab={activeTab} data={advisory} />
                )}
              </motion.div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <p className="text-zinc-600 text-xs mb-3">
                  Advisory generated by AgriVerse AI — Always consult
                  local agricultural experts for critical decisions.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setAdvisory(null);
                    setCrop("");
                    setSoil("");
                    setRegion("");
                  }}
                  className="px-6 py-3 rounded-xl border border-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/10 transition-all duration-300"
                >
                  🔄 Get Another Advisory
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <HistoryPanel
          isOpen={historyOpen}
          entries={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
          onClearAll={handleClearHistory}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </section>
  );
}
