import { useAuthExpiredListener } from '@/hooks/useAuth'

/**
 * Listens for auth:expired custom events dispatched by the API interceptor
 * and performs a soft redirect to /login via React Router (no page reload,
 * no console clearing).
 */
export function AuthExpiredListener() {
  useAuthExpiredListener()
  return null
}
