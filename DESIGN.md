---
version: 1.0.0
name: Azyra Protocol
description: High-conviction financial bidding leaderboard and escrow creator marketplace for modern tech tools.
colors:
  ground: "#090A0C"       # Dark primary canvas (cold obsidian slate)
  surface: "#111317"      # Card and structural surface
  surfaceElevated: "#181B20" # Modals, inputs, interactive active items
  border: "rgba(255, 255, 255, 0.08)" # Crisp 1px hairline
  borderStrong: "rgba(255, 255, 255, 0.16)"
  ink: "#F1F5F9"          # Primary text (Slate 100)
  muted: "#7E8B9B"        # Secondary labels & metrics (Slate 400, WCAG AA compliant)
  signalLime: "#CCF32F"   # Reserved strictly for Sovereign #1, primary outbid CTA, active status
  signalEmerald: "#10B981"# Escrow verified, confirmed payouts, live oracle status
  signalCyan: "#0EA5E9"   # Direct sponsorship custom success deals
  signalRose: "#F43F5E"   # Rank lost, outbid alert, warning
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    letterSpacing: "-0.03em"
    fontWeight: "700"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    lineHeight: "1.5"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    tabular: true
rounded:
  sm: "6px"               # Badges, filter pills, table elements
  md: "8px"               # Buttons, form controls, inputs
  lg: "12px"              # Cards, terminal modules, dialogs
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
---

# Azyra Design System Specification

## 1. Product Truth & Identity
Azyra is **not** a playful social media toy or a generic AI-gradient marketing SaaS. It is an **open financial discovery ledger and creator escrow exchange**.
Founders bid capital to claim sovereign visibility; short-form creators syndicate content with guaranteed algorithmic CPM and milestone escrow settlements.

Every component, table, and layout choice must feel:
1. **Engineered & Authoritative**: Inspired by professional trading platforms (Polymarket, Bloomberg Terminal, Hyperliquid) and Swiss typographic precision.
2. **High-Information-Density**: Clean tabular data, legible typography at small measures, and purposeful contrast over decorative blurs.
3. **Intentional Signal Application**: The electric lime accent is a **currency signal**, not wallpaper. It indicates Rank #1 sovereign status, active bids, and high-stakes financial interactions.

---

## 2. Refused AI Defaults (Enforced Rules)
- **NO Purple / Indigo gradients** (`from-indigo-500`, `to-purple-600`): Permanently eliminated.
- **NO Text Gradient Clipping** (`bg-clip-text text-transparent` on headlines): Headlines must be solid high-contrast ink.
- **NO Generic 'AI Sparkles' on standard buttons**: Sparkles icon (`Sparkles`) is reserved exclusively for AI metadata scrapers or actual generative tools, not standard CTA buttons.
- **NO Serif insertions inside Sans headlines** (`font-serif italic` words in headings): Eliminated in favor of uniform, powerful Grotesk headlines.
- **NO Monospace on decorative labels**: `font-mono` is strictly prohibited on non-tabular strings (e.g. section categories, eyebrows, description tags). Monospace is reserved exclusively for currency figures (`$14,850`), timestamps, view counts, and transaction IDs.
- **NO Ubiquitous `rounded-full` pills**: Standardized on architectural `rounded-md` (6px) and `rounded-lg` (8px). Only circular avatars and specific live indicators use rounded-full.
- **NO Blurred Glass Overload**: `backdrop-blur` is restricted to floating sticky navbars and modal backdrops where layering actually occurs. Static cards must use solid surfaces with 1px hairlines.

---

## 3. Two-Mode Palette Spec

### Dark Mode (Primary Terminal Theme)
- `--color-canvas`: `#090A0C`
- `--color-surface`: `#111317`
- `--color-surfaceElevated`: `#181B20`
- `--color-borderMuted`: `rgba(255, 255, 255, 0.08)`
- `--color-textMain`: `#F1F5F9`
- `--color-textMuted`: `#7E8B9B`

### Light Mode (Financial Treasury Theme)
- `--color-canvas`: `#F6F8FA`
- `--color-surface`: `#FFFFFF`
- `--color-surfaceElevated`: `#EEF2F6`
- `--color-borderMuted`: `rgba(15, 23, 42, 0.08)`
- `--color-textMain`: `#0F172A`
- `--color-textMuted`: `#526071`

---

## 4. Component Rules
- **Leaderboard Podium**: Ranks #2, #1, #3 built like high-conviction orderbook items. Rank #1 carries an Acid Volt border highlight and distinct crown token; ranks #2 and #3 carry subtle institutional silver and bronze slate badges.
- **Quick-Claim Bidding Dock**: Compact terminal input with tabular target rank selector (`#1`, `#2`, `#3`, `#5`, `#10`, `Custom`) and real-time net-payable delta calculation.
- **Campaign Cards**: Structured financial briefs with clear CPM / Retainer reward metrics, verified spots, and budget progress bars.
- **Buttons**:
  - `Primary Action`: Filled Acid Volt with dark ink (`#090A0C`), high weight, crisp `rounded-lg` edges.
  - `Secondary Action`: Surface background with 1px hairline border, subtle hover brightening.
  - `Terminal Action`: Compact square/rectangle controls with tactile active scaling (`active:scale-[0.98]`).
