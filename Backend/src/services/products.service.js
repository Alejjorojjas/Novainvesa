const pool = require('../config/database')

// ─── GET PRODUCTS ─────────────────────────────────────────────────────────────
async function getProducts({ category, limit = 10, page = 1, featured } = {}) {
  const offset = (Number(page) - 1) * Number(limit)
  const params = []
  const conditions = ['active = 1']

  if (category) {
    conditions.push('category_slug = ?')
    params.push(category)
  }

  if (featured === true || featured === 'true') {
    conditions.push('featured = 1')
  }

  const where = conditions.join(' AND ')

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products WHERE ${where}`,
    params
  )
  const total = countRows[0].total

  const [rows] = await pool.query(
    `SELECT * FROM products WHERE ${where} ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  )

  const products = rows.map(parseJsonFields)

  await updateProductStats(products.map((p) => p.id))

  return {
    products,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
  }
}

// ─── GET PRODUCT BY ID ────────────────────────────────────────────────────────
async function getProductById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE (id = ? OR dropi_product_id = ?) AND active = 1 LIMIT 1`,
    [id, id]
  )

  if (!rows.length) return null

  const product = parseJsonFields(rows[0])
  await updateProductStats([product.id])
  return product
}

// ─── SEARCH PRODUCTS ──────────────────────────────────────────────────────────
async function searchProducts(query, limit = 10) {
  if (!query) return { products: [], total: 0 }

  const like = `%${query}%`
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE active = 1 AND (name LIKE ? OR short_description LIKE ?) ORDER BY featured DESC LIMIT ?`,
    [like, like, Number(limit)]
  )

  const products = rows.map(parseJsonFields)
  return { products, total: products.length }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function parseJsonFields(row) {
  const inStock = row.in_stock === 1 || row.in_stock === true
  const featured = row.featured === 1 || row.featured === true
  return {
    ...row,
    in_stock: inStock,
    inStock,
    featured,
    images: parseJson(row.images, []),
    benefits: parseJson(row.benefits, []),
  }
}

function parseJson(value, fallback) {
  if (!value) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function updateProductStats(ids) {
  if (!ids || !ids.length) return
  try {
    await pool.query(
      `UPDATE product_stats SET views = views + 1, updated_at = NOW() WHERE product_id IN (?)`,
      [ids]
    )
  } catch {
    // tabla puede no existir aún; ignorar silenciosamente
  }
}

module.exports = { getProducts, getProductById, searchProducts }
