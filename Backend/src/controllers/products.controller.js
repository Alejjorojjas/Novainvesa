const { validationResult } = require('express-validator')
const productsService = require('../services/products.service')

// GET /api/v1/products
async function getProducts(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    })
  }

  const { category, limit, page, featured } = req.query

  try {
    const data = await productsService.getProducts({
      category,
      limit,
      page,
      featured: featured === 'true',
    })

    return res.json({ success: true, data })
  } catch (err) {
    console.error('[getProducts] Error DB:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Error al obtener los productos' },
    })
  }
}

// GET /api/v1/products/search
async function searchProducts(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    })
  }

  const { q, limit } = req.query

  try {
    const data = await productsService.searchProducts(q, limit)
    return res.json({ success: true, data })
  } catch (err) {
    console.error('[searchProducts] Error DB:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Error al buscar productos' },
    })
  }
}

// GET /api/v1/products/:id
async function getProductById(req, res) {
  const { id } = req.params

  try {
    const product = await productsService.getProductById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'El producto no existe o no está disponible',
        },
      })
    }

    return res.json({ success: true, data: { product } })
  } catch (err) {
    console.error('[getProductById] Error DB:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Error al obtener el producto' },
    })
  }
}

module.exports = { getProducts, searchProducts, getProductById }
