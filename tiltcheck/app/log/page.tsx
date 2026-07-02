"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Toast from "@/components/Toast";
import {
  getTrades,
  saveTrade,
  deleteTrade,
  getEmotionBg,
  getTodayOfficialSession,
  getTodayTradeCount,
  isFirstSessionComplete,
  markFirstSessionComplete,
  Trade,
} from "@/lib/storage";
import Link from "next/link";
import {
  ClipboardList,
  Check,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  StickyNote,
  ArrowLeft,
} from "lucide-react";

const EMOTIONS = [
  "Planned",
  "FOMO",
  "Revenge",
  "Boredom",
  "Greed",
  "Hope",
];

export default function LogPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [emotion, setEmotion] = useState("Planned");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [side, setSide] = useState<"Long" | "Short">(
    "Long"
  );
  const [entryPrice, setEntryPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFirstSessionToast, setShowFirstSessionToast] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setTrades(getTrades());
  }, []);

  const checkAndShowFirstSessionToast = () => {
    const hasCheckToday = getTodayOfficialSession() !== null;
    const wasFirstTradeToday = getTodayTradeCount() === 1;
    const alreadyCelebrated = isFirstSessionComplete();

    if (hasCheckToday && wasFirstTradeToday && !alreadyCelebrated) {
      markFirstSessionComplete();
      setShowFirstSessionToast(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    const trade: Trade = {
      id: Date.now().toString(),
      emotion,
      symbol: symbol.trim().toUpperCase(),
      quantity: parseInt(quantity) || 0,
      side,
      entryPrice: parseFloat(entryPrice) || 0,
      notes,
      timestamp: new Date().toISOString(),
    };

    saveTrade(trade);
    setTrades(getTrades());
    checkAndShowFirstSessionToast();

    // Reset form
    setEmotion("Planned");
    setSymbol("");
    setQuantity("");
    setSide("Long");
    setEntryPrice("");
    setNotes("");

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    deleteTrade(id);
    setTrades(getTrades());
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
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
          <ClipboardList
            size={24}
            className="text-[#22c55e]"
          />
          <h1 className="text-xl font-bold tracking-tight">
            Log Trade
          </h1>
        </div>
        <p className="text-[#8b8ba0] text-sm">
          Record every trade with its emotional driver.
        </p>
      </header>

      {/* Success toast */}
      {showSuccess && (
        <div
          className="mb-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 p-3 flex items-center gap-2 text-[#22c55e] animate-score-reveal"
          role="alert"
        >
          <Check size={18} />
          <span className="text-sm font-medium">
            Trade logged successfully
          </span>
        </div>
      )}

      {/* Log form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-[#13131f] border border-white/5 p-4 mb-5 space-y-4"
      >
        <div>
          <label
            htmlFor="emotion-select"
            className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2"
          >
            Emotion Type
          </label>
          <select
            id="emotion-select"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] focus:outline-none focus:border-[#6366f1]/50"
          >
            {EMOTIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="symbol-input"
              className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2"
            >
              Symbol
            </label>
            <input
              id="symbol-input"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="NIFTY"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50 uppercase"
              required
            />
          </div>
          <div>
            <label
              htmlFor="qty-input"
              className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2"
            >
              Qty
            </label>
            <input
              id="qty-input"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="50"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2">
              Side
            </label>
            <div
              className="flex rounded-xl bg-[#1a1a2e] border border-white/10 p-1"
              role="radiogroup"
              aria-label="Trade side"
            >
              <button
                type="button"
                onClick={() => setSide("Long")}
                role="radio"
                aria-checked={side === "Long"}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  side === "Long"
                    ? "bg-[#22c55e]/20 text-[#22c55e]"
                    : "text-[#8b8ba0]"
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setSide("Short")}
                role="radio"
                aria-checked={side === "Short"}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  side === "Short"
                    ? "bg-[#ef4444]/20 text-[#ef4444]"
                    : "text-[#8b8ba0]"
                }`}
              >
                Short
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="price-input"
              className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2"
            >
              Entry Price
            </label>
            <input
              id="price-input"
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) =>
                setEntryPrice(e.target.value)
              }
              placeholder="24500.50"
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="notes-input"
            className="block text-xs font-medium text-[#8b8ba0] uppercase tracking-wider mb-2"
          >
            Notes
          </label>
          <textarea
            id="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why are you taking this trade?"
            rows={2}
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-3 text-sm text-[#f0f0f5] placeholder-[#8b8ba0]/50 focus:outline-none focus:border-[#6366f1]/50 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-semibold transition-colors active:scale-[0.98]"
        >
          Log Trade
        </button>
      </form>

      {/* Trade history */}
      <section>
        <h2 className="text-sm font-semibold text-[#8b8ba0] uppercase tracking-wider mb-3">
          Recent Trades
        </h2>
        {trades.length === 0 ? (
          <div className="rounded-2xl bg-[#13131f] border border-white/5 p-6 text-center">
            <ClipboardList
              size={32}
              className="text-[#8b8ba0] mx-auto mb-3"
            />
            <p className="text-[#8b8ba0] text-sm mb-1">
              No trades logged yet.
            </p>
            <p className="text-[#8b8ba0]/60 text-xs">
              Start logging to discover emotional patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {trades.slice(0, 10).map((trade) => (
              <div
                key={trade.id}
                className="rounded-xl bg-[#13131f] border border-white/5 p-3 flex items-center gap-3"
              >
                <div className="shrink-0">
                  {trade.side === "Long" ? (
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                      <ArrowUpRight
                        size={16}
                        className="text-[#22c55e]"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                      <ArrowDownRight
                        size={16}
                        className="text-[#ef4444]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">
                      {trade.symbol}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getEmotionBg(
                        trade.emotion
                      )}`}
                    >
                      {trade.emotion}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b8ba0] text-xs">
                    <span>{trade.side}</span>
                    {trade.quantity > 0 && (
                      <span>
                        &middot; {trade.quantity} qty
                      </span>
                    )}
                    {trade.entryPrice > 0 && (
                      <span>
                        &middot; @ {trade.entryPrice}
                      </span>
                    )}
                  </div>
                  {trade.notes && (
                    <p className="text-xs text-[#8b8ba0]/70 mt-1 truncate">
                      <StickyNote
                        size={10}
                        className="inline mr-1"
                      />
                      {trade.notes}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-[#8b8ba0]">
                    {formatTime(trade.timestamp)}
                  </p>
                  <p className="text-[10px] text-[#8b8ba0]/60">
                    {formatDate(trade.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(trade.id)}
                  className="shrink-0 p-1.5 rounded-lg text-[#8b8ba0] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label={`Delete trade ${trade.symbol}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Navigation />

      {showFirstSessionToast && (
        <Toast
          message="Nice work. You completed your first disciplined trading session."
          onClose={() => setShowFirstSessionToast(false)}
        />
      )}
    </div>
  );
}
