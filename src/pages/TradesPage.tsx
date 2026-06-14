import { useState } from 'react'
import { motion } from 'motion/react'
import { useAccountStore } from '@/store/accountStore'
import { useTrades, useTradeSummary } from '@/hooks/useTrades'
import { MetricTile } from '@/components/ui/MetricTile'
import { formatProfit, formatDuration } from '@/lib/utils'
import { Download, ChevronLeft, ChevronRight, History } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type ResultFilter = 'win' | 'loss' | null

const inputStyle: React.CSSProperties = {
  background: 'oklch(0.12 0 0)',
  border: '1px solid oklch(0.22 0 0)',
  color: 'oklch(0.90 0 0)',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '0.8125rem',
  outline: 'none',
}

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
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <History size={32} style={{ color: 'oklch(0.22 0 0)' }} strokeWidth={1} />
        <p className="text-sm" style={{ color: 'oklch(0.38 0 0)' }}>
          Select an account to view trades
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary tiles */}
      {summary && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <MetricTile label="Total Trades" value={String(summary.total_trades)} />
          <MetricTile
            label="Win Rate"
            value={`${summary.win_rate_pct}%`}
            valueStyle={{ color: summary.win_rate_pct >= 50 ? 'oklch(0.70 0.150 155)' : 'oklch(0.57 0.200 25)' }}
          />
          <MetricTile
            label="Total Profit"
            value={formatProfit(summary.total_profit)}
            valueStyle={{ color: summary.total_profit >= 0 ? 'oklch(0.70 0.150 155)' : 'oklch(0.57 0.200 25)' }}
          />
          <MetricTile
            label="Best Trade"
            value={formatProfit(summary.best_trade)}
            valueStyle={{ color: 'oklch(0.70 0.150 155)' }}
          />
          <MetricTile
            label="Worst Trade"
            value={formatProfit(summary.worst_trade)}
            valueStyle={{ color: 'oklch(0.57 0.200 25)' }}
          />
        </motion.div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="trades-date-from" className="sr-only">From date</label>
        <input
          id="trades-date-from"
          type="date"
          value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          style={inputStyle}
        />
        <span className="text-xs" style={{ color: 'oklch(0.38 0 0)' }}>to</span>
        <label htmlFor="trades-date-to" className="sr-only">To date</label>
        <input
          id="trades-date-to"
          type="date"
          value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(1) }}
          style={inputStyle}
        />

        <div className="flex gap-1">
          {([null, 'win', 'loss'] as const).map(f => {
            const active = resultFilter === f
            const label = f === null ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)
            const activeStyles: Record<string, React.CSSProperties> = {
              null: {
                color: 'oklch(0.80 0.149 80)',
                background: 'oklch(0.76 0.149 80 / 0.10)',
                borderColor: 'oklch(0.55 0.120 80)',
              },
              win: {
                color: 'oklch(0.72 0.150 155)',
                background: 'oklch(0.70 0.150 155 / 0.10)',
                borderColor: 'oklch(0.55 0.130 155)',
              },
              loss: {
                color: 'oklch(0.68 0.150 25)',
                background: 'oklch(0.57 0.200 25 / 0.10)',
                borderColor: 'oklch(0.50 0.180 25)',
              },
            }
            return (
              <button
                key={String(f)}
                onClick={() => { setResultFilter(f); setPage(1) }}
                className="px-2.5 py-1.5 rounded text-xs font-medium border transition-all duration-150"
                style={active ? activeStyles[String(f)] : {
                  color: 'oklch(0.42 0 0)',
                  background: 'transparent',
                  borderColor: 'oklch(0.20 0 0)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <a
          href={`${API_URL}/trades/${selectedAccountId}/export`}
          download
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition-all duration-150"
          style={{ color: 'oklch(0.42 0 0)', borderColor: 'oklch(0.20 0 0)' }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.color = 'oklch(0.85 0 0)'
            el.style.borderColor = 'oklch(0.30 0 0)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.color = 'oklch(0.42 0 0)'
            el.style.borderColor = 'oklch(0.20 0 0)'
          }}
        >
          <Download size={12} strokeWidth={2} />
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'oklch(0.105 0 0)', border: '1px solid oklch(0.18 0 0)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'oklch(0.13 0 0)', borderBottom: '1px solid oklch(0.16 0 0)' }}>
                {['Date (UTC)', 'Ticket', 'Type', 'Lots', 'Open', 'Close', 'SL', 'TP', 'Profit', 'Duration'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-medium whitespace-nowrap"
                    style={{ color: 'oklch(0.38 0 0)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm" style={{ color: 'oklch(0.35 0 0)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && !trades?.items.length && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm" style={{ color: 'oklch(0.35 0 0)' }}>
                    No trades found
                  </td>
                </tr>
              )}
              {trades?.items.map((trade, i) => (
                <tr
                  key={trade.id}
                  style={{
                    borderTop: '1px solid oklch(0.13 0 0)',
                    background: i % 2 !== 0 ? 'oklch(0.09 0 0 / 0.4)' : 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'oklch(0.13 0 0)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 !== 0 ? 'oklch(0.09 0 0 / 0.4)' : 'transparent' }}
                >
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap" style={{ color: 'oklch(0.42 0 0)', fontFamily: "var(--font-mono)" }}>
                    {new Date(trade.open_time).toISOString().replace('T', ' ').slice(0, 16)} UTC
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.38 0 0)', fontFamily: "var(--font-mono)" }}>
                    {trade.ticket}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        background: trade.order_type === 'BUY' ? 'oklch(0.70 0.150 155 / 0.10)' : 'oklch(0.57 0.200 25 / 0.10)',
                        color: trade.order_type === 'BUY' ? 'oklch(0.72 0.150 155)' : 'oklch(0.68 0.150 25)',
                      }}
                    >
                      {trade.order_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)" }}>
                    {trade.volume}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)" }}>
                    {trade.price_open}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)" }}>
                    {trade.price_close ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.38 0 0)', fontFamily: "var(--font-mono)" }}>
                    {trade.sl ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.38 0 0)', fontFamily: "var(--font-mono)" }}>
                    {trade.tp ?? '—'}
                  </td>
                  <td
                    className="px-4 py-2.5 text-xs font-semibold"
                    style={{
                      color: (trade.profit ?? 0) >= 0 ? 'oklch(0.70 0.150 155)' : 'oklch(0.57 0.200 25)',
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatProfit(trade.profit)}
                  </td>
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'oklch(0.38 0 0)' }}>
                    {formatDuration(trade.duration_seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trades && trades.pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid oklch(0.16 0 0)' }}
          >
            <span className="text-xs" style={{ color: 'oklch(0.38 0 0)' }}>
              Page {trades.page} of {trades.pages} &middot; {trades.total} trades
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border transition-all duration-150 disabled:opacity-30"
                style={{ borderColor: 'oklch(0.20 0 0)', color: 'oklch(0.45 0 0)' }}
                onMouseEnter={e => { if (page > 1) e.currentTarget.style.color = 'oklch(0.85 0 0)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'oklch(0.45 0 0)' }}
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(trades.pages, p + 1))}
                disabled={page === trades.pages}
                className="p-1.5 rounded border transition-all duration-150 disabled:opacity-30"
                style={{ borderColor: 'oklch(0.20 0 0)', color: 'oklch(0.45 0 0)' }}
                onMouseEnter={e => { if (page < trades.pages) e.currentTarget.style.color = 'oklch(0.85 0 0)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'oklch(0.45 0 0)' }}
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
