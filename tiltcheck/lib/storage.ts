const STORAGE_KEYS = {
  trades: "tiltcheck_trades",
  cooldown: "tiltcheck_cooldown",
  scores: "tiltcheck_scores",
  streak: "tiltcheck_streak",
  cooldownMeta: "tiltcheck_cooldown_meta",
  onboarded: "tiltcheck_onboarded",
};

export interface Trade {
  id: string;
  emotion: string;
  symbol: string;
  quantity: number;
  side: "Long" | "Short";
  entryPrice: number;
  notes: string;
  timestamp: string;
}

export interface ScoreRecord {
  score: number; // 0–100 trading readiness score
  timestamp: string; // ISO 8601
  answers: number[]; // Array of 5 values (1–5 each)
  status?: "Ready" | "Caution" | "Not Ready";
  cooldownCompleted?: boolean;
  isOfficial?: boolean; // true for the first check of the day (counts toward streaks/stats)
}

export interface StreakData {
  current: number;
  best: number;
  lastCompletedDate: string | null;
}

export interface CooldownMeta {
  completed: boolean;
  extended: boolean;
  originalMinutes: number;
}

// ── Onboarding ──

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.onboarded) === "true";
  } catch {
    return false;
  }
}

export function setOnboarded(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.onboarded, "true");
  } catch {
    // Silently ignore
  }
}

// ── Trades ──

export function getTrades(): Trade[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.trades);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTrade(trade: Trade): void {
  if (typeof window === "undefined") return;
  try {
    const trades = getTrades();
    trades.unshift(trade);
    localStorage.setItem(STORAGE_KEYS.trades, JSON.stringify(trades));
  } catch {
    // Silently ignore localStorage quota/full errors
  }
}

export function deleteTrade(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const trades = getTrades().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.trades, JSON.stringify(trades));
  } catch {
    // Silently ignore localStorage quota/full errors
  }
}

// ── Cooldown ──

export function getCooldownEnd(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cooldown);
    if (!raw) return null;
    const end = new Date(raw).getTime();
    return end > Date.now() ? end : null;
  } catch {
    return null;
  }
}

export function setCooldownEnd(minutes: number): void {
  if (typeof window === "undefined") return;
  try {
    const end = new Date(Date.now() + minutes * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.cooldown, end.toISOString());
  } catch {
    // Silently ignore
  }
}

export function clearCooldown(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.cooldown);
    localStorage.removeItem(STORAGE_KEYS.cooldownMeta);
  } catch {
    // Silently ignore
  }
}

export function getCooldownMeta(): CooldownMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cooldownMeta);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCooldownMeta(meta: CooldownMeta): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.cooldownMeta, JSON.stringify(meta));
  } catch {
    // Silently ignore
  }
}

// ── Scores ──

export function getScores(): ScoreRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.scores);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScore(record: ScoreRecord): void {
  if (typeof window === "undefined") return;
  try {
    // Auto-determine official status: first check of the day is official
    if (record.isOfficial === undefined) {
      const todayAlreadyHasOfficial = getScores().some(
        (s) => s.isOfficial && isSameDay(s.timestamp, record.timestamp)
      );
      record.isOfficial = !todayAlreadyHasOfficial;
    }
    const scores = getScores();
    scores.unshift(record);
    localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores));
  } catch {
    // Silently ignore
  }
}

// ── Streak ──

export function getStreak(): StreakData {
  if (typeof window === "undefined")
    return { current: 0, best: 0, lastCompletedDate: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.streak);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through
  }
  return { current: 0, best: 0, lastCompletedDate: null };
}

export function saveStreak(streak: StreakData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.streak, JSON.stringify(streak));
  } catch {
    // Silently ignore
  }
}

export function incrementStreak(): void {
  const streak = getStreak();
  streak.current += 1;
  if (streak.current > streak.best) {
    streak.best = streak.current;
  }
  streak.lastCompletedDate = new Date().toISOString();
  saveStreak(streak);
}

export function resetStreak(): void {
  const streak = getStreak();
  streak.current = 0;
  saveStreak(streak);
}

