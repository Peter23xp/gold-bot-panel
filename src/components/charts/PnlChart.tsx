import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { PnlPoint } from '@/types/api'

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div
      style={{
        background: 'oklch(0.16 0 0)',
        border: '1px solid oklch(0.22 0 0)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 16px oklch(0 0 0 / 0.5)',
      }}
    >
      <p style={{ fontSize: '11px', color: 'oklch(0.40 0 0)', marginBottom: '2px' }}>{label}</p>
      <p style={{
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        color: val >= 0 ? 'oklch(0.72 0.150 155)' : 'oklch(0.68 0.150 25)',
      }}>
        {val >= 0 ? '+' : ''}{val.toFixed(2)}
      </p>
    </div>
  )
}

export function PnlChart({ points }: { points: PnlPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'oklch(0.30 0 0)' }}>
        No P&L data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={176}>
      <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'oklch(0.35 0 0)', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'oklch(0.35 0 0)', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={v => (v >= 0 ? `+${v}` : `${v}`)}
        />
        <ReferenceLine y={0} stroke="oklch(0.22 0 0)" strokeDasharray="3 3" />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'oklch(0.25 0 0)', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke="oklch(0.76 0.149 80)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{
            r: 4,
            fill: 'oklch(0.76 0.149 80)',
            stroke: 'oklch(0.10 0 0)',
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
