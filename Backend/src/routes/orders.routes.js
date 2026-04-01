const express = require('express')
const router = express.Router()
const { createOrder, getOrder } = require('../controllers/orders.controller')

// POST /api/v1/orders — crear pedido (principalmente COD)
router.post('/', createOrder)

// GET /api/v1/orders/:orderId — estado de un pedido
router.get('/:orderId', getOrder)

module.exports = router
