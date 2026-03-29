const express = require('express')
const router = express.Router()
const dropiService = require('../services/dropi.service')

// GET /api/v1/coverage/cod — verifica si COD está disponible para una ciudad
router.get('/cod', async (req, res) => {
  const { city, department } = req.query

  if (!city || !city.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'El parámetro city es requerido' },
    })
  }

  try {
    const coverage = await dropiService.checkCodCoverage(city.trim(), department?.trim())

    if (coverage.codAvailable) {
      return res.json({
        success: true,
        data: {
          city: coverage.city,
          codAvailable: true,
          estimatedDelivery: coverage.estimatedDelivery,
        },
      })
    }

    return res.json({
      success: true,
      data: {
        city: coverage.city,
        codAvailable: false,
        message: 'El pago contra entrega no está disponible para esta ciudad',
        availablePaymentMethods: ['WOMPI', 'MERCADOPAGO'],
      },
    })
  } catch (err) {
    console.error('[coverage/cod] Error Dropi:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'DROPI_ERROR', message: 'Error al verificar la cobertura' },
    })
  }
})

module.exports = router
