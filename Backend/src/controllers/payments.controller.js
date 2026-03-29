const pool = require('../config/database')
const wompiService = require('../services/wompi.service')
const mpService = require('../services/mercadopago.service')

// Genera código de pedido NOVA-YYYYMMDD-NNNN con secuencial diario (RN-015)
async function generateOrderCode() {
  const now = new Date()
  const bogota = new Date(now.getTime() - 5 * 60 * 60 * 1000)
  const y = bogota.getUTCFullYear()
  const m = String(bogota.getUTCMonth() + 1).padStart(2, '0')
  const d = String(bogota.getUTCDate()).padStart(2, '0')
  const dateStr = `${y}${m}${d}`

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM orders
     WHERE DATE(CONVERT_TZ(created_at, '+00:00', '-05:00')) = ?`,
    [`${y}-${m}-${d}`]
  )
  const seq = String(Number(rows[0].cnt) + 1).padStart(4, '0')
  return `NOVA-${dateStr}-${seq}`
}

// Valida los campos mínimos del orderData enviado desde el frontend
function validateOrderData(orderData) {
  const errors = []
  const { customer, shipping, items, total } = orderData || {}

  if (!customer?.fullName || customer.fullName.trim().length < 3)
    errors.push('customer.fullName es requerido (mín 3 caracteres)')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!customer?.email || !emailRegex.test(customer.email))
    errors.push('customer.email es requerido y debe ser válido')

  const phoneDigits = (customer?.phone || '').replace(/\D/g, '')
  if (phoneDigits.length < 10)
    errors.push('customer.phone es requerido (mín 10 dígitos)')

  if (!shipping?.city?.trim())
    errors.push('shipping.city es requerido')

  if (!shipping?.address?.trim())
    errors.push('shipping.address es requerido')

  if (!Array.isArray(items) || items.length === 0)
    errors.push('items es requerido y debe contener al menos 1 producto')

  if (!total || Number(total) <= 0)
    errors.push('total es requerido y debe ser mayor a 0')

  return errors
}

// Crea el registro de pedido pendiente en la BD (compartido por ambos métodos de pago)
async function insertPendingOrder({ orderCode, orderData, paymentMethod }) {
  const { customer, shipping, items, total, currency } = orderData
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  const [result] = await pool.query(
    `INSERT INTO orders (
      order_code, user_id,
      customer_name, customer_email, customer_phone, customer_id_number,
      shipping_country, shipping_department, shipping_city,
      shipping_address, shipping_neighborhood, shipping_notes,
      payment_method, payment_status,
      subtotal, shipping_cost, total, currency,
      status, source
    ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 0.00, ?, ?, 'CREATED', 'WEB')`,
    [
      orderCode,
      customer.fullName.trim(),
      customer.email.trim().toLowerCase(),
      customer.phone.trim(),
      customer.idNumber || null,
      shipping.country || 'CO',
      shipping.department || '',
      shipping.city.trim(),
      shipping.address.trim(),
      shipping.neighborhood || null,
      shipping.notes || null,
      paymentMethod,
      subtotal,
      total,
      currency || 'COP',
    ]
  )

  const orderId = result.insertId

  const itemValues = items.map(item => [
    orderId,
    item.productId,
    item.dropiProductId || item.productId,
    item.name,
    item.image || null,
    item.category || null,
    item.quantity,
    item.unitPrice,
    item.unitPrice * item.quantity,
    item.currency || 'COP',
  ])

  await pool.query(
    `INSERT INTO order_items
      (order_id, product_id, dropi_product_id, product_name, product_image,
       product_category, quantity, unit_price, subtotal, currency)
     VALUES ?`,
    [itemValues]
  )

  return orderId
}

// POST /api/v1/payments/wompi/create
async function createWompiPayment(req, res) {
  const { orderData, redirectUrl } = req.body || {}

  const errors = validateOrderData(orderData)
  if (errors.length) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors[0] },
    })
  }

  let orderCode
  try {
    orderCode = await generateOrderCode()
  } catch (err) {
    console.error('[createWompiPayment] Error generando código de pedido:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al iniciar el pago' },
    })
  }

  try {
    await insertPendingOrder({ orderCode, orderData, paymentMethod: 'WOMPI' })
  } catch (err) {
    console.error('[createWompiPayment] Error insertando pedido en BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al iniciar el pago' },
    })
  }

  // Expira en 30 minutos (RN-019)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const amountInCents = Math.round(Number(orderData.total) * 100)

  let checkoutUrl
  try {
    checkoutUrl = wompiService.buildCheckoutUrl({
      reference: orderCode,
      amountInCents,
      currency: orderData.currency || 'COP',
      redirectUrl: redirectUrl || `${process.env.FRONTEND_URL}/confirmacion`,
      expiresAt,
    })
  } catch (err) {
    console.error('[createWompiPayment] Error construyendo URL de checkout:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al generar el enlace de pago' },
    })
  }

  return res.json({
    success: true,
    data: {
      wompiTransactionId: orderCode, // Wompi usará el reference para identificar la transacción
      checkoutUrl,
      reference: orderCode,
      amountInCents,
      expiresAt,
    },
  })
}

// POST /api/v1/payments/mercadopago/create
async function createMercadoPagoPayment(req, res) {
  const { orderData } = req.body || {}

  const errors = validateOrderData(orderData)
  if (errors.length) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors[0] },
    })
  }

  let orderCode
  try {
    orderCode = await generateOrderCode()
  } catch (err) {
    console.error('[createMercadoPagoPayment] Error generando código de pedido:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al iniciar el pago' },
    })
  }

  try {
    await insertPendingOrder({ orderCode, orderData, paymentMethod: 'MERCADOPAGO' })
  } catch (err) {
    console.error('[createMercadoPagoPayment] Error insertando pedido en BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al iniciar el pago' },
    })
  }

  let preference
  try {
    preference = await mpService.createPreference({
      reference: orderCode,
      items: orderData.items,
      customer: orderData.customer,
      shipping: orderData.shipping,
      total: orderData.total,
    })
  } catch (err) {
    console.error('[createMercadoPagoPayment] Error creando preferencia en MP:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al generar el enlace de pago con MercadoPago' },
    })
  }

  return res.json({
    success: true,
    data: {
      preferenceId: preference.preferenceId,
      initPoint: preference.initPoint,
      reference: orderCode,
    },
  })
}

module.exports = { createWompiPayment, createMercadoPagoPayment }
