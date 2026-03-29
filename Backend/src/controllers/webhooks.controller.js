const pool = require('../config/database')
const dropiService = require('../services/dropi.service')
const wompiService = require('../services/wompi.service')
const mpService = require('../services/mercadopago.service')

// Actualiza estadísticas de productos tras confirmar un pedido (RN-030)
async function updateProductStats(items) {
  for (const item of items) {
    await pool.query(
      `INSERT INTO product_stats
         (product_id, product_name, category_slug, units_sold, orders_count, total_revenue, first_sale_at, last_sale_at)
       VALUES (?, ?, ?, ?, 1, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         units_sold    = units_sold + VALUES(units_sold),
         orders_count  = orders_count + 1,
         total_revenue = total_revenue + VALUES(total_revenue),
         last_sale_at  = NOW()`,
      [
        item.product_id,
        item.product_name,
        item.product_category || null,
        item.quantity,
        Number(item.subtotal),
      ]
    )
  }
}

// Crea el pedido en Dropi con reintentos exponenciales para errores 5xx (RN-042)
async function createDropiOrderWithRetry(orderPayload) {
  const delays = [1000, 2000, 4000]
  let lastError

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await dropiService.createOrder(orderPayload)
    } catch (err) {
      lastError = err
      const status = err.response?.status
      // RN-042: solo reintentar en errores 5xx
      if (status && status < 500) throw err
      if (attempt < delays.length) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]))
      }
    }
  }
  throw lastError
}

