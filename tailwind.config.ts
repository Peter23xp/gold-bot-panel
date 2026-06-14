import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'oklch(var(--bg) / <alpha-value>)',
        surface: 'oklch(var(--surface) / <alpha-value>)',
        'surface-2': 'oklch(var(--surface-2) / <alpha-value>)',
        border: 'oklch(var(--border) / <alpha-value>)',
        gold: 'oklch(var(--gold) / <alpha-value>)',
        'gold-dim': 'oklch(var(--gold-dim) / <alpha-value>)',
        profit: 'oklch(var(--profit) / <alpha-value>)',
        loss: 'oklch(var(--loss) / <alpha-value>)',
        ink: 'oklch(var(--ink) / <alpha-value>)',
        'ink-2': 'oklch(var(--ink-2) / <alpha-value>)',
        'ink-3': 'oklch(var(--ink-3) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
