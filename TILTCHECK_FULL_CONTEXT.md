# TiltCheck — Full Project Context for AI

> This document contains the **complete** source code, architecture, design spec, and business logic for the TiltCheck project. Paste this entire document into any AI context window to give it full understanding of the codebase.

---

## 1. Project Overview

**TiltCheck** is a discipline companion Progressive Web App (PWA) for **Indian F&O (Futures & Options) traders**. It helps traders recognize their emotional state before and during trading, preventing impulsive decisions (revenge trading, FOMO, hope-based exits) that lead to losses.

The app runs as a **mobile-first PWA** with a dark theme, designed to be used quickly on a phone before entering a trade.

### Key Features
- **Pre-Trade Check** (`/check`): 5 emotional discipline questions → calculates a 0–100 discipline score. Scores below 40 trigger a 15-minute trading cooldown.
- **Trade Logger** (`/log`): Log every trade with its emotional driver (Planned, FOMO, Revenge, Boredom, Greed, Hope).
- **Weekly Summary** (`/summary`): Visual breakdown of Planned vs Emotional trades, with week navigation and discipline grading.

---

## 2. Tech Stack & Architecture

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.9 (App Router) |
| UI Library | React 19.2.4 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/postcss`) |
| Icons | `lucide-react` |
| Language | TypeScript 5 |
| Data Storage | `localStorage` (browser-only) |
| PWA | Custom Service Worker (`public/sw.js`) + `manifest.json` |
| Analytics | `@vercel/analytics` |
| Build Output | Static export (`output: 'export'`) |

### Architecture Notes
- **Client Components Only**: All pages use `"use client"` because they rely on `localStorage` and React hooks.
- **Static Export**: The app is built as a static site (`next.config.ts` sets `output: 'export'`).
- **No Backend**: Everything is local-first. No API, no database, no auth.
- **PWA**: Can be installed on mobile home screen via the manifest + service worker.

---

## 3. Directory Structure

```
showdown/
├── package.json                          # Root package (only @vercel/analytics)
├── .gitignore
├── .vercel/
└── tiltcheck/                            # Actual Next.js app
    ├── app/
    │   ├── page.tsx                      # Home / landing page
    │   ├── layout.tsx                    # Root layout (metadata, PWA tags, Analytics)
    │   ├── globals.css                   # Tailwind theme + custom CSS (sliders, scrollbar, animations)
    │   ├── check/page.tsx                # Pre-Trade Check page
    │   ├── log/page.tsx                  # Trade Logger page
    │   └── summary/page.tsx              # Weekly Summary page
    ├── components/
    │   ├── Navigation.tsx                # Bottom tab bar (4 tabs)
    │   ├── ScoreRing.tsx                 # SVG circular progress for discipline score
    │   └── ServiceWorkerRegister.tsx     # Registers /sw.js on mount
    ├── lib/
    │   └── storage.ts                    # All localStorage CRUD + helpers
    ├── design/
    │   └── design.md                     # Full design specification
    ├── public/
    │   ├── manifest.json                 # PWA manifest
    │   ├── sw.js                         # Service worker (cache-first + offline fallback)
    │   ├── icon-192.svg                  # PWA icon (192x192)
    │   ├── icon-512.svg                  # PWA icon (512x512)
    │   └── favicon.ico
    ├── package.json                      # App dependencies
    ├── next.config.ts                    # Next.js config (static export)
    ├── tsconfig.json                     # TypeScript config
    ├── postcss.config.mjs                # PostCSS config (Tailwind v4)
    ├── eslint.config.mjs                 # ESLint config (Next.js core-web-vitals + typescript)
    ├── README.md                         # Standard Next.js README
    ├── AGENTS.md                         # Agent rules (Next.js breaking changes notice)
    └── CLAUDE.md                         # Points to AGENTS.md
```

---

## 4. Design System (from `design/design.md`)

### Color Palette (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | App background |
| `--bg-card` | `#13131f` | Card surfaces |
| `--bg-elevated` | `#1a1a2e` | Inputs, elevated surfaces |
| `--text-primary` | `#f0f0f5` | Primary text |
| `--text-secondary` | `#8b8ba0` | Labels, secondary text |
| `--accent` | `#6366f1` | Indigo accent (primary buttons, active nav) |
| `--accent-light` | `#818cf8` | Hover accent |
| `--success` | `#22c55e` | Good score, planned trades, long positions |
| `--warning` | `#f59e0b` | Medium score, boredom/hope emotions |
| `--danger` | `#ef4444` | Low score, emotional trades, cooldown, short positions |

