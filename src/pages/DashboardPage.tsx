import { motion } from 'motion/react'
import { useDashboard, usePnlChart } from '@/hooks/useDashboard'
import { useBotStatus, useBotAction } from '@/hooks/useBotStatus'
import { useAccountStore } from '@/store/accountStore'
import { MetricTile } from '@/components/ui/MetricTile'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PnlChart } from '@/components/charts/PnlChart'
import { formatProfit, formatUptime } from '@/lib/utils'
import { Play, Square, RotateCcw, Activity } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

function BotControlButton({
  onClick, disabled, children, variant = 'default',
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
  variant?: 'default' | 'danger' | 'neutral'
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { color: 'oklch(0.72 0.150 155)', background: 'oklch(0.70 0.150 155 / 0.08)', borderColor: 'oklch(0.70 0.150 155 / 0.20)' },
    danger: { color: 'oklch(0.68 0.150 25)', background: 'oklch(0.57 0.200 25 / 0.08)', borderColor: 'oklch(0.57 0.200 25 / 0.20)' },
    neutral: { color: 'oklch(0.55 0 0)', background: 'oklch(0.13 0 0)', borderColor: 'oklch(0.22 0 0)' },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
      style={styles[variant]}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.opacity = '0.8'
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.opacity = '1'
      }}
    >
      {children}
    </button>
  )
}