// POST /api/v1/webhooks/wompi
async function handleWompiWebhook(req, res) {
  // Responder de inmediato para no bloquear a Wompi
  res.json({ received: true })

  const event = req.body
  if (!event?.event || !event?.data?.transaction) return

  // RN-021: verificar firma HMAC
  const signatureValid = wompiService.verifyWebhookSignature(event)
  if (!signatureValid) {
    console.error('[webhooks/wompi] Firma inválida — intento rechazado', {
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    return
  }

  const { transaction } = event.data
  if (transaction.status !== 'APPROVED') return

  const reference = transaction.reference
  const transactionId = String(transaction.id)

  try {
    // RN-017: verificar pedido duplicado (mismo wompi_transaction_id)
    const [existing] = await pool.query(
      'SELECT id FROM orders WHERE wompi_transaction_id = ?',
      [transactionId]
    )
    if (existing.length) {
      console.warn('[webhooks/wompi] Transacción duplicada ignorada:', transactionId)
      return
    }

    // Buscar el pedido por referencia
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_code = ?',
      [reference]
    )
    if (!orders.length) {
      console.error('[webhooks/wompi] Pedido no encontrado para referencia:', reference)
      return
    }

    const order = orders[0]

    // Obtener ítems del pedido para Dropi y stats
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    )

    // Actualizar wompi_transaction_id y payment_status
    await pool.query(
      `UPDATE orders SET wompi_transaction_id = ?, payment_status = 'APPROVED', paid_at = NOW()
       WHERE id = ?`,
      [transactionId, order.id]
    )

    // RN-022: crear pedido en Dropi al recibir pago aprobado
    let dropiOrderId = null
    try {
      const dropiResult = await createDropiOrderWithRetry({
        customer: {
          fullName: order.customer_name,
          idNumber: order.customer_id_number,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        shipping: {
          country: order.shipping_country,
          department: order.shipping_department,
          city: order.shipping_city,
          address: order.shipping_address,
          neighborhood: order.shipping_neighborhood,
          notes: order.shipping_notes,
        },
        items: items.map(i => ({
          productId: i.product_id,
          dropiProductId: i.dropi_product_id,
          name: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
        })),
        payment: { method: 'WOMPI', total: Number(order.total) },
        reference: order.order_code,
      })
      dropiOrderId = dropiResult.dropiOrderId
    } catch (err) {
      // RN-042: fallo en Dropi — pedido queda en CONFIRMED sin dropi_order_id para revisión manual
      console.error('[webhooks/wompi] ERROR CRÍTICO creando pedido en Dropi — revisión manual requerida:', {
        orderCode: order.order_code,
        error: err.message,
      })
    }

    // Confirmar pedido en nuestra BD
    await pool.query(
      `UPDATE orders SET status = 'CONFIRMED', dropi_order_id = ? WHERE id = ?`,
      [dropiOrderId, order.id]
    )

    // Actualizar estadísticas (RN-030)
    await updateProductStats(items)

    console.info('[webhooks/wompi] Pedido confirmado:', order.order_code)
  } catch (err) {
    console.error('[webhooks/wompi] Error procesando webhook:', err.message)
  }
}

// POST /api/v1/webhooks/mercadopago
async function handleMercadoPagoWebhook(req, res) {
  // Responder de inmediato para no bloquear a MercadoPago
  res.json({ received: true })

  // RN-021: verificar firma del webhook
  const signatureValid = mpService.verifyWebhookSignature(req)
  if (!signatureValid) {
    console.error('[webhooks/mercadopago] Firma inválida — intento rechazado', {
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    return
  }

  const { type, data } = req.body || {}

  // Solo procesar notificaciones de pagos
  if (type !== 'payment' || !data?.id) return

  const paymentId = String(data.id)

  try {
    // Consultar el pago en la API de MercadoPago para obtener el estado real
    let payment
    try {
      payment = await mpService.getPayment(paymentId)
    } catch (err) {
      console.error('[webhooks/mercadopago] Error consultando pago en MP:', err.message)
      return
    }

    if (payment.status !== 'approved') return

    const reference = payment.external_reference

    // RN-017: verificar pedido duplicado (mismo mp_payment_id)
    const [existing] = await pool.query(
      'SELECT id FROM orders WHERE mp_payment_id = ?',
      [paymentId]
    )
    if (existing.length) {
      console.warn('[webhooks/mercadopago] Pago duplicado ignorado:', paymentId)
      return
    }

    // Buscar el pedido por referencia
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_code = ?',
      [reference]
    )
    if (!orders.length) {
      console.error('[webhooks/mercadopago] Pedido no encontrado para referencia:', reference)
      return
    }

    const order = orders[0]

    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    )

    // Actualizar mp_payment_id y payment_status
    await pool.query(
      `UPDATE orders SET mp_payment_id = ?, payment_status = 'APPROVED', paid_at = NOW()
       WHERE id = ?`,
      [paymentId, order.id]
    )

    // RN-022: crear pedido en Dropi al recibir pago aprobado
    let dropiOrderId = null
    try {
      const dropiResult = await createDropiOrderWithRetry({
        customer: {
          fullName: order.customer_name,
          idNumber: order.customer_id_number,
          email: order.customer_email,
          phone: order.customer_phone,
        },
        shipping: {
          country: order.shipping_country,
          department: order.shipping_department,
          city: order.shipping_city,
          address: order.shipping_address,
          neighborhood: order.shipping_neighborhood,
          notes: order.shipping_notes,
        },
        items: items.map(i => ({
          productId: i.product_id,
          dropiProductId: i.dropi_product_id,
          name: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
        })),
        payment: { method: 'MERCADOPAGO', total: Number(order.total) },
        reference: order.order_code,
      })
      dropiOrderId = dropiResult.dropiOrderId
    } catch (err) {
      console.error('[webhooks/mercadopago] ERROR CRÍTICO creando pedido en Dropi — revisión manual requerida:', {
        orderCode: order.order_code,
        error: err.message,
      })
    }

    // Confirmar pedido en nuestra BD
    await pool.query(
      `UPDATE orders SET status = 'CONFIRMED', dropi_order_id = ? WHERE id = ?`,
      [dropiOrderId, order.id]
    )

    // Actualizar estadísticas (RN-030)
    await updateProductStats(items)

    console.info('[webhooks/mercadopago] Pedido confirmado:', order.order_code)
  } catch (err) {
    console.error('[webhooks/mercadopago] Error procesando webhook:', err.message)
  }
}

module.exports = { handleWompiWebhook, handleMercadoPagoWebhook }
