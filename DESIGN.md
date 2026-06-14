# Design

## Color Strategy

Committed dark theme. The surface is near-black with zero chroma tint — the gold accent carries all the brand warmth. Green and red are semantic (profit/loss), not decorative.

## Color Palette (OKLCH)

```css
:root {
  /* Backgrounds */
  --bg:           oklch(0.07 0.000 0);      /* #0a0a0f — near-black, pure */
  --surface:      oklch(0.11 0.000 0);      /* panel background, cards */
  --surface-2:    oklch(0.15 0.000 0);      /* elevated: modals, dropdowns */
  --border:       oklch(0.20 0.000 0);      /* subtle dividers */

  /* Brand */
  --gold:         oklch(0.76 0.149 80);     /* #f59e0b — amber gold, primary accent */
  --gold-dim:     oklch(0.55 0.100 80);     /* muted gold for secondary states */

  /* Semantic */
  --profit:       oklch(0.70 0.150 155);    /* #10b981 — green, profit/win */
  --loss:         oklch(0.57 0.200 25);     /* #ef4444 — red, loss/error */
  --warning:      oklch(0.78 0.160 60);     /* orange-amber, warning state */
  --info:         oklch(0.65 0.130 240);    /* blue, informational */

  /* Text */
  --ink:          oklch(0.95 0.000 0);      /* primary text — near-white */
  --ink-2:        oklch(0.65 0.000 0);      /* secondary text — muted */
  --ink-3:        oklch(0.42 0.000 0);      /* disabled / placeholder */

  /* Interactive */
  --focus-ring:   oklch(0.76 0.149 80 / 0.5);
}
```

Color strategy: **Committed**. Gold carries 20-30% of interactive surface area (primary buttons, active nav, status badges). All other surfaces stay in the neutral dark ramp. Green/red are semantic only.

## Typography

One family: **Inter** (system-ui fallback). Loaded via Google Fonts or Fontsource.

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}
```

Scale (fixed rem, not fluid — product UI):
```
--text-xs:   0.75rem  / 1rem    (labels, badges, timestamps)
--text-sm:   0.875rem / 1.25rem (secondary UI, table rows)
--text-base: 1rem     / 1.5rem  (body, form controls)
--text-lg:   1.125rem / 1.75rem (section headings, card titles)
--text-xl:   1.25rem  / 1.75rem (page headings)
--text-2xl:  1.5rem   / 2rem    (dashboard metric values)
--text-3xl:  1.875rem / 2.25rem (hero metrics)
```

Weight contrast: 400 (body) / 500 (UI labels) / 600 (headings, active states) / 700 (metric values only).

Mono font used exclusively for: log terminal, price values, ticket numbers.

## Spacing Scale

8px base unit. All spacing is multiples of 4px.
```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-5: 1.25rem  (20px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-10: 2.5rem  (40px)
--space-12: 3rem    (48px)
```

## Layout

App shell: fixed left sidebar (240px) + top bar (56px) + scrollable content area.

Sidebar collapses to icon-only (56px) at < 1024px. Full-width stack at < 640px.

Content max-width: 1280px centered. Data tables can use full width.

## Border Radius

```
--radius-sm:  4px   (badges, inputs, small chips)
--radius-md:  8px   (cards, panels, buttons)
--radius-lg:  12px  (modals, larger containers)
--radius-full: 9999px (status dots, toggle pills)
```

## Components

### Status Badge
```
RUNNING: bg --profit (dim), text --profit, dot pulsing
STOPPED: bg --ink-3 (dim), text --ink-2
ERROR:   bg --loss (dim), text --loss, dot flashing
```

### Buttons
- Primary: bg --gold, text oklch(0.07 0 0) — dark text on gold (L 0.76, WCAG checked)
- Destructive: bg --loss dim, text --loss
- Ghost: no bg, border --border, text --ink-2, hover bg --surface-2
- All buttons: height 36px, padding 0 16px, radius --radius-md

### Data Table
- Header: --surface-2, text --ink-2, --text-sm weight 600
- Rows: alternating --bg / --surface at 50% opacity
- Profit cell: --profit, Loss cell: --loss
- Hover row: bg --surface-2

### Log Terminal
- bg: oklch(0.05 0 0) — deeper black
- font: --font-mono, --text-sm
- INFO: --ink-2, WARN: --warning, ERROR: --loss, timestamp: --ink-3
- Scrollbar: thin, --border

## Motion

Duration tokens:
```
--duration-fast:   100ms  (hover state changes)
--duration-base:   200ms  (transitions, reveals)
--duration-slow:   350ms  (panel open/close, page transitions)
```

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) for all transitions.

Rules:
- Status badge dot: subtle pulse animation (scale 1→1.2→1, 2s loop) for RUNNING state only
- Sidebar collapse: width transition, --duration-slow
- Log new line: opacity 0→1, translateY 4px→0, --duration-fast
- Page transitions: opacity fade only, --duration-base
- All animations: `@media (prefers-reduced-motion: reduce)` → instant / crossfade

## Icons

Lucide React. Size standards: 16px (inline/badge), 20px (sidebar nav), 24px (page headers).
Stroke width: 1.5px throughout.
