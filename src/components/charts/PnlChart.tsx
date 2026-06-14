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
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'oklch(0.42 0 0)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'oklch(0.42 0 0)' }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ background: 'oklch(0.15 0 0)', border: '1px solid oklch(0.20 0 0)', borderRadius: '6px', fontSize: '12px', color: 'oklch(0.95 0 0)' }}
          formatter={(val) => {
            const n = typeof val === 'number' ? val : 0
            return [`${n >= 0 ? '+' : ''}${n.toFixed(2)}`, 'P&L']
          }}
        />
        <Line type="monotone" dataKey="pnl" stroke="oklch(0.76 0.149 80)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'oklch(0.76 0.149 80)' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
