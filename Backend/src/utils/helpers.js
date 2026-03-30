const pool = require('../config/database')

// Genera código de pedido en formato NOVA-YYYYMMDD-NNNN (RN-015)
// El número secuencial se reinicia cada día y se genera en el backend
async function generateOrderCode() {
  const now = new Date()
  // Convertir a hora de Bogotá (UTC-5)
  const bogota = new Date(now.getTime() - 5 * 60 * 60 * 1000)
  const y = bogota.getUTCFullYear()
  const m = String(bogota.getUTCMonth() + 1).padStart(2, '0')
  const d = String(bogota.getUTCDate()).padStart(2, '0')
  const dateStr = `${y}${m}${d}`

  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM orders
     WHERE DATE(CONVERT_TZ(created_at, '+00:00', '-05:00')) = ?`,
    [`${y}-${m}-${d}`]
  )

  const seq = String(Number(rows[0].cnt) + 1).padStart(4, '0')
  return `NOVA-${dateStr}-${seq}`
}

// Pausa de N milisegundos (usado en reintentos con backoff)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Extrae solo los dígitos de un string de teléfono
function digitsOnly(str = '') {
  return str.replace(/\D/g, '')
}

// Trunca un string a maxLength caracteres
function truncate(str = '', maxLength = 255) {
  if (typeof str !== 'string') return ''
  return str.length > maxLength ? str.slice(0, maxLength) : str
}

module.exports = { generateOrderCode, sleep, digitsOnly, truncate }
