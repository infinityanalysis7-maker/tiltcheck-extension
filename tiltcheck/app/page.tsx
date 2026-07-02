"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import {
  ShieldCheck,
  ClipboardList,
  BrainCircuit,
  Flame,
  Trophy,
  Clock,
  Activity,
  Shield,
  Lock,
  ChevronRight,
  History,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import {
  getDashboardStats,
  getLatestSession,
  getScores,
  getCooldownEnd,
  getStreak,
  getReadinessStatus,
  autoCompleteExpiredCooldown,
  migrateScores,
  getRelativeDate,
  getTodayOfficialSession,
  getTodayTradeCount,
  ScoreRecord,
} from "@/lib/storage";

export default function HomePage() {
  const [latestSession, setLatestSession] =
    useState<ScoreRecord | null>(null);
  const [stats, setStats] = useState<
    ReturnType<typeof getDashboardStats> | null
  >(null);
  const [streak, setStreak] = useState<
    ReturnType<typeof getStreak> | null
  >(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [recentSessions, setRecentSessions] = useState<
    ScoreRecord[]
  >([]);
  const [mounted, setMounted] = useState(false);
  const [todayOfficial, setTodayOfficial] =
    useState<ScoreRecord | null>(null);
  const [todayTradeCount, setTodayTradeCount] = useState(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
    migrateScores();
    autoCompleteExpiredCooldown();
    setLatestSession(getLatestSession());
    setTodayOfficial(getTodayOfficialSession());
    setTodayTradeCount(getTodayTradeCount());
    setStats(getDashboardStats());
    setStreak(getStreak());
    setRecentSessions(getScores().slice(0, 5));

    const end = getCooldownEnd();
    if (end) {
      setCooldownActive(true);
      setCooldownLeft(
        Math.ceil((end - Date.now()) / 1000)
      );
    }
  }, []);

  useEffect(() => {
    if (!cooldownActive) return;
    const interval = setInterval(() => {
      const end = getCooldownEnd();
      if (!end) {
        setCooldownActive(false);
        setCooldownLeft(0);
        clearInterval(interval);
        return;
      }
      const left = Math.ceil((end - Date.now()) / 1000);
      if (left <= 0) {
        setCooldownActive(false);
        setCooldownLeft(0);
        clearInterval(interval);
      } else {
        setCooldownLeft(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const todayReadiness = todayOfficial
    ? getReadinessStatus(todayOfficial.score)
    : null;

  /** Determine next recommended action based on state. */
  const getNextAction = () => {
    if (cooldownActive && cooldownLeft > 0) {
      return {
        label: "Enter Cooldown Room",
        href: "/check",
        icon: <Lock size={18} />,
        color: "#ef4444",
        bgColor: "bg-[#ef4444]/10",
        borderColor: "border-[#ef4444]/20",
      };
    }
    if (!todayReadiness) {
      return {
        label: "Take First Check",
        href: "/check",
        icon: <ShieldCheck size={18} />,
        color: "#6366f1",
        bgColor: "bg-[#6366f1]/10",
        borderColor: "border-[#6366f1]/20",
      };
    }
    if (todayTradeCount === 0) {
      return {
        label: "Log Your First Trade Today",
        href: "/log",
        icon: <ClipboardList size={18} />,
        color: "#22c55e",
        bgColor: "bg-[#22c55e]/10",
        borderColor: "border-[#22c55e]/20",
      };
    }
    return {
      label: "You're all set for today. Come back tomorrow.",
      href: "",
      icon: <CheckCircle2 size={18} />,
      color: "#8b8ba0",
      bgColor: "bg-[#8b8ba0]/10",
      borderColor: "border-[#8b8ba0]/20",
    };
  };

  if (!mounted) return null;

  // ── Empty state: new user with no history ──
  if (!latestSession && !stats?.totalAssessments) {
    return (
      <div className="px-4 pt-6 pb-8">
        <header className="mb-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center">
              <BrainCircuit
                size={20}
                className="text-white"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                TiltCheck
              </h1>
              <p className="text-sm text-[#8b8ba0]">
                Trade with discipline
              </p>
            </div>
          </div>
        </header>

        <p className="text-xs text-[#8b8ba0] mb-4 animate-fade-in">
          {todayDate}
        </p>

        {/* How it works */}
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5 mb-5 animate-fade-in">
          <h3 className="text-sm font-semibold mb-4">
            How it works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#6366f1]">
                  1
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  Answer 5 questions
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  Sleep, emotions, plan, review, and
                  mindset.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#f59e0b]">
                  2
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  Get your readiness score
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  Low scores trigger a 15-minute cooldown
                  to protect you.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#22c55e]">
                  3
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  Build discipline over time
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  Track your progress and see your
                  consistency improve.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Action — replaces static cards */}
        <div className="mb-5 animate-fade-in">
          <Link
            href={getNextAction().href}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[#13131f] border border-white/5 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${getNextAction().color}15`,
              }}
            >
              <span style={{ color: getNextAction().color }}>
                {getNextAction().icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#8b8ba0] mb-0.5">
                Get started
              </p>
              <h2
                className="font-semibold"
                style={{ color: getNextAction().color }}
              >
                {getNextAction().label}
              </h2>
            </div>
            <ArrowRight
              size={18}
              className="text-[#8b8ba0]"
            />
          </Link>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 mb-6 pt-2">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors">
              Terms
            </Link>
            <span className="text-xs text-[#8b8ba0]/40">
              v2.0
            </span>
          </div>
          <p className="text-[10px] text-[#8b8ba0]/40">
            Made for traders who want discipline.
          </p>
        </div>

        <Navigation />
      </div>
    );
  }

  // ── Dashboard with data ──
  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center">
            <BrainCircuit
              size={20}
              className="text-white"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              TiltCheck
            </h1>
            <p className="text-sm text-[#8b8ba0]">
              Trade with discipline
            </p>
          </div>
        </div>
      </header>

      {/* Today's Date */}
      <p className="text-xs text-[#8b8ba0] mb-4">
        {todayDate}
      </p>

      {/* Today's Status */}
      {todayReadiness && todayOfficial && (
        <div className="mb-4 rounded-2xl bg-[#13131f] border border-white/5 p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Activity
              size={16}
              className="text-[#6366f1]"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ba0]">
              Today&apos;s Readiness
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${todayReadiness.color}15`,
              }}
            >
              {todayReadiness.status === "Ready" ? (
                <CheckCircle2
                  size={22}
                  style={{ color: todayReadiness.color }}
                />
              ) : todayReadiness.status === "Caution" ? (
                <AlertTriangle
                  size={22}
                  style={{ color: todayReadiness.color }}
                />
              ) : (
                <TrendingDown
                  size={22}
                  style={{ color: todayReadiness.color }}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold"
                  style={{ color: todayReadiness.color }}
                >
                  {todayReadiness.status}
                </span>
                <span className="text-xs text-[#8b8ba0]">
                  Score {todayOfficial.score}/100
                </span>
              </div>
              <p className="text-xs text-[#8b8ba0] leading-relaxed">
                {todayReadiness.status === "Ready" &&
                  "Your discipline is solid. Trade your plan."}
                {todayReadiness.status === "Caution" &&
                  "Readiness is shaky. Consider reducing exposure."}
                {todayReadiness.status === "Not Ready" &&
                  "Step away. Trading now is dangerous."}
              </p>
              <p className="text-[10px] text-[#8b8ba0]/60 mt-1.5">
                Last check{" "}
                {new Date(todayOfficial.timestamp).toLocaleTimeString(
                  "en-IN",
                  { hour: "numeric", minute: "2-digit" }
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Cooldown Banner */}
      {cooldownActive && cooldownLeft > 0 && (
        <div className="mb-4 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 p-4 animate-danger-pulse animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Lock
              size={18}
              className="text-[#ef4444]"
            />
            <span className="font-semibold text-[#ef4444]">
              Cooldown Active
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Clock
              size={16}
              className="text-[#ef4444]"
            />
            <span className="text-2xl font-mono font-bold text-[#ef4444]">
              {formatTime(cooldownLeft)}
            </span>
            <span className="text-sm text-[#ef4444]/70">
              remaining
            </span>
          </div>
          <Link
            href="/check"
            className="block w-full py-2.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-sm font-semibold text-[#ef4444] text-center hover:bg-[#ef4444]/25 transition-all active:scale-[0.98]"
          >
            Enter Cooldown Room
          </Link>
        </div>
      )}

      {/* Today's Routine Complete — shows when check + trade both done */}
      {todayReadiness && todayTradeCount > 0 && (
        <div className="mb-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-[#22c55e]" />
            <span className="text-sm font-semibold text-[#22c55e]">
              Today&apos;s trading routine complete
            </span>
          </div>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#22c55e]/15 flex items-center justify-center text-[#22c55e] text-[11px] font-bold shrink-0">✓</span>
              <span className="text-sm text-[#f0f0f5]">Readiness checked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#22c55e]/15 flex items-center justify-center text-[#22c55e] text-[11px] font-bold shrink-0">✓</span>
              <span className="text-sm text-[#f0f0f5]">
                {todayTradeCount} trade{todayTradeCount !== 1 ? "s" : ""} logged today
              </span>
            </div>
            <p className="text-xs text-[#8b8ba0]/70 mt-1">See you tomorrow.</p>
          </div>
          <Link
            href="/log"
            className="block w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#2dd05e] text-white font-semibold text-center transition-colors active:scale-[0.98]"
          >
            Log Another Trade
          </Link>
        </div>
      )}

      {/* Next Recommended Action — hidden when routine complete */}
      {!(todayReadiness && todayTradeCount > 0) && (
        <div className="mb-4 animate-fade-in">
          <Link
            href={getNextAction().href ?? "#"}
            className="flex items-center gap-4 p-4 rounded-2xl bg-[#13131f] border border-white/5 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${getNextAction().color}15`,
              }}
            >
              <span className="text-lg" style={{ color: getNextAction().color }}>
                {getNextAction().icon}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#8b8ba0] mb-0.5">
                Next recommended action
              </p>
              <h2 className="font-semibold" style={{ color: getNextAction().color }}>
                {getNextAction().label}
              </h2>
            </div>
            <ChevronRight size={18} className="text-[#8b8ba0]" />
          </Link>
        </div>
      )}

      {/* Protection Stats */}
      <div className="mb-4 rounded-2xl bg-[#13131f] border border-white/5 p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Shield
            size={16}
            className="text-[#6366f1]"
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ba0]">
            Protection Stats
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3">
            <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider mb-1">
              Total Checks
            </p>
            <p className="text-xl font-bold text-[#f0f0f5]">
              {stats?.totalAssessments ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3">
            <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider mb-1">
              Today&apos;s Trades
            </p>
            <p className="text-xl font-bold text-[#f0f0f5]">
              {todayTradeCount}
            </p>
          </div>
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame
                size={12}
                className="text-[#f59e0b]"
              />
              <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider">
                Current Streak
              </p>
            </div>
            <p className="text-xl font-bold text-[#f0f0f5]">
              {streak?.current ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy
                size={12}
                className="text-[#6366f1]"
              />
              <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider">
                Best Streak
              </p>
            </div>
            <p className="text-xl font-bold text-[#f0f0f5]">
              {streak?.best ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="mb-5 rounded-2xl bg-[#13131f] border border-white/5 p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <History
              size={16}
              className="text-[#6366f1]"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ba0]">
              Recent Sessions
            </span>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session, i) => {
              const readiness = getReadinessStatus(
                session.score
              );
              const emoji =
                readiness.status === "Ready"
                  ? "✅"
                  : readiness.status === "Caution"
                  ? "⚠️"
                  : "❌";
              return (
                <Link
                  key={i}
                  href="/check"
                  className="flex items-center gap-3 rounded-xl bg-[#1a1a2e] border border-white/5 p-3 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${readiness.color}15`,
                    }}
                  >
                    <span className="text-sm">
                      {emoji}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f0f0f5]">
                        {getRelativeDate(session.timestamp)}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8b8ba0]">
                      {readiness.status}
                    </p>
                  </div>
                  {session.cooldownCompleted ? (
                    <span className="text-[10px] text-[#22c55e] font-medium">
                      Completed
                    </span>
                  ) : readiness.status === "Not Ready" ? (
                    <span className="text-[10px] text-[#ef4444] font-medium">
                      Cooldown
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#8b8ba0]">
                      —
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 mb-6 pt-2">
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors">
            Terms
          </Link>
          <span className="text-xs text-[#8b8ba0]/40">
            v2.0
          </span>
        </div>
        <p className="text-[10px] text-[#8b8ba0]/40">
          Made for traders who want discipline.
        </p>
      </div>

      <Navigation />
    </div>
  );
}
