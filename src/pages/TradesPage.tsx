import { useState } from 'react'
import { motion } from 'motion/react'
import { useAccountStore } from '@/store/accountStore'
import { useTrades, useTradeSummary } from '@/hooks/useTrades'
import { MetricTile } from '@/components/ui/MetricTile'
import { formatProfit, formatDuration } from '@/lib/utils'
import { Download, ChevronLeft, ChevronRight, History } from 'lucide-react'

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
    return (
      <div className="empty-state">
        <History size={32} className="empty-state__icon" strokeWidth={1} />
        <p className="empty-state__text">
          Select an account to view trades
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary tiles */}
      {summary && (
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}
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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <label htmlFor="trades-date-from" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>From date</label>
        <input
          id="trades-date-from"
          type="date"
          className="input"
          value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(1) }}
        />
        <span style={{ fontSize: '0.75rem', color: 'oklch(0.38 0 0)' }}>to</span>
        <label htmlFor="trades-date-to" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>To date</label>
        <input
          id="trades-date-to"
          type="date"
          className="input"
          value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(1) }}
        />

        <div style={{ display: 'flex', gap: '4px' }}>
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
                className="filter-chip"
                style={active ? activeStyles[String(f)] : {}}
              >
                {label}
              </button>
            )
          })}
        </div>

        <a
          href={`${API_URL}/trades/${selectedAccountId}/export`}
          download
          className="btn btn--ghost"
          style={{ marginLeft: 'auto' }}
        >
          <Download size={12} strokeWidth={2} />
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: 'oklch(0.13 0 0)', borderBottom: '1px solid oklch(0.16 0 0)' }}>
                {['Date (UTC)', 'Ticket', 'Type', 'Lots', 'Open', 'Close', 'SL', 'TP', 'Profit', 'Duration'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10} style={{ padding: '40px 16px', textAlign: 'center', color: 'oklch(0.35 0 0)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && !trades?.items.length && (
                <tr>
                  <td colSpan={10} style={{ padding: '40px 16px', textAlign: 'center', color: 'oklch(0.35 0 0)' }}>
                    No trades found
                  </td>
                </tr>
              )}
              {trades?.items.map((trade, i) => (
                <tr
                  key={trade.id}
                  style={{
                    background: i % 2 !== 0 ? 'oklch(0.09 0 0 / 0.4)' : 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'oklch(0.13 0 0)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 !== 0 ? 'oklch(0.09 0 0 / 0.4)' : 'transparent' }}
                >
                  <td style={{ color: 'oklch(0.42 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {new Date(trade.open_time).toISOString().replace('T', ' ').slice(0, 16)} UTC
                  </td>
                  <td style={{ color: 'oklch(0.38 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem' }}>
                    {trade.ticket}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: trade.order_type === 'BUY' ? 'oklch(0.70 0.150 155 / 0.10)' : 'oklch(0.57 0.200 25 / 0.10)',
                        color: trade.order_type === 'BUY' ? 'oklch(0.72 0.150 155)' : 'oklch(0.68 0.150 25)',
                      }}
                    >
                      {trade.order_type}
                    </span>
                  </td>
                  <td style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem' }}>
                    {trade.volume}
                  </td>
                  <td style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem' }}>
                    {trade.price_open}
                  </td>
                  <td style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem' }}>
                    {trade.price_close ?? '—'}
                  </td>
                  <td style={{ color: 'oklch(0.38 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem' }}>
                    {trade.sl ?? '—'}
                  </td>
                  <td style={{ color: 'oklch(0.38 0 0)', fontFamily: "var(--font-mono)", fontSize: '0.75rem' }}>
                    {trade.tp ?? '—'}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: (trade.profit ?? 0) >= 0 ? 'oklch(0.70 0.150 155)' : 'oklch(0.57 0.200 25)',
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatProfit(trade.profit)}
                  </td>
                  <td style={{ color: 'oklch(0.38 0 0)', fontSize: '0.75rem' }}>
                    {formatDuration(trade.duration_seconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trades && trades.pages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: '1px solid oklch(0.16 0 0)'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'oklch(0.38 0 0)' }}>
              Page {trades.page} of {trades.pages} &middot; {trades.total} trades
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn--ghost"
                style={{ padding: '6px' }}
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(trades.pages, p + 1))}
                disabled={page === trades.pages}
                className="btn btn--ghost"
                style={{ padding: '6px' }}
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
