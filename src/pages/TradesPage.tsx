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
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricTile label="Total Trades" value={String(summary.total_trades)} />
          <MetricTile label="Win Rate" value={`${summary.win_rate_pct}%`} valueClass={summary.win_rate_pct >= 50 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'} />
          <MetricTile label="Total Profit" value={formatProfit(summary.total_profit)} valueClass={summary.total_profit >= 0 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'} />
          <MetricTile label="Best Trade" value={formatProfit(summary.best_trade)} valueClass="text-[oklch(0.70_0.150_155)]" />
          <MetricTile label="Worst Trade" value={formatProfit(summary.worst_trade)} valueClass="text-[oklch(0.57_0.200_25)]" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 text-sm text-[oklch(0.95_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors" />
        <span className="text-[oklch(0.42_0_0)] text-xs">to</span>
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
          className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 text-sm text-[oklch(0.95_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors" />
        <div className="flex gap-1">
          {([null, 'win', 'loss'] as const).map(f => (
            <button key={String(f)} onClick={() => { setResultFilter(f); setPage(1) }}
              className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${resultFilter === f ? 'border-[oklch(0.76_0.149_80)] text-[oklch(0.76_0.149_80)] bg-[oklch(0.76_0.149_80_/_0.1)]' : 'border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)]'}`}>
              {f === null ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <a href={`${API_URL}/trades/${selectedAccountId}/export`} download
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] transition-colors">
          <Download size={12} strokeWidth={1.5} /> Export CSV
        </a>
      </div>

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
              {isLoading && <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-[oklch(0.42_0_0)]">Loading…</td></tr>}
              {!isLoading && !trades?.items.length && <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-[oklch(0.42_0_0)]">No trades found</td></tr>}
              {trades?.items.map((trade, i) => (
                <tr key={trade.id} className={`border-t border-[oklch(0.15_0_0)] hover:bg-[oklch(0.13_0_0)] transition-colors ${i % 2 === 0 ? '' : 'bg-[oklch(0.09_0_0_/_0.5)]'}`}>
                  <td className="px-4 py-2.5 text-xs text-[oklch(0.42_0_0)] whitespace-nowrap">{new Date(trade.open_time).toISOString().replace('T',' ').slice(0,16)} UTC</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.42_0_0)]">{trade.ticket}</td>
                  <td className="px-4 py-2.5"><span className={trade.order_type === 'BUY' ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}>{trade.order_type}</span></td>
                  <td className="px-4 py-2.5 text-[oklch(0.65_0_0)]">{trade.volume}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.65_0_0)]">{trade.price_open}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.65_0_0)]">{trade.price_close ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.42_0_0)]">{trade.sl ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[oklch(0.42_0_0)]">{trade.tp ?? '—'}</td>
                  <td className={`px-4 py-2.5 font-mono text-xs font-medium ${(trade.profit ?? 0) >= 0 ? 'text-[oklch(0.70_0.150_155)]' : 'text-[oklch(0.57_0.200_25)]'}`}>{formatProfit(trade.profit)}</td>
                  <td className="px-4 py-2.5 text-xs text-[oklch(0.42_0_0)]">{formatDuration(trade.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {trades && trades.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[oklch(0.20_0_0)]">
            <span className="text-xs text-[oklch(0.42_0_0)]">Page {trades.page} of {trades.pages} ({trades.total} trades)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] disabled:opacity-40 transition-colors"><ChevronLeft size={14} strokeWidth={1.5} /></button>
              <button onClick={() => setPage(p => Math.min(trades.pages, p + 1))} disabled={page === trades.pages} className="p-1.5 rounded border border-[oklch(0.20_0_0)] text-[oklch(0.42_0_0)] hover:text-[oklch(0.95_0_0)] disabled:opacity-40 transition-colors"><ChevronRight size={14} strokeWidth={1.5} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
