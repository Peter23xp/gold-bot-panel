import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { LayoutDashboard, Terminal, History, Settings, LogOut, TrendingUp, ChevronDown, Briefcase } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { useAccountStore } from '@/store/accountStore'
import { useLogout, useCurrentUser } from '@/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: Terminal, label: 'Live Logs' },
  { to: '/trades', icon: History, label: 'Trade History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { data: accounts } = useAccounts()
  const { data: user } = useCurrentUser()
  const { selectedAccountId, setSelectedAccountId } = useAccountStore()
  const logout = useLogout()
  const [accountOpen, setAccountOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedAccount = accounts?.find(a => a.id === selectedAccountId)

  useEffect(() => {
    if (!accountOpen) return
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [accountOpen])

  return (
    <aside
      className="fixed left-0 top-0 h-full w-60 flex flex-col z-20"
      style={{
        background: 'oklch(0.065 0 0)',
        borderRight: '1px solid oklch(0.14 0 0)',
      }}
    >
      {/* Logo */}
      <div
        className="h-14 flex items-center gap-3 px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid oklch(0.14 0 0)' }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            background: 'oklch(0.76 0.149 80 / 0.12)',
            border: '1px solid oklch(0.76 0.149 80 / 0.25)',
          }}
        >
          <TrendingUp size={13} style={{ color: 'oklch(0.76 0.149 80)' }} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none tracking-tight" style={{ color: 'oklch(0.95 0 0)' }}>
            Gold Bot
          </p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'oklch(0.45 0 0)' }}>
            XAUUSD · Panel
          </p>
        </div>
      </div>

      {/* Account selector */}
      {accounts && accounts.length > 0 && (
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid oklch(0.14 0 0)' }}>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAccountOpen(o => !o)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors duration-150"
              style={{
                background: 'oklch(0.11 0 0)',
                border: '1px solid oklch(0.20 0 0)',
                color: selectedAccount ? 'oklch(0.90 0 0)' : 'oklch(0.45 0 0)',
              }}
            >
              <Briefcase size={12} strokeWidth={1.5} style={{ color: 'oklch(0.42 0 0)', flexShrink: 0 }} />
              {selectedAccount ? (
                <span className="flex-1 text-left truncate font-medium text-xs">{selectedAccount.display_name}</span>
              ) : (
                <span className="flex-1 text-left text-xs">Select account…</span>
              )}
              <ChevronDown
                size={12}
                strokeWidth={2}
                style={{
                  color: 'oklch(0.38 0 0)',
                  transition: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              />
            </button>

            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 right-0 top-full mt-1 rounded-md"
                style={{
                  zIndex: 100,
                  background: 'oklch(0.14 0 0)',
                  border: '1px solid oklch(0.22 0 0)',
                  boxShadow: '0 8px 24px oklch(0 0 0 / 0.5)',
                  overflow: 'hidden',
                }}
              >
                {accounts.map(a => {
                  const isSelected = a.id === selectedAccountId
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAccountId(a.id)
                        setAccountOpen(false)
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors duration-100"
                      style={{
                        color: isSelected ? 'oklch(0.76 0.149 80)' : 'oklch(0.70 0 0)',
                        background: isSelected ? 'oklch(0.76 0.149 80 / 0.08)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = 'oklch(0.18 0 0)'
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <Briefcase size={11} strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.6 }} />
                      <span className="flex-1 truncate">{a.display_name}</span>
                      <span
                        className="text-[9px] font-medium px-1 py-0.5 rounded"
                        style={{
                          background: 'oklch(0.70 0.150 155 / 0.12)',
                          color: 'oklch(0.65 0.130 155)',
                        }}
                      >
                        live
                      </span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm relative"
            style={({ isActive }) => ({
              background: isActive ? 'oklch(0.76 0.149 80 / 0.08)' : 'transparent',
              color: isActive ? 'oklch(0.82 0.100 80)' : 'oklch(0.50 0 0)',
              transition: 'background 120ms, color 120ms',
              fontWeight: isActive ? 500 : 400,
            })}
            onMouseEnter={e => {
              const link = e.currentTarget as HTMLAnchorElement
              if (!link.getAttribute('aria-current')) {
                link.style.background = 'oklch(0.11 0 0)'
                link.style.color = 'oklch(0.78 0 0)'
              }
            }}
            onMouseLeave={e => {
              const link = e.currentTarget as HTMLAnchorElement
              if (!link.getAttribute('aria-current')) {
                link.style.background = 'transparent'
                link.style.color = 'oklch(0.50 0 0)'
              }
            }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
                    style={{ background: 'oklch(0.76 0.149 80)' }}
                  />
                )}
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ flexShrink: 0 }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid oklch(0.14 0 0)' }}>
        <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
            style={{
              background: user?.role === 'admin'
                ? 'oklch(0.76 0.149 80 / 0.15)'
                : 'oklch(0.70 0.150 155 / 0.12)',
              color: user?.role === 'admin'
                ? 'oklch(0.76 0.149 80)'
                : 'oklch(0.65 0.130 155)',
            }}
          >
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'oklch(0.80 0 0)' }}>
              {user?.email}
            </p>
            <span
              className="text-[9px] font-semibold uppercase tracking-wide px-1 py-0.5 rounded"
              style={{
                background: user?.role === 'admin'
                  ? 'oklch(0.76 0.149 80 / 0.10)'
                  : 'oklch(0.20 0 0)',
                color: user?.role === 'admin'
                  ? 'oklch(0.70 0.120 80)'
                  : 'oklch(0.42 0 0)',
              }}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors duration-150"
          style={{ color: 'oklch(0.38 0 0)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'oklch(0.62 0.180 25)'
            e.currentTarget.style.background = 'oklch(0.57 0.200 25 / 0.07)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'oklch(0.38 0 0)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
