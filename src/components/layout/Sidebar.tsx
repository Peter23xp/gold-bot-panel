import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ScrollText, History, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccounts } from '@/hooks/useAccounts'
import { useAccountStore } from '@/store/accountStore'
import { useLogout, useCurrentUser } from '@/hooks/useAuth'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/trades', icon: History, label: 'Trades' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { data: accounts } = useAccounts()
  const { data: user } = useCurrentUser()
  const { selectedAccountId, setSelectedAccountId } = useAccountStore()
  const logout = useLogout()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[oklch(0.11_0_0)] border-r border-[oklch(0.20_0_0)] flex flex-col z-20">
      <div className="h-14 flex items-center px-4 border-b border-[oklch(0.20_0_0)]">
        <span className="font-bold text-[oklch(0.76_0.149_80)] tracking-tight">GOLD BOT</span>
        <span className="ml-1.5 text-xs text-[oklch(0.42_0_0)]">PANEL</span>
      </div>

      {accounts && accounts.length > 0 && (
        <div className="px-3 py-3 border-b border-[oklch(0.20_0_0)]">
          <select
            value={selectedAccountId || ''}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="w-full bg-[oklch(0.15_0_0)] text-[oklch(0.95_0_0)] text-sm border border-[oklch(0.20_0_0)] rounded-md px-3 py-1.5 outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
          >
            {!selectedAccountId && <option value="">Select account…</option>}
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.display_name}</option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-[oklch(0.76_0.149_80_/_0.12)] text-[oklch(0.76_0.149_80)] font-medium'
                : 'text-[oklch(0.65_0_0)] hover:text-[oklch(0.95_0_0)] hover:bg-[oklch(0.15_0_0)]'
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-[oklch(0.20_0_0)]">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <div className="w-6 h-6 rounded-full bg-[oklch(0.76_0.149_80_/_0.2)] flex items-center justify-center">
            <span className="text-xs font-medium text-[oklch(0.76_0.149_80)]">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[oklch(0.95_0_0)] truncate">{user?.email}</p>
            <p className="text-xs text-[oklch(0.42_0_0)] capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-[oklch(0.65_0_0)] hover:text-[oklch(0.95_0_0)] hover:bg-[oklch(0.15_0_0)] transition-colors w-full"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