### Layout Rules
- Mobile-first: `max-w-md` centered container, full-width on mobile.
- `min-h-[100dvh]` for viewport stability.
- Fixed bottom navigation bar on all screens.
- Cards: `rounded-2xl`, subtle `border-white/5`.
- Padding: `px-4` (16px).

### Typography
- Font: system-ui stack (Tailwind default).
- Headings: `semibold`, `tracking-tight`.
- Body: `text-[#f0f0f5]`, secondary text `text-[#8b8ba0]`.

### Animation Language
- Score reveal: `scale(0.8)→scale(1)` + fade, 0.4s ease-out.
- Cooldown pulse: `danger-pulse` 2s infinite red glow.
- Button tap: `active:scale-[0.98]`.

---

## 5. Data Model (from `lib/storage.ts`)

### `localStorage` Keys

| Key | Data | Description |
|-----|------|-------------|
| `tiltcheck_trades` | `Trade[]` | All logged trades (chronological, newest first) |
| `tiltcheck_cooldown` | ISO string | Timestamp when cooldown ends |
| `tiltcheck_scores` | `ScoreRecord[]` | Past check scores with answers |

### TypeScript Interfaces

```typescript
export interface Trade {
  id: string;              // Date.now().toString()
  emotion: string;         // "Planned" | "FOMO" | "Revenge" | "Boredom" | "Greed" | "Hope"
  symbol: string;          // e.g., "NIFTY", "BANKNIFTY"
  quantity: number;
  side: "Long" | "Short";
  entryPrice: number;
  notes: string;
  timestamp: string;       // ISO 8601
}

export interface ScoreRecord {
  score: number;           // 0–100
  timestamp: string;       // ISO 8601
  answers: number[];     // Array of 5 values (1–5 each)
}
```

### Storage Functions

```typescript
getTrades(): Trade[]                          // Returns all trades from localStorage
saveTrade(trade: Trade): void                // Prepends to array, stores in localStorage
deleteTrade(id: string): void                  // Removes trade by id
getCooldownEnd(): number | null               // Returns timestamp ms or null if expired
setCooldownEnd(minutes: number): void          // Sets cooldown end timestamp
clearCooldown(): void                          // Removes cooldown key
getScores(): ScoreRecord[]                     // Returns all past scores
saveScore(score, answers): void              // Prepends score record
getWeekStart(date?: Date): Date                // Returns Sunday 00:00:00 for given date
getWeekEnd(date?: Date): Date                 // Returns Saturday 23:59:59 for given date
getTradesForWeek(weekStart: Date): Trade[]   // Filters trades within week range
getEmotionColor(emotion: string): string       // Returns hex color for emotion
getEmotionBg(emotion: string): string          // Returns Tailwind bg/text/border classes for badge
```

### Emotion Color Mapping

| Emotion | Color | Badge Style (Tailwind) |
|---------|-------|------------------------|
| Planned | `#22c55e` | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` |
| FOMO | `#ef4444` | `bg-red-500/10 text-red-400 border-red-500/20` |
| Revenge | `#ef4444` | `bg-red-500/10 text-red-400 border-red-500/20` |
| Greed | `#ef4444` | `bg-red-500/10 text-red-400 border-red-500/20` |
| Boredom | `#f59e0b` | `bg-amber-500/10 text-amber-400 border-amber-500/20` |
| Hope | `#f59e0b` | `bg-amber-500/10 text-amber-400 border-amber-500/20` |

---

## 6. Page-by-Page Source Code

### 6a. `app/layout.tsx` — Root Layout

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "TiltCheck - Trade Discipline Companion",
  description: "Emotional discipline companion for Indian F&O traders",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TiltCheck",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-[#0a0a0f] text-[#f0f0f5]">
        <ServiceWorkerRegister />
        <main className="min-h-[100dvh] max-w-md mx-auto relative pb-24">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
```

### 6b. `app/page.tsx` — Home / Landing Page

```tsx
"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { ShieldCheck, ClipboardList, BarChart3, TrendingUp, AlertTriangle, BrainCircuit } from "lucide-react";

