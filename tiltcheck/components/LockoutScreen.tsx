"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Clock,
  Wind,
  CheckCircle2,
  Droplets,
  Footprints,
  Brain,
  FileText,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Lock,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  getCooldownMeta,
  setCooldownMeta,
  clearCooldown,
  incrementStreak,
  resetStreak,
  setCooldownEnd,
  getCooldownEnd,
} from "@/lib/storage";

interface LockoutScreenProps {
  secondsLeft: number;
  onComplete?: () => void;
}

const QUOTES = [
  "Breathe. Step away from the charts.",
  "Every trade you don't take is a trade you don't lose.",
  "The market will be here tomorrow. Will your capital?",
  "Discipline is doing what you planned, not what you feel.",
  "Revenge trading is a tax on your ego. Don't pay it.",
  "Patience is the only edge that never expires.",
  "Your best trade today might be no trade at all.",
  "The chart doesn't care about your feelings.",
];

const REFLECTION_OPTIONS = [
  { value: "setup", label: "I found a valid setup.", emotional: false },
  {
    value: "revenge",
    label: "I want to recover my losses.",
    emotional: true,
  },
  { value: "fomo", label: "I have FOMO.", emotional: true },
  { value: "bored", label: "I'm bored.", emotional: true },
  { value: "other", label: "Other.", emotional: false },
];

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  checked: boolean;
}

