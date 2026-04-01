const express = require('express')
const router = express.Router()
const { createWompiPayment, createMercadoPagoPayment } = require('../controllers/payments.controller')

// POST /api/v1/payments/wompi/create
router.post('/wompi/create', createWompiPayment)

// POST /api/v1/payments/mercadopago/create
router.post('/mercadopago/create', createMercadoPagoPayment)

module.exports = router
