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
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

function BotControlButton({
  onClick, disabled, children, variant = 'default',
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
  variant?: 'default' | 'danger' | 'neutral'
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant === 'neutral' ? 'ghost' : variant === 'default' ? 'primary' : 'danger'}`}
      style={variant === 'danger' ? {
        background: 'oklch(0.57 0.200 25 / 0.08)',
        color: 'oklch(0.68 0.150 25)',
        borderColor: 'oklch(0.57 0.200 25 / 0.20)'
      } : variant === 'default' ? {
        background: 'oklch(0.70 0.150 155 / 0.08)',
        color: 'oklch(0.72 0.150 155)',
        borderColor: 'oklch(0.70 0.150 155 / 0.20)'
      } : {}}
      onMouseEnter={e => {
        if (!disabled) {
           e.currentTarget.style.opacity = '0.8'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
           e.currentTarget.style.opacity = '1'
        }
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
      <div className="empty-state">
        <Activity size={32} className="empty-state__icon" strokeWidth={1} />
        <p className="empty-state__text">
          Select an account from the sidebar
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ borderRadius: '12px', height: '96px' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="skeleton" style={{ borderRadius: '12px', height: '160px', gridColumn: 'span 1' }} />
          <div className="skeleton" style={{ borderRadius: '12px', height: '160px', gridColumn: 'span 2' }} />
        </div>
        <div className="skeleton" style={{ borderRadius: '12px', height: '192px' }} />
      </div>
    )
  }

  const dailyPnl = dash?.daily_pnl ?? 0
  const drawdown = dash?.drawdown_pct ?? 0

  return (
    <motion.div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} variants={container} initial="hidden" animate="show">
      {/* Metrics row */}
      <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }} variants={item}>
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
      <motion.div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} variants={item}>
        {/* Bot control */}
        <div className="card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px', color: 'oklch(0.42 0 0)' }}>
                Bot Status
              </p>
              {status && <StatusBadge status={status.status} />}
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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

          <p style={{ fontSize: '0.75rem', color: 'oklch(0.38 0 0)' }}>
            {status ? formatUptime(status.uptime_seconds) : 'No status data'}
          </p>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
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
        <div className="card" style={{ flex: '2 1 500px', padding: '16px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '16px', color: 'oklch(0.42 0 0)' }}>
            P&L: last 7 days
          </p>
          <PnlChart points={chart?.points ?? []} />
        </div>
      </motion.div>

      {/* Open positions */}
      <motion.div className="card" variants={item}>
        <div className="card__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'oklch(0.75 0 0)' }}>
            Open Positions
          </p>
          {dash?.open_positions.length ? (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 500,
                background: 'oklch(0.76 0.149 80 / 0.10)',
                color: 'oklch(0.76 0.149 80)',
              }}
            >
              {dash.open_positions.length}
            </span>
          ) : null}
        </div>

        {!dash?.open_positions.length ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'oklch(0.35 0 0)' }}>
              No open positions
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Symbol', 'Type', 'Lots', 'Open', 'Current', 'SL', 'TP', 'Profit'].map(h => (
                    <th key={h}>{h}</th>
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
                  >
                    <td style={{ fontWeight: 600, color: 'oklch(0.90 0 0)' }}>
                      {pos.symbol}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
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
                    <td style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)" }}>
                      {pos.volume}
                    </td>
                    <td style={{ color: 'oklch(0.55 0 0)', fontFamily: "var(--font-mono)" }}>
                      {pos.price_open}
                    </td>
                    <td style={{ color: 'oklch(0.70 0 0)', fontFamily: "var(--font-mono)" }}>
                      {pos.price_current}
                    </td>
                    <td style={{ color: 'oklch(0.45 0 0)', fontFamily: "var(--font-mono)" }}>
                      {pos.sl}
                    </td>
                    <td style={{ color: 'oklch(0.45 0 0)', fontFamily: "var(--font-mono)" }}>
                      {pos.tp}
                    </td>
                    <td
                      style={{
                        fontWeight: 600,
                        color: pos.profit >= 0 ? 'oklch(0.70 0.150 155)' : 'oklch(0.57 0.200 25)',
                        fontFamily: "var(--font-mono)",
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
