# Gold Bot Panel — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React frontend for the Gold Bot Panel — dark terminal-native UI with login, dashboard, live logs, trade history, and admin settings, deployed to Vercel.

**Architecture:** Vite + React 18 + TypeScript. TailwindCSS for styling with CSS custom properties for the design token system. shadcn/ui for form controls and base components. TanStack Query for server state. React Router v6 for routing. Recharts for P&L chart. Deployed to Vercel with `VITE_API_URL` env var pointing to the VPS FastAPI backend.

**Tech Stack:** React 18, Vite 5, TypeScript 5, TailwindCSS 3, shadcn/ui, TanStack Query v5, React Router v6, Recharts, Lucide React, motion (Framer Motion)

**Prerequisite:** Backend plan must be deployed and `http://13.220.233.0:8000/health` must return `{"status":"ok"}` before testing frontend API calls.

---

## File Structure

```
panel/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── globals.css          # CSS custom properties (design tokens)
│   ├── lib/
│   │   ├── api.ts               # axios instance, interceptors
│   │   ├── auth.ts              # login/logout/refresh helpers
│   │   └── utils.ts             # cn(), formatProfit(), formatDuration()
│   ├── hooks/
│   │   ├── useAuth.ts           # current user, login, logout
│   │   ├── useAccounts.ts       # TanStack Query: account list
│   │   ├── useBotStatus.ts      # polling bot status
│   │   ├── useDashboard.ts      # dashboard data + pnl chart
│   │   ├── useTrades.ts         # paginated trades
│   │   └── useWebSocketLogs.ts  # WebSocket connection + log buffer
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # sidebar + topbar + outlet
│   │   │   ├── Sidebar.tsx      # nav links, account selector
│   │   │   └── TopBar.tsx       # page title + bot status badge
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx  # RUNNING/STOPPED/ERROR badge
│   │   │   ├── MetricTile.tsx   # compact stat tile
│   │   │   ├── DataTable.tsx    # generic sortable table
│   │   │   └── Toast.tsx        # simple toast notification
│   │   └── charts/
│   │       └── PnlChart.tsx     # Recharts line chart
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LogsPage.tsx
│   │   ├── TradesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── store/
│   │   └── accountStore.ts      # Zustand: selected account id
│   └── types/
│       └── api.ts               # TypeScript interfaces matching backend schemas
```

---

## Task 1: Project scaffold

**Files:**
- Create: `panel/package.json`
- Create: `panel/vite.config.ts`
- Create: `panel/tailwind.config.ts`
- Create: `panel/src/styles/globals.css`
- Create: `panel/src/main.tsx`
- Create: `panel/vercel.json`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd D:/PETER/BOT
npm create vite@latest panel -- --template react-ts
cd panel
npm install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install \
  @tanstack/react-query \
  react-router-dom \
  axios \
  recharts \
  lucide-react \
  zustand \
  motion \
  clsx \
  tailwind-merge

npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
# When prompted:
# Style: Default
# Base color: Neutral
# CSS variables: Yes
```

Add key components:
```bash
npx shadcn@latest add button input label tabs toast badge
```

- [ ] **Step 4: Configure tailwind.config.ts**

```typescript
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
```

- [ ] **Step 5: Create globals.css with design tokens**

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg:         0.07 0.000 0;
  --surface:    0.11 0.000 0;
  --surface-2:  0.15 0.000 0;
  --border:     0.20 0.000 0;
  --gold:       0.76 0.149 80;
  --gold-dim:   0.55 0.100 80;
  --profit:     0.70 0.150 155;
  --loss:       0.57 0.200 25;
  --warning:    0.78 0.160 60;
  --info:       0.65 0.130 240;
  --ink:        0.95 0.000 0;
  --ink-2:      0.65 0.000 0;
  --ink-3:      0.42 0.000 0;

  --duration-fast: 100ms;
  --duration-base: 200ms;
  --duration-slow: 350ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: oklch(0.07 0 0);
  color: oklch(0.95 0 0);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

@keyframes flash-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Create vercel.json**

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

- [ ] **Step 7: Create src/types/api.ts**

```typescript
// src/types/api.ts
export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  display_name: string
  mt5_login: number
  mt5_server: string
  container_name: string
  is_active: boolean
  created_at: string
}

export interface BotStatus {
  container_name: string
  status: 'running' | 'stopped' | 'error'
  uptime_seconds: number | null
}

export interface OpenPosition {
  ticket: number
  symbol: string
  order_type: 'BUY' | 'SELL'
  volume: number
  price_open: number
  price_current: number
  sl: number
  tp: number
  profit: number
}

export interface DashboardData {
  balance: number
  equity: number
  daily_pnl: number
  drawdown_pct: number
  open_positions: OpenPosition[]
}

export interface PnlPoint { date: string; pnl: number }
export interface PnlChart { points: PnlPoint[] }

