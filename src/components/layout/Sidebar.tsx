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
    <aside className="app-shell__sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <TrendingUp size={13} strokeWidth={2} />
        </div>
        <div>
          <p className="sidebar__logo-text">Gold Bot</p>
          <p className="sidebar__logo-sub">XAUUSD · Panel</p>
        </div>
      </div>

      {/* Account selector */}
      {accounts && accounts.length > 0 && (
        <div className="sidebar__account-section">
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setAccountOpen(o => !o)}
              className="sidebar__account-btn"
              style={{
                color: selectedAccount ? 'oklch(0.90 0 0)' : 'oklch(0.45 0 0)',
              }}
            >
              <Briefcase size={12} strokeWidth={1.5} style={{ color: 'oklch(0.42 0 0)', flexShrink: 0 }} />
              {selectedAccount ? (
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, fontSize: '0.75rem' }}>
                  {selectedAccount.display_name}
                </span>
              ) : (
                <span style={{ flex: 1, textAlign: 'left', fontSize: '0.75rem' }}>Select account…</span>
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
                className="sidebar__dropdown"
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
                      className="sidebar__dropdown-item"
                      style={{
                        color: isSelected ? 'oklch(0.76 0.149 80)' : 'oklch(0.70 0 0)',
                        background: isSelected ? 'oklch(0.76 0.149 80 / 0.08)' : 'transparent',
                      }}
                    >
                      <Briefcase size={11} strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.6 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.display_name}</span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 500,
                          padding: '2px 4px',
                          borderRadius: '3px',
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
      <nav className="sidebar__nav">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="sidebar__nav-indicator" />}
                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div
            className="sidebar__user-avatar"
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="sidebar__user-email">{user?.email}</p>
            <span
              className="sidebar__user-role"
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

        <button onClick={() => logout.mutate()} className="sidebar__logout">
          <LogOut size={13} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
