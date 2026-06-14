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
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4 h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  const dailyPnl = dash?.daily_pnl ?? 0
  const drawdown = dash?.drawdown_pct ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile label="Balance" value={`$${dash?.balance.toFixed(2) ?? '—'}`} />
        <MetricTile label="Equity" value={`$${dash?.equity.toFixed(2) ?? '—'}`} />
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
        <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)]">Bot Status</h2>
            {status && <StatusBadge status={status.status} />}
          </div>
          <p className="text-xs text-[oklch(0.42_0_0)]">{status ? formatUptime(status.uptime_seconds) : '—'}</p>
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

        <div className="lg:col-span-2 bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg p-4">
          <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)] mb-4">P&L (7 days)</h2>
          <PnlChart points={chart?.points ?? []} />
        </div>
      </div>

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
