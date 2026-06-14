import { useState } from 'react'
import { motion } from 'motion/react'
import { useLogin } from '@/hooks/useAuth'
import { AlertCircle, TrendingUp, ArrowRight } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const login = useLogin()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="login-page">
      {/* ─── Left panel — branding & features ─── */}
      <div className="login-left">
        {/* Grid texture overlay */}
        <div className="login-left__grid" />

        {/* Ambient glow */}
        <div className="login-left__glow" />
        <div className="login-left__glow login-left__glow--top" />

        {/* Content */}
        <div className="login-left__content">
          {/* Logo */}
          <motion.div
            className="login-logo"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="login-logo__icon">
              <TrendingUp size={18} strokeWidth={2} />
            </div>
            <span className="login-logo__text">Gold Bot</span>
          </motion.div>

          {/* Hero text */}
          <motion.div
            className="login-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="login-hero__title">
              Full control of your bot,{' '}
              <span className="login-hero__title--accent">from anywhere.</span>
            </h2>
            <p className="login-hero__subtitle">
              Start, stop, inspect trades, and adjust risk parameters without touching the server.
            </p>
          </motion.div>

          {/* Features list */}
          <motion.ul
            className="login-features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {[
              'P&L and equity updated every 30 seconds',
              'Start, stop, or restart the container in one click',
              'Tail live bot logs without SSH access',
              'Edit risk parameters and trade hours from any browser',
            ].map((line, i) => (
              <motion.li
                key={line}
                className="login-features__item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
              >
                <span className="login-features__dot" />
                {line}
              </motion.li>
            ))}
          </motion.ul>

          {/* Tech stack */}
          <motion.p
            className="login-tech"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            AWS · Docker · FastAPI · PostgreSQL
          </motion.p>
        </div>
      </div>

      {/* ─── Right panel — sign-in form ─── */}
      <div className="login-right">
        <motion.div
          className="login-form-wrapper"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="login-mobile-logo">
            <div className="login-logo__icon login-logo__icon--sm">
              <TrendingUp size={15} strokeWidth={2} />
            </div>
            <span className="login-logo__text login-logo__text--sm">Gold Bot</span>
          </div>

          {/* Form card */}
          <div className="login-card">
            <div className="login-card__header">
              <h1 className="login-card__title">Sign in</h1>
              <p className="login-card__subtitle">
                Enter your credentials to access the panel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email field */}
              <div className="login-field">
                <label htmlFor="login-email" className="login-field__label">
                  Email
                </label>
                <div className={`login-field__input-wrapper ${focusedField === 'email' ? 'login-field__input-wrapper--focused' : ''}`}>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    className="login-field__input"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="login-field">
                <label htmlFor="login-password" className="login-field__label">
                  Password
                </label>
                <div className={`login-field__input-wrapper ${focusedField === 'password' ? 'login-field__input-wrapper--focused' : ''}`}>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    className="login-field__input"
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Error message */}
              {login.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="login-error"
                >
                  <AlertCircle size={14} strokeWidth={2} />
                  <p>Incorrect email or password</p>
                </motion.div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={login.isPending}
                className={`login-submit ${login.isPending ? 'login-submit--loading' : ''}`}
              >
                {login.isPending ? (
                  <span className="login-submit__loading">
                    <span className="login-submit__spinner" />
                    Signing in…
                  </span>
                ) : (
                  <span className="login-submit__content">
                    Sign in
                    <ArrowRight size={16} strokeWidth={2} />
                  </span>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════
           LOGIN PAGE — SCOPED STYLES
           ═══════════════════════════════════════════ */

        .login-page {
          display: flex;
          min-height: 100vh;
          min-height: 100dvh;
          background: oklch(0.06 0 0);
        }

        /* ─── Left Panel ─── */
        .login-left {
          display: none;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          width: 520px;
          background: oklch(0.08 0.006 80);
          border-right: 1px solid oklch(0.18 0.008 80);
        }

        @media (min-width: 1024px) {
          .login-left { display: flex; }
        }

        @media (min-width: 1280px) {
          .login-left { width: 580px; }
        }

        .login-left__grid {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image:
            linear-gradient(oklch(0.8 0 0) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.8 0 0) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 100%);
        }

        .login-left__glow {
          position: absolute;
          bottom: -140px;
          left: -100px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          opacity: 0.18;
          pointer-events: none;
          background: radial-gradient(circle, oklch(0.76 0.149 80) 0%, transparent 65%);
          filter: blur(60px);
        }

        .login-left__glow--top {
          bottom: auto;
          left: auto;
          top: -200px;
          right: -100px;
          width: 400px;
          height: 400px;
          opacity: 0.06;
        }

        .login-left__content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          padding: 40px 48px;
        }

        /* ─── Logo ─── */
        .login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-logo__icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: oklch(0.76 0.149 80 / 0.12);
          border: 1px solid oklch(0.76 0.149 80 / 0.25);
          color: oklch(0.76 0.149 80);
        }

        .login-logo__icon--sm {
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }

        .login-logo__text {
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: -0.01em;
          color: oklch(0.95 0 0);
        }

        .login-logo__text--sm {
          font-size: 0.875rem;
        }

        /* ─── Hero ─── */
        .login-hero {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .login-hero__title {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: oklch(0.95 0 0);
          text-wrap: balance;
        }

        .login-hero__title--accent {
          background: linear-gradient(135deg, oklch(0.76 0.149 80), oklch(0.82 0.130 70));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-hero__subtitle {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: oklch(0.55 0 0);
          max-width: 380px;
        }

        /* ─── Features ─── */
        .login-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 4px;
        }

        .login-features__item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: oklch(0.50 0 0);
        }

        .login-features__dot {
          margin-top: 7px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          background: oklch(0.76 0.149 80 / 0.5);
        }

        .login-tech {
          font-size: 0.6875rem;
          color: oklch(0.32 0 0);
          letter-spacing: 0.02em;
        }

        /* ─── Right Panel ─── */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 40px 24px;
          background: oklch(0.06 0 0);
        }

        @media (min-width: 1024px) {
          .login-right {
            padding: 40px 64px;
          }
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        /* ─── Mobile Logo ─── */
        .login-mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        @media (min-width: 1024px) {
          .login-mobile-logo { display: none; }
        }

        /* ─── Form Card ─── */
        .login-card {
          background: oklch(0.10 0 0);
          border: 1px solid oklch(0.18 0 0);
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow:
            0 0 0 1px oklch(0.14 0 0),
            0 8px 40px oklch(0 0 0 / 0.3),
            0 2px 8px oklch(0 0 0 / 0.2);
        }

        .login-card__header {
          margin-bottom: 28px;
        }

        .login-card__title {
          font-size: 1.375rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: oklch(0.95 0 0);
          margin-bottom: 6px;
        }

        .login-card__subtitle {
          font-size: 0.8125rem;
          color: oklch(0.50 0 0);
          line-height: 1.5;
        }

        /* ─── Form ─── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ─── Field ─── */
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-field__label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: oklch(0.60 0 0);
        }

        .login-field__input-wrapper {
          position: relative;
          border-radius: 10px;
          border: 1px solid oklch(0.22 0 0);
          background: oklch(0.12 0 0);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }

        .login-field__input-wrapper--focused {
          border-color: oklch(0.76 0.149 80 / 0.5);
          box-shadow: 0 0 0 3px oklch(0.76 0.149 80 / 0.08), 0 0 16px oklch(0.76 0.149 80 / 0.04);
        }

        .login-field__input {
          width: 100%;
          padding: 12px 16px;
          font-size: 0.875rem;
          font-family: inherit;
          color: oklch(0.95 0 0);
          background: transparent;
          border: none;
          outline: none;
          border-radius: 10px;
        }

        .login-field__input::placeholder {
          color: oklch(0.35 0 0);
        }

        /* Autofill override — critical for dark theme */
        .login-field__input:-webkit-autofill,
        .login-field__input:-webkit-autofill:hover,
        .login-field__input:-webkit-autofill:focus,
        .login-field__input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px oklch(0.12 0 0) inset !important;
          -webkit-text-fill-color: oklch(0.95 0 0) !important;
          caret-color: oklch(0.95 0 0);
          transition: background-color 9999s ease-in-out 0s;
          border-radius: 10px;
        }

        /* ─── Error ─── */
        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          background: oklch(0.57 0.200 25 / 0.08);
          border: 1px solid oklch(0.57 0.200 25 / 0.2);
          color: oklch(0.72 0.14 25);
          font-size: 0.8125rem;
        }

        .login-error svg {
          flex-shrink: 0;
          color: oklch(0.57 0.200 25);
        }

        /* ─── Submit Button ─── */
        .login-submit {
          width: 100%;
          padding: 13px 20px;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, oklch(0.76 0.149 80), oklch(0.72 0.155 75));
          color: oklch(0.08 0 0);
          transition: all 150ms ease;
          margin-top: 4px;
          box-shadow: 0 1px 2px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1);
        }

        .login-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, oklch(0.80 0.149 80), oklch(0.76 0.155 75));
          box-shadow: 0 2px 8px oklch(0.76 0.149 80 / 0.3), 0 1px 2px oklch(0 0 0 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.15);
          transform: translateY(-1px);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px oklch(0 0 0 / 0.3);
        }

        .login-submit--loading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .login-submit__content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-submit__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-submit__spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid currentColor;
          border-top-color: transparent;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
