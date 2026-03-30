const crypto = require('crypto')
const axios = require('axios')
const logger = require('../utils/logger')

// Meta Conversions API (server-side) — complementa el Pixel del navegador
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api

const GRAPH_API_VERSION = 'v19.0'

// Hashea un valor con SHA-256 (requerido por CAPI para PII)
function sha256(value) {
  if (!value) return null
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex')
}

// Normaliza y hashea los datos del usuario antes de enviarlos a Meta (privacidad)
function buildUserData(userData = {}) {
  return {
    em:  userData.email ? [sha256(userData.email)] : undefined,
    ph:  userData.phone ? [sha256(userData.phone.replace(/\D/g, ''))] : undefined,
    fn:  userData.firstName ? [sha256(userData.firstName)] : undefined,
    ln:  userData.lastName  ? [sha256(userData.lastName)]  : undefined,
    ct:  userData.city ? [sha256(userData.city.toLowerCase().replace(/\s+/g, ''))] : undefined,
    country: userData.countryCode ? [sha256(userData.countryCode.toLowerCase())] : undefined,
  }
}

// Construye el payload del evento para la CAPI
function buildEvent({ eventName, eventTime, userData, customData, eventSourceUrl, actionSource }) {
  return {
    event_name:       eventName,
    event_time:       eventTime || Math.floor(Date.now() / 1000),
    event_source_url: eventSourceUrl || undefined,
    action_source:    actionSource || 'website',
    user_data:        buildUserData(userData),
    custom_data:      customData || undefined,
  }
}

// Envía uno o varios eventos a Meta CAPI
// Retorna { eventsReceived, facebookTrace }
async function sendEvent({ eventName, eventTime, userData, customData, eventSourceUrl, actionSource }) {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_ACCESS_TOKEN

  if (!pixelId || !accessToken) {
    logger.warn('[pixel] META_PIXEL_ID o META_ACCESS_TOKEN no configurado — evento omitido', { eventName })
    return { eventsReceived: 0, facebookTrace: null }
  }

  const event = buildEvent({ eventName, eventTime, userData, customData, eventSourceUrl, actionSource })

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
      {
        data: [event],
        // test_event_code solo en desarrollo para validar en Meta Events Manager
        ...(process.env.META_TEST_EVENT_CODE
          ? { test_event_code: process.env.META_TEST_EVENT_CODE }
          : {}),
      },
      {
        params: { access_token: accessToken },
        timeout: 10000,
      }
    )

    const result = response.data
    logger.info('[pixel] Evento enviado a Meta CAPI', {
      eventName,
      eventsReceived: result.events_received,
    })

    return {
      eventsReceived: result.events_received || 1,
      facebookTrace: result.fbtrace_id || null,
    }
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message
    logger.error('[pixel] Error enviando evento a Meta CAPI', { eventName, error: detail })
    throw new Error(`Error al enviar evento a Meta CAPI: ${detail}`)
  }
}

module.exports = { sendEvent }
