/**
 * Farm Advisor History — persisted in localStorage.
 * Works on any platform (Android, Windows, Mac, iOS) without a backend.
 */

export interface HistoryEntry {
  id: string;
  crop: string;
  soil: string;
  region: string;
  data: Record<string, unknown>;
  createdAt: string; // ISO string
}

const STORAGE_KEY = "agriverse_farm_advisor_history";
const MAX_ENTRIES = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Read all history entries (newest first). */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: HistoryEntry[] = JSON.parse(raw);
    return entries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/** Save a new advisory result to history. */
export function saveToHistory(
  crop: string,
  soil: string,
  region: string,
  data: Record<string, unknown>
): HistoryEntry {
  const entry: HistoryEntry = {
    id: generateId(),
    crop,
    soil: soil || "Auto-detected",
    region: region || "General India",
    data,
    createdAt: new Date().toISOString(),
  };

  const existing = getHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full — drop oldest entries and retry
    const trimmed = updated.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }

  return entry;
}

/** Delete a single history entry by ID. */
export function deleteFromHistory(id: string): void {
  const existing = getHistory();
  const updated = existing.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/** Clear all history. */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Format a date string for display. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
