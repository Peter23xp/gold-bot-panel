import axios from 'axios'

/**
 * API client for Gold Bot Panel.
 *
 * In development, Vite proxies /api/* → backend (same-origin, cookies work).
 * In production (Vercel), VITE_API_URL points to the real backend.
 */
const isDev = import.meta.env.DEV
const API_URL = isDev ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000')

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Store the access token in memory for Bearer auth fallback
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

// Attach Bearer token to every request if available
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

    // Don't intercept auth calls — let the caller handle errors directly
    if (isAuthCall || error.config._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && refreshToken) {
      error.config._retry = true
      try {
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
        // Refresh failed — clear tokens, redirect via React Router
        clearTokens()
        // Dispatch a custom event instead of hard redirect to keep console logs
        window.dispatchEvent(new CustomEvent('auth:expired'))
        return Promise.reject(error)
      }
    }

    // No refresh token available and got 401 → session expired
    if (error.response?.status === 401) {
      clearTokens()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(error)
  }
)
