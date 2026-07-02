"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import {
  getTrades,
  getScores,
  getStreak,
  getCooldownEnd,
  getCooldownMeta,
  clearAllData,
} from "@/lib/storage";
import {
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  ClipboardList,
  Flame,
  Trophy,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleExport = () => {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      trades: getTrades(),
      scores: getScores(),
      streak: getStreak(),
      cooldown: getCooldownEnd(),
      cooldownMeta: getCooldownMeta(),
      onboarded: localStorage.getItem("tiltcheck_onboarded"),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiltcheck-backup-${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportReady(true);
    setTimeout(() => setExportReady(false), 2000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.version || !json.timestamp) throw new Error("Invalid format");

        if (json.trades) localStorage.setItem("tiltcheck_trades", JSON.stringify(json.trades));
        if (json.scores) localStorage.setItem("tiltcheck_scores", JSON.stringify(json.scores));
        if (json.streak) localStorage.setItem("tiltcheck_streak", JSON.stringify(json.streak));
        if (json.cooldown) localStorage.setItem("tiltcheck_cooldown", json.cooldown);
        if (json.cooldownMeta) localStorage.setItem("tiltcheck_cooldown_meta", JSON.stringify(json.cooldownMeta));
        if (json.onboarded) localStorage.setItem("tiltcheck_onboarded", json.onboarded);

        setImportStatus("success");
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    setTimeout(() => window.location.reload(), 500);
  };

  const trades = getTrades();
  const scores = getScores();
  const streak = getStreak();

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
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-[#8b8ba0] text-sm">
          Manage your data and preferences
        </p>
      </header>

      {/* Data Backup & Restore */}
      <section className="mb-5 rounded-2xl bg-[#13131f] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download size={18} className="text-[#6366f1]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8ba0]">
            Data Backup & Restore
          </h2>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
            disabled={exportReady}
          >
            <Download size={18} />
            {exportReady ? "Exported!" : "Export All Data"}
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Import data"
            />
            <button
              className="w-full py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#8b8ba0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Import Data
            </button>
            {importStatus === "success" && (
              <p className="text-xs text-[#22c55e] text-center mt-1">
                Import successful. Reloading...
              </p>
            )}
            {importStatus === "error" && (
              <p className="text-xs text-[#ef4444] text-center mt-1">
                Invalid file format. Please use a TiltCheck export file.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Current Data Summary */}
      <section className="mb-5 rounded-2xl bg-[#13131f] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={18} className="text-[#f59e0b]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8ba0]">
            Current Data Summary
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3 text-center">
            <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider mb-1">
              Total Checks
            </p>
            <p className="text-xl font-bold text-[#f0f0f5]">{scores.length}</p>
          </div>
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3 text-center">
            <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider mb-1">
              Trades Logged
            </p>
            <p className="text-xl font-bold text-[#f0f0f5]">{trades.length}</p>
          </div>
          <div className="rounded-xl bg-[#1a1a2e] border border-white/5 p-3 text-center">
            <div className="flex items-center gap-1.5 mb-1 justify-center">
              <Flame size={12} className="text-[#f59e0b]" />
              <p className="text-[10px] text-[#8b8ba0] uppercase tracking-wider">
                Current Streak
              </p>
            </div>
            <p className="text-xl font-bold text-[#f0f0f5]">{streak.current}</p>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mb-5 rounded-2xl bg-[#13131f] border border-red-500/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 size={18} className="text-[#ef4444]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#ef4444]">
            Danger Zone
          </h2>
        </div>

        <p className="text-xs text-[#8b8ba0] mb-4">
          This will permanently delete all your checks, trades, streaks, and
          settings. Cannot be undone.
        </p>

        {showClearConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-[#ef4444] font-medium">
              Are you absolutely sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl bg-[#ef4444] hover:bg-[#f87171] text-white font-semibold transition-colors active:scale-[0.98]"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#8b8ba0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 rounded-xl bg-[#1a1a2e] border border-red-500/30 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-red-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Clear All Data
          </button>
        )}
      </section>

      {/* App Info */}
      <section className="mb-5 rounded-2xl bg-[#13131f] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={18} className="text-[#6366f1]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8b8ba0]">
            App Info
          </h2>
        </div>

        <div className="space-y-2 text-sm text-[#8b8ba0]">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="text-[#f0f0f5] font-mono">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="text-[#f0f0f5]">localStorage</span>
          </div>
          <div className="flex justify-between">
            <span>Privacy</span>
            <span className="text-[#f0f0f5]">100% local</span>
          </div>
        </div>
      </section>

      <Navigation />
    </div>
  );
}