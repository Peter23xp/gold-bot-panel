import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/logs': 'Live Logs',
  '/trades': 'Trade History',
  '/settings': 'Settings',
}

export function AppShell() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'Gold Bot Panel'
  return (
    <div className="min-h-screen bg-[oklch(0.07_0_0)]">
      <Sidebar />
      <div className="ml-60">
        <TopBar title={title} />
        <main className="pt-14 min-h-screen">
          <div className="p-6 max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