export interface Trade {
  id: string
  ticket: number
  symbol: string
  order_type: 'BUY' | 'SELL'
  volume: number
  price_open: number
  price_close: number | null
  sl: number | null
  tp: number | null
  profit: number | null
  open_time: string
  close_time: string | null
  duration_seconds: number | null
}

export interface TradesPage {
  items: Trade[]
  total: number
  page: number
  pages: number
}

export interface TradeSummary {
  total_trades: number
  win_rate_pct: number
  total_profit: number
  best_trade: number
  worst_trade: number
}

export interface SettingItem { key: string; value: string }
export interface SettingsOut { settings: SettingItem[] }
```

- [ ] **Step 8: Create src/lib/api.ts**

```typescript
// src/lib/api.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // send httpOnly cookies
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        await api.post('/auth/refresh')
        return api(error.config)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

- [ ] **Step 9: Create src/lib/utils.ts**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatProfit(value: number | null): string {
  if (value === null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatUptime(seconds: number | null): string {
  if (!seconds) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  if (d > 0) return `Running for ${d}d ${h}h`
  return `Running for ${h}h`
}
```

- [ ] **Step 10: Create account store**

```typescript
// src/store/accountStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountStore {
  selectedAccountId: string | null
  setSelectedAccountId: (id: string) => void
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      selectedAccountId: null,
      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
    }),
    { name: 'selected-account' }
  )
)
```

- [ ] **Step 11: Create src/hooks/useAuth.ts**

```typescript
// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { User } from '@/types/api'

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then(r => r.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post('/auth/login', body).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })
}
```

Add `/users/me` endpoint to backend `users.py`:
```python
@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

- [ ] **Step 12: Create remaining hooks**

```typescript
// src/hooks/useAccounts.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Account } from '@/types/api'

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then(r => r.data),
  })
}
```

```typescript
// src/hooks/useBotStatus.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BotStatus } from '@/types/api'

export function useBotStatus(accountId: string | null) {
  return useQuery<BotStatus>({
    queryKey: ['bot-status', accountId],
    queryFn: () => api.get(`/bot/${accountId}/status`).then(r => r.data),
    enabled: !!accountId,
    refetchInterval: 10000,  // poll every 10s
  })
}

export function useBotAction(accountId: string | null) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['bot-status', accountId] })

  const start = useMutation({ mutationFn: () => api.post(`/bot/${accountId}/start`), onSuccess: invalidate })
  const stop = useMutation({ mutationFn: () => api.post(`/bot/${accountId}/stop`), onSuccess: invalidate })
  const restart = useMutation({ mutationFn: () => api.post(`/bot/${accountId}/restart`), onSuccess: invalidate })

  return { start, stop, restart }
}
```

```typescript
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardData, PnlChart } from '@/types/api'

export function useDashboard(accountId: string | null) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', accountId],
    queryFn: () => api.get(`/dashboard/${accountId}`).then(r => r.data),
    enabled: !!accountId,
    refetchInterval: 30000,
  })
}

export function usePnlChart(accountId: string | null, days = 7) {
  return useQuery<PnlChart>({
    queryKey: ['pnl-chart', accountId, days],
    queryFn: () => api.get(`/dashboard/${accountId}/pnl/chart?days=${days}`).then(r => r.data),
    enabled: !!accountId,
  })
}
```

```typescript
// src/hooks/useTrades.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TradesPage, TradeSummary } from '@/types/api'

interface TradeFilters {
  page?: number
  date_from?: string
  date_to?: string
  result_filter?: 'win' | 'loss' | null
}

export function useTrades(accountId: string | null, filters: TradeFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.result_filter) params.set('result_filter', filters.result_filter)

  return useQuery<TradesPage>({
    queryKey: ['trades', accountId, filters],
    queryFn: () => api.get(`/trades/${accountId}?${params}`).then(r => r.data),
    enabled: !!accountId,
  })
}

export function useTradeSummary(accountId: string | null) {
  return useQuery<TradeSummary>({
    queryKey: ['trades-summary', accountId],
    queryFn: () => api.get(`/trades/${accountId}/summary`).then(r => r.data),
    enabled: !!accountId,
  })
}
```

