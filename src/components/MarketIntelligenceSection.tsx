"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SectionHeading } from "./ui/Cards";

// ── Types ────────────────────────────────────────────────────────────────────
interface CropPrice {
  crop: string;
  unit: string;
  base: number;
  price: number;
  change: number;
  trend: "up" | "down";
}

interface ChartPoint {
  day: string;
  wheat: number;
  rice: number;
  cotton: number;
}

// ── Fallback static data (used while loading or if API fails) ─────────────────
const FALLBACK_PRICES: CropPrice[] = [
  { crop: "Wheat",     unit: "quintal", base: 2125, price: 2125, change: 2.8,  trend: "up"   },
  { crop: "Rice",      unit: "quintal", base: 2450, price: 2450, change: 5.2,  trend: "up"   },
  { crop: "Cotton",    unit: "quintal", base: 6800, price: 6800, change: 8.1,  trend: "up"   },
  { crop: "Tomato",    unit: "kg",      base: 48,   price: 48,   change: -3.4, trend: "down" },
  { crop: "Soybean",   unit: "quintal", base: 4200, price: 4200, change: 3.5,  trend: "up"   },
  { crop: "Sugarcane", unit: "tonne",   base: 3150, price: 3150, change: -1.4, trend: "down" },
];

const FALLBACK_CHART: ChartPoint[] = [
  { day: "Mon", wheat: 2100, rice: 2380, cotton: 6550 },
  { day: "Tue", wheat: 2135, rice: 2410, cotton: 6620 },
  { day: "Wed", wheat: 2090, rice: 2445, cotton: 6700 },
  { day: "Thu", wheat: 2150, rice: 2430, cotton: 6770 },
  { day: "Fri", wheat: 2125, rice: 2460, cotton: 6800 },
  { day: "Sat", wheat: 2170, rice: 2490, cotton: 6880 },
  { day: "Sun", wheat: 2210, rice: 2520, cotton: 6950 },
];

