"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  TrendingUp,
  ChevronRight,
  X,
} from "lucide-react";
import { hasOnboarded, setOnboarded } from "@/lib/storage";

const ONBOARDING_STEPS = [
  {
    icon: <ShieldCheck size={32} className="text-[#6366f1]" />,
    title: "Answer 5 honest questions",
    description:
      "Sleep, emotions, trading plan, recent reviews, and mindset. Takes 30 seconds.",
  },
  {
    icon: <Clock size={32} className="text-[#f59e0b]" />,
    title: "Low score starts a cooldown",
    description:
      "If your readiness is below 40, a 15-minute cooldown protects you from emotional trades.",
  },
  {
    icon: <TrendingUp size={32} className="text-[#22c55e]" />,
    title: "Build discipline over time",
    description:
      "Track your consistency, see your streak grow, and become a more disciplined trader.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (hasOnboarded()) {
      router.replace("/");
    }
  }, [router]);

  const handleFinish = () => {
    setOnboarded();
    router.push("/");
  };

  const handleSkip = () => {
    setOnboarded();
    router.push("/");
  };

  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="px-4 pt-8 pb-8 min-h-[100dvh] flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1 text-xs text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors"
          aria-label="Skip onboarding"
        >
          Skip
          <X size={14} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {ONBOARDING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? "w-8 bg-[#6366f1]"
                : i < step
                ? "w-4 bg-[#6366f1]/50"
                : "w-4 bg-[#1a1a2e]"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-[#13131f] border border-white/5 flex items-center justify-center mb-6">
          {current.icon}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-center mb-3">
          {current.title}
        </h2>
        <p className="text-sm text-[#8b8ba0] text-center leading-relaxed max-w-xs">
          {current.description}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-8">
        <button
          onClick={() =>
            isLast ? handleFinish() : setStep(step + 1)
          }
          className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLast ? (
            "Get Started"
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </button>
        {!isLast && (
          <button
            onClick={handleSkip}
            className="w-full py-3 rounded-xl text-sm text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors"
          >
            Skip onboarding
          </button>
        )}
      </div>
    </div>
  );
}