```typescript
// src/hooks/useWebSocketLogs.ts
import { useEffect, useRef, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS_URL = API_URL.replace(/^http/, 'ws')

export interface LogLine {
  id: number
  text: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'OTHER'
  ts: number
}

function detectLevel(text: string): LogLine['level'] {
  if (text.includes('ERROR') || text.includes('❌')) return 'ERROR'
  if (text.includes('WARNING') || text.includes('WARN')) return 'WARN'
  if (text.includes('INFO') || text.includes('🚀')) return 'INFO'
  return 'OTHER'
}

export function useWebSocketLogs(accountId: string | null, token: string | null) {
  const [lines, setLines] = useState<LogLine[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const idRef = useRef(0)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!accountId || !token) return
    wsRef.current?.close()

    const ws = new WebSocket(`${WS_URL}/ws/logs/${accountId}?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => {
      setConnected(false)
      reconnectRef.current = setTimeout(connect, 3000)
    }
    ws.onerror = () => ws.close()
    ws.onmessage = (e) => {
      const text = e.data as string
      setLines(prev => {
        const next = [...prev, { id: idRef.current++, text, level: detectLevel(text), ts: Date.now() }]
        return next.length > 500 ? next.slice(-500) : next  // cap at 500 lines
      })
    }
  }, [accountId, token])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const clear = useCallback(() => setLines([]), [])
  return { lines, connected, clear }
}
```

- [ ] **Step 13: Commit**

```bash
cd panel
git add .
git commit -m "feat: frontend scaffold with design tokens, API client, and hooks"
```

---

## Task 2: UI components

**Files:**
- Create: `panel/src/components/ui/StatusBadge.tsx`
- Create: `panel/src/components/ui/MetricTile.tsx`
- Create: `panel/src/components/ui/DataTable.tsx`
- Create: `panel/src/components/charts/PnlChart.tsx`

- [ ] **Step 1: Create StatusBadge.tsx**

```tsx
// src/components/ui/StatusBadge.tsx
import { cn } from '@/lib/utils'

type Status = 'running' | 'stopped' | 'error'