// ── Week helpers ──

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date = new Date()): Date {
  const d = getWeekStart(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getTradesForWeek(weekStart: Date): Trade[] {
  const weekEnd = getWeekEnd(weekStart);
  return getTrades().filter((t) => {
    const d = new Date(t.timestamp);
    return d >= weekStart && d <= weekEnd;
  });
}

// ── Emotion helpers ──

export function getEmotionColor(emotion: string): string {
  switch (emotion) {
    case "Planned":
      return "#22c55e";
    case "FOMO":
      return "#ef4444";
    case "Revenge":
      return "#ef4444";
    case "Greed":
      return "#ef4444";
    case "Boredom":
      return "#f59e0b";
    case "Hope":
      return "#f59e0b";
    default:
      return "#8b8ba0";
  }
}

export function getEmotionBg(emotion: string): string {
  switch (emotion) {
    case "Planned":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "FOMO":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "Revenge":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "Greed":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "Boredom":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Hope":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-[#1a1a2e] text-[#8b8ba0] border-white/5";
  }
}

// ── Readiness helpers ──

export type ReadinessStatus = "Ready" | "Caution" | "Not Ready";

export function getReadinessStatus(score: number): {
  status: ReadinessStatus;
  color: string;
} {
  if (score >= 70) return { status: "Ready", color: "#22c55e" };
  if (score >= 40) return { status: "Caution", color: "#f59e0b" };
  return { status: "Not Ready", color: "#ef4444" };
}

/** Migrate old ScoreRecord status values to new terminology. */
function migrateStatus(
  status?: string
): ReadinessStatus {
  if (status === "Ready" || status === "Caution" || status === "Not Ready")
    return status;
  if (status === "Safe") return "Ready";
  if (status === "Moderate") return "Caution";
  if (status === "High Risk") return "Not Ready";
  return "Caution";
}

/** Migrate legacy ScoreRecords to new format. */
export function migrateScores(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.scores);
    if (!raw) return;
    const scores: ScoreRecord[] = JSON.parse(raw);
    let changed = false;
    for (const s of scores) {
      if (s.status && !['Ready', 'Caution', 'Not Ready'].includes(s.status)) {
        s.status = migrateStatus(s.status);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores));
    }
  } catch {
    // Silently ignore
  }
}

// ── Dashboard stats ──

/** Return a human-readable relative date label. */
export function getRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function autoCompleteExpiredCooldown(): boolean {
  const meta = getCooldownMeta();
  if (meta && !meta.completed) {
    const end = getCooldownEnd();
    if (!end) {
      setCooldownMeta({
        completed: true,
        extended: meta.extended,
        originalMinutes: meta.originalMinutes,
      });
      incrementStreak();
      clearCooldown();
      return true;
    }
  }
  return false;
}

export function getDashboardStats() {
  const scores = getScores();
  const streak = getStreak();
  const totalAssessments = scores.length;
  const cooldownsCompleted = scores.filter((s) => s.cooldownCompleted).length;
  const highRiskChecks = scores.filter((s) => s.status === "Not Ready").length;
  const avgScore =
    totalAssessments > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + s.score, 0) / totalAssessments
        )
      : 0;
  const totalTrades = getTrades().length;

  return {
    totalAssessments,
    cooldownsCompleted,
    highRiskChecks,
    avgScore,
    totalTrades,
    currentStreak: streak.current,
    bestStreak: streak.best,
  };
}

export function getTodaySessions(): ScoreRecord[] {
  const scores = getScores();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return scores.filter((s) => {
    const d = new Date(s.timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
}

export function getLatestSession(): ScoreRecord | null {
  const scores = getScores();
  return scores.length > 0 ? scores[0] : null;
}

// ── Official daily check helpers ──

/** Check if two ISO timestamps are on the same calendar day. */
function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Return today's official (first) readiness check, or null. */
export function getTodayOfficialSession(): ScoreRecord | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scores = getScores();
  return (
    scores.find(
      (s) =>
        s.isOfficial &&
        (() => {
          const d = new Date(s.timestamp);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        })()
    ) ?? null
  );
}

/** Has the user completed their first session (check + trade)? */
export function isFirstSessionComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("tiltcheck_first_session_complete") === "true";
  } catch {
    return false;
  }
}

export function markFirstSessionComplete(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("tiltcheck_first_session_complete", "true");
  } catch {
    // Silently ignore
  }
}

/** Return all trades logged today. */
export function getTodayTrades(): Trade[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getTrades().filter((t) => {
    const d = new Date(t.timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
}

/** Return the number of trades logged today. */
export function getTodayTradeCount(): number {
  return getTodayTrades().length;
}

/** Clear all localStorage data used by the app. */
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch {
    // Silently ignore
  }
}
