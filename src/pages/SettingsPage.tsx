import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccountStore } from '@/store/accountStore'
import { useCurrentUser } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { SettingsOut } from '@/types/api'
import { Save, Check } from 'lucide-react'

const BOT_SETTING_FIELDS = [
  { key: 'RISK_PER_TRADE_PCT', label: 'Risk per Trade (%)', type: 'number' },
  { key: 'TRADING_START_HOUR_UTC', label: 'Trading Start Hour (UTC)', type: 'number' },
  { key: 'TRADING_END_HOUR_UTC', label: 'Trading End Hour (UTC)', type: 'number' },
  { key: 'MAX_OPEN_TRADES', label: 'Max Open Trades', type: 'number' },
  { key: 'MAX_DAILY_DRAWDOWN_PCT', label: 'Max Daily Drawdown (%)', type: 'number' },
  { key: 'ATR_SL_MULTIPLIER', label: 'ATR SL Multiplier', type: 'number' },
  { key: 'ATR_TP_MULTIPLIER', label: 'ATR TP Multiplier', type: 'number' },
  { key: 'CHECK_INTERVAL_SECONDS', label: 'Check Interval (seconds)', type: 'number' },
  { key: 'TRAILING_STOP_ENABLED', label: 'Trailing Stop Enabled', type: 'boolean' },
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
    mutationFn: () => api.put(`/settings/${selectedAccountId}`, {
      settings: Object.entries(values).map(([key, value]) => ({ key, value }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', selectedAccountId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (user?.role !== 'admin') {
    return <div className="flex items-center justify-center h-64 text-sm text-[oklch(0.42_0_0)]">Admin access required</div>
  }

  if (!selectedAccountId) {
    return <div className="text-sm text-[oklch(0.42_0_0)]">Select an account to manage settings</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-lg">
        <div className="px-5 py-4 border-b border-[oklch(0.20_0_0)]">
          <h2 className="text-sm font-semibold text-[oklch(0.95_0_0)]">Bot Parameters</h2>
          <p className="text-xs text-[oklch(0.42_0_0)] mt-0.5">Changes are written to .env and restart the bot</p>
        </div>
        <div className="p-5 space-y-4">
          {BOT_SETTING_FIELDS.map(field => (
            <div key={field.key} className="flex items-center justify-between gap-4">
              <label className="text-sm text-[oklch(0.65_0_0)] min-w-0 flex-1">{field.label}</label>
              {field.type === 'boolean' ? (
                <button
                  onClick={() => setValues(v => ({ ...v, [field.key]: v[field.key] === 'True' ? 'False' : 'True' }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${values[field.key] === 'True' ? 'bg-[oklch(0.76_0.149_80)]' : 'bg-[oklch(0.20_0_0)]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${values[field.key] === 'True' ? 'translate-x-5' : ''}`} />
                </button>
              ) : (
                <input
                  type={field.type}
                  value={values[field.key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                  className="w-28 bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 text-sm text-[oklch(0.95_0_0)] text-right outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-[oklch(0.20_0_0)] flex items-center gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[oklch(0.76_0.149_80)] text-[oklch(0.07_0_0)] hover:bg-[oklch(0.70_0.149_80)] disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? 'Saving…' : saved ? <><Check size={14} strokeWidth={2} /> Saved</> : <><Save size={14} strokeWidth={1.5} /> Save &amp; Restart Bot</>}
          </button>
          {saved && <span className="text-xs text-[oklch(0.42_0_0)]">Settings saved — bot restarting…</span>}
          {saveMutation.isError && <span className="text-xs text-[oklch(0.57_0.200_25)]">Failed to save settings</span>}
        </div>
      </div>
    </div>
  )
}
