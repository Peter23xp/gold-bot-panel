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
    return <div className="min-h-screen" style={{ background: 'var(--bg)' }} />
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="ml-60">
        <TopBar title={title} />
        <main className="pt-14 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="p-6 max-w-[1280px] mx-auto"
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
