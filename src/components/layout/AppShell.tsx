import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useCurrentUser } from '@/hooks/useAuth'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/logs': 'Live Logs',
  '/trades': 'Trade History',
  '/settings': 'Settings',
}

export function AppShell() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Gold Bot Panel'
  const { data: user, isLoading, isError } = useCurrentUser()

  if (isLoading) {
    return <div className="app-shell" />
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main-wrapper">
        <TopBar title={title} />
        <main className="app-shell__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="app-shell__page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
