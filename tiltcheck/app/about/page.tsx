import Link from "next/link";
import { BrainCircuit, ShieldCheck, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          About TiltCheck
        </h1>
      </header>

      <div className="space-y-6">
        {/* App identity */}
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#6366f1] flex items-center justify-center">
              <BrainCircuit
                size={24}
                className="text-white"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                TiltCheck
              </h2>
              <p className="text-xs text-[#8b8ba0]">
                Trade with discipline
              </p>
            </div>
          </div>
          <p className="text-sm text-[#8b8ba0] leading-relaxed">
            TiltCheck is a discipline companion for traders.
            It helps you recognize your emotional state
            before trading, preventing impulsive decisions
            that lead to losses.
          </p>
        </div>

        {/* Features */}
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
          <h3 className="text-sm font-semibold mb-3">
            What it does
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={16}
                className="text-[#6366f1] mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-medium">
                  Readiness Check
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  5 quick questions to assess your
                  emotional state before trading.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={16}
                className="text-[#f59e0b] mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-medium">
                  Smart Cooldown
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  Low readiness triggers a timed cooldown
                  to protect you from emotional trades.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={16}
                className="text-[#22c55e] mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-medium">
                  Trade Logging
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  Record each trade with its emotional
                  driver to identify patterns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-5">
          <h3 className="text-sm font-semibold mb-2">
            Your data stays on your device
          </h3>
          <p className="text-xs text-[#8b8ba0] leading-relaxed">
            All data is stored in your browser&apos;s localStorage.
            No accounts, no cloud sync, no tracking. You
            control your data completely.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <Link
            href="/privacy"
            className="block rounded-xl bg-[#13131f] border border-white/5 p-4 text-sm font-medium hover:border-[#6366f1]/30 transition-all"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="block rounded-xl bg-[#13131f] border border-white/5 p-4 text-sm font-medium hover:border-[#6366f1]/30 transition-all"
          >
            Terms of Use
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#13131f] border border-white/5 p-4 text-sm font-medium hover:border-[#6366f1]/30 transition-all"
          >
            <ExternalLink size={16} />
            Source Code
          </a>
        </div>
      </div>
    </div>
  );
}
