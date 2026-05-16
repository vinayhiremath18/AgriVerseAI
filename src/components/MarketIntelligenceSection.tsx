"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "./ui/Cards";

const marketData = [
  { crop: "Rice", price: "₹2,450", change: "+5.2%", trend: "up" },
  { crop: "Wheat", price: "₹2,125", change: "+2.8%", trend: "up" },
  { crop: "Sugarcane", price: "₹3,150", change: "-1.4%", trend: "down" },
  { crop: "Cotton", price: "₹6,800", change: "+8.1%", trend: "up" },
  { crop: "Soybean", price: "₹4,200", change: "+3.5%", trend: "up" },
];

const insights = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: "Price Prediction",
    desc: "AI-powered price forecasting with 94% accuracy using historical data and market sentiment analysis.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    title: "Global Markets",
    desc: "Real-time access to international commodity markets, trade flows, and demand forecasting.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: "Supply Chain",
    desc: "End-to-end supply chain visibility with smart logistics optimization and buyer matching.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: "Analytics Dashboard",
    desc: "Comprehensive analytics with customizable reports, trend analysis, and revenue forecasting.",
  },
];

export default function MarketIntelligenceSection() {
  return (
    <section id="market-intelligence" className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary/50 via-transparent to-bg-secondary/50" />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionHeading
          badge="Market Intelligence"
          title="Real-Time Market"
          highlight="Analytics"
          description="Make data-driven decisions with AI-powered market intelligence covering prices, demand forecasting, and supply chain optimization across global agricultural markets."
        />

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Live ticker */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-text-primary tracking-wider uppercase"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Live Prices
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-glow animate-pulse" />
                <span className="text-xs text-green-glow" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  LIVE
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {marketData.map((item, i) => (
                <motion.div
                  key={item.crop}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-green-glow/[0.03] border border-green-glow/[0.06] hover:bg-green-glow/[0.06] hover:border-green-glow/15 transition-all duration-300"
                >
                  <div>
                    <span className="text-sm font-semibold text-text-primary">{item.crop}</span>
                    <span className="block text-xs text-text-muted">per quintal</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-text-primary" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                      {item.price}
                    </span>
                    <span
                      className={`block text-xs font-medium ${
                        item.trend === "up" ? "text-green-glow" : "text-red-400"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', monospace" }}
                    >
                      {item.change}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mini chart placeholder */}
            <div className="mt-6 h-32 rounded-xl bg-green-glow/[0.03] border border-green-glow/[0.06] flex items-end justify-around px-4 pb-4 pt-2 overflow-hidden">
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="w-[6%] rounded-t-sm bg-gradient-to-t from-green-glow/40 to-green-glow/10"
                />
              ))}
            </div>
          </motion.div>

          {/* Insights grid */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
            {insights.map((insight, i) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-glow/10 border border-green-glow/15 flex items-center justify-center mb-4 group-hover:bg-green-glow/20 group-hover:shadow-[0_0_15px_rgba(0,255,102,0.2)] transition-all duration-300">
                  {insight.icon}
                </div>
                <h4 className="text-base font-bold text-text-primary mb-2"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {insight.title}
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">{insight.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