export default function HomePage() {
  return (
    <div className="px-4 pt-8 pb-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center">
            <BrainCircuit size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">TiltCheck</h1>
            <p className="text-[#8b8ba0] text-sm">Trade with discipline</p>
          </div>
        </div>
      </header>

      <section className="space-y-3 mb-8">
        <Link href="/check" className="flex items-center gap-4 p-4 rounded-2xl bg-[#13131f] border border-white/5 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]">
          <div className="w-12 h-12 rounded-xl bg-[#6366f1]/10 flex items-center justify-center">
            <ShieldCheck size={24} className="text-[#6366f1]" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Pre-Trade Check</h2>
            <p className="text-sm text-[#8b8ba0]">5 questions before you trade</p>
          </div>
          <TrendingUp size={18} className="text-[#8b8ba0]" />
        </Link>

        <Link href="/log" className="flex items-center gap-4 p-4 rounded-2xl bg-[#13131f] border border-white/5 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]">
          <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
            <ClipboardList size={24} className="text-[#22c55e]" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Log Trade</h2>
            <p className="text-sm text-[#8b8ba0]">Record emotion & trade details</p>
          </div>
          <TrendingUp size={18} className="text-[#8b8ba0]" />
        </Link>

        <Link href="/summary" className="flex items-center gap-4 p-4 rounded-2xl bg-[#13131f] border border-white/5 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]">
          <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
            <BarChart3 size={24} className="text-[#f59e0b]" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Weekly Summary</h2>
            <p className="text-sm text-[#8b8ba0]">Planned vs emotional ratio</p>
          </div>
          <TrendingUp size={18} className="text-[#8b8ba0]" />
        </Link>
      </section>

      <section className="rounded-2xl bg-[#13131f] border border-white/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#f59e0b] mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Why emotional discipline matters</h3>
            <p className="text-sm text-[#8b8ba0] leading-relaxed">
              Indian F&O markets are volatile. Most losses come from revenge trading, FOMO entries, and hope-based exits. TiltCheck helps you pause, reflect, and only trade when you're mentally ready.
            </p>
          </div>
        </div>
      </section>

      <Navigation />
    </div>
  );
}
```

### 6c. `app/check/page.tsx` — Pre-Trade Check

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import ScoreRing from "@/components/ScoreRing";
import { saveScore, setCooldownEnd, getCooldownEnd, clearCooldown } from "@/lib/storage";
import { ShieldCheck, Clock, AlertOctagon, Share2, Check } from "lucide-react";

const QUESTIONS = [
  { text: "Did I get enough sleep last night?", low: "Very tired", high: "Well rested" },
  { text: "Am I emotionally calm right now?", low: "Stressed / anxious", high: "Calm & focused" },
  { text: "Do I have a clear trading plan for this setup?", low: "No plan", high: "Clear plan with SL & target" },
  { text: "Have I reviewed my last 3 trades?", low: "Skipped review", high: "Reviewed & learned" },
  { text: "Am I trading to recover losses?", low: "Yes, revenge mode", high: "No, fresh mindset", reversed: true },
];

export default function CheckPage() {
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(3));
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "shared">("idle");

  useEffect(() => {
    const end = getCooldownEnd();
    if (end) { setCooldownActive(true); setCooldownLeft(Math.ceil((end - Date.now()) / 1000)); }
  }, []);

  useEffect(() => {
    if (!cooldownActive) return;
    const interval = setInterval(() => {
      const end = getCooldownEnd();
      if (!end) { setCooldownActive(false); setCooldownLeft(0); clearInterval(interval); return; }
      const left = Math.ceil((end - Date.now()) / 1000);
      if (left <= 0) { setCooldownActive(false); setCooldownLeft(0); clearCooldown(); clearInterval(interval); }
      else { setCooldownLeft(left); }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownActive]);

  const handleAnswer = (index: number, value: number) => {
    const next = [...answers]; next[index] = value; setAnswers(next); setShowResult(false); setScore(null);
  };

  const calculateScore = () => {
    let total = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i]; const val = answers[i];
      if (q.reversed) { total += val; } else { total += val; }
    }
    const disciplineScore = Math.round(((total - 5) / 20) * 100);
    setScore(disciplineScore); setShowResult(true);
    try { saveScore(disciplineScore, answers); } catch { /* ignore */ }
    if (disciplineScore < 40) {
      try { setCooldownEnd(15); setCooldownActive(true); setCooldownLeft(15 * 60); } catch { /* ignore */ }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getScoreLabel = (s: number) => {
    if (s >= 70) return { text: "Ready to trade", color: "#22c55e" };
    if (s >= 40) return { text: "Proceed with caution", color: "#f59e0b" };
    return { text: "Do not trade", color: "#ef4444" };
  };

  const buildShareText = (s: number) => {
    const status = s >= 70 ? "✅ Cleared to trade" : s >= 40 ? "⚠️ Proceed with caution" : "🚫 On cooldown";
    return `My TiltCheck score today: ${s}/100 ${status}. tiltcheck.vercel.app`;
  };

  const handleShare = async () => {
    if (score === null) return;
    const text = buildShareText(score);
    try {
      if (navigator.share) { await navigator.share({ text }); setShareStatus("shared"); }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(text); setShareStatus("copied"); }
      else {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta); setShareStatus("copied");
      }
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch { setShareStatus("idle"); }
  };

  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={24} className="text-[#6366f1]" />
          <h1 className="text-xl font-bold tracking-tight">Pre-Trade Check</h1>
        </div>
        <p className="text-[#8b8ba0] text-sm">Answer honestly. Your discipline score determines if you should trade.</p>
      </header>

      {cooldownActive && cooldownLeft > 0 && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-danger-pulse">
          <div className="flex items-center gap-3 mb-2"><AlertOctagon size={20} className="text-red-400" /><span className="font-semibold text-red-400">Cooldown Active</span></div>
          <p className="text-sm text-red-300/80 mb-3">A previous check scored below 40. You must wait before trading.</p>
          <div className="flex items-center gap-2 text-red-400"><Clock size={18} /><span className="text-2xl font-mono font-bold">{formatTime(cooldownLeft)}</span><span className="text-sm">remaining</span></div>
        </div>
      )}

      <section className="space-y-5 mb-6">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="rounded-2xl bg-[#13131f] border border-white/5 p-4">
            <p className="font-medium text-sm mb-3">{i + 1}. {q.text}</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-[#8b8ba0] px-1"><span>{q.low}</span><span>{q.high}</span></div>
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={5} step={1} value={answers[i]} onChange={(e) => handleAnswer(i, parseInt(e.target.value))} className="flex-1" />
                <span className="w-8 text-center font-bold text-[#6366f1]">{answers[i]}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <button onClick={calculateScore} className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-white font-semibold transition-colors active:scale-[0.98] mb-6">Calculate Discipline Score</button>

      {showResult && score !== null && (
        <div className="mb-6">
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-6 text-center">
            <ScoreRing score={score} />
            <div className="mt-4">
              <p className="font-semibold text-lg" style={{ color: getScoreLabel(score).color }}>{getScoreLabel(score).text}</p>
              <p className="text-[#8b8ba0] text-sm mt-1">
                {score >= 70 ? "Your mindset is strong. Stick to your plan." : score >= 40 ? "Your discipline is shaky. Reduce position size or skip this trade." : "Your emotional state is compromised. Step away from the screen."}
              </p>
            </div>
            <button onClick={handleShare} className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/10 text-sm font-medium text-[#f0f0f5] hover:bg-[#6366f1]/10 hover:border-[#6366f1]/30 transition-all active:scale-[0.98]">
              {shareStatus === "copied" || shareStatus === "shared" ? (<><Check size={16} className="text-[#22c55e]" /><span className="text-[#22c55e]">{shareStatus === "shared" ? "Shared" : "Copied"}</span></>) : (<><Share2 size={16} /><span>Share score</span></>)}
            </button>
          </div>

          {score < 40 && cooldownLeft > 0 && (
            <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-danger-pulse">
              <div className="flex items-center gap-2 mb-2"><AlertOctagon size={18} className="text-red-400" /><span className="font-semibold text-red-400">Trading Blocked</span></div>
              <p className="text-sm text-red-300/80 mb-2">You must wait 15 minutes before taking any new trade.</p>
              <div className="flex items-center gap-2 text-red-400"><Clock size={16} /><span className="text-xl font-mono font-bold">{formatTime(cooldownLeft)}</span></div>
            </div>
          )}
        </div>
      )}

      <Navigation />
    </div>
  );
}
```

