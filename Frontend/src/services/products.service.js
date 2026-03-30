import api from './api'

export const productsService = {
  // GET /api/v1/products
  async getProducts({ category, limit = 20, page = 1, featured } = {}) {
    const params = { limit, page }
    if (category) params.category = category
    if (featured !== undefined) params.featured = featured

    const { data } = await api.get('/api/v1/products', { params })
    return data.data // { products, pagination }
  },

  // GET /api/v1/products/:id
  async getProductById(id) {
    const { data } = await api.get(`/api/v1/products/${id}`)
    return data.data // { product }
  },

  // GET /api/v1/products/search?q=...
  async searchProducts(query, limit = 20) {
    const { data } = await api.get('/api/v1/products/search', {
      params: { q: query, limit },
    })
    return data.data // { query, results, total }
  },

  // GET /api/v1/categories
  async getCategories() {
    const { data } = await api.get('/api/v1/categories')
    return data.data // { categories }
  },

  // GET /api/v1/coverage/cod?city=...&department=...
  async checkCodCoverage(city, department = '') {
    const params = { city }
    if (department) params.department = department

    const { data } = await api.get('/api/v1/coverage/cod', { params })
    return data.data // { city, codAvailable, estimatedDelivery?, availablePaymentMethods? }
  },
}
