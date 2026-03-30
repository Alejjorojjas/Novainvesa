import api from './api'

const AUTH_HEADERS = {
  'x-api-key': import.meta.env.VITE_INTERNAL_API_KEY,
}

export const ordersService = {
  // POST /api/v1/orders — crear pedido COD
  async createOrder(orderData) {
    const { data } = await api.post('/api/v1/orders', orderData, {
      headers: AUTH_HEADERS,
    })
    return data.data // { order }
  },

  // GET /api/v1/orders/:orderId
  async getOrder(orderId) {
    const { data } = await api.get(`/api/v1/orders/${orderId}`, {
      headers: AUTH_HEADERS,
    })
    return data.data // { order }
  },

  // POST /api/v1/payments/wompi/create
  async createWompiPayment(orderData, redirectUrl) {
    const { data } = await api.post(
      '/api/v1/payments/wompi/create',
      { orderData, redirectUrl },
      { headers: AUTH_HEADERS }
    )
    return data.data // { wompiTransactionId, checkoutUrl, reference, amountInCents, expiresAt }
  },

  // POST /api/v1/payments/mercadopago/create
  async createMercadoPagoPayment(orderData) {
    const { data } = await api.post(
      '/api/v1/payments/mercadopago/create',
      { orderData },
      { headers: AUTH_HEADERS }
    )
    return data.data // { preferenceId, initPoint, reference }
  },

  // GET /api/v1/tracking/:orderId
  async getTracking(orderId) {
    const { data } = await api.get(`/api/v1/tracking/${orderId}`)
    return data.data // { orderId, status, statusLabel, trackingNumber, timeline, ... }
  },
}
