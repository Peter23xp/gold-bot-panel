import { useState } from 'react'
import { motion } from 'motion/react'
import { useLogin } from '@/hooks/useAuth'
import { AlertCircle, TrendingUp } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'oklch(0.07 0 0)' }}
    >
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'oklch(0.09 0.008 80)' }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.95 0 0) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.95 0 0) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glowing orb */}
        <div
          className="absolute bottom-[-120px] left-[-80px] w-[480px] h-[480px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, oklch(0.76 0.149 80) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.76 0.149 80 / 0.15)', border: '1px solid oklch(0.76 0.149 80 / 0.3)' }}
          >
            <TrendingUp size={18} style={{ color: 'oklch(0.76 0.149 80)' }} strokeWidth={2} />
          </div>
          <span className="font-semibold tracking-tight" style={{ color: 'oklch(0.95 0 0)' }}>
            Gold Bot
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'oklch(0.76 0.149 80)' }}>
              XAUUSD · Algorithmic
            </p>
            <h2
              className="text-4xl font-bold leading-tight tracking-tight"
              style={{ color: 'oklch(0.95 0 0)', textWrap: 'balance' } as React.CSSProperties}
            >
              Full control of your bot, from anywhere.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'oklch(0.55 0 0)' }}>
              Start, stop, inspect trades and adjust risk parameters without touching the server.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: 'Live P&L', value: 'Real-time' },
              { label: 'Log access', value: 'Instant' },
              { label: 'Bot control', value: '1 click' },
            ].map(s => (
              <div key={s.label} className="space-y-1">
                <p className="text-xl font-bold" style={{ color: 'oklch(0.76 0.149 80)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'oklch(0.42 0 0)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <p className="relative z-10 text-xs" style={{ color: 'oklch(0.35 0 0)' }}>
          AWS · Docker · FastAPI · PostgreSQL
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'oklch(0.76 0.149 80 / 0.12)', border: '1px solid oklch(0.76 0.149 80 / 0.25)' }}
            >
              <TrendingUp size={15} style={{ color: 'oklch(0.76 0.149 80)' }} strokeWidth={2} />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'oklch(0.95 0 0)' }}>Gold Bot</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'oklch(0.95 0 0)' }}>
              Sign in
            </h1>
            <p className="text-sm" style={{ color: 'oklch(0.42 0 0)' }}>
              Enter your credentials to access the panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
                style={{ color: 'oklch(0.65 0 0)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200"
                style={{
                  background: 'oklch(0.12 0 0)',
                  border: '1px solid oklch(0.22 0 0)',
                  color: 'oklch(0.95 0 0)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.76 0.149 80 / 0.6)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.76 0.149 80 / 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.22 0 0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: 'oklch(0.65 0 0)' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200"
                style={{
                  background: 'oklch(0.12 0 0)',
                  border: '1px solid oklch(0.22 0 0)',
                  color: 'oklch(0.95 0 0)',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.76 0.149 80 / 0.6)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.76 0.149 80 / 0.1)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.22 0 0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Error message */}
            {login.isError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
                style={{
                  background: 'oklch(0.57 0.200 25 / 0.1)',
                  border: '1px solid oklch(0.57 0.200 25 / 0.25)',
                }}
              >
                <AlertCircle size={14} style={{ color: 'oklch(0.57 0.200 25)', flexShrink: 0 }} strokeWidth={2} />
                <p className="text-sm" style={{ color: 'oklch(0.75 0.12 25)' }}>
                  Incorrect email or password
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 relative overflow-hidden"
              style={{
                background: login.isPending ? 'oklch(0.60 0.120 80)' : 'oklch(0.76 0.149 80)',
                color: 'oklch(0.10 0 0)',
                cursor: login.isPending ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!login.isPending)
                  e.currentTarget.style.background = 'oklch(0.80 0.149 80)'
              }}
              onMouseLeave={e => {
                if (!login.isPending)
                  e.currentTarget.style.background = 'oklch(0.76 0.149 80)'
              }}
            >
              {login.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