### Scoring Logic
- 5 questions, each 1–5. Total raw = 5–25.
- Discipline Score = `((total - 5) / 20) * 100` → 0–100.
- **≥ 70**: Green — "Ready to trade"
- **40–69**: Amber — "Proceed with caution"
- **< 40**: Red — "Do not trade" + 15-minute cooldown stored in localStorage.

### 6d. `app/log/page.tsx` — Trade Logger

```tsx
"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { getTrades, saveTrade, deleteTrade, getEmotionBg, Trade } from "@/lib/storage";
import { ClipboardList, Check, Trash2, ArrowUpRight, ArrowDownRight, StickyNote } from "lucide-react";

const EMOTIONS = ["Planned", "FOMO", "Revenge", "Boredom", "Greed", "Hope"];

export default function LogPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [emotion, setEmotion] = useState("Planned");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [side, setSide] = useState<"Long" | "Short">("Long");
  const [entryPrice, setEntryPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { setTrades(getTrades()); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!symbol.trim()) return;
    const trade: Trade = {
      id: Date.now().toString(), emotion, symbol: symbol.trim().toUpperCase(),
      quantity: parseInt(quantity) || 0, side, entryPrice: parseFloat(entryPrice) || 0, notes,
      timestamp: new Date().toISOString(),
    };
    saveTrade(trade); setTrades(getTrades());
    setEmotion("Planned"); setSymbol(""); setQuantity(""); setSide("Long"); setEntryPrice(""); setNotes("");
    setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDelete = (id: string) => { deleteTrade(id); setTrades(getTrades()); };
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1"><ClipboardList size={24} className="text-[#22c55e]" /><h1 className="text-xl font-bold tracking-tight">Log Trade</h1></div>
        <p className="text-[#8b8ba0] text-sm">Record every trade with its emotional driver.</p>
      </header>

      {showSuccess && (
        <div className="mb-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 p-3 flex items-center gap-2 text-[#22c55e] animate-score-reveal">
          <Check size={18} /><span className="text-sm font-medium">Trade logged successfully</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">Emotion Type</label>
          <select value={emotion} onChange={(e) => setEmotion(e.target.value)} className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#6366f1]/50">
            {EMOTIONS.map((e) => (<option key={e} value={e}>{e}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">Symbol</label>
            <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="NIFTY" required className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50 uppercase" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">Qty</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="50" className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">Side</label>
            <div className="flex rounded-xl bg-[#1a1a2e] border border-white/10 p-1">
              <button type="button" onClick={() => setSide("Long")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${side === "Long" ? "bg-[#22c55e]/20 text-[#22c55e]" : "text-[#8b8ba0]"}`}>Long</button>
              <button type="button" onClick={() => setSide("Short")} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${side === "Short" ? "bg-[#ef4444]/20 text-[#ef4444]" : "text-[#8b8ba0]"}`}>Short</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">Entry Price</label>
            <input type="number" step="0.01" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="24500.50" className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why are you taking this trade?" rows={2} className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50 resize-none" />
        </div>
        <button type="submit" className="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-semibold transition-colors active:scale-[0.98]">Log Trade</button>
      </form>

      <section>
        <h2 className="text-sm font-semibold text-[#8b8ba0] uppercase tracking-wider mb-3">Recent Trades</h2>
        {trades.length === 0 ? (
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-6 text-center">
            <ClipboardList size={32} className="text-[#8b8ba0] mx-auto mb-3" />
            <p className="text-[#8b8ba0] text-sm">No trades logged yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.slice(0, 10).map((trade) => (
              <div key={trade.id} className="rounded-xl bg-[#13131f] border border-white/5 p-3 flex items-center gap-3">
                <div className="shrink-0">
                  {trade.side === "Long" ? (
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center"><ArrowUpRight size={16} className="text-[#22c55e]" /></div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center"><ArrowDownRight size={16} className="text-[#ef4444]" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{trade.symbol}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getEmotionBg(trade.emotion)}`}>{trade.emotion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b8ba0] text-xs">
                    <span>{trade.side}</span>
                    {trade.quantity > 0 && <span>&middot; {trade.quantity} qty</span>}
                    {trade.entryPrice > 0 && <span>&middot; @ {trade.entryPrice}</span>}
                  </div>
                  {trade.notes && <p className="text-xs text-[#8b8ba0]/70 mt-1 truncate"><StickyNote size={10} className="inline mr-1" />{trade.notes}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-[#8b8ba0]">{formatTime(trade.timestamp)}</p>
                  <p className="text-[10px] text-[#8b8ba0]/60">{formatDate(trade.timestamp)}</p>
                </div>
                <button onClick={() => handleDelete(trade.id)} className="shrink-0 p-1.5 rounded-lg text-[#8b8ba0] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Navigation />
    </div>
  );
}
```

### 6e. `app/summary/page.tsx` — Weekly Summary

```tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { getTradesForWeek, getWeekStart, getEmotionBg, getEmotionColor, Trade } from "@/lib/storage";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, Zap, AlertCircle } from "lucide-react";

