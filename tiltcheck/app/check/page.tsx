"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import RiskAssessment from "@/components/RiskAssessment";
import {
  saveScore,
  setCooldownEnd,
  getCooldownEnd,
  clearCooldown,
  getCooldownMeta,
  setCooldownMeta,
  resetStreak,
  getReadinessStatus,
  autoCompleteExpiredCooldown,
  getTodayOfficialSession,
  getTodayTradeCount,
  ScoreRecord,
} from "@/lib/storage";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import LockoutScreen from "@/components/LockoutScreen";

const QUESTIONS = [
  {
    text: "Did I get enough sleep last night?",
    low: "Very tired",
    high: "Well rested",
  },
  {
    text: "Am I emotionally calm right now?",
    low: "Stressed / anxious",
    high: "Calm & focused",
  },
  {
    text: "Do I have a clear trading plan for this setup?",
    low: "No plan",
    high: "Clear plan with SL & target",
  },
  {
    text: "Have I reviewed my last 3 trades?",
    low: "Skipped review",
    high: "Reviewed & learned",
  },
  {
    text: "Am I trading to recover losses?",
    low: "Yes, revenge mode",
    high: "No, fresh mindset",
  },
];

export default function CheckPage() {
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(3));
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [shareStatus, setShareStatus] = useState<
    "idle" | "copied" | "shared"
  >("idle");
  const [showLockout, setShowLockout] = useState(false);
  const [todayOfficial, setTodayOfficial] =
    useState<ScoreRecord | null>(null);
  const [showRetake, setShowRetake] = useState(false);
  const [todayTradeCount, setTodayTradeCount] = useState(0);

  // Check existing cooldown on mount
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    autoCompleteExpiredCooldown();
    setTodayOfficial(getTodayOfficialSession());
    setTodayTradeCount(getTodayTradeCount());
    const end = getCooldownEnd();
    if (end) {
      setCooldownActive(true);
      setCooldownLeft(Math.ceil((end - Date.now()) / 1000));
    }
  }, []);

  // Countdown timer (when not in lockout)
  useEffect(() => {
    if (!cooldownActive || showLockout) return;
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
        const meta = getCooldownMeta();
        if (meta && !meta.completed) {
          setCooldownMeta({ ...meta, completed: true });
        }
        clearCooldown();
        clearInterval(interval);
      } else {
        setCooldownLeft(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownActive, showLockout]);

  const handleAnswer = (index: number, value: number) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    setShowResult(false);
    setScore(null);
  };

  const calculateScore = () => {
    let total = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      const val = answers[i];
      // All questions: slider=1 is worst, slider=5 is best.
      // The labels already ensure low=bad, high=good for every question.
      total += val;
    }
    // total is 5–25, where 25 = best possible
    const readinessScore = Math.round(((total - 5) / 20) * 100);
    const { status } = getReadinessStatus(readinessScore);

    setScore(readinessScore);
    setShowResult(true);

    const record: ScoreRecord = {
      score: readinessScore,
      timestamp: new Date().toISOString(),
      answers,
      status,
      cooldownCompleted: false,
      // isOfficial is auto-determined by saveScore based on today's existing official check
    };

    try {
      saveScore(record);
      // After saving, refresh today's official (saveScore auto-assigns isOfficial)
      const updated = getTodayOfficialSession();
      setTodayOfficial(updated);
    } catch {
      // Silently ignore
    }

    if (readinessScore < 40) {
      try {
        if (cooldownActive) {
          resetStreak();
        }
        setCooldownEnd(15);
        setCooldownMeta({
          completed: false,
          extended: false,
          originalMinutes: 15,
        });
        setCooldownActive(true);
        setCooldownLeft(15 * 60);
        // Immediately enter lockout — no intermediate click needed
        setShowLockout(true);
      } catch {
        // Silently ignore
      }
    }
  };

  const handleShare = async () => {
    if (score === null) return;
    const { status } = getReadinessStatus(score);
    const emoji =
      status === "Ready"
        ? "✅"
        : status === "Caution"
        ? "⚠️"
        : "🚫";
    const text = `My Trading Readiness: ${score}/100 ${emoji} ${status}. tiltcheck.vercel.app`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setShareStatus("shared");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareStatus("copied");
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setShareStatus("copied");
      }
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("idle");
    }
  };

  const handleLockoutComplete = () => {
    setShowLockout(false);
    setCooldownActive(false);
    setCooldownLeft(0);
    clearCooldown();
    setTodayOfficial(getTodayOfficialSession());
  };

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
          <ShieldCheck size={24} className="text-[#6366f1]" />
          <h1 className="text-xl font-bold tracking-tight">
            Trading Readiness Check
          </h1>
        </div>
        <p className="text-[#8b8ba0] text-sm">
          Answer honestly. Your score determines if you should trade.
        </p>
      </header>

      {/* Full-screen lockout overlay */}
      {showLockout && cooldownLeft > 0 && (
        <LockoutScreen
          secondsLeft={cooldownLeft}
          onComplete={handleLockoutComplete}
        />
      )}

      {/* If cooldown is active but not in lockout, show warning */}
      {cooldownActive && cooldownLeft > 0 && !showLockout && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-danger-pulse">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={20} className="text-red-400" />
            <span className="font-semibold text-red-400">
              Cooldown Active
            </span>
          </div>
          <p className="text-sm text-red-300/80 mb-3">
            You must wait before taking a new trade.
          </p>
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-2xl font-mono font-bold">
              {Math.floor(cooldownLeft / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(cooldownLeft % 60).toString().padStart(2, "0")}
            </span>
            <span className="text-sm">remaining</span>
          </div>
          <button
            onClick={() => setShowLockout(true)}
            className="mt-3 w-full py-2.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444]/25 transition-all active:scale-[0.98]"
            aria-label="Enter cooldown room"
          >
            Enter Cooldown Room
          </button>
        </div>
      )}

      {/* ═══ TODAY'S OFFICIAL CHECK COMPLETE — SHOW RESULT ═══ */}
      {todayOfficial && !showRetake && !showResult && (
        <div className="space-y-4 mb-5">
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-[#22c55e]" />
            </div>
            <h2 className="text-lg font-bold mb-1">
              Today&apos;s Check Complete
            </h2>
            <p className="text-sm text-[#8b8ba0] mb-4">
              Only your first check each day counts toward streaks and
              statistics. You may retake for practice.
            </p>

            {/* Official score preview */}
            <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${getReadinessStatus(todayOfficial.score).color}15`,
                  }}
                >
                  {todayOfficial.status === "Ready"
                    ? "✅"
                    : todayOfficial.status === "Caution"
                    ? "⚠️"
                    : "🚫"}
                </div>
                <div className="text-left">
                  <p className="text-xs text-[#8b8ba0]">
                    Official Score
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{
                      color: getReadinessStatus(todayOfficial.score)
                        .color,
                    }}
                  >
                    {todayOfficial.score}
                    <span className="text-xs font-normal text-[#8b8ba0]">
                      /100
                    </span>
                  </p>
                </div>
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${getReadinessStatus(todayOfficial.score).color}15`,
                    color: getReadinessStatus(todayOfficial.score)
                      .color,
                    borderColor: `${getReadinessStatus(todayOfficial.score).color}30`,
                  }}
                >
                  {getReadinessStatus(todayOfficial.score).status}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setShowResult(true)}
                className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98]"
              >
                View Today&apos;s Result
              </button>
              {todayTradeCount === 0 && (
                <Link
                  href="/log"
                  className="block w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#2dd05e] text-white font-semibold text-center transition-colors active:scale-[0.98]"
                >
                  Log Today&apos;s Trade
                </Link>
              )}
              <button
                onClick={() => setShowRetake(true)}
                className="w-full py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#8b8ba0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
              >
                Retake for Practice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEWING OFFICIAL RESULT (read-only, no cooldown trigger) ═══ */}
      {todayOfficial && showResult && !showRetake && (
        <div className="space-y-4 mb-5">
          <RiskAssessment
            readinessScore={todayOfficial.score}
            answers={todayOfficial.answers}
            onShare={handleShare}
            shareStatus={shareStatus}
            isRetake={false}
          />
          <Link
            href="/log"
            className="block w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#2dd05e] text-white font-semibold text-center transition-colors active:scale-[0.98]"
          >
            Log Today&apos;s Trade
          </Link>
          <button
            onClick={() => setShowResult(false)}
            className="w-full py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#8b8ba0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
          >
            Back to Summary
          </button>
        </div>
      )}

      {/* ═══ QUESTIONS — NORMAL OR RETAKE MODE ═══ */}
      {(!todayOfficial || showRetake) && !showResult && (
        <>
          {/* Retake banner */}
          {showRetake && todayOfficial && (
            <div className="mb-4 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-4">
              <p className="text-sm text-[#f59e0b] font-medium">
                Practice Check
              </p>
              <p className="text-xs text-[#8b8ba0] mt-1">
                Your official score today was{" "}
                <span className="font-semibold text-[#f0f0f5]">
                  {todayOfficial.score}
                </span>{" "}
                ({getReadinessStatus(todayOfficial.score).status}).
                This practice check won&apos;t replace it.
              </p>
            </div>
          )}

          <section
            className="space-y-4 mb-5"
            role="group"
            aria-label="Readiness questions"
          >
            {QUESTIONS.map((q, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#13131f] border border-white/5 p-4"
              >
                <p className="font-medium text-sm mb-3">
                  {i + 1}. {q.text}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-[#8b8ba0] px-1">
                    <span>{q.low}</span>
                    <span>{q.high}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={answers[i]}
                      onChange={(e) =>
                        handleAnswer(i, parseInt(e.target.value))
                      }
                      className="flex-1"
                      aria-label={`Question ${i + 1}: ${q.text}`}
                    />
                    <span
                      className="w-8 text-center font-bold text-[#6366f1]"
                      aria-live="polite"
                    >
                      {answers[i]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <button
            onClick={calculateScore}
            className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98] mb-5"
            aria-label="Calculate your trading readiness score"
          >
            {showRetake ? "Calculate Practice Score" : "Calculate Readiness Score"}
          </button>
        </>
      )}

      {/* ═══ RETAKE RESULT — SHOWS BOTH SCORES ═══ */}
      {showResult && showRetake && score !== null && todayOfficial && (
        <div className="space-y-4 mb-5">
          {/* Comparison card */}
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-[#6366f1]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8ba0]">
                Score Comparison
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Official */}
              <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-4 text-center">
                <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider mb-2">
                  Official
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: getReadinessStatus(todayOfficial.score)
                      .color,
                  }}
                >
                  {todayOfficial.score}
                </p>
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mt-2"
                  style={{
                    backgroundColor: `${getReadinessStatus(todayOfficial.score).color}15`,
                    color: getReadinessStatus(todayOfficial.score)
                      .color,
                    borderColor: `${getReadinessStatus(todayOfficial.score).color}30`,
                  }}
                >
                  {getReadinessStatus(todayOfficial.score).status}
                </div>
              </div>
              {/* Practice */}
              <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-4 text-center">
                <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider mb-2">
                  Practice
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: getReadinessStatus(score).color,
                  }}
                >
                  {score}
                </p>
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mt-2"
                  style={{
                    backgroundColor: `${getReadinessStatus(score).color}15`,
                    color: getReadinessStatus(score).color,
                    borderColor: `${getReadinessStatus(score).color}30`,
                  }}
                >
                  {getReadinessStatus(score).status}
                </div>
              </div>
            </div>
            <p className="text-xs text-[#8b8ba0] text-center mt-4 leading-relaxed">
              Practice score {score >= todayOfficial.score ? "improved by +" : "changed by "}
              {Math.abs(score - todayOfficial.score)}.
              Your official score stays locked until tomorrow.
            </p>
          </div>

          {/* Full analysis of practice check */}
          <RiskAssessment
            readinessScore={score}
            answers={answers}
            onShare={handleShare}
            shareStatus={shareStatus}
            isRetake={true}
            officialScore={todayOfficial.score}
            officialStatus={getReadinessStatus(todayOfficial.score).status}
          />

          <Link
            href="/log"
            className="block w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#2dd05e] text-white font-semibold text-center transition-colors active:scale-[0.98]"
          >
            Log Today&apos;s Trade
          </Link>

          <button
            onClick={() => {
              setShowResult(false);
              setShowRetake(false);
              setScore(null);
            }}
            className="w-full py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#8b8ba0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
          >
            Back to Summary
          </button>
        </div>
      )}

      {/* ═══ FIRST CHECK RESULT — NORMAL FLOW ═══ */}
      {showResult && !showRetake && !todayOfficial && score !== null && (
        <div className="space-y-4 mb-5">
          <RiskAssessment
            readinessScore={score}
            answers={answers}
            onShare={handleShare}
            shareStatus={shareStatus}
            isRetake={false}
          />
          <Link
            href="/log"
            className="block w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#2dd05e] text-white font-semibold text-center transition-colors active:scale-[0.98]"
          >
            Log Today&apos;s Trade
          </Link>
        </div>
      )}

      <Navigation />
    </div>
  );
}
