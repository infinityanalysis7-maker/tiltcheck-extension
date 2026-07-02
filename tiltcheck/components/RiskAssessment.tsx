"use client";

import { useMemo } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Lightbulb,
  Activity,
  Share2,
  Check,
  Quote,
  Target,
} from "lucide-react";
import ScoreRing from "./ScoreRing";
import { getReadinessStatus, ReadinessStatus } from "@/lib/storage";

const QUESTION_LABELS = [
  { key: "sleep", label: "Sleep", good: "Well Rested", bad: "Fatigue Detected", badDesc: "Poor sleep impairs decision-making and risk judgment." },
  { key: "emotions", label: "Emotions", good: "Emotionally Calm", bad: "Emotional Distress", badDesc: "Stress and anxiety cloud trading judgment." },
  { key: "plan", label: "Plan", good: "Clear Plan", bad: "No Trading Plan", badDesc: "Entering without a plan is gambling, not trading." },
  { key: "review", label: "Review", good: "Reviewed Trades", bad: "Skipped Review", badDesc: "Ignoring past mistakes means repeating them." },
  { key: "mindset", label: "Mindset", good: "Fresh Mindset", bad: "Revenge Mode", badDesc: "Trading to recover losses leads to bigger losses." },
];

interface RiskAssessmentProps {
  readinessScore: number;
  answers: number[];
  onShare: () => void;
  shareStatus: "idle" | "copied" | "shared";
  isRetake?: boolean;
  officialScore?: number;
  officialStatus?: ReadinessStatus;
}