const FALLBACK_PREDICTIONS = [
  { label: "HIGH DEMAND",        crop: "Rice",    color: "#00ff66", bg: "rgba(0,255,102,0.08)"   },
  { label: "PRICE SPIKE ALERT",  crop: "Cotton",  color: "#ffd700", bg: "rgba(255,215,0,0.08)"   },
  { label: "LOW RISK CROP",      crop: "Wheat",   color: "#00e5ff", bg: "rgba(0,229,255,0.08)"   },
  { label: "EXPORT OPPORTUNITY", crop: "Soybean", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
];

const FALLBACK_RECS = [
  { action: "BUY",  crop: "Rice",   reason: "Demand surge — monsoon boost",   color: "#00ff66", glow: "rgba(0,255,102,0.35)"  },
  { action: "SELL", crop: "Tomato", reason: "Peak harvest — prices softening", color: "#ffd700", glow: "rgba(255,215,0,0.35)"  },
  { action: "HOLD", crop: "Wheat",  reason: "Stable — watch export data",      color: "#00e5ff", glow: "rgba(0,229,255,0.35)"  },
];

const TICKER_ITEMS = [
  "🌾 Brazil soybean exports rising 12% YoY",
  "🌾 India rice demand increasing — government procurement up",
  "🌾 Wheat export opportunities growing in Middle East",
  "🌾 Cotton futures hit 3-month high on US drought fears",
  "🌾 Tomato prices to stabilise post-monsoon, analysts say",
  "🌾 Sugarcane MSP hike proposed — farmer groups optimistic",
  "🌾 Global food index rises 2.3% in weekly trade",
  "🌾 Soybean meal demand from Asia poised to set records",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function nudgePrice(base: number): number {
  const pct = (Math.random() - 0.48) * 0.015;
  return Math.round(base * (1 + pct));
}

function fmt(price: number, crop: string): string {
  if (crop === "Tomato") return `₹${price}`;
  return `₹${price.toLocaleString("en-IN")}`;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: "rgba(8,26,12,0.95)",
      border: "1px solid rgba(0,255,102,0.25)",
      borderRadius: 12,
      padding: "10px 16px",
      fontFamily: "'Space Grotesk', monospace",
    }}>
      <p style={{ color: "#00ff66", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: 12, margin: "2px 0" }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: ₹{p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MarketIntelligenceSection() {
  const [prices, setPrices]       = useState<CropPrice[]>(FALLBACK_PRICES);
  const [chartData, setChartData] = useState<ChartPoint[]>(FALLBACK_CHART);
  const [aiPredictions, setAiPredictions] = useState(FALLBACK_PREDICTIONS);
  const [recommendations, setRecommendations] = useState(FALLBACK_RECS);
  const [sentiment, setSentiment] = useState<{ status: "BULLISH" | "BEARISH"; confidence: number }>({
    status: "BULLISH", confidence: 74,
  });
  const [changed, setChanged]     = useState<Record<string, "up" | "down" | null>>({});
  const [dataSource, setDataSource] = useState<"live" | "fallback">("fallback");
  const tickerRef = useRef<HTMLDivElement>(null);

  // ── Fetch real commodity prices from API ────────────────────────────────
  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await fetch("/api/market-prices");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        // Replace base prices with real data from Yahoo Finance
        setPrices(data.prices as CropPrice[]);
        if (data.chartData?.length > 0) setChartData(data.chartData);
        if (data.aiPredictions?.length > 0) setAiPredictions(data.aiPredictions);
        if (data.recommendations?.length > 0) setRecommendations(data.recommendations);
        if (data.sentiment) setSentiment(data.sentiment);
        setDataSource("live");
      } catch (err) {
        console.warn("[MarketIntelligence] Using fallback data:", err);
        setDataSource("fallback");
      }
    }

    loadPrices();
    // Refresh real data every 60 s
    const refreshId = setInterval(loadPrices, 60_000);
    return () => clearInterval(refreshId);
  }, []);

  // ── Micro-nudge prices every 3 s for live-ticker feel ──────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) =>
        prev.map((item) => {
          const newPrice = nudgePrice(item.base);
          const diff     = newPrice - item.base;
          const newChange = parseFloat(((diff / item.base) * 100).toFixed(2));
          return { ...item, price: newPrice, change: newChange, trend: newChange >= 0 ? "up" : "down" };
        })
      );

      setChanged(
        FALLBACK_PRICES.reduce<Record<string, "up" | "down">>((acc, item) => {
          acc[item.crop] = Math.random() > 0.5 ? "up" : "down";
          return acc;
        }, {})
      );
      setTimeout(() => setChanged({}), 600);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const isBullish = sentiment.status === "BULLISH";

  return (
    <section id="market-intelligence" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary/50 via-transparent to-bg-secondary/50" />
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6 space-y-12">
        <SectionHeading
          badge="Market Intelligence"
          title="Real-Time Market"
          highlight="Analytics"
          description="Make data-driven decisions with AI-powered market intelligence covering prices, demand forecasting, and supply chain optimisation across global agricultural markets."
        />

        {/* ── Data source badge ── */}
        <div className="flex justify-end">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: dataSource === "live" ? "rgba(0,255,102,0.08)" : "rgba(255,165,0,0.08)",
              border: dataSource === "live" ? "1px solid rgba(0,255,102,0.3)" : "1px solid rgba(255,165,0,0.3)",
              color: dataSource === "live" ? "#00ff66" : "#ffa500",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: dataSource === "live" ? "#00ff66" : "#ffa500" }}
            />
            {dataSource === "live" ? "Live · Yahoo Finance" : "Cached Data"}
          </span>
        </div>

        {/* ── ROW 1: Live Price Cards ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-green-glow"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Live Market Prices
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {prices.map((item, i) => {
              const flash = changed[item.crop];
              const isUp = item.trend === "up";
              return (
                <motion.div
                  key={item.crop}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  className="glass-card p-4 relative overflow-hidden cursor-default"
                  style={{
                    border: flash
                      ? `1px solid ${flash === "up" ? "rgba(0,255,102,0.5)" : "rgba(248,113,113,0.5)"}`
                      : undefined,
                    transition: "border 0.3s ease",
                  }}
                >
                  {/* Glow orb */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-30"
                    style={{ background: isUp ? "#00ff66" : "#f87171" }} />

                  {/* Indicator dot */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}>
                      {item.crop}
                    </span>
                    <span className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: isUp ? "#00ff66" : "#f87171",
                        boxShadow: isUp ? "0 0 8px #00ff66" : "0 0 8px #f87171" }} />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={item.price}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.25 }}
                      className="text-base font-bold"
                      style={{ fontFamily: "'Space Grotesk', monospace",
                        color: isUp ? "#00ff66" : "#f87171",
                        textShadow: isUp ? "0 0 10px rgba(0,255,102,0.5)" : "0 0 10px rgba(248,113,113,0.5)" }}
                    >
                      {fmt(item.price, item.crop)}
                    </motion.p>
                  </AnimatePresence>

                  <p className="text-[10px] text-text-muted mb-1">per {item.unit}</p>

                  <AnimatePresence mode="wait">
                    <motion.span
                      key={item.change}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-semibold"
                      style={{ fontFamily: "'Space Grotesk', monospace",
                        color: isUp ? "#00ff66" : "#f87171" }}
                    >
                      {isUp ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── ROW 2: Chart + Sentiment + Predictions ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recharts 7-day chart */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold tracking-wider uppercase text-text-primary"
                style={{ fontFamily: "'Orbitron', sans-serif" }}>
                7-Day AI Price Prediction
              </h3>
              <div className="flex gap-4 text-[10px]" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                <span style={{ color: "#00ff66" }}>● Wheat</span>
                <span style={{ color: "#00e5ff" }}>● Rice</span>
                <span style={{ color: "#ffd700" }}>● Cotton</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gWheat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff66" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff66" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCotton" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd700" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,102,0.06)" />
                <XAxis dataKey="day" tick={{ fill: "#4a8a60", fontSize: 11, fontFamily: "'Space Grotesk', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4a8a60", fontSize: 10, fontFamily: "'Space Grotesk', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="wheat" stroke="#00ff66" strokeWidth={2} fill="url(#gWheat)" dot={false} activeDot={{ r: 4, fill: "#00ff66", stroke: "#020d04", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="rice"  stroke="#00e5ff" strokeWidth={2} fill="url(#gRice)"  dot={false} activeDot={{ r: 4, fill: "#00e5ff", stroke: "#020d04", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="cotton" stroke="#ffd700" strokeWidth={2} fill="url(#gCotton)" dot={false} activeDot={{ r: 4, fill: "#ffd700", stroke: "#020d04", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* AI Market Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-sm font-bold tracking-wider uppercase text-text-primary mb-4"
                style={{ fontFamily: "'Orbitron', sans-serif" }}>
                AI Market Sentiment
              </h3>

              {/* Pulse orb */}
              <div className="flex justify-center my-6">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: isBullish ? "rgba(0,255,102,0.4)" : "rgba(248,113,113,0.4)", filter: "blur(12px)" }}
                  />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: isBullish
                        ? "radial-gradient(circle, rgba(0,255,102,0.2), rgba(0,255,102,0.05))"
                        : "radial-gradient(circle, rgba(248,113,113,0.2), rgba(248,113,113,0.05))",
                      border: isBullish ? "2px solid rgba(0,255,102,0.5)" : "2px solid rgba(248,113,113,0.5)",
                      boxShadow: isBullish ? "0 0 30px rgba(0,255,102,0.3)" : "0 0 30px rgba(248,113,113,0.3)",
                    }}>
                    <span className="text-2xl">{isBullish ? "📈" : "📉"}</span>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={sentiment.status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <p className="text-xl font-bold mb-1"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      color: isBullish ? "#00ff66" : "#f87171",
                      textShadow: isBullish ? "0 0 15px rgba(0,255,102,0.6)" : "0 0 15px rgba(248,113,113,0.6)",
                    }}>
                    {sentiment.status}
                  </p>
                  <p className="text-text-muted text-xs" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    Confidence: <span style={{ color: isBullish ? "#00ff66" : "#f87171" }}>{sentiment.confidence}%</span>
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Confidence bar */}
            <div className="mt-6">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${sentiment.confidence}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ background: isBullish ? "linear-gradient(90deg,#00ff66,#00e5ff)" : "linear-gradient(90deg,#f87171,#fbbf24)" }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-2 text-center" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                AI Confidence Index
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3: AI Prediction Cards ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-accent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              AI Predictions
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiPredictions.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="glass-card p-5 relative overflow-hidden cursor-default"
                style={{ border: `1px solid ${p.color}22` }}
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20"
                  style={{ background: p.color }} />
                <span className="text-[10px] font-black tracking-widest"
                  style={{ fontFamily: "'Orbitron', sans-serif", color: p.color,
                    textShadow: `0 0 10px ${p.color}80` }}>
                  {p.label}
                </span>
                <p className="text-base font-bold text-text-primary mt-2 mb-1"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {p.crop}
                </p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.color }} />
                  <span className="text-[10px] text-text-muted" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    AI Signal Active
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── ROW 4: News Ticker ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card overflow-hidden"
          style={{ border: "1px solid rgba(0,255,102,0.12)" }}
        >
          <div className="flex items-center">
            <div className="shrink-0 px-4 py-3 flex items-center gap-2"
              style={{ borderRight: "1px solid rgba(0,255,102,0.12)", background: "rgba(0,255,102,0.05)" }}>
              <span className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-green-glow"
                style={{ fontFamily: "'Orbitron', sans-serif" }}>LIVE NEWS</span>
            </div>
            <div className="overflow-hidden flex-1">
              <div
                ref={tickerRef}
                className="flex whitespace-nowrap py-3"
                style={{ animation: "tickerScroll 28s linear infinite" }}
              >
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                  <span key={i} className="inline-block px-8 text-sm text-text-secondary"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    {item}
                    <span className="mx-6 text-green-glow/30">◆</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ROW 5: Buy / Sell / Hold ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2 h-2 rounded-full bg-gold-accent animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-gold-accent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              AI Recommendations
            </span>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.crop}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ scale: 1.04, y: -5 }}
                className="glass-card p-6 relative overflow-hidden cursor-default"
                style={{ border: `1px solid ${rec.color}30` }}
              >
                {/* Background glow */}
                <div className="absolute inset-0 opacity-5 rounded-[20px]"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${rec.color}, transparent 70%)` }} />

                <div className="relative z-10">
                  {/* Action badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full mb-4"
                    style={{ background: `${rec.color}15`, border: `1px solid ${rec.color}50` }}>
                    <span className="text-sm font-black tracking-widest"
                      style={{ fontFamily: "'Orbitron', sans-serif", color: rec.color,
                        textShadow: `0 0 12px ${rec.glow}` }}>
                      {rec.action}
                    </span>
                  </div>

                  <p className="text-lg font-bold text-text-primary mb-1"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    {rec.crop}
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed"
                    style={{ fontFamily: "'Space Grotesk', monospace" }}>
                    {rec.reason}
                  </p>

                  {/* Animated bottom bar */}
                  <motion.div
                    className="h-0.5 mt-4 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                    style={{ background: `linear-gradient(90deg, ${rec.color}, transparent)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
