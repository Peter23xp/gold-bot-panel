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
