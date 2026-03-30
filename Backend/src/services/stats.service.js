const pool = require('../config/database')
const logger = require('../utils/logger')

// Incrementa view_count para un producto (RN-030)
// El throttle de 1 por sesión se controla en el frontend/controller, no aquí
async function incrementViewCount(productId, productName, categorySlug) {
  try {
    await pool.query(
      `INSERT INTO product_stats (product_id, product_name, category_slug, view_count)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         view_count   = view_count + 1,
         product_name = VALUES(product_name)`,
      [productId, productName, categorySlug || null]
    )
  } catch (err) {
    logger.error('[stats] Error incrementando view_count', { productId, error: err.message })
  }
}

// Incrementa cart_add_count para un producto (RN-030)
async function incrementCartAddCount(productId, productName, categorySlug) {
  try {
    await pool.query(
      `INSERT INTO product_stats (product_id, product_name, category_slug, cart_add_count)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         cart_add_count = cart_add_count + 1,
         product_name   = VALUES(product_name)`,
      [productId, productName, categorySlug || null]
    )
  } catch (err) {
    logger.error('[stats] Error incrementando cart_add_count', { productId, error: err.message })
  }
}

// Incrementa search_count para cada producto devuelto en una búsqueda (RN-030)
async function incrementSearchCount(products = []) {
  if (!products.length) return
  try {
    for (const p of products) {
      await pool.query(
        `INSERT INTO product_stats (product_id, product_name, category_slug, search_count)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           search_count = search_count + 1,
           product_name = VALUES(product_name)`,
        [p.id || p.productId, p.name, p.category || p.categorySlug || null]
      )
    }
  } catch (err) {
    logger.error('[stats] Error incrementando search_count', { error: err.message })
  }
}

// Actualiza units_sold, orders_count y total_revenue al confirmar un pedido (RN-030)
// items es un array de filas de la tabla order_items
async function recordSale(items = []) {
  if (!items.length) return
  try {
    for (const item of items) {
      const productId   = item.product_id   || item.productId
      const productName = item.product_name || item.name
      const category    = item.product_category || item.categorySlug || null
      const qty         = Number(item.quantity)
      const revenue     = Number(item.subtotal || (item.unit_price * item.quantity))

      await pool.query(
        `INSERT INTO product_stats
           (product_id, product_name, category_slug,
            units_sold, orders_count, total_revenue,
            first_sale_at, last_sale_at)
         VALUES (?, ?, ?, ?, 1, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           units_sold    = units_sold    + VALUES(units_sold),
           orders_count  = orders_count  + 1,
           total_revenue = total_revenue + VALUES(total_revenue),
           last_sale_at  = NOW()`,
        [productId, productName, category, qty, revenue]
      )
    }
  } catch (err) {
    logger.error('[stats] Error registrando venta en product_stats', { error: err.message })
  }
}

// Ajusta wishlist_count (+1 al agregar, -1 al quitar) (RN-030)
async function adjustWishlistCount(productId, productName, categorySlug, delta) {
  try {
    if (delta > 0) {
      await pool.query(
        `INSERT INTO product_stats (product_id, product_name, category_slug, wishlist_count)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           wishlist_count = wishlist_count + 1,
           product_name   = VALUES(product_name)`,
        [productId, productName, categorySlug || null]
      )
    } else {
      await pool.query(
        `UPDATE product_stats
         SET wishlist_count = GREATEST(0, wishlist_count - 1)
         WHERE product_id = ?`,
        [productId]
      )
    }
  } catch (err) {
    logger.error('[stats] Error ajustando wishlist_count', { productId, error: err.message })
  }
}

// Registra un término de búsqueda (RN-031)
// Solo se llama cuando el usuario confirma la búsqueda (Enter / botón), mín 2 chars
async function recordSearch(searchTerm, resultsCount, userId = null) {
  if (!searchTerm || searchTerm.trim().length < 2) return
  try {
    await pool.query(
      `INSERT INTO product_searches (search_term, results_count, user_id)
       VALUES (?, ?, ?)`,
      [searchTerm.trim().toLowerCase(), Math.min(resultsCount, 255), userId]
    )
  } catch (err) {
    logger.error('[stats] Error registrando búsqueda', { error: err.message })
  }
}

module.exports = {
  incrementViewCount,
  incrementCartAddCount,
  incrementSearchCount,
  recordSale,
  adjustWishlistCount,
  recordSearch,
}