export default function SummaryPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);

  const weekStart = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - weekOffset * 7); return getWeekStart(d); }, [weekOffset]);
  const weekEnd = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); d.setHours(23, 59, 59, 999); return d; }, [weekStart]);

  useEffect(() => { setTrades(getTradesForWeek(weekStart)); }, [weekStart]);

  const stats = useMemo(() => {
    const total = trades.length;
    const planned = trades.filter((t) => t.emotion === "Planned").length;
    const emotional = total - planned;
    const plannedPct = total > 0 ? Math.round((planned / total) * 100) : 0;
    const emotionalPct = total > 0 ? Math.round((emotional / total) * 100) : 0;
    const emotionCounts: Record<string, number> = {};
    for (const t of trades) { emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1; }
    return { total, planned, emotional, plannedPct, emotionalPct, emotionCounts };
  }, [trades]);

  const weekLabel = useMemo(() => {
    const startStr = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const endStr = weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${startStr} - ${endStr}`;
  }, [weekStart, weekEnd]);

  const emotionBreakdown = useMemo(() => {
    const allEmotions = ["Planned", "FOMO", "Revenge", "Boredom", "Greed", "Hope"];
    return allEmotions.map((emotion) => {
      const count = stats.emotionCounts[emotion] || 0;
      const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
      return { emotion, count, pct };
    }).filter((e) => e.count > 0);
  }, [stats]);

  return (
    <div className="px-4 pt-6 pb-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1"><BarChart3 size={24} className="text-[#f59e0b]" /><h1 className="text-xl font-bold tracking-tight">Weekly Summary</h1></div>
        <p className="text-[#8b8ba0] text-sm">Emotional vs planned trade ratio</p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setWeekOffset((p) => Math.min(p + 1, 2))} className="px-3 py-1.5 rounded-lg bg-[#13131f] border border-white/5 text-sm text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors" disabled={weekOffset >= 2}>&larr; Prev</button>
        <div className="flex items-center gap-2 text-sm text-[#f0f0f5]"><Calendar size={14} className="text-[#8b8ba0]" /><span className="font-medium">{weekLabel}</span></div>
        <button onClick={() => setWeekOffset((p) => Math.max(p - 1, 0))} className="px-3 py-1.5 rounded-lg bg-[#13131f] border border-white/5 text-sm text-[#8b8ba0] hover:text-[#f0f0f5] transition-colors" disabled={weekOffset <= 0}>Next &rarr;</button>
      </div>

      {stats.total === 0 ? (
        <div className="rounded-2xl bg-[#13131f] border border-white/5 p-8 text-center">
          <BarChart3 size={40} className="text-[#8b8ba0] mx-auto mb-3" />
          <p className="text-[#8b8ba0] text-sm mb-1">No trades logged this week</p>
          <p className="text-[#8b8ba0]/60 text-xs">Go to Log Trade to start recording</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2"><Target size={14} className="text-[#22c55e]" /><span className="text-xs text-[#8b8ba0] uppercase tracking-wider">Planned</span></div>
              <p className="text-2xl font-bold text-[#22c55e]">{stats.planned}</p>
              <p className="text-xs text-[#8b8ba0]">{stats.plannedPct}% of trades</p>
            </div>
            <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2"><Zap size={14} className="text-[#ef4444]" /><span className="text-xs text-[#8b8ba0] uppercase tracking-wider">Emotional</span></div>
              <p className="text-2xl font-bold text-[#ef4444]">{stats.emotional}</p>
              <p className="text-xs text-[#8b8ba0]">{stats.emotionalPct}% of trades</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6">
            <div className="flex items-center justify-between mb-3"><span className="text-sm font-medium">Planned vs Emotional</span><span className="text-xs text-[#8b8ba0]">{stats.total} trades</span></div>
            <div className="h-4 rounded-full bg-[#1a1a2e] overflow-hidden flex mb-2">
              {stats.plannedPct > 0 && <div className="h-full bg-[#22c55e] transition-all duration-500" style={{ width: `${stats.plannedPct}%` }} />}
              {stats.emotionalPct > 0 && <div className="h-full bg-[#ef4444] transition-all duration-500" style={{ width: `${stats.emotionalPct}%` }} />}
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /><span className="text-[#8b8ba0]">Planned {stats.plannedPct}%</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /><span className="text-[#8b8ba0]">Emotional {stats.emotionalPct}%</span></div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6">
            <div className="flex items-center gap-3">
              {stats.plannedPct >= 70 ? (
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center"><TrendingUp size={20} className="text-[#22c55e]" /></div>
              ) : stats.plannedPct >= 40 ? (
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center"><AlertCircle size={20} className="text-[#f59e0b]" /></div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/10 flex items-center justify-center"><TrendingDown size={20} className="text-[#ef4444]" /></div>
              )}
              <div>
                <p className="text-sm font-medium">
                  {stats.plannedPct >= 70 ? "Strong Discipline" : stats.plannedPct >= 40 ? "Mixed Discipline" : "Weak Discipline"}
                </p>
                <p className="text-xs text-[#8b8ba0]">
                  {stats.plannedPct >= 70 ? "Most trades are planned. Keep it up!" : stats.plannedPct >= 40 ? "You're slipping into emotion. Tighten your process." : "Most trades are emotional. Step back and review."}
                </p>
              </div>
            </div>
          </div>

          {emotionBreakdown.length > 0 && (
            <div className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-6">
              <h3 className="text-sm font-medium mb-3">Emotion Breakdown</h3>
              <div className="space-y-3">
                {emotionBreakdown.map((item) => (
                  <div key={item.emotion}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getEmotionBg(item.emotion)}`}>{item.emotion}</span>
                      <span className="text-xs text-[#8b8ba0]">{item.count} trades ({Math.round(item.pct)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1a1a2e] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: getEmotionColor(item.emotion) }} />
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
```

---

## 7. Shared Components

### 7a. `components/Navigation.tsx` — Bottom Tab Bar

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShieldCheck, ClipboardList, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/check", label: "Check", icon: ShieldCheck },
  { href: "/log", label: "Log", icon: ClipboardList },
  { href: "/summary", label: "Summary", icon: BarChart3 },
];

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-all duration-200 active:scale-95 ${isActive ? "text-[#6366f1] bg-[#6366f1]/10" : "text-[#8b8ba0] hover:text-[#f0f0f5]"}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 7b. `components/ScoreRing.tsx` — Circular Progress

```tsx
"use client";