export function DashboardPage() {
  const { selectedAccountId } = useAccountStore()
  const { data: dash, isLoading } = useDashboard(selectedAccountId)
  const { data: status } = useBotStatus(selectedAccountId)
  const { data: chart } = usePnlChart(selectedAccountId)
  const { start, stop, restart } = useBotAction(selectedAccountId)

  if (!selectedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} style={{ color: 'oklch(0.25 0 0)' }} strokeWidth={1} />
        <p className="text-sm" style={{ color: 'oklch(0.38 0 0)' }}>
          Select an account from the sidebar
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="skeleton rounded-xl h-40" />
          <div className="skeleton rounded-xl lg:col-span-2 h-40" />
        </div>
        <div className="skeleton rounded-xl h-48" />
      </div>
    )
  }

  const dailyPnl = dash?.daily_pnl ?? 0
  const drawdown = dash?.drawdown_pct ?? 0

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      {/* Metrics row */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" variants={item}>
        <MetricTile
          label="Balance"
          value={dash?.balance != null ? `$${dash.balance.toFixed(2)}` : '—'}
        />
        <MetricTile
          label="Equity"
          value={dash?.equity != null ? `$${dash.equity.toFixed(2)}` : '—'}
        />
        <MetricTile
          label="Daily P&L"
          value={formatProfit(dailyPnl)}
          valueStyle={{
            color: dailyPnl > 0
              ? 'oklch(0.70 0.150 155)'
              : dailyPnl < 0
                ? 'oklch(0.57 0.200 25)'
                : 'oklch(0.95 0 0)',
          }}
        />
        <MetricTile
          label="Drawdown"
          value={`${drawdown.toFixed(2)}%`}
          valueStyle={{ color: drawdown > 3 ? 'oklch(0.57 0.200 25)' : undefined }}
        />
      </motion.div>

      {/* Bot status + P&L chart */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-3" variants={item}>
        {/* Bot control */}
        <div
          className="rounded-xl p-4 flex flex-col gap-4"
          style={{
            background: 'oklch(0.105 0 0)',
            border: '1px solid oklch(0.18 0 0)',
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'oklch(0.42 0 0)' }}>
                Bot Status
              </p>
              {status && <StatusBadge status={status.status} />}
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: status?.status === 'running'
                  ? 'oklch(0.70 0.150 155 / 0.08)'
                  : 'oklch(0.13 0 0)',
              }}
            >
              <Activity
                size={15}
                strokeWidth={1.5}
                style={{
                  color: status?.status === 'running'
                    ? 'oklch(0.70 0.150 155)'
                    : 'oklch(0.30 0 0)',
                }}
              />
            </div>
          </div>

          <p className="text-xs" style={{ color: 'oklch(0.38 0 0)' }}>
            {status ? formatUptime(status.uptime_seconds) : 'No status data'}
          </p>

          <div className="flex gap-2 pt-1">
            <BotControlButton
              onClick={() => start.mutate()}
              disabled={start.isPending || status?.status === 'running'}
              variant="default"
            >
              <Play size={11} strokeWidth={2} fill="currentColor" />
              Start
            </BotControlButton>
            <BotControlButton
              onClick={() => stop.mutate()}
              disabled={stop.isPending || status?.status === 'stopped'}
              variant="danger"
            >
              <Square size={11} strokeWidth={2} fill="currentColor" />
              Stop
            </BotControlButton>
            <BotControlButton
              onClick={() => restart.mutate()}
              disabled={restart.isPending}
              variant="neutral"
            >
              <RotateCcw size={11} strokeWidth={2} />
              Restart
            </BotControlButton>
          </div>
        </div>

        {/* P&L chart */}
        <div
          className="lg:col-span-2 rounded-xl p-4"
          style={{
            background: 'oklch(0.105 0 0)',
            border: '1px solid oklch(0.18 0 0)',
          }}
        >
          <p className="text-xs font-medium mb-4" style={{ color: 'oklch(0.42 0 0)' }}>
            P&L — last 7 days
          </p>
          <PnlChart points={chart?.points ?? []} />
        </div>
      </motion.div>

      {/* Open positions */}
      <motion.div
        className="rounded-xl overflow-hidden"
        variants={item}
        style={{
          background: 'oklch(0.105 0 0)',
          border: '1px solid oklch(0.18 0 0)',
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid oklch(0.16 0 0)' }}
        >
          <p className="text-xs font-semibold" style={{ color: 'oklch(0.75 0 0)' }}>
            Open Positions
          </p>
          {dash?.open_positions.length ? (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'oklch(0.76 0.149 80 / 0.10)',
                color: 'oklch(0.76 0.149 80)',
              }}
            >
              {dash.open_positions.length}
            </span>
          ) : null}
        </div>

        {!dash?.open_positions.length ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm" style={{ color: 'oklch(0.35 0 0)' }}>
              No open positions
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(0.14 0 0)' }}>
                  {['Symbol', 'Type', 'Lots', 'Open', 'Current', 'SL', 'TP', 'Profit'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-medium"
                      style={{ color: 'oklch(0.38 0 0)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dash.open_positions.map((pos, i) => (
                  <motion.tr
                    key={pos.ticket}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="transition-colors duration-100"
                    style={{ borderTop: i > 0 ? '1px solid oklch(0.13 0 0)' : undefined }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'oklch(0.13 0 0)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: 'oklch(0.90 0 0)' }}>
                      {pos.symbol}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: pos.order_type === 'BUY'
                            ? 'oklch(0.70 0.150 155 / 0.12)'
                            : 'oklch(0.57 0.200 25 / 0.12)',
                          color: pos.order_type === 'BUY'
                            ? 'oklch(0.72 0.150 155)'
                            : 'oklch(0.68 0.150 25)',
                        }}
                      >
                        {pos.order_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: 'oklch(0.55 0 0)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {pos.volume}
                    </td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: 'oklch(0.55 0 0)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {pos.price_open}
                    </td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: 'oklch(0.70 0 0)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {pos.price_current}
                    </td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: 'oklch(0.45 0 0)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {pos.sl}
                    </td>
                    <td className="px-4 py-2.5 text-sm" style={{ color: 'oklch(0.45 0 0)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {pos.tp}
                    </td>
                    <td
                      className="px-4 py-2.5 text-sm font-semibold"
                      style={{
                        color: pos.profit >= 0 ? 'oklch(0.70 0.150 155)' : 'oklch(0.57 0.200 25)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {formatProfit(pos.profit)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
