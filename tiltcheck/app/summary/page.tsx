"use client";

import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import {
  getTradesForWeek,
  getWeekStart,
  getEmotionBg,
  getEmotionColor,
  getScores,
  getReadinessStatus,
  Trade,
} from "@/lib/storage";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Zap,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldOff,
} from "lucide-react";

export default function SummaryPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - weekOffset * 7);
    return getWeekStart(d);
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [weekStart]);

  useEffect(() => {
    setTrades(getTradesForWeek(weekStart));
  }, [weekStart]);

  const stats = useMemo(() => {
    const total = trades.length;
    const planned = trades.filter(
      (t) => t.emotion === "Planned"
    ).length;
    const emotional = total - planned;
    const plannedPct =
      total > 0 ? Math.round((planned / total) * 100) : 0;
    const emotionalPct =
      total > 0 ? Math.round((emotional / total) * 100) : 0;

    const emotionCounts: Record<string, number> = {};
    for (const t of trades) {
      emotionCounts[t.emotion] =
        (emotionCounts[t.emotion] || 0) + 1;
    }

    return {
      total,
      planned,
      emotional,
      plannedPct,
      emotionalPct,
      emotionCounts,
    };
  }, [trades]);

  // Readiness breakdown for the selected week
  const readinessStats = useMemo(() => {
    const scores = getScores();
    const weekScores = scores.filter((s) => {
      const d = new Date(s.timestamp);
      return d >= weekStart && d <= weekEnd;
    });
    const ready = weekScores.filter((s) => getReadinessStatus(s.score).status === "Ready").length;
    const caution = weekScores.filter((s) => getReadinessStatus(s.score).status === "Caution").length;
    const blocked = weekScores.filter((s) => getReadinessStatus(s.score).status === "Not Ready").length;
    const avgScore = weekScores.length > 0
      ? Math.round(weekScores.reduce((sum, s) => sum + s.score, 0) / weekScores.length)
      : 0;
    return { ready, caution, blocked, total: weekScores.length, avgScore };
  }, [weekStart, weekEnd]);

  const weekLabel = useMemo(() => {
    const startStr = weekStart.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    const endStr = weekEnd.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    return `${startStr} - ${endStr}`;
  }, [weekStart, weekEnd]);

  const emotionBreakdown = useMemo(() => {
    const allEmotions = [
      "Planned",
      "FOMO",
      "Revenge",
      "Boredom",
      "Greed",
      "Hope",
    ];
    return allEmotions
      .map((emotion) => {
        const count = stats.emotionCounts[emotion] || 0;
        const pct =
          stats.total > 0
            ? (count / stats.total) * 100
            : 0;
        return { emotion, count, pct };
      })
      .filter((e) => e.count > 0);
  }, [stats]);

  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#8b8ba0] text-sm mb-3 hover:text-[#f0f0f5] transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <BarChart3
            size={24}
            className="text-[#f59e0b]"
          />
          <h1 className="text-xl font-bold tracking-tight">
            Weekly Summary
          </h1>
        </div>
        <p className="text-[#8b8ba0] text-sm">
          Emotional vs planned trade ratio
        </p>
      </header>

      {/* Week selector */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() =>
            setWeekOffset((p) => Math.min(p + 1, 2))
          }
          className="px-3 py-1.5 rounded-lg bg-[#13131f] border border-white/5 text-sm text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors"
          disabled={weekOffset >= 2}
          aria-label="Previous week"
        >
          &larr; Prev
        </button>
        <div className="flex items-center gap-2 text-sm text-[#f0f0f5]">
          <Calendar
            size={14}
            className="text-[#8b8ba0]"
          />
          <span className="font-medium">{weekLabel}</span>
        </div>
        <button
          onClick={() =>
            setWeekOffset((p) => Math.max(p - 1, 0))
          }
          className="px-3 py-1.5 rounded-lg bg-[#13131f] border border-white/5 text-sm text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors"
          disabled={weekOffset <= 0}
          aria-label="Next week"
        >
          Next &rarr;
        </button>
      </div>

      {/* This week's readiness breakdown */}
      {readinessStats.total > 0 && (
        <div className="mb-6 rounded-2xl bg-[#13131f] border border-white/5 p-5">
          <h3 className="text-sm font-semibold mb-4">
            This week you were
          </h3>
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-[#22c55e]" />
              <span className="text-sm text-[#f0f0f5]">
                🟢 Ready <span className="font-bold">{readinessStats.ready}</span> times
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-[#f59e0b]" />
              <span className="text-sm text-[#f0f0f5]">
                🟡 Caution <span className="font-bold">{readinessStats.caution}</span> times
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldOff size={16} className="text-[#ef4444]" />
              <span className="text-sm text-[#f0f0f5]">
                🔴 Blocked <span className="font-bold">{readinessStats.blocked}</span> times
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3">
            <p className="text-xs text-[#8b8ba0] uppercase tracking-wider mb-1">
              Your average readiness
            </p>
            <p className="text-2xl font-bold text-[#f0f0f5]">
              {readinessStats.avgScore}%
            </p>
          </div>
        </div>
      )}

      {stats.total === 0 ? (
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-8 text-center">
          <BarChart3
            size={40}
            className="text-[#8b8ba0] mx-auto mb-3"
          />
          <p className="text-[#8b8ba0] text-sm mb-1">
            No trades logged this week
          </p>
          <p className="text-[#8b8ba0]/60 text-xs">
            Go to Log Trade to start recording
          </p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target
                  size={14}
                  className="text-[#22c55e]"
                />
                <span className="text-xs text-[#8b8ba0] uppercase tracking-wider">
                  Planned
                </span>
              </div>
              <p className="text-2xl font-bold text-[#22c55e]">
                {stats.planned}
              </p>
              <p className="text-xs text-[#8b8ba0]">
                {stats.plannedPct}% of trades
              </p>
            </div>
            <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap
                  size={14}
                  className="text-[#ef4444]"
                />
                <span className="text-xs text-[#8b8ba0] uppercase tracking-wider">
                  Emotional
                </span>
              </div>
              <p className="text-2xl font-bold text-[#ef4444]">
                {stats.emotional}
              </p>
              <p className="text-xs text-[#8b8ba0]">
                {stats.emotionalPct}% of trades
              </p>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Planned vs Emotional
              </span>
              <span className="text-xs text-[#8b8ba0]">
                {stats.total} trades
              </span>
            </div>
            <div className="h-4 rounded-full bg-[#1a1a2e] overflow-hidden flex mb-2">
              {stats.plannedPct > 0 && (
                <div
                  className="h-full bg-[#22c55e] transition-all duration-500"
                  style={{
                    width: `${stats.plannedPct}%`,
                  }}
                />
              )}
              {stats.emotionalPct > 0 && (
                <div
                  className="h-full bg-[#ef4444] transition-all duration-500"
                  style={{
                    width: `${stats.emotionalPct}%`,
                  }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-[#8b8ba0]">
                  Planned {stats.plannedPct}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-[#8b8ba0]">
                  Emotional {stats.emotionalPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Discipline grade */}
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6">
            <div className="flex items-center gap-3">
              {stats.plannedPct >= 70 ? (
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                  <TrendingUp
                    size={20}
                    className="text-[#22c55e]"
                  />
                </div>
              ) : stats.plannedPct >= 40 ? (
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                  <AlertCircle
                    size={20}
                    className="text-[#f59e0b]"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                  <TrendingDown
                    size={20}
                    className="text-[#ef4444]"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-medium">
                  {stats.plannedPct >= 70
                    ? "Strong Discipline"
                    : stats.plannedPct >= 40
                    ? "Mixed Discipline"
                    : "Weak Discipline"}
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  {stats.plannedPct >= 70
                    ? "Most trades are planned. Keep it up!"
                    : stats.plannedPct >= 40
                    ? "You're slipping into emotion. Tighten your process."
                    : "Most trades are emotional. Step back and review."}
                </p>
              </div>
            </div>
          </div>

          {/* Emotion breakdown */}
          {emotionBreakdown.length > 0 && (
            <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6">
              <h3 className="text-sm font-medium mb-3">
                Emotion Breakdown
              </h3>
              <div className="space-y-3">
                {emotionBreakdown.map((item) => (
                  <div key={item.emotion}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getEmotionBg(
                          item.emotion
                        )}`}
                      >
                        {item.emotion}
                      </span>
                      <span className="text-xs text-[#8b8ba0]">
                        {item.count} trades (
                        {Math.round(item.pct)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor:
                            getEmotionColor(item.emotion),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Navigation />
    </div>
  );
}
