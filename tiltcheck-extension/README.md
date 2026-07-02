# TiltCheck Emergency Cool-Down

> An **Emergency Circuit Breaker** for crypto traders. One click instantly locks you out of the charts and redirects you to a forced cool-down session—preventing emotional revenge trades before they happen.

---

## Purpose

Revenge trading is the #1 killer of trading accounts. When a stop-loss is hit or a position goes sideways, adrenaline floods the decision-making process. TiltCheck acts as a **physical circuit breaker** for your browser. A high-visibility emergency button lives directly on the trading sites you use most, giving you a single, frictionless escape hatch to break the emotional loop and protect your capital.

No willpower required. Just click the button and step away.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Multi-Platform Support** | Injects seamlessly into **pump.fun**, **DexScreener**, and **TradingView**—the three most common venues for emotional over-trading. |
| **Instant Redirect** | One click immediately navigates the active tab away from the exchange and into a **15-minute disciplined lockout session** at [tiltcheck.vercel.app](https://tiltcheck.vercel.app). |
| **SPA-Resilient Injection** | Survives React/Vue/Angular route changes. If the site swaps the DOM underneath you, the button re-appears automatically within milliseconds. |
| **High-Urgency Visual Design** | Bright crimson (`#ff0033`), fixed-position, terminal-aesthetic button with maximum z-index to stay above every popup, banner, or overlay. |
| **Zero Telemetry** | **No analytics, no tracking pixels, no external network calls, no backend.** The extension is a 100% client-side DOM injector. It does not read, collect, or transmit any trading data, wallet addresses, or personal information. |
| **Privacy-First Permissions** | Manifest V3 with an empty `permissions` array. The only host permission is the redirect destination itself. |

---

## Installation Guide (Chrome — Unpacked Extension)

1. **Download or clone** this repository to a folder on your machine.

2. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions/
   ```

3. Toggle **Developer mode** to **ON** in the top-right corner.

4. Click the **Load unpacked** button that appears in the top-left.

5. Select the `tiltcheck-extension` folder (the one containing `manifest.json`) and click **Select Folder**.

6. The **TiltCheck Emergency Cool-Down** tile will appear in your extensions list with a green dot confirming it is active.

7. (Optional) Click the **pin icon** next to the extension to keep it visible in your toolbar for quick access.

8. Visit **pump.fun**, **dexscreener.com**, or **tradingview.com**. The crimson **Emergency Cool-Down** button will appear in the **top-left corner** of the page.

9. Click the button anytime you feel the urge to revenge-trade. You will be instantly redirected to your cool-down session.

> **Note:** If you update any files in the extension folder, return to `chrome://extensions/` and click the **refresh icon** (circular arrow) on the TiltCheck tile to reload the changes.

---

## Security Assurance

**TiltCheck Emergency Cool-Down is completely client-side.**

- It does not communicate with any external server.
- It does not collect, store, or transmit any user data, trading history, wallet addresses, or IP addresses.
- It does not modify trading orders, wallet transactions, or site functionality beyond injecting a single HTML button.
- It does not use analytics, error-reporting, or cloud-based services of any kind.
- The only outbound action is a standard browser redirect to `https://tiltcheck.vercel.app` **when you voluntarily click the button**.

The entire codebase is open-source and contained in three small files: `manifest.json`, `content.js`, and `styles.css`. You can audit every line before installing.

---

## Tech Stack

- **Manifest V3** — Latest Chrome extension format with strict permission scoping.
- **Vanilla JavaScript** — No frameworks, no build step, no dependencies.
- **Pure CSS** — `!important`-hardened styles to survive aggressive site resets.
- **MutationObserver** — Lightweight DOM watcher for SPA resilience.

---

## License

This project is open-source and provided as-is for the trading community. Use it, fork it, and improve it.

**Trade smart. Stay disciplined. 🛡️**