export default function RiskAssessment({
  readinessScore,
  answers,
  onShare,
  shareStatus,
  isRetake = false,
  officialScore,
  officialStatus,
}: RiskAssessmentProps) {
  const { status, color } = getReadinessStatus(readinessScore);

  const statusLabel = status === "Caution" ? "Needs Caution" : status;

  const coachingMessage = useMemo(() => {
    const weakAreas: { q: number; label: string }[] = [];
    if (answers[0] <= 2) weakAreas.push({ q: 0, label: "sleep" });
    if (answers[1] <= 2) weakAreas.push({ q: 1, label: "emotions" });
    if (answers[2] <= 2) weakAreas.push({ q: 2, label: "planning" });
    if (answers[3] <= 2) weakAreas.push({ q: 3, label: "review" });
    if (answers[4] <= 2) weakAreas.push({ q: 4, label: "mindset" });

    const primaryWeak = weakAreas[0]?.label;

    if (status === "Not Ready") {
      if (primaryWeak === "mindset")
        return "You only need one bad trade to erase a good week. Protect your capital first.";
      if (primaryWeak === "emotions")
        return "Your biggest risk today isn't the market — it's what's going on inside you.";
      if (primaryWeak === "sleep")
        return "Your biggest weakness today isn't your strategy — it's fatigue.";
      if (primaryWeak === "planning")
        return "The market rewards preparation, not impulse. Without a plan, you're gambling.";
      if (primaryWeak === "review")
        return "Ignoring yesterday's mistakes guarantees repeating them. Review before you risk.";
      return "The market will still be here tomorrow. Your edge depends on arriving prepared.";
    }

    if (status === "Caution") {
      if (primaryWeak === "mindset")
        return "One loss doesn't mean you need to chase. Reset your focus before you trade again.";
      if (primaryWeak === "emotions")
        return "You're carrying tension into your trading. That tension costs money.";
      if (primaryWeak === "sleep")
        return "Fatigue and trading don't mix. Protect your capital — rest or reduce your size.";
      if (primaryWeak === "planning")
        return "You're close to being ready. Write your plan before your finger touches the mouse.";
      if (primaryWeak === "review")
        return "Discipline is built in the review, not just the trade. Take five minutes to reflect.";
      return "You're not quite there yet, and that's okay. Trade small today and protect your capital.";
    }

    if (weakAreas.length === 0)
      return "Everything aligned today. Trust the process, not the outcome, and let the trade unfold.";
    if (primaryWeak === "mindset")
      return "You're locked in. Don't let a past loss steal your focus from this moment.";
    if (primaryWeak === "emotions")
      return "Your calm is your edge. Protect it — no one can take it from you.";
    if (primaryWeak === "sleep")
      return "Rest is part of your edge. You showed up prepared. Now execute deliberately.";
    return "Your discipline is showing. Protect it by staying deliberate, not distracted.";
  }, [status, answers]);

  // All 5 behavioral items — always shown
  const behavioralItems = useMemo(() => {
    return answers.map((val, i) => {
      const q = QUESTION_LABELS[i];
      if (val >= 4)
        return { key: q.key, label: q.label, status: "good" as const, icon: <CheckCircle2 size={16} />, title: q.good, color: "#22c55e" };
      if (val <= 2)
        return { key: q.key, label: q.label, status: "bad" as const, icon: <AlertTriangle size={16} />, title: q.bad, description: q.badDesc, color: "#ef4444" };
      return { key: q.key, label: q.label, status: "neutral" as const, icon: <Activity size={16} />, title: "Average", color: "#8b8ba0" };
    });
  }, [answers]);

  // Deductions for "Why did I get this score?" — sorted by impact (largest first)
  const deductions = useMemo(() => {
    return answers
      .map((val, i) => {
        if (val <= 2) {
          const q = QUESTION_LABELS[i];
          const points = (5 - val) * 5;
          return {
            area: q.label,
            label: q.bad,
            points,
            value: val,
            key: q.key,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.points - a!.points) as { area: string; label: string; points: number; value: number; key: string }[];
  }, [answers]);

  // Single biggest risk area
  const mainRisk = useMemo(() => {
    const lowest = Math.min(...answers);
    if (lowest >= 3) return null;
    const idx = answers.indexOf(lowest);
    const q = QUESTION_LABELS[idx];
    return { qIdx: idx, ...q, value: answers[idx] };
  }, [answers]);

  // Confidence / proximity message
  const proximityText = useMemo(() => {
    if (status === "Ready") return "";
    if (mainRisk) {
      const penalty = (5 - mainRisk.value) * 5;
      return `Resolving ${mainRisk.label.toLowerCase()} removes your largest penalty (-${penalty}) and improves your readiness score the most.`;
    }
    if (status === "Not Ready") {
      const toCaution = 40 - readinessScore;
      return `${toCaution} points to reach Needs Caution. Every factor matters.`;
    }
    return "";
  }, [status, readinessScore, mainRisk]);

  // Recommendations — one per deduction
  const recs = useMemo(() => {
    return deductions.map((d) => {
      switch (d.key) {
        case "sleep":
          return "Sleep before trading tomorrow.";
        case "emotions":
          return "Wait until you feel calm before opening charts.";
        case "plan":
          return "Prepare your setup before you enter any trade.";
        case "review":
          return "Review your last trades before taking new ones.";
        case "mindset":
          return "Wait until the urge to recover losses fades.";
        default:
          return "Trade small or skip today. Protect your capital.";
      }
    });
  }, [deductions]);

  return (
    <div className="space-y-4 mb-6">
      {/* Practice check banner */}
      {isRetake && (
        <div className="rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 p-4">
          <p className="text-sm text-[#f59e0b] font-medium">
            Practice Check
          </p>
          <p className="text-xs text-[#8b8ba0] mt-1">
            This score does not count toward your streak or statistics.
            {officialScore !== undefined && officialStatus && (
              <>
                {" "}Your official score today is{" "}
                <span className="font-semibold text-[#f0f0f5]">
                  {officialScore}
                </span>{" "}
                ({officialStatus}).
              </>
            )}
          </p>
        </div>
      )}

      {/* Main Score Card */}
      <div className="rounded-2xl bg-[#13131f] border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-[#6366f1]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8ba0]">
            Trading Readiness
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <div className="shrink-0">
            <ScoreRing
              score={readinessScore}
              size={100}
              strokeWidth={7}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-2xl font-bold"
                style={{ color }}
              >
                {readinessScore}
              </span>
              <span className="text-xs text-[#8b8ba0] font-medium">
                / 100
              </span>
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: `${color}15`,
                color,
                borderColor: `${color}30`,
              }}
            >
              {(status === "Ready") && <CheckCircle2 size={12} />}
              {(status === "Caution" || status === "Not Ready") && (
                <AlertTriangle size={12} />
              )}
              {statusLabel}
            </div>
            <p className="text-xs text-[#8b8ba0] mt-2 leading-relaxed">
              {status === "Ready" &&
                "Your discipline is solid. Trade your plan."}
              {status === "Caution" &&
                "Your readiness is shaky. Consider reducing exposure."}
              {status === "Not Ready" &&
                "Trading now is dangerous. Step away."}
            </p>
          </div>
        </div>
      </div>

      {/* Coach's Note */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: `${color}06`,
        }}
      >
        <div className="flex items-start gap-3">
          <Quote
            size={18}
            className="shrink-0 mt-0.5"
            style={{ color: `${color}80` }}
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8b8ba0] mb-1">
              Coach&apos;s Note
            </p>
            <p
              className="text-sm leading-relaxed italic"
              style={{ color }}
            >
              {coachingMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Main Risk Today */}
      {mainRisk && (
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-[#ef4444]" />
            <h3 className="text-sm font-semibold text-[#ef4444]">
              Main Risk Today
            </h3>
          </div>
          <div className="rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/10 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#ef4444]/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-[#ef4444]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f0f0f5]">
                  {mainRisk.bad}
                </p>
                <p className="text-xs text-[#8b8ba0] mt-0.5">
                  {mainRisk.badDesc}
                </p>
              </div>
            </div>
          </div>
          {proximityText && (
            <p className="text-xs text-[#8b8ba0] mt-3 leading-relaxed">
              {proximityText}
            </p>
          )}
        </div>
      )}

      {/* Behavioral Analysis */}
      <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit size={16} className="text-[#6366f1]" />
          <h3 className="text-sm font-semibold">Behavioral Analysis</h3>
        </div>
        <div className="space-y-2">
          {behavioralItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-[#1a1a2e] border border-white/5 px-3 py-2.5"
            >
              <div
                className="shrink-0 w-6 h-6 rounded flex items-center justify-center"
                style={{
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium text-[#8b8ba0] w-16 shrink-0 uppercase tracking-wider">
                {item.label}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: item.color }}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Why did I get this score? */}
      <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit size={16} className="text-[#6366f1]" />
          <h3 className="text-sm font-semibold">
            Why did I get this score?
          </h3>
        </div>
        {deductions.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-[#8b8ba0] mb-2">
              Main factors lowering today&apos;s readiness:
            </p>
            {deductions.map((d, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  i === 0
                    ? "bg-[#ef4444]/10 border-[#ef4444]/20"
                    : "bg-[#ef4444]/5 border-[#ef4444]/10"
                }`}
              >
                <div>
                  <p className={`text-sm font-medium ${i === 0 ? "text-[#f0f0f5]" : "text-[#f0f0f5]/90"}`}>
                    {d.label}
                  </p>
                  <p className="text-xs text-[#8b8ba0] mt-0.5">
                    {d.area}
                  </p>
                </div>
                <span className={`shrink-0 ml-4 ${i === 0 ? "text-base font-bold text-[#ef4444]" : "text-sm font-bold text-[#ef4444]/80"}`}>
                  -{d.points}
                </span>
              </div>
            ))}
            <p className="text-xs text-[#8b8ba0] mt-2">
              Everything else checked out.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#22c55e] text-center py-2">
            All answers were strong. Your readiness is solid.
          </p>
        )}
      </div>

      {/* Personalized Recommendations */}
      <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-[#f59e0b]" />
          <h3 className="text-sm font-semibold">
            Recommendations
          </h3>
        </div>
        <ul className="space-y-2">
          {recs.map((rec, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-[#f0f0f5]/90"
            >
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onShare}
          className="flex-1 py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#f0f0f5] hover:bg-[#6366f1]/10 hover:border-[#6366f1]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          aria-label="Share your readiness score"
        >
          {shareStatus === "copied" || shareStatus === "shared" ? (
            <>
              <Check
                size={16}
                className="text-[#22c55e]"
              />
              <span className="text-[#22c55e]">
                {shareStatus === "shared" ? "Shared" : "Copied"}
              </span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              <span>Share score</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