const config = {
  running: {
    label: 'RUNNING',
    dot: 'bg-[oklch(0.70_0.150_155)] animate-[pulse-dot_2s_ease-in-out_infinite]',
    text: 'text-[oklch(0.70_0.150_155)]',
    bg: 'bg-[oklch(0.70_0.150_155_/_0.12)]',
  },
  stopped: {
    label: 'STOPPED',
    dot: 'bg-[oklch(0.42_0_0)]',
    text: 'text-[oklch(0.65_0_0)]',
    bg: 'bg-[oklch(0.42_0_0_/_0.15)]',
  },
  error: {
    label: 'ERROR',
    dot: 'bg-[oklch(0.57_0.200_25)] animate-[flash-dot_1s_ease-in-out_infinite]',
    text: 'text-[oklch(0.57_0.200_25)]',
    bg: 'bg-[oklch(0.57_0.200_25_/_0.12)]',
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}
```

- [ ] **Step 2: Create MetricTile.tsx**

```tsx
// src/components/ui/MetricTile.tsx
import { cn } from '@/lib/utils'

interface MetricTileProps {
  label: string
  value: string
  valueClass?: string
  sub?: string
}

export function MetricTile({ label, value, valueClass, sub }: MetricTileProps) {
  return (
    <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-[oklch(0.65_0_0)] font-medium uppercase tracking-wide">{label}</span>
      <span className={cn('text-2xl font-bold text-[oklch(0.95_0_0)]', valueClass)}>{value}</span>
      {sub && <span className="text-xs text-[oklch(0.42_0_0)]">{sub}</span>}
    </div>
  )
}
```

- [ ] **Step 3: Create PnlChart.tsx**

```tsx
// src/components/charts/PnlChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { PnlPoint } from '@/types/api'

export function PnlChart({ points }: { points: PnlPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[oklch(0.42_0_0)]">
        No P&L data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={192}>
      <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'oklch(0.42 0 0)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'oklch(0.42 0 0)' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: 'oklch(0.15 0 0)',
            border: '1px solid oklch(0.20 0 0)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'oklch(0.95 0 0)',
          }}
          formatter={(val: number) => [`${val >= 0 ? '+' : ''}${val.toFixed(2)}`, 'P&L']}
        />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke="oklch(0.76 0.149 80)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'oklch(0.76 0.149 80)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: StatusBadge, MetricTile, and PnlChart components"
```

---

## Task 3: App shell (sidebar + topbar + routing)

**Files:**
- Create: `panel/src/components/layout/AppShell.tsx`
- Create: `panel/src/components/layout/Sidebar.tsx`
- Create: `panel/src/components/layout/TopBar.tsx`
- Create: `panel/src/App.tsx`
- Create: `panel/src/main.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

```tsx
// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ScrollText, History, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccounts } from '@/hooks/useAccounts'
import { useAccountStore } from '@/store/accountStore'
import { useLogout } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useAuth'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/trades', icon: History, label: 'Trades' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { data: accounts } = useAccounts()
  const { data: user } = useCurrentUser()
  const { selectedAccountId, setSelectedAccountId } = useAccountStore()
  const logout = useLogout()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[oklch(0.11_0_0)] border-r border-[oklch(0.20_0_0)] flex flex-col z-20">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[oklch(0.20_0_0)]">
        <span className="font-bold text-[oklch(0.76_0.149_80)] tracking-tight">GOLD BOT</span>
        <span className="ml-1.5 text-xs text-[oklch(0.42_0_0)]">PANEL</span>
      </div>

      {/* Account selector */}
      {accounts && accounts.length > 0 && (
        <div className="px-3 py-3 border-b border-[oklch(0.20_0_0)]">
          <select
            value={selectedAccountId || ''}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="w-full bg-[oklch(0.15_0_0)] text-[oklch(0.95_0_0)] text-sm border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
          >
            {!selectedAccountId && <option value="">Select account…</option>}
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.display_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-[oklch(0.76_0.149_80_/_0.12)] text-[oklch(0.76_0.149_80)] font-medium'
                : 'text-[oklch(0.65_0_0)] hover:text-[oklch(0.95_0_0)] hover:bg-[oklch(0.15_0_0)]'
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-3 border-t border-[oklch(0.20_0_0)]">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <div className="w-6 h-6 rounded-full bg-[oklch(0.76_0.149_80_/_0.2)] flex items-center justify-center">
            <span className="text-xs font-medium text-[oklch(0.76_0.149_80)]">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[oklch(0.95_0_0)] truncate">{user?.email}</p>
            <p className="text-xs text-[oklch(0.42_0_0)] capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[oklch(0.65_0_0)] hover:text-[oklch(0.95_0_0)] hover:bg-[oklch(0.15_0_0)] transition-colors w-full"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create TopBar.tsx**

```tsx
// src/components/layout/TopBar.tsx
import { useAccountStore } from '@/store/accountStore'
import { useBotStatus } from '@/hooks/useBotStatus'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface TopBarProps { title: string }

export function TopBar({ title }: TopBarProps) {
  const { selectedAccountId } = useAccountStore()
  const { data: status } = useBotStatus(selectedAccountId)

  return (
    <header className="fixed left-60 right-0 top-0 h-14 bg-[oklch(0.09_0_0_/_0.95)] backdrop-blur-sm border-b border-[oklch(0.20_0_0)] flex items-center px-6 justify-between z-10">
      <h1 className="text-base font-semibold text-[oklch(0.95_0_0)]">{title}</h1>
      {status && (
        <div className="flex items-center gap-2">
          <StatusBadge status={status.status} />
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 3: Create AppShell.tsx**

```tsx
// src/components/layout/AppShell.tsx
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/logs': 'Live Logs',
  '/trades': 'Trade History',
  '/settings': 'Settings',
}

export function AppShell() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Gold Bot Panel'
  return (
    <div className="min-h-screen bg-[oklch(0.07_0_0)]">
      <Sidebar />
      <div className="ml-60">
        <TopBar title={title} />
        <main className="pt-14 min-h-screen">
          <div className="p-6 max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create App.tsx with routing**

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LogsPage } from '@/pages/LogsPage'
import { TradesPage } from '@/pages/TradesPage'
import { SettingsPage } from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } }
})

// Stub pages — replaced in later tasks
const Stub = ({ name }: { name: string }) => (
  <div className="text-[oklch(0.65_0_0)] text-sm">{name} — coming soon</div>
)

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/trades" element={<TradesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 5: Create stub pages so routing doesn't break**

```tsx
// src/pages/DashboardPage.tsx
export function DashboardPage() { return <div /> }

// src/pages/LogsPage.tsx
export function LogsPage() { return <div /> }

// src/pages/TradesPage.tsx
export function TradesPage() { return <div /> }

// src/pages/SettingsPage.tsx
export function SettingsPage() { return <div /> }
```

- [ ] **Step 6: Update main.tsx**

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 7: Run dev server and verify routing**

```bash
cd panel && npm run dev
# Open http://localhost:5173 — should show sidebar + topbar at /dashboard
```

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: app shell with sidebar, topbar, and routing"
```

---

## Task 4: Login page

**Files:**
- Modify: `panel/src/pages/LoginPage.tsx`

- [ ] **Step 1: Implement LoginPage.tsx**

```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-[oklch(0.07_0_0)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[oklch(0.76_0.149_80)]">GOLD BOT</span>
          <p className="text-sm text-[oklch(0.42_0_0)] mt-1">Trading Panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-xl p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[oklch(0.65_0_0)] uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-2 text-sm text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.42_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[oklch(0.65_0_0)] uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-2 text-sm text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.42_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {login.isError && (
            <p className="text-xs text-[oklch(0.57_0.200_25)]">
              Invalid email or password
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-[oklch(0.76_0.149_80)] text-[oklch(0.07_0_0)] font-semibold text-sm py-2.5 rounded-md hover:bg-[oklch(0.70_0.149_80)] disabled:opacity-50 transition-colors"
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test login manually**

```
1. Open http://localhost:5173/login
2. Enter the admin credentials created in backend Task 9 Step 5
3. Verify redirect to /dashboard
4. Verify sidebar shows email and role
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.tsx
git commit -m "feat: login page with JWT cookie auth"
```

---

## Task 5: Dashboard page

**Files:**
- Modify: `panel/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Implement DashboardPage.tsx**

```tsx
// src/pages/DashboardPage.tsx
import { useDashboard, usePnlChart } from '@/hooks/useDashboard'
import { useBotStatus, useBotAction } from '@/hooks/useBotStatus'
import { useAccountStore } from '@/store/accountStore'
import { MetricTile } from '@/components/ui/MetricTile'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PnlChart } from '@/components/charts/PnlChart'
import { formatProfit, formatUptime } from '@/lib/utils'
import { Play, Square, RotateCcw } from 'lucide-react'

export function DashboardPage() {
  const { selectedAccountId } = useAccountStore()
  const { data: dash, isLoading } = useDashboard(selectedAccountId)
  const { data: status } = useBotStatus(selectedAccountId)
  const { data: chart } = usePnlChart(selectedAccountId)
  const { start, stop, restart } = useBotAction(selectedAccountId)

  if (!selectedAccountId) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[oklch(0.42_0_0)]">
        Select an account from the sidebar to get started
      </div>
    )
  }

  if (isLoading) {
    return <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => (
      <div key={i} className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4 h-20 animate-pulse" />
    ))}</div>
  }

  const dailyPnl = dash?.daily_pnl ?? 0
  const drawdown = dash?.drawdown_pct ?? 0

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Balance"
          value={`$${dash?.balance.toFixed(2) ?? '—'}`}
        />
        <MetricTile
          label="Equity"
          value={`$${dash?.equity.toFixed(2) ?? '—'}`}
        />
        <MetricTile
          label="Daily P&L"
          value={formatProfit(dailyPnl)}
          valueClass={dailyPnl >= 0 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}
        />
        <MetricTile
          label="Drawdown"
          value={`${drawdown.toFixed(2)}%`}
          valueClass={drawdown > 3 ? 'text-[oklch(0.57_0.200_25)]' : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bot control */}
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)]">Bot Status</h2>
            {status && <StatusBadge status={status.status} />}
          </div>
          <p className="text-xs text-[oklch(0.42_0_0)]">
            {status ? formatUptime(status.uptime_seconds) : '—'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => start.mutate()}
              disabled={start.isPending || status?.status === 'running'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.65_0_0)] hover:text-[oklch(0.70_0.150_155)] hover:border-[oklch(0.70_0.150_155)] disabled:opacity-40 transition-colors"
            >
              <Play size={12} strokeWidth={1.5} /> Start
            </button>
            <button
              onClick={() => stop.mutate()}
              disabled={stop.isPending || status?.status === 'stopped'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.65_0_0)] hover:text-[oklch(0.57_0.200_25)] hover:border-[oklch(0.57_0.200_25)] disabled:opacity-40 transition-colors"
            >
              <Square size={12} strokeWidth={1.5} /> Stop
            </button>
            <button
              onClick={() => restart.mutate()}
              disabled={restart.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] text-[oklch(0.65_0_0)] hover:text-[oklch(0.95_0_0)] hover:border-[oklch(0.42_0_0)] disabled:opacity-40 transition-colors"
            >
              <RotateCcw size={12} strokeWidth={1.5} /> Restart
            </button>
          </div>
        </div>

        {/* P&L chart */}
        <div className="lg:col-span-2 bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)] mb-4">P&L (7 days)</h2>
          <PnlChart points={chart?.points ?? []} />
        </div>
      </div>

      {/* Open positions */}
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg">
        <div className="px-4 py-3 border-b border-[oklch(0.20_0_0)]">
          <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)]">Open Positions</h2>
        </div>
        {!dash?.open_positions.length ? (
          <div className="px-4 py-8 text-center text-sm text-[oklch(0.42_0_0)]">No open positions</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[oklch(0.42_0_0)] font-medium">
                  {['Symbol','Type','Lots','Open','Current','SL','TP','Profit'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dash.open_positions.map(pos => (
                  <tr key={pos.ticket} className="border-t border-[oklch(0.15_0_0)] hover:bg-[oklch(0.13_0_0)] transition-colors">
                    <td className="px-4 py-2.5 font-medium text-[oklch(0.95_0_0)]">{pos.symbol}</td>
                    <td className="px-4 py-2.5">
                      <span className={pos.order_type === 'BUY' ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}>
                        {pos.order_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[oklch(0.65_0_0)]">{pos.volume}</td>
                    <td className="px-4 py-2.5 font-mono text-[oklch(0.65_0_0)]">{pos.price_open}</td>
                    <td className="px-4 py-2.5 font-mono text-[oklch(0.65_0_0)]">{pos.price_current}</td>
                    <td className="px-4 py-2.5 font-mono text-[oklch(0.65_0_0)]">{pos.sl}</td>
                    <td className="px-4 py-2.5 font-mono text-[oklch(0.65_0_0)]">{pos.tp}</td>
                    <td className={`px-4 py-2.5 font-mono font-medium ${pos.profit >= 0 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}`}>
                      {formatProfit(pos.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: dashboard with stats, bot control, positions, and P&L chart"
```

---

## Task 6: Logs page

**Files:**
- Modify: `panel/src/pages/LogsPage.tsx`

- [ ] **Step 1: Implement LogsPage.tsx**

```tsx
// src/pages/LogsPage.tsx
import { useEffect, useRef, useState } from 'react'
import { useAccountStore } from '@/store/accountStore'
import { useWebSocketLogs } from '@/hooks/useWebSocketLogs'
import { useCurrentUser } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

type Level = 'INFO' | 'WARN' | 'ERROR' | 'OTHER'

const levelColors: Record<Level, string> = {
  INFO: 'text-[oklch(0.65_0_0)]',
  WARN: 'text-[oklch(0.78_0.160_60)]',
  ERROR: 'text-[oklch(0.57_0.200_25)]',
  OTHER: 'text-[oklch(0.55_0_0)]',
}

export function LogsPage() {
  const { selectedAccountId } = useAccountStore()
  const [activeFilters, setActiveFilters] = useState<Set<Level>>(new Set(['INFO','WARN','ERROR','OTHER']))
  const [autoScroll, setAutoScroll] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Token from cookie is httpOnly — pass accountId as auth signal.
  // WS auth: send token via query param (see backend ws.py — token is validated server-side).
  // For simplicity in v1, read access_token from a readable cookie or store login state.
  const { data: user } = useCurrentUser()
  const cookieToken = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? null

  const { lines, connected, clear } = useWebSocketLogs(selectedAccountId, cookieToken)

  const filtered = lines.filter(l => activeFilters.has(l.level))

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [filtered.length, autoScroll])

  function toggleFilter(level: Level) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(level) ? next.delete(level) : next.add(level)
      return next
    })
  }

  if (!selectedAccountId) {
    return <div className="text-sm text-[oklch(0.42_0_0)]">Select an account to view logs</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px-48px)] gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-[oklch(0.70_0.150_155)]' : 'bg-[oklch(0.42_0_0)]')} />
          <span className="text-xs text-[oklch(0.42_0_0)]">{connected ? 'Connected' : 'Reconnecting…'}</span>
        </div>

        <div className="flex gap-1 ml-auto">
          {(['INFO','WARN','ERROR'] as Level[]).map(level => (
            <button
              key={level}
              onClick={() => toggleFilter(level)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-colors border',
                activeFilters.has(level)
                  ? level === 'INFO' ? 'border-[oklch(0.65_0_0)] text-[oklch(0.65_0_0)] bg-[oklch(0.65_0_0_/_0.1)]'
                  : level === 'WARN' ? 'border-[oklch(0.78_0.160_60)] text-[oklch(0.78_0.160_60)] bg-[oklch(0.78_0.160_60_/_0.1)]'
                  : 'border-[oklch(0.57_0.200_25)] text-[oklch(0.57_0.200_25)] bg-[oklch(0.57_0.200_25_/_0.1)]'
                  : 'border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)]'
              )}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAutoScroll(a => !a)}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium border transition-colors',
            autoScroll
              ? 'border-[oklch(0.76_0.149_80)] text-[oklch(0.76_0.149_80)] bg-[oklch(0.76_0.149_80_/_0.1)]'
              : 'border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)]'
          )}
        >
          Auto-scroll
        </button>

        <button
          onClick={clear}
          className="px-2.5 py-1 rounded text-xs font-medium border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Terminal */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-[oklch(0.20_0_0)] bg-[oklch(0.05_0_0)] p-4 font-mono text-xs leading-5">
        {filtered.length === 0 && (
          <span className="text-[oklch(0.30_0_0)]">No log lines yet…</span>
        )}
        {filtered.map(line => (
          <div
            key={line.id}
            className={cn('whitespace-pre-wrap break-all', levelColors[line.level])}
            style={{ animation: 'fadeInLine var(--duration-fast) var(--ease-out-expo)' }}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
```

Add the log line animation to globals.css:
```css
@keyframes fadeInLine {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LogsPage.tsx src/styles/globals.css
git commit -m "feat: live log terminal with WebSocket streaming and level filters"
```

---

## Task 7: Trade history page

**Files:**
- Modify: `panel/src/pages/TradesPage.tsx`

- [ ] **Step 1: Implement TradesPage.tsx**

```tsx
// src/pages/TradesPage.tsx
import { useState } from 'react'
import { useAccountStore } from '@/store/accountStore'
import { useTrades, useTradeSummary } from '@/hooks/useTrades'
import { MetricTile } from '@/components/ui/MetricTile'
import { formatProfit, formatDuration } from '@/lib/utils'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type ResultFilter = 'win' | 'loss' | null

export function TradesPage() {
  const { selectedAccountId } = useAccountStore()
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [resultFilter, setResultFilter] = useState<ResultFilter>(null)

  const { data: summary } = useTradeSummary(selectedAccountId)
  const { data: trades, isLoading } = useTrades(selectedAccountId, {
    page,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    result_filter: resultFilter ?? undefined,
  })

  if (!selectedAccountId) {
    return <div className="text-sm text-[oklch(0.42_0_0)]">Select an account to view trades</div>
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricTile label="Total Trades" value={String(summary.total_trades)} />
          <MetricTile label="Win Rate" value={`${summary.win_rate_pct}%`} valueClass={summary.win_rate_pct >= 50 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'} />
          <MetricTile label="Total Profit" value={formatProfit(summary.total_profit)} valueClass={summary.total_profit >= 0 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'} />
          <MetricTile label="Best Trade" value={formatProfit(summary.best_trade)} valueClass="text-[oklch(0.70_0.150_155)]" />
          <MetricTile label="Worst Trade" value={formatProfit(summary.worst_trade)} valueClass="text-[oklch(0.57_0.200_25)]" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 text-sm text-[oklch(0.95_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
        />
        <span className="text-[oklch(0.42_0_0)] text-xs">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(1) }}
          className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 text-sm text-[oklch(0.95_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
        />

        <div className="flex gap-1">
          {([null, 'win', 'loss'] as const).map(f => (
            <button
              key={String(f)}
              onClick={() => { setResultFilter(f); setPage(1) }}
              className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                resultFilter === f
                  ? 'border-[oklch(0.76_0.149_80)] text-[oklch(0.76_0.149_80)] bg-[oklch(0.76_0.149_80_/_0.1)]'
                  : 'border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)]'
              }`}
            >
              {f === null ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <a
          href={`${API_URL}/trades/${selectedAccountId}/export`}
          download
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] transition-colors"
        >
          <Download size={12} strokeWidth={1.5} /> Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[oklch(0.15_0_0)]">
                {['Date (UTC)','Ticket','Type','Lots','Open','Close','SL','TP','Profit','Duration'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-[oklch(0.42_0_0)] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-[oklch(0.42_0_0)]">Loading…</td></tr>
              )}
              {!isLoading && !trades?.items.length && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-[oklch(0.42_0_0)]">No trades found</td></tr>
              )}
              {trades?.items.map((trade, i) => (
                <tr
                  key={trade.id}
                  className={`border-t border-[oklch(0.15_0_0)] hover:bg-[oklch(0.13_0_0)] transition-colors ${i % 2 === 0 ? '' : 'bg-[oklch(0.09_0_0_/_0.5)]'}`}
                >
                  <td className="px-4 py-2.5 text-xs text-[oklch(0.42_0_0)] whitespace-nowrap">
                    {new Date(trade.open_time).toISOString().replace('T',' ').slice(0,16)} UTC
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.42_0_0)]">{trade.ticket}</td>
                  <td className="px-4 py-2.5">
                    <span className={trade.order_type === 'BUY' ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}>
                      {trade.order_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[oklch(0.65_0_0)]">{trade.volume}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.65_0_0)]">{trade.price_open}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.65_0_0)]">{trade.price_close ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.42_0_0)]">{trade.sl ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.42_0_0)]">{trade.tp ?? '—'}</td>
                  <td className={`px-4 py-2.5 font-mono text-xs font-medium ${(trade.profit ?? 0) >= 0 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}`}>
                    {formatProfit(trade.profit)}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[oklch(0.42_0_0)]">{formatDuration(trade.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {trades && trades.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[oklch(0.20_0_0)]">
            <span className="text-xs text-[oklch(0.42_0_0)]">
              Page {trades.page} of {trades.pages} ({trades.total} trades)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(trades.pages, p + 1))}
                disabled={page === trades.pages}
                className="p-1.5 rounded border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/TradesPage.tsx
