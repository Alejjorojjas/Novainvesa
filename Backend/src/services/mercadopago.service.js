const crypto = require('crypto')
const axios = require('axios')

const mpClient = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

function authHeader() {
  return { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
}

// Crea una preferencia de pago en MercadoPago
// Docs: https://www.mercadopago.com.co/developers/es/reference/preferences
async function createPreference({ reference, items, customer, shipping, total, backUrl }) {
  const mpItems = items.map(item => ({
    id: item.productId,
    title: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: 'COP',
  }))

  const payload = {
    external_reference: reference,
    items: mpItems,
    payer: {
      name: customer.fullName,
      email: customer.email,
      phone: { number: customer.phone },
    },
    shipments: {
      receiver_address: {
        zip_code: '',
        state_name: shipping.department || '',
        city_name: shipping.city,
        street_name: shipping.address,
      },
    },
    back_urls: {
      success: backUrl || process.env.FRONTEND_URL + '/confirmacion',
      failure: backUrl || process.env.FRONTEND_URL + '/checkout',
      pending: backUrl || process.env.FRONTEND_URL + '/confirmacion',
    },
    auto_return: 'approved',
    // Expiración en 30 minutos (RN-019)
    expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    statement_descriptor: 'NOVAINVESA',
  }

  const response = await mpClient.post('/checkout/preferences', payload, {
    headers: authHeader(),
  })
  const pref = response.data

  return {
    preferenceId: pref.id,
    initPoint: pref.init_point,
    sandboxInitPoint: pref.sandbox_init_point,
  }
}

// Consulta un pago por su ID (llamado desde el webhook handler)
async function getPayment(paymentId) {
  const response = await mpClient.get(`/v1/payments/${paymentId}`, {
    headers: authHeader(),
  })
  return response.data
}

// Verifica la firma del webhook de MercadoPago (RN-021)
// Header x-signature: "ts=<timestamp>,v1=<hash>"
// Mensaje firmado: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
function verifyWebhookSignature(req) {
  const xSignature = req.headers['x-signature']
  const xRequestId = req.headers['x-request-id'] || ''
  const dataId = req.query['data.id'] || req.body?.data?.id || ''

  if (!xSignature) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map(part => part.trim().split('='))
  )
  const { ts, v1 } = parts
  if (!ts || !v1) return false

  const message = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto
    .createHmac('sha256', process.env.MP_WEBHOOK_SECRET || '')
    .update(message)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(v1, 'hex')
    )
  } catch {
    return false
  }
}

module.exports = { createPreference, getPayment, verifyWebhookSignature }
