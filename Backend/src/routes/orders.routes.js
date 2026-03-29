const express = require('express')
const router = express.Router()
const { createOrder, getOrder } = require('../controllers/orders.controller')
const { verifyApiKey } = require('../middlewares/auth.middleware')

// POST /api/v1/orders — crear pedido (principalmente COD)
router.post('/', verifyApiKey, createOrder)

// GET /api/v1/orders/:orderId — estado de un pedido
router.get('/:orderId', verifyApiKey, getOrder)

module.exports = router
