const axios = require('axios')

const BASE_URL = process.env.DROPI_API_URL || 'https://api.dropi.co'

// ─── Token cache ─────────────────────────────────────────────────────────────
// { value: string, expiresAt: number (ms) }
let _tokenCache = null

// Refrescamos a los 55 min para no llegar al límite típico de 1 hora
const TOKEN_TTL_MS = 55 * 60 * 1000

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

  const response = await axios.post(
    `${BASE_URL}/api/v1/login`,
    { email, password },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  )

  // La API puede devolver el token en distintos niveles del body
  const body = response.data
  const token = body.token || body.data?.token || body.access_token

  if (!token) {
    throw new Error('Dropi login no devolvió un token válido')
  }

  _tokenCache = { value: token, expiresAt: now + TOKEN_TTL_MS }
  return token
}

// Wrapper de axios que inyecta el header correcto y reintenta en 401
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
    // Token expirado antes de lo esperado → invalidar cache y reintentar una sola vez
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

function mapProduct(dropiProduct, full = false) {
  const base = {
    id: String(dropiProduct.id),
    name: dropiProduct.name || dropiProduct.title,
    slug: dropiProduct.slug || slugify(dropiProduct.name || dropiProduct.title),
    category: dropiProduct.category_slug || dropiProduct.category || '',
    price: Math.round(dropiProduct.price || dropiProduct.sale_price || 0),
    currency: 'COP',
    images: Array.isArray(dropiProduct.images)
      ? dropiProduct.images.map(img => (typeof img === 'string' ? img : img.url || img.src))
      : [dropiProduct.image].filter(Boolean),
    shortDescription: dropiProduct.short_description || '',
    inStock: dropiProduct.in_stock !== undefined ? dropiProduct.in_stock : true,
    featured: dropiProduct.featured || dropiProduct.is_featured || false,
    dropiProductId: String(dropiProduct.id),
  }

  if (!full) return base

  return {
    ...base,
    description: dropiProduct.description || '',
    compareAtPrice: dropiProduct.compare_at_price
      ? Math.round(dropiProduct.compare_at_price)
      : undefined,
    benefits: Array.isArray(dropiProduct.benefits) ? dropiProduct.benefits : [],
    weight: dropiProduct.weight || null,
    relatedProducts: Array.isArray(dropiProduct.related_products)
      ? dropiProduct.related_products.map(String)
      : [],
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function getProducts({ category, limit = 20, page = 1, featured = false } = {}) {
  const safeLimit = Math.min(Number(limit) || 20, 50)
  const safePage = Math.max(Number(page) || 1, 1)

  const params = new URLSearchParams({ per_page: safeLimit, page: safePage })
  if (category) params.set('category', category)
  if (featured) params.set('featured', 'true')

  const response = await dropiRequest('GET', `/api/v1/products?${params}`)
  const body = response.data

  const rawProducts = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : [])
  const total = body.total || body.meta?.total || rawProducts.length
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

async function getProductById(id) {
  const response = await dropiRequest('GET', `/api/v1/products/${id}`)
  const body = response.data
  const raw = body.data || body

  if (!raw || !raw.id) return null
  return mapProduct(raw, true)
}

async function searchProducts(query, limit = 20) {
  const safeLimit = Math.min(Number(limit) || 20, 50)
  const params = new URLSearchParams({ q: query, per_page: safeLimit })

  const response = await dropiRequest('GET', `/api/v1/products/search?${params}`)
  const body = response.data

  const rawProducts = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : [])
  return {
    query,
    results: rawProducts.map(p => mapProduct(p, false)),
    total: body.total || rawProducts.length,
  }
}

async function checkCodCoverage(city, department) {
  const params = new URLSearchParams({ city })
  if (department) params.set('department', department)

  const response = await dropiRequest('GET', `/api/v1/coverage?${params}`)
  const body = response.data
  const data = body.data || body

  return {
    city,
    codAvailable: data.cod_available ?? data.available ?? false,
    estimatedDelivery: data.estimated_delivery || '3-7 días hábiles',
  }
}

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

  const response = await dropiRequest('POST', '/api/v1/orders', { data: dropiPayload })
  const body = response.data
  const data = body.data || body

  return {
    dropiOrderId: String(data.id || data.order_id),
    status: data.status || 'CREATED',
    estimatedDelivery: data.estimated_delivery || '3-7 días hábiles',
  }
}

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
