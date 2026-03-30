const axios = require('axios')

const BASE_URL = 'https://api.dropi.co'

// ─── Axios wrapper ────────────────────────────────────────────────────────────
async function dropiRequest(method, path, options = {}) {
  const token = process.env.DROPI_INTEGRATION_TOKEN

  if (!token) {
    throw new Error('DROPI_INTEGRATION_TOKEN es requerido')
  }

  const { headers: extraHeaders = {}, ...rest } = options

  const config = {
    method,
    url: `${BASE_URL}${path}`,
    headers: {
      'dropi-integracion-key': token,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    timeout: 15000,
    ...rest,
  }

  try {
    console.log('[Dropi] →', method, config.url)
    const res = await axios(config)
    console.log('[Dropi] ←', res.status, config.url)
    return res
  } catch (err) {
    const status = err.response?.status
    console.error('[Dropi] ERROR →', method, config.url, '| status:', status)

    if (err.response?.data) {
      console.error('[Dropi] BODY:', JSON.stringify(err.response.data))
    }

    throw err
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function mapProduct(p) {
  return {
    id: String(p.id),
    name: p.name || p.title,
    slug: slugify(p.name || ''),
    price: Math.round(p.price || p.sale_price || 0),
    currency: 'COP',
    images: Array.isArray(p.images)
      ? p.images.map(i => (typeof i === 'string' ? i : i.url || i.src))
      : [],
    description: p.description || '',
    inStock: p.in_stock ?? true,
    dropiProductId: String(p.id),
  }
}

// ─── CORE: GET PRODUCTS (AUTO FALLBACK) ──────────────────────────────────────

async function getProducts({ limit = 20, page = 1 } = {}) {
  const safeLimit = Math.min(Number(limit) || 20, 50)
  const safePage = Math.max(Number(page) || 1, 1)

  // ── 1. Intentar Integration API ────────────────────────────────────────────
  try {
    const res = await dropiRequest(
      'GET',
      `/api/integration/products?page=${safePage}&limit=${safeLimit}`
    )

    const data = res.data?.data || res.data || []

    console.log('[Dropi] usando integration API')

    return {
      products: data.map(mapProduct),
      source: 'integration',
    }
  } catch (err) {
    if (err.response?.status !== 404) throw err
    console.log('[Dropi] integration API no disponible, fallback a v1...')
  }

  // ── 2. Fallback a API clásica (/api/v1) ─────────────────────────────────────
  const startData = (safePage - 1) * safeLimit + 1

  const body = {
    pageSize: safeLimit,
    startData,
    no_count: false,
    order_by: 'id',
    order_type: 'asc',
    keywords: '',
    category: [],
    favorite: false,
    privated_product: false,
  }

  const response = await dropiRequest(
    'POST',
    '/api/v1/products/getproducts',
    { data: body }
  )

  const res = response.data

  const rawProducts = Array.isArray(res.objects) ? res.objects : []

  return {
    products: rawProducts.map(mapProduct),
    total: res.count || rawProducts.length,
    source: 'v1',
  }
}

// ─── PRODUCT BY ID ───────────────────────────────────────────────────────────

async function getProductById(id) {
  // intentar integration
  try {
    const res = await dropiRequest(
      'GET',
      `/api/integration/products/${id}`
    )

    const data = res.data?.data || res.data
    if (data) return mapProduct(data)

  } catch (err) {
    if (err.response?.status !== 404) throw err
  }

  // fallback NO disponible en v1 (no hay endpoint directo fiable)
  return null
}

// ─── SEARCH ──────────────────────────────────────────────────────────────────

async function searchProducts(query, limit = 20) {
  const { products } = await getProducts({ limit })

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  return {
    query,
    results: filtered,
    total: filtered.length,
  }
}

// ─── COD COVERAGE ────────────────────────────────────────────────────────────

async function checkCodCoverage(city) {
  try {
    const res = await dropiRequest('GET', '/api/integration/cities')

    const cities = res.data?.data || res.data || []

    const normalizedQuery = city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const match = cities.find(c =>
      (c.name || '').toLowerCase().includes(normalizedQuery)
    )

    return {
      city,
      codAvailable: !!match,
    }
  } catch {
    return {
      city,
      codAvailable: false,
    }
  }
}

// ─── CREATE ORDER ────────────────────────────────────────────────────────────

async function createOrder(orderData) {
  try {
    const payload = {
      customer: {
        name: orderData.customer.fullName,
        phone: orderData.customer.phone,
        email: orderData.customer.email,
      },
      shipping: {
        city: orderData.shipping.city,
        address: orderData.shipping.address,
      },
      products: orderData.items.map(i => ({
        id: i.dropiProductId,
        quantity: i.quantity,
      })),
      payment_method: orderData.payment.method || 'COD',
    }

    const res = await dropiRequest(
      'POST',
      '/api/integration/orders',
      { data: payload }
    )

    const data = res.data?.data || res.data

    return {
      dropiOrderId: String(data.id),
      status: data.status || 'CREATED',
    }

  } catch (err) {
    console.error('[Dropi] createOrder error')
    throw err
  }
}

// ─── ORDER STATUS ────────────────────────────────────────────────────────────

async function getOrderStatus(orderId) {
  try {
    const res = await dropiRequest(
      'GET',
      `/api/integration/orders/${orderId}`
    )

    return res.data?.data || res.data
  } catch (err) {
    console.error('[Dropi] getOrderStatus error')
    throw err
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  checkCodCoverage,
  createOrder,
  getOrderStatus,
}