# TiltCheck

**Trade with discipline.**

Behavioral trading assistant that prevents revenge trading before it starts.

<details>
<summary>Hero Image</summary>

<!-- Replace with assets/hero.png -->
![TiltCheck](assets/home.png)
</details>

---

## Why TiltCheck?

Most traders don't blow accounts because of bad strategies.

They blow them because they break their own rules.

TiltCheck acts like a **behavioral circuit breaker**.

Instead of trying to predict markets... it protects you from yourself.

---

## Features

- **Daily Readiness Check** — 5-question assessment that scores your mental state before you trade
- **Trade Logging** — Record every trade with entry, exit, size, P&L, screenshots, and notes
- **Session Summary** — Review your day with aggregated stats and behavioral patterns
- **Streak Tracking** — Build discipline streaks by completing your daily routine
- **Progressive Lockout** — Escalating cool-down periods when you trade while tilted
- **Privacy First** — Everything stays on your device. No cloud, no accounts, no telemetry.
- **Local Storage Only** — Your data is yours. Export or delete it anytime.

---

## Screenshots

| Home | Onboarding | Readiness |
|------|-----------|-----------|
| ![Home](assets/home.png) | ![Onboarding](assets/onboarding.png) | ![Readiness](assets/readiness.png) |

| Log Trade | Summary | Settings |
|-----------|---------|----------|
| ![Log Trade](assets/log-trade.png) | ![Summary](assets/summary.png) | ![Settings](assets/settings.png) |

---

## Installation

### Web App

Visit **[tiltcheck.vercel.app](https://tiltcheck.vercel.app)** and install as a PWA:

- **Desktop**: Click the install icon in your browser's address bar
- **Mobile**: Share → Add to Home Screen

### Chrome Extension

1. Clone the repo and open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `tiltcheck-extension/`
4. An **Emergency Cool-Down** button appears on supported trading sites

### Manual Build

```bash
git clone https://github.com/infinityanalysis7-maker/tiltcheck-extension
cd tiltcheck-extension/tiltcheck
npm install
npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| PWA | Service Worker + Web Manifest |
| Data | localStorage (no backend) |
| Extension | Manifest V3, MutationObserver |

---

## Roadmap

### v1 ✅

- Daily Readiness Check
- Trade Logging with Screenshots
- Session Summary & Stats
- Discipline Streaks
- Progressive Lockout
- PWA Install
- Privacy-first (100% local)

### v2

- TradingView Pine Script integration
- Auto-detection of emotional trading patterns
- Analytics dashboard
- Calendar view
- CSV / JSON export
- Cloud sync (optional)

---

## Philosophy

**Discipline > Prediction.**

The market will always be unpredictable. Your reaction to it doesn't have to be.

TiltCheck is open source. No cloud. No accounts. No analytics. No telemetry.

Your data stays on your device. Always.

---

## Contributing

PRs are welcome. See any issue, want a feature, or found a bug? Open an issue or submit a pull request.

---

## License

MIT

---

⭐ **Star the project**  
If TiltCheck helped save even one bad trade, consider giving the repository a star. It helps other traders find it.
