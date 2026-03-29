const express = require('express')
const router = express.Router()
const { createWompiPayment, createMercadoPagoPayment } = require('../controllers/payments.controller')
const { verifyApiKey } = require('../middlewares/auth.middleware')

// POST /api/v1/payments/wompi/create
router.post('/wompi/create', verifyApiKey, createWompiPayment)

// POST /api/v1/payments/mercadopago/create
router.post('/mercadopago/create', verifyApiKey, createMercadoPagoPayment)

module.exports = router
