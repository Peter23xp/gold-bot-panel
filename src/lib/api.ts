import axios from 'axios'

/**
 * API client for Gold Bot Panel.
 *
 * The backend authenticates via httpOnly cookies (primary) or
 * Authorization: Bearer header (fallback, added in deps.py).
 *
 * In development, Vite proxies /api/* → backend (same-origin).
 * In production (Vercel), VITE_API_URL points to the real backend.
 */
const isDev = import.meta.env.DEV
const API_URL = isDev ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000')

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// ---------- In-memory token storage ----------
// The backend sets httpOnly cookies, but those only work over HTTPS with
// samesite=none + secure=true. As a fallback we store the tokens from the
// login response and attach them as Authorization: Bearer headers.
let accessToken: string | null = null
let refreshToken: string | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
}

export function getAccessToken() {
  return accessToken
}

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// URLs that should NOT trigger automatic refresh on 401
const AUTH_URLS = ['/auth/login', '/auth/refresh', '/auth/logout']

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthCall = AUTH_URLS.some(u => requestUrl.includes(u))

    if (isAuthCall || error.config._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && refreshToken) {
      error.config._retry = true
      try {
        // Send refresh_token in body (backend now accepts both cookie and body)
        const res = await api.post('/auth/refresh', { refresh_token: refreshToken })
        const newTokens = res.data
        accessToken = newTokens.access_token
        if (newTokens.refresh_token) {
          refreshToken = newTokens.refresh_token
        }
        // Retry the original request with the new token
        error.config.headers.Authorization = `Bearer ${accessToken}`
        return api(error.config)
      } catch {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth:expired'))
        return Promise.reject(error)
      }
    }

    if (error.response?.status === 401) {
      clearTokens()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(error)
  }
)
