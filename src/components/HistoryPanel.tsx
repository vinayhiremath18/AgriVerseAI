"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HistoryEntry, formatDate } from "@/lib/history";

interface Props {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function HistoryPanel({
  entries,
  onSelect,
  onDelete,
  onClearAll,
  onClose,
  isOpen,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[70vh] rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-green-950/90 to-black border border-green-500/15 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-green-500/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-lg">
                  📋
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Advisory History
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {entries.length} saved{" "}
                    {entries.length === 1 ? "advisory" : "advisories"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entries.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl border border-green-500/15 flex items-center justify-center text-zinc-400 hover:text-white hover:border-green-500/30 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Entries list */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 overscroll-contain">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl mb-3">🌾</span>
                  <p className="text-zinc-400 text-sm">No history yet</p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Your AI advisories will appear here
                  </p>
                </div>
              ) : (
                entries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-green-500/10 bg-black/40 hover:border-green-400/25 transition-all cursor-pointer active:scale-[0.98]"
                    onClick={() => onSelect(entry)}
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center justify-center text-lg shrink-0">
                      🌱
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {entry.crop}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {entry.region} • {entry.soil}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-zinc-600">
                        {formatDate(entry.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(entry.id);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all text-xs"
                      >
                        🗑
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
