"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionHeadingProps {
  badge: string;
  title: string;
  highlight: string;
  description: string;
}

export function SectionHeading({ badge, title, highlight, description }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="text-center mb-16"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-glow/15 bg-green-glow/5 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-green-glow animate-pulse" />
        <span className="text-xs text-green-glow font-medium tracking-widest uppercase"
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          {badge}
        </span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        <span className="text-text-primary">{title} </span>
        <span className="gradient-text">{highlight}</span>
      </h2>
      <p className="max-w-2xl mx-auto text-text-secondary text-base md:text-lg leading-relaxed"
        style={{ fontFamily: "'Space Grotesk', monospace" }}
      >
        {description}
      </p>
    </motion.div>
  );
}

/* ===== Feature Card ===== */
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient?: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, features, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="glass-card p-8 group relative"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-green-glow/0 to-cyan-accent/0 group-hover:from-green-glow/[0.03] group-hover:to-cyan-accent/[0.02] transition-all duration-500" />

      <div className="relative z-10">
        <div className="icon-container mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-3"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">{description}</p>
        <ul className="space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-green-glow shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* ===== Stat Card ===== */
interface StatCardProps {
  value: string;
  label: string;
  icon: ReactNode;
  delay?: number;
}

export function StatCard({ value, label, icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 text-center group"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-glow/10 border border-green-glow/15 mb-4 group-hover:bg-green-glow/20 transition-all duration-300">
        {icon}
      </div>
      <div className="stat-value text-2xl mb-1">{value}</div>
      <div className="text-xs text-text-muted uppercase tracking-wider"
        style={{ fontFamily: "'Space Grotesk', monospace" }}
      >
        {label}
      </div>
    </motion.div>
  );
}

/* ===== Mini Feature Item ===== */
interface MiniFeatureProps {
  icon: ReactNode;
  title: string;
  desc: string;
  delay?: number;
}

export function MiniFeature({ icon, title, desc, delay = 0 }: MiniFeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-4 p-4 rounded-xl hover:bg-green-glow/[0.03] transition-all duration-300 group"
    >
      <div className="w-10 h-10 rounded-lg bg-green-glow/10 border border-green-glow/15 flex items-center justify-center shrink-0 group-hover:bg-green-glow/20 transition-all duration-300">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-1"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {title}
        </h4>
        <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
