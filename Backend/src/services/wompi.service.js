const crypto = require('crypto')
const axios = require('axios')

const wompiClient = axios.create({
  baseURL: 'https://production.wompi.co/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Construye la URL de checkout de Wompi hosted (redirect checkout)
// El hash de integridad es SHA256(reference + amountInCents + currency + integrityKey)
function buildCheckoutUrl({ reference, amountInCents, currency = 'COP', redirectUrl, expiresAt }) {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY
  const publicKey = process.env.WOMPI_PUBLIC_KEY

  const integrityData = `${reference}${amountInCents}${currency}${integrityKey}`
  const integrityHash = crypto.createHash('sha256').update(integrityData).digest('hex')

  const params = new URLSearchParams({
    'public-key': publicKey,
    currency,
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': integrityHash,
    'redirect-url': redirectUrl,
    'expiration-time': expiresAt,
  })

  return `https://checkout.wompi.co/p/?${params.toString()}`
}

// Verifica la firma HMAC del webhook de Wompi (RN-021)
// checksum = SHA256(valores_de_properties + timestamp + WOMPI_EVENTS_SECRET)
function verifyWebhookSignature(event) {
  const { timestamp, signature, data } = event
  if (!signature?.checksum || !Array.isArray(signature.properties)) return false

  const values = signature.properties.map(path =>
    path.split('.').reduce((obj, key) => obj?.[key], data)
  )
  const message = values.join('') + timestamp + process.env.WOMPI_EVENTS_SECRET
  const expected = crypto.createHash('sha256').update(message).digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature.checksum, 'hex')
  )
}

// Consulta el estado de una transacción por su ID (para verificación extra si se necesita)
async function getTransaction(transactionId) {
  const response = await wompiClient.get(`/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` },
  })
  return response.data?.data || response.data
}

module.exports = { buildCheckoutUrl, verifyWebhookSignature, getTransaction }