export default function LockoutScreen({
  secondsLeft: initialSeconds,
  onComplete,
}: LockoutScreenProps) {
  const [phase, setPhase] = useState<
    "cooldown" | "reflection" | "extended" | "complete"
  >("cooldown");
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "water",
      label: "Drink water",
      icon: <Droplets size={16} />,
      checked: false,
    },
    {
      id: "desk",
      label: "Leave your desk",
      icon: <Footprints size={16} />,
      checked: false,
    },
    {
      id: "breathe",
      label: "Breathe deeply",
      icon: <Wind size={16} />,
      checked: false,
    },
    {
      id: "plan",
      label: "Review your trading plan",
      icon: <FileText size={16} />,
      checked: false,
    },
  ]);
  const [selectedReason, setSelectedReason] = useState<string | null>(
    null
  );
  const [extendedSeconds, setExtendedSeconds] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);

  // Determine initial phase based on meta
  useEffect(() => {
    const meta = getCooldownMeta();
    if (meta?.extended) {
      const end = getCooldownEnd();
      if (end) {
        const left = Math.ceil((end - Date.now()) / 1000);
        if (left > 0) {
          setPhase("extended");
          setExtendedSeconds(left);
        } else {
          setPhase("complete");
          completeCooldown();
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate quotes every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Main countdown timer
  useEffect(() => {
    if (phase !== "cooldown") return;
    const interval = setInterval(() => {
      const end = getCooldownEnd();
      if (!end) {
        setSecondsLeft(0);
        clearInterval(interval);
        setPhase("reflection");
        return;
      }
      const left = Math.ceil((end - Date.now()) / 1000);
      if (left <= 0) {
        setSecondsLeft(0);
        clearInterval(interval);
        setPhase("reflection");
      } else {
        setSecondsLeft(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Extended countdown timer
  useEffect(() => {
    if (phase !== "extended") return;
    const interval = setInterval(() => {
      const end = getCooldownEnd();
      if (!end) {
        setExtendedSeconds(0);
        clearInterval(interval);
        setPhase("complete");
        completeCooldown();
        return;
      }
      const left = Math.ceil((end - Date.now()) / 1000);
      if (left <= 0) {
        setExtendedSeconds(0);
        clearInterval(interval);
        setPhase("complete");
        completeCooldown();
      } else {
        setExtendedSeconds(left);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeCooldown = useCallback(() => {
    const meta = getCooldownMeta();
    if (!meta?.completed) {
      setCooldownMeta({
        completed: true,
        extended: meta?.extended ?? false,
        originalMinutes: meta?.originalMinutes ?? 15,
      });
      incrementStreak();
    }
    if (onComplete) onComplete();
  }, [onComplete]);

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const totalCooldownSeconds = 15 * 60;
  const progress = Math.max(
    0,
    Math.min(
      1,
      (totalCooldownSeconds - secondsLeft) / totalCooldownSeconds
    )
  );
  const extendedProgress =
    1 -
    Math.max(0, Math.min(1, extendedSeconds / (10 * 60)));

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  const handleReflectionSubmit = () => {
    if (!selectedReason) return;
    const option = REFLECTION_OPTIONS.find(
      (o) => o.value === selectedReason
    );
    if (option?.emotional) {
      setShowWarning(true);
      setTimeout(() => {
        setShowWarning(false);
        setPhase("extended");
        setCooldownEnd(10);
        setCooldownMeta({
          completed: false,
          extended: true,
          originalMinutes: 15,
        });
        setExtendedSeconds(10 * 60);
      }, 3000);
    } else {
      setPhase("complete");
      completeCooldown();
    }
  };

  const handleGiveUp = () => {
    resetStreak();
    clearCooldown();
    if (onComplete) onComplete();
  };

  const allChecked = checklist.every((c) => c.checked);

  // ── Cooldown Phase ──
  if (phase === "cooldown") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center px-6 text-center overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm py-10">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center animate-pulse">
              <Shield
                size={28}
                className="text-[#ef4444]"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#f0f0f5] mb-1 tracking-tight">
            Trading Blocked
          </h2>
          <p className="text-[#8b8ba0] text-sm mb-8 max-w-xs leading-relaxed">
            Your readiness score is low. A cooldown is enforced
            to protect your capital.
          </p>

          <div className="mb-10 relative">
            <svg
              width="220"
              height="220"
              className="-rotate-90"
            >
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="#1a1a2e"
                strokeWidth="10"
              />
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="#ef4444"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={
                  2 * Math.PI * 100 * (1 - progress)
                }
                style={{
                  transition: "stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock
                size={20}
                className="text-[#ef4444] mb-1"
              />
              <div className="text-[4rem] font-mono font-bold tracking-wider leading-none text-[#f0f0f5]">
                {formatTime(secondsLeft)}
              </div>
              <div className="text-[#8b8ba0] text-xs mt-1">
                remaining
              </div>
            </div>
          </div>

          <div className="w-full max-w-xs mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8b8ba0]">
                Discipline Checklist
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  allChecked
                    ? "bg-[#22c55e]/15 text-[#22c55e]"
                    : "bg-[#1a1a2e] text-[#8b8ba0]"
                }`}
              >
                {
                  checklist.filter((c) => c.checked).length
                }
                /{checklist.length}
              </span>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                    item.checked
                      ? "bg-[#22c55e]/10 border-[#22c55e]/30"
                      : "bg-[#13131f] border-white/5 hover:border-white/10"
                  }`}
                  aria-label={`${item.label} - ${
                    item.checked ? "completed" : "not completed"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      item.checked
                        ? "bg-[#22c55e] text-white"
                        : "bg-[#1a1a2e] text-[#8b8ba0]"
                    }`}
                  >
                    {item.checked ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      item.checked
                        ? "text-[#22c55e] line-through"
                        : "text-[#f0f0f5]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-xs mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Wind
                size={14}
                className="text-[#6366f1]"
              />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6366f1] font-semibold">
                Remember this
              </span>
              <Wind
                size={14}
                className="text-[#6366f1]"
              />
            </div>
            <p className="text-base font-medium text-[#f0f0f5]/90 leading-relaxed animate-fade-quote">
              {QUOTES[quoteIndex]}
            </p>
          </div>

          {/* Reset streak with confirmation */}
          {!showGiveUpConfirm ? (
            <button
              onClick={() => setShowGiveUpConfirm(true)}
              className="text-xs text-[#8b8ba0]/50 hover:text-[#ef4444] transition-colors mb-6"
            >
              Reset streak
            </button>
          ) : (
            <div className="w-full max-w-xs rounded-xl bg-[#13131f] border border-[#ef4444]/20 p-4 mb-6">
              <p className="text-sm text-[#f0f0f5] mb-3">
                Are you sure? This will reset your current
                discipline streak.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGiveUpConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#f0f0f5] transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiveUp}
                  className="flex-1 py-2.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-sm font-semibold text-[#ef4444] transition-all active:scale-[0.98]"
                >
                  Reset Streak
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-[#8b8ba0]/30 text-xs pb-6">
          Closing this tab won't bypass the timer.
        </div>
      </div>
    );
  }

  // ── Reflection Phase ──
  if (phase === "reflection") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center px-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center">
              <Brain size={28} className="text-[#6366f1]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#f0f0f5] mb-2 tracking-tight">
            One Last Question
          </h2>
          <p className="text-[#8b8ba0] text-sm mb-8 max-w-xs leading-relaxed">
            The timer is up. Before you trade, be honest with
            yourself.
          </p>

          <div className="w-full text-left mb-8">
            <p className="text-sm font-medium text-[#f0f0f5] mb-4">
              Why do you still want to trade?
            </p>
            <div className="space-y-2.5">
              {REFLECTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setSelectedReason(option.value)
                  }
                  className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all active:scale-[0.98] ${
                    selectedReason === option.value
                      ? option.emotional
                        ? "bg-[#ef4444]/10 border-[#ef4444]/40"
                        : "bg-[#22c55e]/10 border-[#22c55e]/40"
                      : "bg-[#13131f] border-white/5 hover:border-white/15"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selectedReason === option.value
                        ? option.emotional
                          ? "border-[#ef4444] bg-[#ef4444]"
                          : "border-[#22c55e] bg-[#22c55e]"
                        : "border-[#8b8ba0]/40"
                    }`}
                  >
                    {selectedReason === option.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-[#f0f0f5]">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {showWarning && (
            <div className="w-full max-w-xs mb-6 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 p-4 animate-danger-pulse">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  size={18}
                  className="text-[#ef4444] shrink-0 mt-0.5"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#ef4444] mb-1">
                    This is still emotional trading.
                  </p>
                  <p className="text-xs text-[#f0f0f5]/80 leading-relaxed">
                    Your answer reveals emotional motivation.
                    Extending cooldown by 10 minutes to protect
                    your capital.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleReflectionSubmit}
            disabled={!selectedReason || showWarning}
            className="w-full max-w-xs py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ChevronRight size={16} />
          </button>

          {/* Reset streak with confirmation */}
          {!showGiveUpConfirm ? (
            <button
              onClick={() => setShowGiveUpConfirm(true)}
              className="mt-4 text-xs text-[#8b8ba0]/50 hover:text-[#ef4444] transition-colors"
            >
              Reset streak
            </button>
          ) : (
            <div className="w-full max-w-xs mt-4 rounded-xl bg-[#13131f] border border-[#ef4444]/20 p-4">
              <p className="text-sm text-[#f0f0f5] mb-3">
                Are you sure? This will reset your current
                discipline streak.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGiveUpConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#f0f0f5] transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiveUp}
                  className="flex-1 py-2.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-sm font-semibold text-[#ef4444] transition-all active:scale-[0.98]"
                >
                  Reset Streak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Extended Phase ──
  if (phase === "extended") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center px-6 text-center overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm py-10">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center animate-pulse">
              <XCircle
                size={28}
                className="text-[#ef4444]"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#f0f0f5] mb-1 tracking-tight">
            Cooldown Extended
          </h2>
          <p className="text-[#8b8ba0] text-sm mb-8 max-w-xs leading-relaxed">
            Your reflection revealed emotional intent. The
            cooldown is extended to protect you.
          </p>

          <div className="mb-10 relative">
            <svg
              width="220"
              height="220"
              className="-rotate-90"
            >
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="#1a1a2e"
                strokeWidth="10"
              />
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={
                  2 * Math.PI * 100 * (1 - extendedProgress)
                }
                style={{
                  transition: "stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <RotateCcw
                size={20}
                className="text-[#f59e0b] mb-1"
              />
              <div className="text-[4rem] font-mono font-bold tracking-wider leading-none text-[#f0f0f5]">
                {formatTime(extendedSeconds)}
              </div>
              <div className="text-[#8b8ba0] text-xs mt-1">
                extra time
              </div>
            </div>
          </div>

          <div className="w-full max-w-xs rounded-xl bg-[#13131f] border border-white/5 p-4 mb-6">
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                size={16}
                className="text-[#f59e0b] shrink-0 mt-0.5"
              />
              <p className="text-xs text-[#f0f0f5]/80 leading-relaxed text-left">
                Trading to recover losses, out of FOMO, or from
                boredom are all forms of emotional trading. These
                are the trades that blow up accounts. Use this
                extra time to reset completely.
              </p>
            </div>
          </div>

          {/* Reset streak with confirmation */}
          {!showGiveUpConfirm ? (
            <button
              onClick={() => setShowGiveUpConfirm(true)}
              className="text-xs text-[#8b8ba0]/50 hover:text-[#ef4444] transition-colors mb-6"
            >
              Reset streak
            </button>
          ) : (
            <div className="w-full max-w-xs rounded-xl bg-[#13131f] border border-[#ef4444]/20 p-4 mb-6">
              <p className="text-sm text-[#f0f0f5] mb-3">
                Are you sure? This will reset your current
                discipline streak.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGiveUpConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#f0f0f5] transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiveUp}
                  className="flex-1 py-2.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-sm font-semibold text-[#ef4444] transition-all active:scale-[0.98]"
                >
                  Reset Streak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Complete Phase ──
  if (phase === "complete") {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col items-center px-6 text-center">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center animate-score-reveal">
              <Lock
                size={32}
                className="text-[#22c55e]"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#f0f0f5] mb-2 tracking-tight animate-score-reveal">
            Cooldown Complete
          </h2>
          <p className="text-[#8b8ba0] text-sm mb-8 max-w-xs leading-relaxed animate-score-reveal">
            You stayed disciplined. Your streak is protected.
            Trade only if you have a valid setup.
          </p>

          <div className="w-full max-w-xs rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 p-4 mb-6 animate-score-reveal">
            <div className="flex items-center gap-2">
              <Sparkles
                size={16}
                className="text-[#22c55e]"
              />
              <span className="text-sm font-semibold text-[#22c55e]">
                Streak maintained
              </span>
            </div>
            <p className="text-xs text-[#f0f0f5]/70 mt-1 text-left">
              Consistency builds discipline. Keep it up.
            </p>
          </div>

          <button
            onClick={onComplete}
            className="w-full max-w-xs py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2 animate-score-reveal"
          >
            <TrendingUp size={18} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
