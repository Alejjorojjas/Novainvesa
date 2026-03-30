const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const dropiService = require('../services/dropi.service')
const logger = require('../utils/logger')

// Mapa de estados internos → etiqueta y descripción para el cliente
const STATUS_LABELS = {
  CREATED:    { label: 'Pedido recibido',     description: 'Tu pedido fue registrado exitosamente' },
  CONFIRMED:  { label: 'Confirmado',           description: 'Tu pago fue confirmado y estamos alistando tu pedido' },
  PREPARING:  { label: 'En preparación',       description: 'Estamos preparando tu pedido para el envío' },
  SHIPPED:    { label: 'Enviado',              description: 'Tu paquete está en camino' },
  IN_TRANSIT: { label: 'En tránsito',          description: 'Tu paquete está viajando hacia tu ciudad' },
  DELIVERED:  { label: 'Entregado',            description: '¡Tu pedido fue entregado exitosamente!' },
  FAILED:     { label: 'No entregado',         description: 'No pudimos entregar tu pedido. Te contactaremos pronto' },
  RETURNED:   { label: 'Devuelto',             description: 'Tu pedido fue devuelto. Nos comunicaremos contigo' },
  CANCELLED:  { label: 'Cancelado',            description: 'Tu pedido fue cancelado' },
}

const TIMELINE_STEPS = ['CREATED', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

function buildTimeline(currentStatus, order) {
  const statusOrder = ['CREATED', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED']
  const currentIdx = statusOrder.indexOf(currentStatus)

  return TIMELINE_STEPS.map((step, idx) => {
    const info = STATUS_LABELS[step]
    const completed = currentIdx >= statusOrder.indexOf(step)
    let timestamp = null

    if (step === 'CREATED') timestamp = order.created_at
    else if (step === 'CONFIRMED' && order.paid_at) timestamp = order.paid_at
    else if (step === 'SHIPPED' && order.status === 'SHIPPED') timestamp = order.updated_at
    else if (step === 'DELIVERED' && order.status === 'DELIVERED') timestamp = order.updated_at

    return {
      status: step,
      label: info.label,
      timestamp: completed ? (timestamp || null) : null,
      completed,
    }
  })
}

// GET /api/v1/tracking/:orderId
// Sin autenticación — el orderId actúa como token implícito (API contract §8)
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params

  try {
    const [orders] = await pool.query(
      `SELECT id, order_code, status, dropi_order_id, tracking_number,
              carrier, estimated_delivery, paid_at, created_at, updated_at
       FROM orders WHERE order_code = ?`,
      [orderId]
    )

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'El pedido no existe' },
      })
    }

    const order = orders[0]
    let currentStatus = order.status

    // Si hay dropi_order_id, consultar estado en tiempo real a Dropi
    if (order.dropi_order_id) {
      try {
        const dropiData = await dropiService.getOrderStatus(order.dropi_order_id)

        // Mapear estado de Dropi al estado interno
        const dropiStatusMap = {
          created:    'CREATED',
          confirmed:  'CONFIRMED',
          preparing:  'PREPARING',
          shipped:    'SHIPPED',
          in_transit: 'IN_TRANSIT',
          delivered:  'DELIVERED',
          failed:     'FAILED',
          returned:   'RETURNED',
          cancelled:  'CANCELLED',
        }

        const mappedStatus = dropiStatusMap[dropiData.status?.toLowerCase()]
        if (mappedStatus) currentStatus = mappedStatus

        // Actualizar tracking_number y carrier si Dropi los tiene
        if (dropiData.tracking_number && dropiData.tracking_number !== order.tracking_number) {
          await pool.query(
            `UPDATE orders SET status = ?, tracking_number = ?, carrier = ? WHERE id = ?`,
            [currentStatus, dropiData.tracking_number, dropiData.carrier || null, order.id]
          )
          order.tracking_number = dropiData.tracking_number
          order.carrier = dropiData.carrier || order.carrier
          order.status = currentStatus
        }
      } catch (err) {
        // Si Dropi falla, usar el estado guardado en BD sin error al cliente
        logger.warn('[tracking] No se pudo consultar Dropi en tiempo real', {
          orderId,
          dropiOrderId: order.dropi_order_id,
          error: err.message,
        })
      }
    }

    const statusInfo = STATUS_LABELS[currentStatus] || { label: currentStatus, description: '' }

    // Mensaje de tracking_number según RN-024
    const trackingMessage = order.tracking_number
      ? null
      : 'Número de guía pendiente — disponible cuando tu pedido sea enviado'

    return res.json({
      success: true,
      data: {
        orderId: order.order_code,
        status: currentStatus,
        statusLabel: statusInfo.label,
        statusDescription: statusInfo.description,
        trackingNumber: order.tracking_number || null,
        trackingMessage,
        carrier: order.carrier || null,
        estimatedDelivery: order.estimated_delivery || null,
        timeline: buildTimeline(currentStatus, order),
      },
    })
  } catch (err) {
    logger.error('[tracking] Error obteniendo estado del pedido', { orderId, error: err.message })
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al consultar el estado del pedido' },
    })
  }
})

module.exports = router
