"use client";

import { motion } from "framer-motion";

/* eslint-disable @typescript-eslint/no-explicit-any */

function StatCard({ icon, label, value, sub, highlight }: {
  icon: string; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 ${
      highlight
        ? "border-yellow-500/30 bg-gradient-to-br from-yellow-950/30 to-black/60"
        : "border-green-500/10 bg-gradient-to-br from-green-950/40 to-black/60"
    } hover:border-green-400/30`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-green-400/60 font-semibold">{label}</span>
      </div>
      <p className={`text-lg sm:text-xl font-bold ${highlight ? "text-yellow-300" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export function NPKSection({ npk }: { npk: any }) {
  if (!npk) return null;
  const items = [
    { key: "nitrogen", label: "Nitrogen (N)", icon: "🟢", color: "text-green-400" },
    { key: "phosphorus", label: "Phosphorus (P)", icon: "🔵", color: "text-blue-400" },
    { key: "potassium", label: "Potassium (K)", icon: "🟠", color: "text-orange-400" },
  ];
  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-3">NPK Requirements</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map(({ key, label, icon, color }) => {
          const d = npk[key];
          if (!d) return null;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-green-500/10 bg-black/40 hover:border-green-400/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <span className={`text-xs font-bold ${color}`}>{label}</span>
              </div>
              <p className="text-2xl font-black text-white">{d.kg} <span className="text-sm text-zinc-500">kg</span></p>
              <p className="text-xs text-zinc-400 mt-1">Source: {d.source}</p>
              <p className="text-xs text-zinc-500">Need {d.sourceKg} kg @ ₹{d.pricePerKg}/kg</p>
              <p className="text-sm font-semibold text-green-400 mt-1">₹{d.totalCost?.toLocaleString("en-IN")}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ScheduleTable({ schedule }: { schedule: any[] }) {
  if (!schedule?.length) return null;
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-3">Application Schedule</h4>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-xs sm:text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-green-500/15 text-green-400/70">
              <th className="text-left py-2 pr-3 font-semibold">Stage</th>
              <th className="text-left py-2 pr-3 font-semibold">Timing</th>
              <th className="text-center py-2 pr-3 font-semibold">Urea</th>
              <th className="text-center py-2 pr-3 font-semibold">DAP</th>
              <th className="text-center py-2 pr-3 font-semibold">MOP</th>
              <th className="text-left py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row: any, i: number) => (
              <tr key={i} className="border-b border-green-500/5 hover:bg-green-500/5 transition-colors">
                <td className="py-2.5 pr-3 text-white font-medium">{row.stage}</td>
                <td className="py-2.5 pr-3 text-zinc-400">{row.timing}</td>
                <td className="py-2.5 pr-3 text-center text-zinc-300">{row.urea}</td>
                <td className="py-2.5 pr-3 text-center text-zinc-300">{row.dap}</td>
                <td className="py-2.5 pr-3 text-center text-zinc-300">{row.mop}</td>
                <td className="py-2.5 text-zinc-500">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IrrigationSection({ irrigation }: { irrigation: any }) {
  if (!irrigation) return null;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 mb-3">
        <StatCard icon="💧" label="Method" value={irrigation.method || "N/A"} />
        <StatCard icon="🌊" label="Total Water" value={irrigation.totalWaterNeeded || "N/A"} />
      </div>
      {irrigation.schedule?.length > 0 && (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-xs sm:text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-green-500/15 text-green-400/70">
                <th className="text-left py-2 pr-3 font-semibold">Growth Stage</th>
                <th className="text-center py-2 pr-3 font-semibold">Days</th>
                <th className="text-center py-2 pr-3 font-semibold">Every X Days</th>
                <th className="text-center py-2 pr-3 font-semibold">Water (L)</th>
                <th className="text-left py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {irrigation.schedule.map((row: any, i: number) => (
                <tr key={i} className="border-b border-green-500/5 hover:bg-green-500/5 transition-colors">
                  <td className="py-2.5 pr-3 text-white font-medium">{row.stage}</td>
                  <td className="py-2.5 pr-3 text-center text-zinc-400">{row.daysAfterSowing}</td>
                  <td className="py-2.5 pr-3 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold">{row.frequencyDays}d</span>
                  </td>
                  <td className="py-2.5 pr-3 text-center text-zinc-300">{row.waterLiters?.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-zinc-500">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {irrigation.rainfedNote && (
        <div className="p-3 rounded-xl border border-cyan-500/15 bg-cyan-950/10 text-xs text-cyan-300/80">
          🌧️ <strong>Rainfed Note:</strong> {irrigation.rainfedNote}
        </div>
      )}
    </div>
  );
}

export function CostBreakdown({ cost, govSchemes, finalCost, totalSavings }: {
  cost: any; govSchemes: any[]; finalCost: number; totalSavings: number;
}) {
  return (
    <div className="space-y-4">
      {cost && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon="🧪" label="Fertilizer" value={`₹${cost.fertilizerCost?.toLocaleString("en-IN")}`} />
          <StatCard icon="🔬" label="Micronutrient" value={`₹${cost.micronutrientCost?.toLocaleString("en-IN")}`} />
          <StatCard icon="💧" label="Irrigation" value={`₹${cost.irrigationCost?.toLocaleString("en-IN")}`} />
          <StatCard icon="📊" label="Total Cost" value={`₹${cost.totalCost?.toLocaleString("en-IN")}`} highlight />
        </div>
      )}

      {govSchemes?.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-widest text-yellow-400/70 font-semibold mb-3 flex items-center gap-2">
            <span>🏛️</span> Government Schemes & Subsidies
          </h4>
          <div className="space-y-2">
            {govSchemes.map((scheme: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-yellow-500/15 bg-gradient-to-r from-yellow-950/20 to-black/40 hover:border-yellow-400/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h5 className="text-sm font-bold text-yellow-300">{scheme.name}</h5>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-400 font-semibold w-fit">
                    Save ₹{scheme.savings?.toLocaleString("en-IN")} • {scheme.discount}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-1">{scheme.description}</p>
                <p className="text-xs text-zinc-500">📝 {scheme.howToApply}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(finalCost > 0 || totalSavings > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-4 rounded-2xl border border-green-400/25 bg-gradient-to-br from-green-950/40 to-black/60">
            <p className="text-xs uppercase tracking-widest text-green-400/60 font-semibold mb-1">💰 Total Savings</p>
            <p className="text-2xl font-black text-green-400">₹{totalSavings?.toLocaleString("en-IN")}</p>
          </div>
          <div className="p-4 rounded-2xl border border-yellow-400/25 bg-gradient-to-br from-yellow-950/30 to-black/60">
            <p className="text-xs uppercase tracking-widest text-yellow-400/60 font-semibold mb-1">🎯 Final Cost After Subsidy</p>
            <p className="text-2xl font-black text-yellow-300">₹{finalCost?.toLocaleString("en-IN")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
