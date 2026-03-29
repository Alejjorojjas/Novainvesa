const pool = require('../config/database')
const dropiService = require('../services/dropi.service')

// Genera código de pedido NOVA-YYYYMMDD-NNNN con secuencial diario (RN-015)
async function generateOrderCode() {
  const now = new Date()
  // Colombia: UTC-5
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

// Valida campos obligatorios del body (RN-014)
function validateOrderBody(body) {
  const errors = []
  const { customer, shipping, items, payment } = body || {}

  if (!customer?.fullName || customer.fullName.trim().length < 3)
    errors.push('customer.fullName es requerido (mín 3 caracteres)')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!customer?.email || !emailRegex.test(customer.email))
    errors.push('customer.email es requerido y debe tener formato válido')

  const phoneDigits = (customer?.phone || '').replace(/\D/g, '')
  if (phoneDigits.length < 10)
    errors.push('customer.phone es requerido (mín 10 dígitos)')

  if (!shipping?.city?.trim())
    errors.push('shipping.city es requerido')

  if (!shipping?.address?.trim())
    errors.push('shipping.address es requerido')

  if (!Array.isArray(items) || items.length === 0)
    errors.push('items es requerido y debe contener al menos 1 producto')

  const validMethods = ['COD', 'WOMPI', 'MERCADOPAGO']
  if (!payment?.method || !validMethods.includes(payment.method))
    errors.push('payment.method es requerido (COD, WOMPI o MERCADOPAGO)')

  return errors
}

// Etiqueta de tiempo estimado de entrega según ciudad (RN-023)
function getEstimatedDeliveryLabel(city) {
  const mainCities = ['bogota', 'medellin', 'cali', 'barranquilla']
  const norm = (city || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return mainCities.includes(norm) ? '2-4 días hábiles' : '4-7 días hábiles'
}

// POST /api/v1/orders
async function createOrder(req, res) {
  const errors = validateOrderBody(req.body)
  if (errors.length) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors[0] },
    })
  }

  const { customer, shipping, items, payment, source, utmParams } = req.body

  // RN-018: Validaciones específicas para COD
  if (payment.method === 'COD') {
    const total = payment.total || items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

    if (total >= 500000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COD_NOT_AVAILABLE',
          message: 'El pago contra entrega solo está disponible para pedidos menores a $500.000 COP',
        },
      })
    }

    let coverage
    try {
      coverage = await dropiService.checkCodCoverage(shipping.city, shipping.department)
    } catch (err) {
      console.error('[createOrder] Error verificando cobertura COD:', err.message)
      return res.status(500).json({
        success: false,
        error: { code: 'DROPI_ERROR', message: 'Error al verificar la cobertura COD' },
      })
    }

    if (!coverage.codAvailable) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COD_NOT_AVAILABLE',
          message: `El pago contra entrega no está disponible para la ciudad: ${shipping.city}`,
        },
      })
    }
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const total = payment.total || subtotal
  // payment_status: COD se marca 'COD' (se paga al entregar); online empieza en PENDING
  const paymentStatus = payment.method === 'COD' ? 'COD' : 'PENDING'

  let orderCode
  try {
    orderCode = await generateOrderCode()
  } catch (err) {
    console.error('[createOrder] Error generando código de pedido:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al crear el pedido' },
    })
  }

  // Insertar pedido — datos del cliente se copian en este momento (RN-016)
  let orderId
  try {
    const [result] = await pool.query(
      `INSERT INTO orders (
        order_code, user_id,
        customer_name, customer_email, customer_phone, customer_id_number,
        shipping_country, shipping_department, shipping_city,
        shipping_address, shipping_neighborhood, shipping_notes,
        payment_method, payment_status,
        subtotal, shipping_cost, total, currency,
        status,
        utm_source, utm_medium, utm_campaign,
        source
      ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?, 'COP', 'CREATED', ?, ?, ?, ?)`,
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
        payment.method,
        paymentStatus,
        subtotal,
        total,
        utmParams?.source || null,
        utmParams?.medium || null,
        utmParams?.campaign || null,
        (source || 'WEB').toUpperCase(),
      ]
    )
    orderId = result.insertId
  } catch (err) {
    console.error('[createOrder] Error insertando pedido en BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al crear el pedido' },
    })
  }

  // Insertar ítems del pedido
  try {
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
  } catch (err) {
    console.error('[createOrder] Error insertando ítems en BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al guardar los ítems del pedido' },
    })
  }

  // RN-022: Para COD, crear pedido en Dropi inmediatamente
  let dropiOrderId = null
  let finalStatus = 'CREATED'

  if (payment.method === 'COD') {
    try {
      const dropiResult = await dropiService.createOrder({
        customer,
        shipping,
        items,
        payment,
        reference: orderCode,
      })
      dropiOrderId = dropiResult.dropiOrderId
      finalStatus = 'CONFIRMED'

      await pool.query(
        `UPDATE orders SET dropi_order_id = ?, status = 'CONFIRMED' WHERE id = ?`,
        [dropiOrderId, orderId]
      )

      // Actualizar estadísticas de productos (RN-030)
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
            item.productId,
            item.name,
            item.category || null,
            item.quantity,
            item.unitPrice * item.quantity,
          ]
        )
      }
    } catch (err) {
      // RN-042: fallo en Dropi — el pedido queda en CREATED sin dropi_order_id para revisión manual
      console.error('[createOrder] Error creando pedido en Dropi (revisión manual requerida):', err.message)
    }
  }

  return res.status(201).json({
    success: true,
    data: {
      order: {
        id: orderCode,
        dropiOrderId,
        status: finalStatus,
        customer: {
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
        total,
        currency: 'COP',
        paymentMethod: payment.method,
        estimatedDelivery: getEstimatedDeliveryLabel(shipping.city),
        createdAt: new Date().toISOString(),
      },
    },
    message: 'Pedido creado exitosamente',
  })
}

// GET /api/v1/orders/:orderId
async function getOrder(req, res) {
  const { orderId } = req.params

  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE order_code = ?`,
      [orderId]
    )

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'El pedido no existe' },
      })
    }

    const order = orders[0]

    const [items] = await pool.query(
      `SELECT product_id, dropi_product_id, product_name, product_image,
              product_category, quantity, unit_price, subtotal, currency
       FROM order_items WHERE order_id = ?`,
      [order.id]
    )

    return res.json({
      success: true,
      data: {
        order: {
          id: order.order_code,
          dropiOrderId: order.dropi_order_id,
          status: order.status,
          trackingNumber: order.tracking_number,
          carrier: order.carrier,
          customer: {
            fullName: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
          },
          shipping: {
            city: order.shipping_city,
            address: order.shipping_address,
          },
          items: items.map(item => ({
            productId: item.product_id,
            name: item.product_name,
            image: item.product_image,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            subtotal: Number(item.subtotal),
          })),
          total: Number(order.total),
          currency: order.currency,
          paymentMethod: order.payment_method,
          estimatedDelivery: order.estimated_delivery,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        },
      },
    })
  } catch (err) {
    console.error('[getOrder] Error BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error interno al obtener el pedido' },
    })
  }
}

module.exports = { createOrder, getOrder }
