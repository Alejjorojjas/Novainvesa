const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/database')

const ADMIN_TOKEN_EXPIRY = '8h' // RN-005

// POST /api/v1/admin/login
async function adminLogin(req, res) {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'username y password son requeridos' },
    })
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM admin_users WHERE username = ?',
      [username.trim()]
    )

    const genericError = {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Usuario o contraseña incorrectos' },
    }

    if (!rows.length) {
      await bcrypt.compare(password, '$2a$12$invalidhashpadding000000000000000000000000000000000000')
      return res.status(401).json(genericError)
    }

    const admin = rows[0]
    const passwordMatch = await bcrypt.compare(password, admin.password_hash)
    if (!passwordMatch) {
      return res.status(401).json(genericError)
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'Esta cuenta de administrador está inactiva' },
      })
    }

    // Registrar last_login_at (RN-034)
    await pool.query('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [admin.id])

    // JWT firmado con JWT_ADMIN_SECRET (separado de JWT_SECRET)
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: ADMIN_TOKEN_EXPIRY }
    )

    return res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      },
    })
  } catch (err) {
    console.error('[adminLogin] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al iniciar sesión' },
    })
  }
}

// GET /api/v1/admin/dashboard
async function getDashboard(req, res) {
  try {
    const [[salesToday]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS orders
       FROM orders
       WHERE DATE(CONVERT_TZ(created_at, '+00:00', '-05:00')) = CURDATE()
         AND payment_status IN ('APPROVED', 'COD')`
    )

    const [[salesMonth]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS orders
       FROM orders
       WHERE YEAR(CONVERT_TZ(created_at, '+00:00', '-05:00')) = YEAR(CURDATE())
         AND MONTH(CONVERT_TZ(created_at, '+00:00', '-05:00')) = MONTH(CURDATE())
         AND payment_status IN ('APPROVED', 'COD')`
    )

    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) AS totalUsers FROM users WHERE is_active = TRUE'
    )

    // Ventas por día últimos 30 días
    const [salesByDay] = await pool.query(
      `SELECT DATE(CONVERT_TZ(created_at, '+00:00', '-05:00')) AS date,
              COUNT(*) AS orders,
              COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND payment_status IN ('APPROVED', 'COD')
       GROUP BY DATE(CONVERT_TZ(created_at, '+00:00', '-05:00'))
       ORDER BY date ASC`
    )

    // Top 5 productos
    const [topProducts] = await pool.query(
      `SELECT product_id, product_name, category_slug,
              units_sold, orders_count, total_revenue
       FROM product_stats
       ORDER BY units_sold DESC LIMIT 5`
    )

    // Últimos 5 pedidos
    const [recentOrders] = await pool.query(
      `SELECT order_code, customer_name, customer_email,
              total, currency, payment_method, status, created_at
       FROM orders
       ORDER BY created_at DESC LIMIT 5`
    )

    return res.json({
      success: true,
      data: {
        salesToday: {
          revenue: Number(salesToday.total),
          orders: Number(salesToday.orders),
        },
        salesMonth: {
          revenue: Number(salesMonth.total),
          orders: Number(salesMonth.orders),
        },
        totalUsers: Number(totalUsers),
        salesByDay: salesByDay.map(r => ({
          date: r.date,
          orders: Number(r.orders),
          revenue: Number(r.revenue),
        })),
        topProducts: topProducts.map(p => ({
          productId: p.product_id,
          name: p.product_name,
          category: p.category_slug,
          unitsSold: p.units_sold,
          ordersCount: p.orders_count,
          totalRevenue: Number(p.total_revenue),
        })),
        recentOrders: recentOrders.map(o => ({
          orderCode: o.order_code,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          total: Number(o.total),
          currency: o.currency,
          paymentMethod: o.payment_method,
          status: o.status,
          createdAt: o.created_at,
        })),
      },
    })
  } catch (err) {
    console.error('[getDashboard] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener el dashboard' },
    })
  }
}

