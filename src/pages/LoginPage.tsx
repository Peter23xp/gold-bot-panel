import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-[oklch(0.07_0_0)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-[oklch(0.76_0.149_80)]">GOLD BOT</span>
          <p className="text-sm text-[oklch(0.42_0_0)] mt-1">Trading Panel</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-[oklch(0.11_0_0)] border border-[oklch(0.20_0_0)] rounded-xl p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[oklch(0.65_0_0)] uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-2 text-sm text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.42_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[oklch(0.65_0_0)] uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[oklch(0.15_0_0)] border border-[oklch(0.20_0_0)] rounded-md px-3 py-2 text-sm text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.42_0_0)] outline-none focus:border-[oklch(0.76_0.149_80)] transition-colors"
              placeholder="••••••••"
            />
          </div>
          {login.isError && (
            <p className="text-xs text-[oklch(0.57_0.200_25)]">Invalid email or password</p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-[oklch(0.76_0.149_80)] text-[oklch(0.07_0_0)] font-semibold text-sm py-2.5 rounded-md hover:bg-[oklch(0.70_0.149_80)] disabled:opacity-50 transition-colors"
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