import { useMemo } from "react";

interface ScoreRingProps { score: number; size?: number; strokeWidth?: number; }

export default function ScoreRing({ score, size = 120, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = useMemo(() => { if (score >= 70) return "#22c55e"; if (score >= 40) return "#f59e0b"; return "#ef4444"; }, [score]);

  return (
    <div className="relative flex items-center justify-center animate-score-reveal">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1a1a2e" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-[#8b8ba0] uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}
```

### 7c. `components/ServiceWorkerRegister.tsx` — PWA Registration

```tsx
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* Silent fail */ });
    }
  }, []);
  return null;
}
```

---

## 8. Configuration Files

### `next.config.ts`
```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: 'export', images: { unoptimized: true } };
export default nextConfig;
```

### `tsconfig.json`
- Standard Next.js TypeScript config with `strict: true`, `paths: { "@/*": ["./*"] }`.

### `postcss.config.mjs`
```javascript
export default { plugins: { "@tailwindcss/postcss": {} } };
```

### `eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

### `package.json` (app)
```json
{
  "name": "tiltcheck",
  "version": "0.1.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start", "lint": "eslint" },
  "dependencies": { "@vercel/analytics": "^2.0.1", "lucide-react": "^1.21.0", "next": "16.2.9", "react": "19.2.4", "react-dom": "19.2.4" },
  "devDependencies": { "@tailwindcss/postcss": "^4", "@types/node": "^20", "@types/react": "^19", "@types/react-dom": "^19", "eslint": "^9", "eslint-config-next": "16.2.9", "tailwindcss": "^4", "typescript": "^5" }
}
```