// GET /api/v1/admin/orders
async function listOrders(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const offset = (page - 1) * limit
  const { status, paymentMethod, search } = req.query

  const conditions = []
  const params = []

  if (status) {
    conditions.push('o.status = ?')
    params.push(status)
  }
  if (paymentMethod) {
    conditions.push('o.payment_method = ?')
    params.push(paymentMethod)
  }
  if (search) {
    conditions.push('(o.order_code LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)')
    const like = `%${search}%`
    params.push(like, like, like)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${where}`,
      params
    )

    const [orders] = await pool.query(
      `SELECT o.id, o.order_code, o.customer_name, o.customer_email,
              o.customer_phone, o.shipping_city, o.payment_method,
              o.payment_status, o.total, o.currency, o.status,
              o.dropi_order_id, o.tracking_number, o.created_at
       FROM orders o ${where}
       ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return res.json({
      success: true,
      data: {
        orders: orders.map(o => ({
          id: o.order_code,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerPhone: o.customer_phone,
          shippingCity: o.shipping_city,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          total: Number(o.total),
          currency: o.currency,
          status: o.status,
          dropiOrderId: o.dropi_order_id || null,
          trackingNumber: o.tracking_number || null,
          createdAt: o.created_at,
        })),
        pagination: {
          total: Number(total),
          page,
          limit,
          totalPages: Math.ceil(Number(total) / limit),
          hasNextPage: page * limit < Number(total),
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (err) {
    console.error('[listOrders] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener los pedidos' },
    })
  }
}

// GET /api/v1/admin/orders/:orderId
async function getOrderDetail(req, res) {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE order_code = ?`,
      [req.params.orderId]
    )

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'El pedido no existe' },
      })
    }

    const order = orders[0]
    const [items] = await pool.query(
      `SELECT product_id, product_name, product_image, product_category,
              quantity, unit_price, subtotal, currency
       FROM order_items WHERE order_id = ?`,
      [order.id]
    )

    return res.json({
      success: true,
      data: {
        order: {
          id: order.order_code,
          status: order.status,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          dropiOrderId: order.dropi_order_id || null,
          wompiTransactionId: order.wompi_transaction_id || null,
          mpPaymentId: order.mp_payment_id || null,
          customer: {
            fullName: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            idNumber: order.customer_id_number || null,
          },
          shipping: {
            country: order.shipping_country,
            department: order.shipping_department,
            city: order.shipping_city,
            address: order.shipping_address,
            neighborhood: order.shipping_neighborhood || null,
            notes: order.shipping_notes || null,
          },
          trackingNumber: order.tracking_number || null,
          carrier: order.carrier || null,
          items: items.map(i => ({
            productId: i.product_id,
            name: i.product_name,
            image: i.product_image || null,
            category: i.product_category || null,
            quantity: i.quantity,
            unitPrice: Number(i.unit_price),
            subtotal: Number(i.subtotal),
            currency: i.currency,
          })),
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shipping_cost),
          total: Number(order.total),
          currency: order.currency,
          estimatedDelivery: order.estimated_delivery || null,
          paidAt: order.paid_at || null,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        },
      },
    })
  } catch (err) {
    console.error('[getOrderDetail] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener el pedido' },
    })
  }
}

// PUT /api/v1/admin/orders/:orderId/status
// RN-035: solo transiciones permitidas desde el panel
async function updateOrderStatus(req, res) {
  const { status } = req.body || {}

  // RN-035: transiciones permitidas desde el panel
  const allowedStatuses = ['CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'RETURNED']
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Estado inválido. Valores permitidos: ${allowedStatuses.join(', ')}`,
      },
    })
  }

  try {
    const [orders] = await pool.query(
      'SELECT id, status FROM orders WHERE order_code = ?',
      [req.params.orderId]
    )

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'El pedido no existe' },
      })
    }

    const order = orders[0]

    // RN-035: DELIVERED y RETURNED son estados finales, no se pueden cambiar
    if (order.status === 'DELIVERED' || order.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `El pedido en estado "${order.status}" no puede ser modificado`,
        },
      })
    }

    const updates = ['status = ?']
    const values = [status]

    // Si se marca como enviado y viene tracking info
    if (req.body.trackingNumber) {
      updates.push('tracking_number = ?')
      values.push(req.body.trackingNumber)
    }
    if (req.body.carrier) {
      updates.push('carrier = ?')
      values.push(req.body.carrier)
    }

    values.push(order.id)
    await pool.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, values)

    return res.json({
      success: true,
      data: { orderCode: req.params.orderId, newStatus: status },
      message: 'Estado del pedido actualizado',
    })
  } catch (err) {
    console.error('[updateOrderStatus] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al actualizar el estado del pedido' },
    })
  }
}

