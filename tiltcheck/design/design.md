# TiltCheck Design Document

## Product Concept
TiltCheck is a discipline companion for Indian F&O (Futures & Options) traders. It helps traders recognize emotional states before and during trading, preventing impulsive decisions that lead to losses. The app runs as a mobile-first PWA with a dark theme.

## Target User
Indian F&O traders who trade on mobile or need quick emotional discipline checks before entering positions.

## Pages / Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Landing with quick navigation to all 3 screens |
| `/check` | Pre-Trade Check | 5 emotional questions, discipline score, cooldown warning |
| `/log` | Trade Logger | Log each trade with emotion type dropdown |
| `/summary` | Weekly Summary | Emotional vs planned trade ratio visualization |

## Color Palette (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | App background |
| `--bg-card` | `#13131f` | Card surfaces |
| `--bg-elevated` | `#1a1a2e` | Elevated surfaces, inputs |
| `--text-primary` | `#f0f0f5` | Primary text |
| `--text-secondary` | `#8b8ba0` | Secondary text, labels |
| `--accent` | `#6366f1` | Primary accent (indigo) |
| `--accent-light` | `#818cf8` | Accent hover |
| `--success` | `#22c55e` | Good score, planned trades |
| `--warning` | `#f59e0b` | Medium score |
| `--danger` | `#ef4444` | Low score, emotional trades, cooldown |
| `--danger-glow` | `rgba(239,68,68,0.3)` | Red warning glow |

## Typography
- Font: system-ui, -apple-system, sans-serif (default Tailwind stack)
- Scale: base 16px, tight line-height for mobile density
- Headings: semibold, tracking-tight
- Body: regular, text-secondary

## Layout Rules
- Mobile-first: max-w-md centered container, full-width on mobile
- `min-h-[100dvh]` for viewport stability
- Bottom navigation bar (fixed) on all screens
- Cards with rounded-2xl, subtle border `border-white/5`
- Padding: px-4 (16px) on mobile, generous vertical spacing

## Shared Components

### BottomNavigation
- Fixed at bottom, 4 tabs: Home, Check, Log, Summary
- Icons from lucide-react
- Active state: accent color + subtle background
- Height: 64px + safe-area padding

### ScoreRing
- SVG circular progress indicator
- 100px diameter, 8px stroke
- Color: success (green) >=70, warning (amber) 40-69, danger (red) <40
- Animated on score calculation

### CooldownTimer
- Large red warning block when score <40
- 15-minute countdown (MM:SS format)
- Pulsing animation on the warning block
- Prevents trading until timer expires

## Screen 1: Pre-Trade Check (/check)

### 5 Questions (1-5 scale, 1=worst, 5=best)
1. "Did I get enough sleep last night?" (1-5)
2. "Am I emotionally calm right now?" (1-5)
3. "Do I have a clear trading plan for this setup?" (1-5)
4. "Have I reviewed my last 3 trades?" (1-5)
5. "Am I trading to recover losses?" (1-5, reversed: 5=best, 1=worst)

### Scoring
- Raw total: 5-25
- Discipline Score: `((total - 5) / 20) * 100` -> 0-100
- Displayed as large number with ScoreRing
- Below 40: trigger red warning + 15-minute cooldown timer
- Timer stored in localStorage, persists across sessions

### Interactions
- Sliders or segmented 1-5 buttons per question
- "Calculate Score" button at bottom
- Score reveals with fade-in animation
- If score <40: cooldown timer starts, large red warning overlay
- Timer shows "Wait 15:00 before trading" with pulsing red glow

## Screen 2: Trade Logger (/log)

### Form Fields
- **Emotion Type**: Dropdown/select with options:
  - Planned (green badge)
  - FOMO (red badge)
  - Revenge (red badge)
  - Boredom (amber badge)
  - Greed (red badge)
  - Hope (amber badge)
- **Trade Symbol**: Text input (e.g., NIFTY, BANKNIFTY, stock ticker)
- **Quantity**: Number input
- **Trade Side**: Long / Short toggle
- **Entry Price**: Number input
- **Optional Notes**: Textarea

### Submit
- "Log Trade" button
- Store in localStorage with timestamp
- Success toast/notification
- Form clears after submit

### Trade History List
- Below the form: last 10 trades in reverse chronological order
- Each trade card shows: emotion badge, symbol, side, time, delete button

## Screen 3: Weekly Summary (/summary)

### Data Aggregation
- Group trades by week (Sunday-Saturday)
- Calculate ratio: Planned / Total trades
- Emotional trades = FOMO + Revenge + Greed + Hope + Boredom

### Visualizations
- **Weekly Ratio Bar**: Large horizontal bar showing planned % vs emotional %
- **Emotion Breakdown**: Small bars per emotion type with counts
- **Weekly Selector**: Toggle between current week and last 2 weeks
- **Stats Cards**: Total trades, planned count, emotional count, discipline %

### Empty State
- "No trades logged this week" with a CTA to go to Log screen

## PWA Configuration
- Manifest: `public/manifest.json` with name, icons, theme_color, display: standalone
- Service Worker: `public/sw.js` with basic caching strategy
- Theme color: `#0a0a0f` (dark background)
- Apple touch icon meta tags in layout

## Data Storage
- localStorage keys:
  - `tiltcheck_trades`: array of trade objects
  - `tiltcheck_cooldown`: cooldown end timestamp (ISO string)
  - `tiltcheck_scores`: array of past check scores with timestamps

## Dependencies
- next (from scaffold)
- react, react-dom (from scaffold)
- tailwindcss (from scaffold)
- lucide-react (icons)
- No chart library needed -- CSS-based visual bars sufficient

## Animation Language
- Page transitions: subtle fade (200ms)
- Score reveal: scale + fade (300ms ease-out)
- Timer pulse: CSS animation `animate-pulse` on warning block
- Button tap: active scale 0.98
- Card hover (desktop): subtle translateY -2px
