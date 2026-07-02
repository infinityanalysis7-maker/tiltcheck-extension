<p align="center">
  <img src="assets/hero.png" width="140" alt="TiltCheck Logo">
</p>

<h1 align="center">TiltCheck</h1>

<p align="center">
Stop revenge trading before it starts.
</p>

<p align="center">
  <a href="https://github.com/infinityanalysis7-maker/tiltcheck-extension/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/PWA-ready-success" alt="PWA">
  <img src="https://img.shields.io/badge/Open%20Source-Yes-orange" alt="Open Source">
</p>

<p align="center">
An open-source, privacy-first trading discipline app that helps traders build consistent habits through readiness checks, trade journaling, and behavioral lockouts.
</p>

<p align="center">
<strong>100% open source. 100% local-first. Zero tracking.</strong>
</p>

---

## Demo

🌐 **Live App** — [tiltcheck.vercel.app](https://tiltcheck.vercel.app)

📹 **Demo Video** — Coming soon

---

## Who is TiltCheck for?

- Day traders, swing traders, futures traders, options traders
- Anyone who struggles with revenge trading or emotional execution
- Traders who want to build consistent pre-trade routines
- Anyone tired of blowing accounts because they broke their own rules

---

## Why TiltCheck?

Most traders don't lose because of bad strategies.

They lose because they abandon their strategy.

TiltCheck is a **behavioral circuit breaker** that helps you pause, reflect, and stick to your trading plan before emotions take over.

---

## Features

- ✅ **Daily Readiness Check** — 5-question assessment that scores your mental state
- 📝 **Trade Journal & Review** — Log every trade with entry, exit, P&L, screenshots, and notes
- 📊 **Session Summary** — Review behavioral patterns and daily stats
- 🔥 **Discipline Streaks** — Build momentum by completing your daily routine
- 🛑 **Progressive Lockouts** — Escalating cool-downs when you trade while tilted
- 🔒 **Privacy First** — No cloud, no accounts, no telemetry
- 💾 **Local Storage Only** — Your data stays on your device. Export or delete anytime.

---

## Screenshots

## Screenshots

<p align="center">
  <img src="assets/Screenshot%202026-07-02%20110336.png" width="45%">
  <img src="assets/Screenshot%202026-07-02%20110352.png" width="45%">
</p>

<p align="center">
  <img src="assets/Screenshot%202026-07-02%20110403.png" width="45%">
  <img src="assets/Screenshot%202026-07-02%20110412.png" width="45%">
</p>

<p align="center">
  <img src="assets/Screenshot%202026-07-02%20110440.png" width="45%">
  <img src="assets/Screenshot%202026-07-02%20110452.png" width="45%">
</p>

<p align="center">
  <img src="assets/Screenshot%202026-07-02%20110511.png" width="45%">
  <img src="assets/Screenshot%202026-07-02%20110555.png" width="45%">
</p>

## Installation

### Use the Web App

Visit **[tiltcheck.vercel.app](https://tiltcheck.vercel.app)** and install as a PWA:

- **Desktop** — Click the install icon in your browser's address bar
- **Mobile** — Share → Add to Home Screen

### Install the Chrome Extension

1. Clone the repo and open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `tiltcheck-extension/`
4. An **Emergency Cool-Down** button appears on supported trading sites

### Build from Source

```bash
git clone https://github.com/infinityanalysis7-maker/tiltcheck-extension.git
cd tiltcheck-extension/tiltcheck
npm install
npm run dev
```

---

## Project Status

| | |
|---|---|
| **Current Version** | v0.2.0 |
| **Status** | Active Development |
| **Next Milestone** | Chrome Web Store Release |

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4)
![PWA](https://img.shields.io/badge/PWA-ready-success)
![Manifest V3](https://img.shields.io/badge/Manifest_V3-✓-green)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| PWA | Service Worker + Web Manifest |
| Data | localStorage |
| Extension | Manifest V3 |

---

## Architecture

```
tiltcheck/
├── app/          # Next.js App Router pages
├── components/   # UI components
├── lib/          # Storage & helpers
└── public/       # Static assets

tiltcheck-extension/
├── manifest.json
├── content.js
└── styles.css
```

---

## Roadmap

### ✅ v1

- [x] Daily Readiness Check
- [x] Trade Journal with Screenshots
- [x] Session Summary & Stats
- [x] Discipline Streaks
- [x] Progressive Lockouts
- [x] PWA Install
- [x] Privacy-first (100% local)

### 🚀 v2

- [ ] TradingView Pine Script integration
- [ ] Auto-detection of emotional trading patterns
- [ ] Analytics dashboard
- [ ] Calendar view
- [ ] CSV / JSON export
- [ ] Cloud sync (optional)

---

## Philosophy

Markets are unpredictable.

Your behavior doesn't have to be.

TiltCheck isn't designed to help you predict the next trade.

It's designed to help you execute your own trading plan consistently.

Discipline compounds faster than predictions.

---

## Contributing

PRs welcome. Open an issue or submit a pull request for any feature, bug, or improvement.

---

## License

MIT

---

⭐ **Star this repo**

If TiltCheck helped save even one bad trade, consider giving the repository a star. It helps other traders find it.
