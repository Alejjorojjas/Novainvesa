const express = require('express')
const router = express.Router()
const pixelService = require('../services/pixel.service')
const logger = require('../utils/logger')

// Eventos válidos según el contrato de API
const VALID_EVENTS = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase', 'Search', 'Contact']

// POST /api/v1/pixel/event
router.post('/event', async (req, res) => {
  const { eventName, eventTime, userData, customData, eventSourceUrl, actionSource } = req.body || {}

  if (!eventName || !VALID_EVENTS.includes(eventName)) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `eventName inválido. Valores permitidos: ${VALID_EVENTS.join(', ')}`,
      },
    })
  }

  try {
    const result = await pixelService.sendEvent({
      eventName,
      eventTime,
      userData,
      customData,
      eventSourceUrl,
      actionSource,
    })

    return res.json({
      success: true,
      data: {
        eventsReceived: result.eventsReceived,
        facebookTrace: result.facebookTrace,
      },
    })
  } catch (err) {
    logger.error('[pixel/event] Error enviando a Meta CAPI', { eventName, error: err.message })
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al enviar el evento a Meta' },
    })
  }
})

module.exports = router
