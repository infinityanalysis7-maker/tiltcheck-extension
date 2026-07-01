# TiltCheck + DRE-Monitor

> **A behavioral circuit breaker for traders who are serious about protecting their capital from themselves.**

Stop revenge trading before it destroys your account.

**DRE-Monitor** detects emotional risk on TradingView.

**TiltCheck** interrupts execution by forcing a cool-down before you can place another trade.

Together they create a behavioral circuit breaker between impulse and execution.

---

# 🎥 Demo

## Live Demo

https://tiltcheck-app.vercel.app

## Demo Video

https://youtu.be/YOUR_VIDEO_LINK

---

# 📸 Screenshots

> Add screenshots here after uploading them.

- Home
- Pre-Trade Check
- Trade Journal
- Weekly Summary
- TradingView Emergency Cool-Down Button

---

# ✨ Features

- 🧠 Pre-Trade Discipline Check
- 📒 Emotional Trade Journal
- 📊 Weekly Discipline Summary
- 🚨 Emergency Cool-Down Button
- 📉 DRE-Monitor TradingView Indicator
- 🔒 Behavioral Circuit Breaker
- 🌐 Works directly inside your browser
- 🔓 Fully Open Source
- 🔐 Privacy First
- 🚫 Zero Analytics
- 🚫 Zero Tracking
- 🚫 No Backend Required

---

# The Problem

Most traders don't lose because they lack strategy.

They lose because one emotional decision turns into ten.

After a large loss, stress hormones reduce rational thinking. At that point you stop following your plan and start trying to "win it back."

That is where revenge trading begins.

Most trading tools help you analyze the market.

TiltCheck helps you manage **yourself.**

---

# The Solution

TiltCheck consists of two independent layers working together.

| Layer | Purpose | Trigger |
|-------|---------|---------|
| **DRE-Monitor** | Detects dangerous emotional conditions using drawdown and consecutive adverse bars. | Risk threshold reached |
| **TiltCheck Extension** | Forces an immediate cool-down before another emotional trade can happen. | Manual activation or TradingView alert |

**DRE-Monitor is the sensor.**

**TiltCheck is the lock.**

Together they create a simple feedback loop:

Detect emotional risk → Interrupt trading → Allow time to reset.

---

# Why This Combination Matters

Most traders already know they should walk away.

The problem is that emotions happen faster than discipline.

Traditional alerts only notify you.

Traditional website blockers depend on you remembering to use them.

TiltCheck combines both.

1. **DRE-Monitor** measures emotional danger objectively.
2. **TiltCheck** removes the ability to immediately act on that emotion.

That small gap between impulse and execution is where most revenge trades happen.

TiltCheck closes that gap.

---

# 🏗 Architecture

```mermaid
flowchart LR

A[TradingView Chart]
-->B[DRE-Monitor]

B
-->C[TradingView Alert]

C
-->D[TiltCheck Extension]

D
-->E[Emergency Cool-Down]

E
-->F[TiltCheck Web App]

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
