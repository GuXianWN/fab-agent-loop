import axios, { AxiosError } from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 15_000,
  headers: {
    'Cache-Control': 'no-store',
  },
})

http.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (error instanceof ApiError) return Promise.reject(error)

    if (error instanceof AxiosError) {
      const payload = error.response?.data as { msg?: unknown; message?: unknown } | undefined
      const message = typeof payload?.msg === 'string'
        ? payload.msg
        : typeof payload?.message === 'string'
          ? payload.message
          : error.code === 'ECONNABORTED'
            ? 'Request timed out'
            : error.message || 'Request failed'

      return Promise.reject(new ApiError(message, error.response?.status))
    }

    return Promise.reject(new ApiError('Request failed'))
  },
)