### `public/manifest.json`
```json
{
  "name": "TiltCheck",
  "short_name": "TiltCheck",
  "description": "Emotional discipline companion for Indian F&O traders",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#0a0a0f",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    { "src": "/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
    { "src": "/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
  ]
}
```

### `public/sw.js` (Service Worker)
```javascript
const CACHE_NAME = 'tiltcheck-static-v1';
const PAGES_CACHE = 'tiltcheck-pages-v1';
const STATIC_ASSETS = ['/', '/check', '/log', '/summary', '/manifest.json', '/sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => Promise.all(cacheNames.filter((name) => name !== CACHE_NAME && name !== PAGES_CACHE).map((name) => caches.delete(name)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event; const url = new URL(request.url);
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font' || url.pathname.startsWith('/_next/') || url.pathname.startsWith('/icon-') || url.pathname.startsWith('/favicon') || url.pathname === '/manifest.json' || url.pathname === '/sw.js') {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.status === 200) { caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())); } return response; }).catch(() => new Response('Offline', { status: 503 }))));
    return;
  }
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request).then((response) => { if (response.status === 200) { caches.open(PAGES_CACHE).then((cache) => cache.put(request, response.clone())); } return response; }).catch(() => caches.match(request).then((cached) => cached || caches.match('/').then((fallback) => fallback || new Response('Offline', { status: 503 })))));
    return;
  }
  event.respondWith(fetch(request).catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 }))));
});
```

