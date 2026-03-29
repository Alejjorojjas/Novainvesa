const { Router } = require('express')
const router = Router()
const { handleWompiWebhook, handleMercadoPagoWebhook } = require('../controllers/webhooks.controller')

// Los webhooks vienen de IPs de las pasarelas — sin rate limiting (ver API contract §13)
// La verificación criptográfica reemplaza la autenticación (RN-021)

// POST /api/v1/webhooks/wompi
router.post('/wompi', handleWompiWebhook)

// POST /api/v1/webhooks/mercadopago
router.post('/mercadopago', handleMercadoPagoWebhook)

module.exports = router
