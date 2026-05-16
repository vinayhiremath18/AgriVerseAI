"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { SectionHeading } from "./ui/Cards";

const robotCapabilities = [
  {
    title: "Autonomous Navigation",
    desc: "GPS + LiDAR powered self-driving across any terrain with centimeter-level precision.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    title: "Smart Weeding",
    desc: "AI-targeted weed removal using computer vision — eliminates 99% of weeds without chemicals.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M12 22V8" />
        <path d="M5 12H2a10 10 0 0020 0h-3" />
        <path d="M12 2a3 3 0 00-3 3v3h6V5a3 3 0 00-3-3z" />
      </svg>
    ),
  },
  {
    title: "Precision Spraying",
    desc: "Variable-rate application reduces pesticide use by 85% with pinpoint accuracy.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3-4.56-3-7.5c0 2.94-1 5.08-3 7.5S5 13 5 15a7 7 0 007 7z" />
      </svg>
    ),
  },
  {
    title: "Harvest Assist",
    desc: "Automated picking with gentle robotic arms — handles fruits 3x faster than manual labor.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: "Soil Sampling",
    desc: "Automated core collection and on-board NPK analysis for real-time soil health mapping.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M3 3v18h18" />
        <rect x="7" y="10" width="3" height="8" rx="1" />
        <rect x="14" y="6" width="3" height="12" rx="1" />
      </svg>
    ),
  },
  {
    title: "24/7 Patrol",
    desc: "Night-vision enabled surveillance with real-time threat detection and perimeter alerts.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-glow">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

function RobotVisualization() {
  const robotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!robotRef.current) return;
    const rings = robotRef.current.querySelectorAll(".orbit-ring");
    rings.forEach((ring, i) => {
      gsap.to(ring, {
        rotation: 360,
        duration: 10 + i * 5,
        ease: "none",
        repeat: -1,
        transformOrigin: "center center",
      });
    });
  }, []);

  return (
    <div ref={robotRef} className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="orbit-ring absolute rounded-full border border-green-glow/10"
          style={{
            width: `${70 + i * 15}%`,
            height: `${70 + i * 15}%`,
            borderStyle: i === 1 ? "dashed" : "solid",
          }}
        >
          {/* Orbit dots */}
          <div
            className="absolute w-3 h-3 rounded-full bg-green-glow/60 shadow-[0_0_10px_rgba(0,255,102,0.6)]"
            style={{ top: "-6px", left: "50%", transform: "translateX(-50%)" }}
          />
        </div>
      ))}

      {/* Center robot icon */}
      <div className="relative z-10 w-32 h-32 rounded-3xl bg-gradient-to-br from-green-glow/15 to-cyan-accent/10 border border-green-glow/30 flex items-center justify-center robot-glow">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-green-glow">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <line x1="12" y1="7" x2="12" y2="11" />
          <line x1="8" y1="16" x2="8" y2="16.01" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="16" x2="16" y2="16.01" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="21" x2="6" y2="24" />
          <line x1="18" y1="21" x2="18" y2="24" />
        </svg>
      </div>

      {/* Floating data labels */}
      {["Speed: 4.2 km/h", "Battery: 87%", "Area: 12 ha"].map((label, i) => (
        <motion.div
          key={label}
          className="absolute px-3 py-1.5 rounded-lg bg-green-glow/10 border border-green-glow/20 text-[10px] text-green-glow whitespace-nowrap"
          style={{
            top: `${20 + i * 30}%`,
            right: i % 2 === 0 ? "-10%" : "auto",
            left: i % 2 !== 0 ? "-10%" : "auto",
            fontFamily: "var(--font-space), 'Space Grotesk', monospace",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        >
          {label}
        </motion.div>
      ))}
    </div>
  );
}

export default function SmartRobotSection() {
  return (
    <section id="smart-robot" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary/50 via-transparent to-bg-secondary/50" />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionHeading
          badge="Smart Farming Robot"
          title="Autonomous Farm"
          highlight="Robotics"
          description="Deploy AI-powered autonomous robots that navigate, monitor, and maintain your farm around the clock — reducing labor costs by 60% while boosting precision."
        />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Robot visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <RobotVisualization />
          </motion.div>

          {/* Capabilities grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {robotCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-5 rounded-xl bg-green-glow/[0.03] border border-green-glow/[0.08] hover:bg-green-glow/[0.06] hover:border-green-glow/20 transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-green-glow/10 border border-green-glow/15 flex items-center justify-center mb-3 group-hover:bg-green-glow/20 group-hover:shadow-[0_0_12px_rgba(0,255,102,0.2)] transition-all duration-300">
                  {cap.icon}
                </div>
                <h4
                  className="text-sm font-bold text-text-primary mb-1.5"
                  style={{ fontFamily: "var(--font-orbitron), 'Orbitron', sans-serif" }}
                >
                  {cap.title}
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 glass-card p-6 md:p-8 border-beam"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Robots", value: "2,340", icon: "🤖" },
              { label: "Hectares Covered", value: "45,000+", icon: "🌾" },
              { label: "Uptime", value: "99.97%", icon: "⚡" },
              { label: "Cost Savings", value: "60%", icon: "💰" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div
                  className="stat-value text-xl md:text-2xl mb-1"
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] text-text-muted uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-space), 'Space Grotesk', monospace" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