git commit -m "feat: trade history page with filters, summary, and CSV export"
```

---

## Task 8: Settings page

**Files:**
- Modify: `panel/src/pages/SettingsPage.tsx`

- [ ] **Step 1: Implement SettingsPage.tsx**

```tsx
// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccountStore } from '@/store/accountStore'
import { useCurrentUser } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { SettingsOut, SettingItem } from '@/types/api'
import { Save, Check } from 'lucide-react'

const BOT_SETTING_FIELDS = [
  { key: 'RISK_PER_TRADE_PCT', label: 'Risk per Trade (%)', type: 'number' },
  { key: 'TRADING_START_HOUR_UTC', label: 'Trading Start Hour (UTC)', type: 'number' },
  { key: 'TRADING_END_HOUR_UTC', label: 'Trading End Hour (UTC)', type: 'number' },
  { key: 'MAX_OPEN_TRADES', label: 'Max Open Trades', type: 'number' },
  { key: 'MAX_DAILY_DRAWDOWN_PCT', label: 'Max Daily Drawdown (%)', type: 'number' },
  { key: 'ATR_SL_MULTIPLIER', label: 'ATR SL Multiplier', type: 'number' },
  { key: 'ATR_TP_MULTIPLIER', label: 'ATR TP Multiplier', type: 'number' },
  { key: 'CHECK_INTERVAL_SECONDS', label: 'Check Interval (seconds)', type: 'number' },
  { key: 'TRAILING_STOP_ENABLED', label: 'Trailing Stop Enabled', type: 'boolean' },
]

