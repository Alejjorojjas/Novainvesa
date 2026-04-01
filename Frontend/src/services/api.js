import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Adjunta x-api-key a todas las peticiones internas
api.interceptors.request.use(config => {
  const apiKey = import.meta.env.VITE_INTERNAL_API_KEY
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  return config
})

export default api