// GET /api/v1/admin/users
async function listUsers(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
  const offset = (page - 1) * limit
  const { search } = req.query

  const conditions = []
  const params = []

  if (search) {
    conditions.push('(email LIKE ? OR full_name LIKE ?)')
    const like = `%${search}%`
    params.push(like, like)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    )

    const [users] = await pool.query(
      `SELECT id, email, full_name, phone, is_active, email_verified,
              created_at, last_login_at
       FROM users ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )

    return res.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone || null,
          isActive: Boolean(u.is_active),
          emailVerified: Boolean(u.email_verified),
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at || null,
        })),
        pagination: {
          total: Number(total),
          page,
          limit,
          totalPages: Math.ceil(Number(total) / limit),
          hasNextPage: page * limit < Number(total),
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (err) {
    console.error('[listUsers] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener los usuarios' },
    })
  }
}

// GET /api/v1/admin/users/:userId
async function getUserDetail(req, res) {
  const userId = parseInt(req.params.userId)

  try {
    const [rows] = await pool.query(
      `SELECT id, email, full_name, phone, id_number,
              is_active, email_verified, created_at, last_login_at
       FROM users WHERE id = ?`,
      [userId]
    )

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' },
      })
    }

    const u = rows[0]

    // Historial de pedidos del usuario (RN-036)
    const [orders] = await pool.query(
      `SELECT order_code, status, payment_method, total, currency, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    )

    return res.json({
      success: true,
      data: {
        user: {
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone || null,
          idNumber: u.id_number || null,
          isActive: Boolean(u.is_active),
          emailVerified: Boolean(u.email_verified),
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at || null,
        },
        orders: orders.map(o => ({
          orderCode: o.order_code,
          status: o.status,
          paymentMethod: o.payment_method,
          total: Number(o.total),
          currency: o.currency,
          createdAt: o.created_at,
        })),
      },
    })
  } catch (err) {
    console.error('[getUserDetail] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener el usuario' },
    })
  }
}

// GET /api/v1/admin/product-stats
async function getProductStats(req, res) {
  const sortBy = ['units_sold', 'total_revenue', 'view_count', 'cart_add_count', 'wishlist_count']
    .includes(req.query.sortBy) ? req.query.sortBy : 'units_sold'
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))

  try {
    const [rows] = await pool.query(
      `SELECT product_id, product_name, category_slug,
              view_count, cart_add_count, wishlist_count,
              units_sold, orders_count, total_revenue,
              first_sale_at, last_sale_at
       FROM product_stats
       ORDER BY ${sortBy} DESC LIMIT ?`,
      [limit]
    )

    return res.json({
      success: true,
      data: {
        products: rows.map(p => ({
          productId: p.product_id,
          name: p.product_name,
          category: p.category_slug,
          viewCount: p.view_count,
          cartAddCount: p.cart_add_count,
          wishlistCount: p.wishlist_count,
          unitsSold: p.units_sold,
          ordersCount: p.orders_count,
          totalRevenue: Number(p.total_revenue),
          firstSaleAt: p.first_sale_at || null,
          lastSaleAt: p.last_sale_at || null,
        })),
      },
    })
  } catch (err) {
    console.error('[getProductStats] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener las estadísticas de productos' },
    })
  }
}

// GET /api/v1/admin/searches
async function getSearches(req, res) {
  try {
    const [popular] = await pool.query(
      `SELECT search_term, COUNT(*) AS count,
              ROUND(AVG(results_count), 0) AS avg_results
       FROM product_searches
       GROUP BY search_term
       ORDER BY count DESC LIMIT 20`
    )

    const [noResults] = await pool.query(
      `SELECT search_term, COUNT(*) AS count
       FROM product_searches
       WHERE results_count = 0
       GROUP BY search_term
       ORDER BY count DESC LIMIT 20`
    )

    return res.json({
      success: true,
      data: {
        popularSearches: popular.map(s => ({
          term: s.search_term,
          count: Number(s.count),
          avgResults: Number(s.avg_results),
        })),
        noResultsSearches: noResults.map(s => ({
          term: s.search_term,
          count: Number(s.count),
        })),
      },
    })
  } catch (err) {
    console.error('[getSearches] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener las búsquedas' },
    })
  }
}

module.exports = {
  adminLogin,
  getDashboard,
  listOrders,
  getOrderDetail,
  updateOrderStatus,
  listUsers,
  getUserDetail,
  getProductStats,
  getSearches,
}