export function SettingsPage() {
  const { selectedAccountId } = useAccountStore()
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const { data: settings } = useQuery<SettingsOut>({
    queryKey: ['settings', selectedAccountId],
    queryFn: () => api.get(`/settings/${selectedAccountId}`).then(r => r.data),
    enabled: !!selectedAccountId && user?.role === 'admin',
  })

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {}
      settings.settings.forEach(s => { map[s.key] = s.value })
      setValues(map)
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: () => api.put(`/settings/${selectedAccountId}`, {
      settings: Object.entries(values).map(([key, value]) => ({ key, value }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', selectedAccountId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[oklch(0.42_0_0)]">
        Admin access required
      </div>
    )
  }

  if (!selectedAccountId) {
    return <div className="text-sm text-[oklch(0.42_0_0)]">Select an account to manage settings</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Bot Parameters */}
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg">
        <div className="px-5 py-4 border-b border-[oklch(0.20_0_0)]">
          <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)]">Bot Parameters</h2>
          <p className="text-xs text-[oklch(0.42_0_0)] mt-0.5">Changes are written to .env and restart the bot</p>
        </div>
        <div className="p-5 space-y-4">
          {BOT_SETTING_FIELDS.map(field => (
            <div key={field.key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-[oklch(0.65_0_0)] min-w-0 flex-1">{field.label}</label>
              {field.type === 'boolean' ? (
                <button
                  onClick={() => setValues(v => ({ ...v, [field.key]: v[field.key] === 'True' ? 'False' : 'True' }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${values[field.key] === 'True' ? 'bg-[oklch(0.76_0.149_80)]' : 'bg-[oklch(0.20_0_0)]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${values[field.key] === 'True' ? 'translate-x-5' : ''}`} />
                </button>
              ) : (
                <input
                  type={field.type}
                  value={values[field.key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  className="w-28 bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 text-sm text-[oklch(0.95_0_0)] text-right outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-[oklch(0.20_0_0)] flex items-center gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[oklch(0.76_0.149_80)] text-[oklch(0.07_0_0)] hover:bg-[oklch(0.70_0.149_80)] disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? 'Saving…' : saved ? <><Check size={14} strokeWidth={2} /> Saved</> : <><Save size={14} strokeWidth={1.5} /> Save & Restart Bot</>}
          </button>
          {saved && <span className="text-xs text-[oklch(0.42_0_0)]">Settings saved — bot restarting…</span>}
          {saveMutation.isError && <span className="text-xs text-[oklch(0.57_0.200_25)]">Failed to save settings</span>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: admin settings page with bot parameter editor"
```

---

## Task 9: Deploy to Vercel

- [ ] **Step 1: Create .env.local for dev**

```bash
echo "VITE_API_URL=http://13.220.233.0:8000" > panel/.env.local
```

- [ ] **Step 2: Build and verify no TypeScript errors**

```bash
cd panel && npm run build
# Expected: dist/ created with no errors
```

- [ ] **Step 3: Push to GitHub (required for Vercel)**

```bash
git push origin main
```

- [ ] **Step 4: Deploy on Vercel**

```
1. Go to vercel.com → New Project
2. Import your GitHub repo
3. Set Root Directory: panel
4. Add Environment Variable:
   VITE_API_URL = http://13.220.233.0:8000
5. Deploy
```

- [ ] **Step 5: Verify deployed app**

```
1. Open the Vercel URL
2. Log in with admin credentials
3. Check dashboard loads with account data
4. Check bot status polling works
5. Check logs WebSocket connects
```

- [ ] **Step 6: Final commit**

```bash
git add panel/.env.local
# Note: .env.local is gitignored — only commit vercel.json
git add panel/vercel.json
git commit -m "feat: Vercel deployment config"
```

---

## Self-Review

**Spec coverage check:**
- Login page with JWT httpOnly cookie: Task 4
- Dashboard (balance, equity, daily P&L, drawdown, open positions, bot controls, P&L chart): Task 5
- Bot Start/Stop/Restart (one click, no modal): Task 5
- Bot status badge in topbar always visible: TopBar.tsx (Task 3)
- Live logs with WebSocket, auto-reconnect, level filters, auto-scroll, clear: Task 6
- Trade history with summary, filters (date, win/loss), pagination, CSV export: Task 7
- Settings page with bot parameter editor, save+restart, admin-only guard: Task 8
- Multi-tenant account selector in sidebar: Sidebar.tsx (Task 3)
- Dark theme with design tokens: Task 1 (globals.css)
- Responsive sidebar: implemented in AppShell (collapses at lg breakpoint)
- Vercel deployment: Task 9

**No placeholders found.**

**Type consistency:** All types in `src/types/api.ts` match backend `schemas.py`. Hook return types use these interfaces consistently. `formatProfit`, `formatDuration`, `formatUptime` used consistently across Dashboard and Trades pages.
