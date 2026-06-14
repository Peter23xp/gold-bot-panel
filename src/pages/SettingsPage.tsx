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
      <div className="empty-state">
        <ShieldOff size={32} className="empty-state__icon" strokeWidth={1} />
        <p className="empty-state__text">Admin access required</p>
      </div>
    )
  }

  if (!selectedAccountId) {
    return (
      <div className="empty-state">
        <Settings size={32} className="empty-state__icon" strokeWidth={1} />
        <p className="empty-state__text">Select an account to manage settings</p>
      </div>
    )
  }

  return (
    <motion.div
      style={{ maxWidth: '672px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="card">
        {/* Header */}
        <div className="card__header">
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'oklch(0.90 0 0)' }}>
            Bot Parameters
          </p>
          <p style={{ fontSize: '0.75rem', marginTop: '2px', color: 'oklch(0.38 0 0)' }}>
            Changes write to .env and restart the container
          </p>
        </div>

        {/* Fields */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          {BOT_SETTING_FIELDS.map((field, i) => (
            <div
              key={field.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '24px',
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid oklch(0.14 0 0)' : undefined,
              }}
            >
              <label
                htmlFor={`setting-${field.key}`}
                style={{ fontSize: '0.875rem', flex: 1, color: 'oklch(0.65 0 0)' }}
              >
                {field.label}
                {field.unit && (
                  <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'oklch(0.38 0 0)' }}>
                    ({field.unit})
                  </span>
                )}
              </label>

              {field.type === 'boolean' ? (
                <button
                  id={`setting-${field.key}`}
                  onClick={() =>
                    setValues(v => ({
                      ...v,
                      [field.key]: v[field.key] === 'True' ? 'False' : 'True',
                    }))
                  }
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '20px',
                    borderRadius: '9999px',
                    transition: 'background 200ms',
                    flexShrink: 0,
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      values[field.key] === 'True'
                        ? 'oklch(0.76 0.149 80)'
                        : 'oklch(0.20 0 0)',
                  }}
                  role="switch"
                  aria-checked={values[field.key] === 'True'}
                  aria-label={field.label}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      transition: 'transform 200ms',
                      background: 'oklch(0.95 0 0)',
                      transform:
                        values[field.key] === 'True'
                          ? 'translateX(20px)'
                          : 'translateX(0)',
                    }}
                  />
                </button>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    id={`setting-${field.key}`}
                    type="number"
                    value={values[field.key] ?? ''}
                    onChange={e =>
                      setValues(v => ({ ...v, [field.key]: e.target.value }))
                    }
                    className="input"
                    style={{ width: '112px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderTop: '1px solid oklch(0.16 0 0)'
          }}
        >
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="btn"
            style={{
              padding: '8px 16px',
              background: saved ? 'oklch(0.65 0.140 155)' : 'oklch(0.76 0.149 80)',
              color: 'oklch(0.08 0 0)',
              borderColor: saved ? 'oklch(0.65 0.140 155)' : 'oklch(0.76 0.149 80)'
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
                <span style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }} />
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
              style={{ fontSize: '0.75rem', color: 'oklch(0.55 0.120 155)' }}
            >
              Settings saved. Bot restarting…
            </motion.p>
          )}
          {saveMutation.isError && (
            <p style={{ fontSize: '0.75rem', color: 'oklch(0.62 0.180 25)' }}>
              Failed to save settings
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
