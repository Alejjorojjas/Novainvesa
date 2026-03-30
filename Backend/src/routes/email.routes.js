const express = require('express')
const router = express.Router()
const { verifyApiKey } = require('../middlewares/auth.middleware')
const emailService = require('../services/email.service')
const logger = require('../utils/logger')

// POST /api/v1/email/order-confirmation
// Endpoint interno — solo llamado desde webhooks y orders controller (RN-032)
router.post('/order-confirmation', verifyApiKey, async (req, res) => {
  const { to, customerName, order } = req.body || {}

  if (!to || !customerName || !order?.id || !Array.isArray(order.items)) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'to, customerName y order (id, items) son requeridos' },
    })
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'El campo "to" debe ser un email válido' },
    })
  }

  try {
    const result = await emailService.sendOrderConfirmation({ to, customerName, order })
    return res.json({
      success: true,
      data: {
        messageId: result.messageId,
        sentTo: result.sentTo,
      },
    })
  } catch (err) {
    logger.error('[email/order-confirmation] Fallo tras todos los reintentos', {
      to,
      orderId: order.id,
      error: err.message,
    })
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'No se pudo enviar el email de confirmación' },
    })
  }
})

module.exports = router
