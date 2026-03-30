const axios = require('axios')

const BASE_URL = process.env.DROPI_API_URL || 'https://api.dropi.co'

// ─── Token cache ─────────────────────────────────────────────────────────────
let _tokenCache = null
const TOKEN_TTL_MS = 55 * 60 * 1000 // 55 min — antes del límite típico de 1 hora

async function getToken() {
  const now = Date.now()

  if (_tokenCache && _tokenCache.expiresAt > now) {
    return _tokenCache.value
  }

  const email = process.env.DROPI_EMAIL
  const password = process.env.DROPI_PASSWORD

  if (!email || !password) {
    throw new Error('DROPI_EMAIL y DROPI_PASSWORD son requeridos')
  }

  // POST /api/v1/login
  const response = await axios.post(
    `${BASE_URL}/api/v1/login`,
    { email, password },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  )

  const body = response.data
  const token = body.token || body.data?.token || body.access_token

  if (!token) {
    throw new Error('Dropi login no devolvió un token válido')
  }

  _tokenCache = { value: token, expiresAt: now + TOKEN_TTL_MS }
  return token
}

// Wrapper con inyección de header y reintento automático en 401
async function dropiRequest(method, path, options = {}) {
  const token = await getToken()
  const { headers: extraHeaders = {}, _retry, ...rest } = options

  const config = {
    method,
    url: `${BASE_URL}${path}`,
    headers: {
      'dropi-integracion-key': token,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    timeout: 10000,
    ...rest,
  }

  try {
    return await axios(config)
  } catch (err) {
    if (err.response?.status === 401 && !_retry) {
      _tokenCache = null
      return dropiRequest(method, path, { ...options, _retry: true })
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

function mapProduct(p, full = false) {
  const base = {
    id: String(p.id),
    name: p.name || p.title,
    slug: p.slug || slugify(p.name || p.title || ''),
    category: p.category_slug || p.category || '',
    price: Math.round(p.price || p.sale_price || 0),
    currency: 'COP',
    images: Array.isArray(p.images)
      ? p.images.map(img => (typeof img === 'string' ? img : img.url || img.src))
      : [p.image].filter(Boolean),
    shortDescription: p.short_description || '',
    inStock: p.in_stock !== undefined ? p.in_stock : true,
    featured: p.featured || p.is_featured || false,
    dropiProductId: String(p.id),
  }

  if (!full) return base

  return {
    ...base,
    description: p.description || '',
    compareAtPrice: p.compare_at_price ? Math.round(p.compare_at_price) : undefined,
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    weight: p.weight || null,
    relatedProducts: Array.isArray(p.related_products) ? p.related_products.map(String) : [],
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

// POST /api/v1/products/getproducts
async function getProducts({ category, limit = 20, page = 1, featured = false } = {}) {
  const safeLimit = Math.min(Number(limit) || 20, 50)
  const safePage = Math.max(Number(page) || 1, 1)

  // startData es el offset (índice base 1)
  const startData = (safePage - 1) * safeLimit + 1

  const body = {
    pageSize: safeLimit,
    startData,
    no_count: false,
    order_by: 'id',
    order_type: 'asc',
    keywords: '',
    category: category ? [category] : [],
    favorite: false,
    privated_product: false,
  }

  if (featured) body.featured = true

  const response = await dropiRequest('POST', '/api/v1/products/getproducts', { data: body })
  const res = response.data

  const rawProducts = Array.isArray(res.objects)
    ? res.objects
    : Array.isArray(res.data)
    ? res.data
    : Array.isArray(res)
    ? res
    : []

  const total = res.count || res.total || rawProducts.length
  const totalPages = Math.ceil(total / safeLimit)

  return {
    products: rawProducts.map(p => mapProduct(p, false)),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  }
}

// GET /api/v1/products/:id
async function getProductById(id) {
  const response = await dropiRequest('GET', `/api/v1/products/${id}`)
  const body = response.data
  const raw = body.data || body

  if (!raw || !raw.id) return null
  return mapProduct(raw, true)
}

// Búsqueda usando getproducts con keywords
async function searchProducts(query, limit = 20) {
  const safeLimit = Math.min(Number(limit) || 20, 50)

  const body = {
    pageSize: safeLimit,
    startData: 1,
    no_count: false,
    order_by: 'id',
    order_type: 'asc',
    keywords: query,
    category: [],
    favorite: false,
    privated_product: false,
  }

  const response = await dropiRequest('POST', '/api/v1/products/getproducts', { data: body })
  const res = response.data

  const rawProducts = Array.isArray(res.objects)
    ? res.objects
    : Array.isArray(res.data)
    ? res.data
    : Array.isArray(res)
    ? res
    : []

  return {
    query,
    results: rawProducts.map(p => mapProduct(p, false)),
    total: res.count || res.total || rawProducts.length,
  }
}

// GET /api/v1/logistic/cities — cobertura COD por ciudad
async function checkCodCoverage(city, department) {
  const response = await dropiRequest('GET', '/api/v1/logistic/cities')
  const body = response.data

  const cities = Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : []

  const normalizedQuery = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const match = cities.find(c => {
    const cityName = (c.name || c.city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return cityName === normalizedQuery
  })

  return {
    city,
    codAvailable: match ? (match.cod_available ?? match.available ?? true) : false,
    estimatedDelivery: match?.estimated_delivery || '3-7 días hábiles',
  }
}

// POST /api/v1/orders/store
async function createOrder(orderData) {
  const dropiPayload = {
    customer: {
      full_name: orderData.customer.fullName,
      id_number: orderData.customer.idNumber || '',
      email: orderData.customer.email,
      phone: orderData.customer.phone,
    },
    shipping_address: {
      country: orderData.shipping.country || 'CO',
      department: orderData.shipping.department,
      city: orderData.shipping.city,
      address: orderData.shipping.address,
      neighborhood: orderData.shipping.neighborhood || '',
      notes: orderData.shipping.notes || '',
    },
    items: orderData.items.map(item => ({
      product_id: item.dropiProductId || item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    })),
    payment_method: orderData.payment.method,
    reference: orderData.reference,
  }

  const response = await dropiRequest('POST', '/api/v1/orders/store', { data: dropiPayload })
  const body = response.data
  const data = body.data || body

  return {
    dropiOrderId: String(data.id || data.order_id),
    status: data.status || 'CREATED',
    estimatedDelivery: data.estimated_delivery || '3-7 días hábiles',
  }
}

// GET /api/v1/orders/:id  (no hay endpoint de status documentado, usamos el de orden)
async function getOrderStatus(dropiOrderId) {
  const response = await dropiRequest('GET', `/api/v1/orders/${dropiOrderId}`)
  const body = response.data
  return body.data || body
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  checkCodCoverage,
  createOrder,
  getOrderStatus,
}
