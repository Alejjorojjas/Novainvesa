const axios = require('axios')

const dropiClient = axios.create({
  baseURL: process.env.DROPI_API_URL || 'https://api.dropi.co',
  headers: {
    'Authorization': `Bearer ${process.env.DROPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Mapea un producto de Dropi al formato interno de Novainvesa
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

function slugify(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// GET /api/v1/products
async function getProducts({ category, limit = 20, page = 1, featured = false } = {}) {
  const safeLimit = Math.min(Number(limit) || 20, 50)
  const safePage = Math.max(Number(page) || 1, 1)

  const params = {
    per_page: safeLimit,
    page: safePage,
  }
  if (category) params.category = category
  if (featured) params.featured = true

  const response = await dropiClient.get('/v1/products', { params })
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

// GET /api/v1/products/:id
async function getProductById(id) {
  const response = await dropiClient.get(`/v1/products/${id}`)
  const body = response.data
  const raw = body.data || body

  if (!raw || !raw.id) return null
  return mapProduct(raw, true)
}

// GET /api/v1/products/search?q=...
async function searchProducts(query, limit = 20) {
  const safeLimit = Math.min(Number(limit) || 20, 50)

  const response = await dropiClient.get('/v1/products/search', {
    params: { q: query, per_page: safeLimit },
  })
  const body = response.data

  const rawProducts = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : [])
  return {
    query,
    results: rawProducts.map(p => mapProduct(p, false)),
    total: body.total || rawProducts.length,
  }
}

// Verifica cobertura COD para una ciudad (usado por coverage.routes)
async function checkCodCoverage(city, department) {
  const params = { city }
  if (department) params.department = department

  const response = await dropiClient.get('/v1/coverage', { params })
  const body = response.data
  const data = body.data || body

  return {
    city,
    codAvailable: data.cod_available ?? data.available ?? false,
    estimatedDelivery: data.estimated_delivery || '3-7 días hábiles',
  }
}

// POST a Dropi para crear un pedido (usado por orders y webhooks)
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

  const response = await dropiClient.post('/v1/orders', dropiPayload)
  const body = response.data
  const data = body.data || body

  return {
    dropiOrderId: String(data.id || data.order_id),
    status: data.status || 'CREATED',
    estimatedDelivery: data.estimated_delivery || '3-7 días hábiles',
  }
}

// Consulta el estado actual de un pedido en Dropi
async function getOrderStatus(dropiOrderId) {
  const response = await dropiClient.get(`/v1/orders/${dropiOrderId}`)
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
