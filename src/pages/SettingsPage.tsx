import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccountStore } from '@/store/accountStore'
import { useCurrentUser } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { SettingsOut } from '@/types/api'
import { Save, Check, ShieldOff, Settings } from 'lucide-react'

const BOT_SETTING_FIELDS = [
  { key: 'RISK_PER_TRADE_PCT',       label: 'Risk per Trade',          unit: '%',     type: 'number' },
  { key: 'TRADING_START_HOUR_UTC',   label: 'Trading Start Hour',      unit: 'UTC',   type: 'number' },
  { key: 'TRADING_END_HOUR_UTC',     label: 'Trading End Hour',        unit: 'UTC',   type: 'number' },
  { key: 'MAX_OPEN_TRADES',          label: 'Max Open Trades',         unit: '',      type: 'number' },
  { key: 'MAX_DAILY_DRAWDOWN_PCT',   label: 'Max Daily Drawdown',      unit: '%',     type: 'number' },
  { key: 'ATR_SL_MULTIPLIER',        label: 'ATR SL Multiplier',       unit: 'x',     type: 'number' },
  { key: 'ATR_TP_MULTIPLIER',        label: 'ATR TP Multiplier',       unit: 'x',     type: 'number' },
  { key: 'CHECK_INTERVAL_SECONDS',   label: 'Check Interval',          unit: 's',     type: 'number' },
  { key: 'TRAILING_STOP_ENABLED',    label: 'Trailing Stop',           unit: '',      type: 'boolean' },
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
    mutationFn: () =>
      api.put(`/settings/${selectedAccountId}`, {
        settings: Object.entries(values).map(([key, value]) => ({ key, value })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', selectedAccountId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShieldOff size={32} style={{ color: 'oklch(0.22 0 0)' }} strokeWidth={1} />
        <p className="text-sm" style={{ color: 'oklch(0.38 0 0)' }}>Admin access required</p>
      </div>
    )
  }

  if (!selectedAccountId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Settings size={32} style={{ color: 'oklch(0.22 0 0)' }} strokeWidth={1} />
        <p className="text-sm" style={{ color: 'oklch(0.38 0 0)' }}>Select an account to manage settings</p>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-2xl space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'oklch(0.105 0 0)', border: '1px solid oklch(0.18 0 0)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid oklch(0.16 0 0)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'oklch(0.90 0 0)' }}>
            Bot Parameters
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'oklch(0.38 0 0)' }}>
            Changes write to .env and restart the container
          </p>
        </div>

        {/* Fields */}
        <div className="p-5 space-y-0">
          {BOT_SETTING_FIELDS.map((field, i) => (
            <div
              key={field.key}
              className="flex items-center justify-between gap-6 py-3"
              style={{
                borderTop: i > 0 ? '1px solid oklch(0.14 0 0)' : undefined,
              }}
            >
              <label className="text-sm flex-1" style={{ color: 'oklch(0.65 0 0)' }}>
                {field.label}
                {field.unit && (
                  <span className="ml-1 text-xs" style={{ color: 'oklch(0.38 0 0)' }}>
                    ({field.unit})
                  </span>
                )}
              </label>

              {field.type === 'boolean' ? (
                <button
                  onClick={() =>
                    setValues(v => ({
                      ...v,
                      [field.key]: v[field.key] === 'True' ? 'False' : 'True',
                    }))
                  }
                  className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
                  style={{
                    background:
                      values[field.key] === 'True'
                        ? 'oklch(0.76 0.149 80)'
                        : 'oklch(0.20 0 0)',
                  }}
                  role="switch"
                  aria-checked={values[field.key] === 'True'}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200"
                    style={{
                      background: 'oklch(0.95 0 0)',
                      transform:
                        values[field.key] === 'True'
                          ? 'translateX(20px)'
                          : 'translateX(0)',
                    }}
                  />
                </button>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={values[field.key] ?? ''}
                    onChange={e =>
                      setValues(v => ({ ...v, [field.key]: e.target.value }))
                    }
                    className="w-28 rounded-lg px-3 py-1.5 text-sm text-right tabular-nums transition-all duration-150"
                    style={{
                      background: 'oklch(0.13 0 0)',
                      border: '1px solid oklch(0.22 0 0)',
                      color: 'oklch(0.90 0 0)',
                      outline: 'none',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'oklch(0.55 0.120 80)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.76 0.149 80 / 0.08)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'oklch(0.22 0 0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid oklch(0.16 0 0)' }}
        >
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50"
            style={{
              background: saved ? 'oklch(0.65 0.140 155)' : 'oklch(0.76 0.149 80)',
              color: 'oklch(0.08 0 0)',
            }}
            onMouseEnter={e => {
              if (!saveMutation.isPending && !saved)
                e.currentTarget.style.background = 'oklch(0.80 0.149 80)'
            }}
            onMouseLeave={e => {
              if (!saveMutation.isPending && !saved)
                e.currentTarget.style.background = 'oklch(0.76 0.149 80)'
            }}
          >
            {saveMutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                Saved
              </>
            ) : (
              <>
                <Save size={14} strokeWidth={2} />
                Save &amp; Restart Bot
              </>
            )}
          </button>

          {saved && (
            <motion.p
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs"
              style={{ color: 'oklch(0.55 0.120 155)' }}
            >
              Settings saved — bot restarting…
            </motion.p>
          )}
          {saveMutation.isError && (
            <p className="text-xs" style={{ color: 'oklch(0.62 0.180 25)' }}>
              Failed to save settings
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
