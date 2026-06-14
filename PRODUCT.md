# Product

## Register

product

## Users

Traders and trading team members managing a Gold (XAUUSD) algorithmic trading bot on AWS VPS.
Two roles:
- **Admin** (owner): full access — all accounts, user management, Docker control, bot settings
- **User** (collaborator/client): read/write access to their own MT5 accounts only

Primary context: sitting at a desk, monitoring active trades, checking P&L, investigating bot behavior after a session. Occasionally on mobile to check status quickly.

## Product Purpose

A multi-tenant web control panel for the Gold trading bot. Replaces SSH access with a secure, visual interface.

Core jobs to be done:
1. Monitor the bot's status and act fast (start/stop/restart) when something is wrong
2. Read logs without needing terminal access
3. Review trade history and cumulative P&L across accounts
4. Adjust bot parameters (risk, hours, SL/TP multipliers) without touching the server

Success: a trader can manage the bot entirely from a browser, from anywhere in the world.

## Brand Personality

Precise, reliable, professional. Not flashy — the interface should disappear into the data.
Three words: **terminal-native, austere, trustworthy**

## Anti-references

- Robinhood / Webull: gamified, consumer-friendly, rounded, celebratory — wrong register
- Crypto dashboard clichés: gradient cards, neon glow, saturated teal-on-dark everything
- SaaS-cream + orange: warm-neutral backgrounds with startup-orange CTAs
- Bloomberg terminal literal clone: too dense, no hierarchy, no breathing room

## Design Principles

1. **Data before decoration** — every element earns its place by carrying information. No cosmetic chrome.
2. **Status is always visible** — bot state (running/stopped/error) and account health are never buried. They surface at a glance.
3. **Trust through precision** — numbers are formatted consistently, timestamps are unambiguous (UTC), states are never ambiguous.
4. **Speed to action** — Start/Stop/Restart are always one click away, never behind a modal chain.
5. **Dark by default** — traders work at night, in low-light environments. The dark theme is the product, not an option.

## Accessibility & Inclusion

- WCAG AA minimum (4.5:1 body text contrast, 3:1 large text)
- Color is never the sole carrier of state — always paired with label or icon
- Reduced motion support via prefers-reduced-motion
- Keyboard navigable for power users
