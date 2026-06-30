 DRE-Monitor + TiltCheck

> A two-part **behavioral circuit breaker** for traders who are serious about protecting their capital from themselves.

---

## The Problem

Every blown account has the same DNA: a disciplined trader, one bad loss, and a split-second emotional decision to "get it back."

Revenge trading is not a strategy problem. It is a **biological problem**. When adrenaline floods your system after a stop-loss breach, your prefrontal cortex—the part of your brain responsible for rational decision-making—goes offline. You are no longer trading. You are gambling. And the charts are designed to keep you clicking.

The market does not care about your emotions. But your **account** does.

---

## The Solution

This repository contains a **two-layer safety net** that separates emotional impulse from execution:

| Layer | What It Does | When It Fires |
|-------|-------------|---------------|
| **DRE-Monitor** (TradingView) | Quantifies your risk state in real-time using drawdown % and consecutive adverse bars. | When you hit your pre-defined risk threshold. |
| **TiltCheck Extension** (Browser) | Physically locks you out of trading sites and forces a 15-minute cool-down. | When DRE-Monitor fires, or when you manually hit the Emergency Cool-Down button. |

**DRE-Monitor is the sensor. TiltCheck is the lock.**

Used together, they create an automated pipeline that detects danger *before* you act on it—and then removes your ability to act until your nervous system has reset. It is the trading equivalent of a breathalyzer on a car ignition.

---

## Why the Combination Matters

Alert fatigue is real. Most traders set mental stop-losses and then ignore them. Most traders know they should walk away—and then scroll back to the chart 90 seconds later.

A standalone alert tells you what you already know. A standalone blocker requires you to remember to use it in the heat of the moment.

**The combination solves both failures:**

1. **DRE-Monitor** removes the burden of self-assessment. It tracks your drawdown and consecutive losses with mathematical precision. It does not get tired. It does not rationalize. It simply measures when you have entered the **Emotional Decision Zone**.

2. **TiltCheck** removes the burden of self-control. Once triggered, it does not ask you if you want to lock out. It locks you out. You cannot override it. You cannot negotiate with it. You can only wait.

That gap—between the alert and the lock—is where most revenge trades die. This system closes it.

---

## Architecture Overview
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  TradingView    │────▶│  DRE-Monitor     │────▶│  TradingView     │
│  Chart          │     │  (Pine Script)   │     │  Alert System    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
│
│ (Webhook / Notification)
▼
┌──────────────────┐
│  TiltCheck       │
│  Browser         │
│  Extension       │
└──────────────────┘
│
│ (Instant Redirect)
▼
┌──────────────────┐
│  tiltcheck.      │
│  vercel.app      │
│  (15-Min Lockout)│
└──────────────────┘
plain
Copy

*Note: The DRE-Monitor alert can be routed to any TradingView notification channel (push, email, webhook). The browser extension also provides a manual Emergency Cool-Down button on every supported trading site for immediate, self-directed intervention.*

---

## Getting Started

### Step 1: Add the DRE-Monitor Pine Script to TradingView

1. Open **TradingView** in your browser and load any chart.

2. Click **Pine Editor** at the bottom of the screen.

3. Delete the default template code in the editor.

4. Copy the entire contents of `RiskExhaustionMonitor.pine` from this repository and paste it into the Pine Editor.

5. Click **Add to Chart** (or press `Ctrl + S` / `Cmd + S`).

6. The indicator will appear in a separate pane below your chart. Configure your risk thresholds in the **Settings** panel:
   - **Moving Average Length** (e.g., `21`)
   - **Max Consecutive Adverse Bars** (e.g., `3`)
   - **Max Drawdown % from Session High** (e.g., `3.0`)

7. Set up an **Alert** on the indicator:
   - Right-click the indicator pane → **Add Alert**.
   - Choose **DRE-Monitor** as the condition.
   - Select **Risk Exhaustion** as the trigger.
   - Choose your notification method (app, email, or webhook).

*The DRE-Monitor is now live. It will watch your chart 24/7 and alert you the moment you enter the Emotional Decision Zone.*

---

### Step 2: Install the TiltCheck Browser Extension

#### Chrome (Unpacked Extension)

1. Download or clone this repository to your local machine.

2. Open **Google Chrome** and navigate to:
chrome://extensions/
plain
Copy

3. Toggle **Developer mode** to **ON** in the top-right corner.

4. Click **Load unpacked** in the top-left.

5. Select the `tiltcheck-extension` folder (the one containing `manifest.json`) and click **Select Folder**.

6. The **TiltCheck Emergency Cool-Down** tile will appear with a green dot. (Optional: click the **pin icon** to keep it in your toolbar.)

7. Visit **pump.fun**, **dexscreener.com**, or **tradingview.com**. A bright crimson **Emergency Cool-Down** button will appear in the **top-left corner** of the page.

8. Click the button anytime you feel the urge to revenge-trade. You will be instantly redirected to a **15-minute disciplined lockout** at `tiltcheck.vercel.app`.

> **Tip:** The button survives SPA route changes. If the site swaps the DOM underneath you, it re-injects automatically within milliseconds.

---

## Security & Privacy

This system is designed with a **zero-trust, zero-telemetry** philosophy:

- **No external data collection.** The extension does not read, store, or transmit trading data, wallet addresses, or personal information.
- **No analytics.** No tracking pixels. No error reporting. No cloud services.
- **No backend.** The Pine Script runs entirely inside TradingView. The extension runs entirely inside your browser. The only outbound action is a voluntary redirect when you click the button.
- **Open-source auditability.** The entire codebase is contained in three small, readable files. You can verify every line before installing.

**Your risk data is yours. Your privacy is yours.**

---

## How It Works (For the Curious)

### DRE-Monitor Mathematical Logic

The script tracks two independent risk metrics:

1. **Peak-to-Trough Drawdown:** `((SessionHigh - Close) / SessionHigh) * 100`
   - A running percentage decline from the highest price achieved since the indicator loaded.
   - Updates only when a new high is printed, creating a natural recovery mechanism.

2. **Consecutive Adverse Bars:** A counter of uninterrupted bars where `Close < MA` (and optionally `Close < Open`).
   - Resets to zero on the first non-adverse bar, ensuring the count reflects sustained momentum against your position.

Both metrics are gated by `barstate.isconfirmed` to eliminate repainting. A one-shot `breachFired` latch prevents alert spam.

### TiltCheck Extension Logic

The extension uses a **MutationObserver** to watch for DOM changes on modern SPAs. It injects a fixed-position button with `z-index: 2147483647` (maximum safe value) to survive every banner, popup, and overlay. On click, it simulates a native `<a>` element click with `target="_top"` to force a full-tab redirect, breaking out of any iframe context.

---

## License

This project is open-source and provided as-is for the trading community. Use it, fork it, improve it, and share it with traders who need it.

**Trade smart. Stay disciplined. 🛡️**