---

## 9. CSS / Theme (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #0a0a0f;
  --color-bg-card: #13131f;
  --color-bg-elevated: #1a1a2e;
  --color-text-primary: #f0f0f5;
  --color-text-secondary: #8b8ba0;
  --color-accent: #6366f1;
  --color-accent-light: #818cf8;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

body { background-color: #0a0a0f; color: #f0f0f5; -webkit-tap-highlight-color: transparent; overscroll-behavior-y: none; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 4px; }

input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; background: #1a1a2e; outline: none; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 3px solid #0a0a0f; box-shadow: 0 0 0 2px #6366f1; }
input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: #6366f1; cursor: pointer; border: 3px solid #0a0a0f; box-shadow: 0 0 0 2px #6366f1; }

select { -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,...chevron..."); background-repeat: no-repeat; background-position: right 12px center; background-size: 18px; }

@keyframes danger-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 50% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); } }
.animate-danger-pulse { animation: danger-pulse 2s ease-in-out infinite; }

@keyframes score-reveal { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.animate-score-reveal { animation: score-reveal 0.4s ease-out forwards; }
```

---

## 10. Deployment

- **Platform**: Vercel (root `.vercel` directory present).
- **Output**: Static export (`out/` directory after build).
- **Domain**: Likely deployed at `tiltcheck.vercel.app` (referenced in share text).
- **Build command**: `npm run build` (produces `out/` folder with static HTML/CSS/JS).

---

## 11. Known Issues / Limitations

1. **No user accounts or auth** — All data is local to the browser/device. Clearing browser data wipes all trades and cooldowns.
2. **No cloud sync** — A user cannot access their data across devices.
3. **No exit price / P&L tracking** — The logger only captures entry details, not trade outcomes.
4. **Cooldown is per-device** — Switching browsers or incognito bypasses the cooldown.
5. **Week range is hardcoded Sunday–Saturday** — Indian markets trade Mon–Fri, so some weeks may show empty days at start/end.
6. **No chart library** — All visualizations are CSS bars (intentional, keeps bundle small).
7. **Static export limitations** — Next.js Image component requires `unoptimized: true`.

---

## 12. Potential Roadmap / Plans

Based on the design document and current architecture, logical next features could be:

1. **Exit Trade Tracking** — Add exit price, P&L, and a trade outcome flag (Win/Loss/Break-even) to the log form.
2. **Daily Journal / Notes** — A free-text daily reflection note separate from individual trades.
3. **Export Data** — Export `localStorage` data as JSON or CSV for backup/analysis.
4. **Push Notifications** — Reminder to do the Pre-Trade Check before market open (9:15 AM IST).
5. **Cloud Sync / Auth** — Add lightweight auth (Clerk/Supabase) to sync trades across devices.
6. **Customizable Questions** — Let users edit the 5 Pre-Trade Check questions.
7. **Cooldown Customization** — Let users adjust the cooldown duration or disable it.
8. **Trade Outcome Analytics** — Correlate emotional trades with win/loss rates.
9. **Market Hours Awareness** — Block trades entirely outside Indian market hours (9:15 AM – 3:30 PM IST).
10. **Multi-Week History** — Summary currently limits to 3 weeks; allow infinite scroll back.
11. **Dark/Light Theme Toggle** — Currently hardcoded dark only.
12. **Haptic Feedback** — Add `navigator.vibrate` on button presses for mobile PWA feel.

---

## 13. How to Modify This Project

### Run locally
```bash
cd tiltcheck
npm install
npm run dev        # localhost:3000
npm run build      # static export to out/
```

### Add a new page
1. Create `app/newpage/page.tsx`.
2. Add route to `Navigation.tsx` navItems array.
3. Add to `public/sw.js` STATIC_ASSETS if offline support is needed.

### Change the color theme
Edit the `@theme` block in `app/globals.css` and the hardcoded Tailwind classes throughout the components.

### Change the questions
Edit the `QUESTIONS` array in `app/check/page.tsx`.

### Add a new emotion
Add to `EMOTIONS` array in `app/log/page.tsx`, and add color mappings in `lib/storage.ts` (`getEmotionColor` and `getEmotionBg`).

### Add a new localStorage key
Add to `STORAGE_KEYS` in `lib/storage.ts` and write getter/setter functions following the existing `try/catch` + `typeof window` guard patterns.

---

*End of Full Context Document*
