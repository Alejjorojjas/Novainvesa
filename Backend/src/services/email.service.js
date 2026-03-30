const nodemailer = require('nodemailer')
const logger = require('../utils/logger')
const { formatPrice } = require('../utils/formatters')
const { sleep } = require('../utils/helpers')

// Configuración del transporter con SMTP de Hostinger (RN-032)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // SSL
    auth: {
      user: process.env.SMTP_USER || 'pedidos@novainvesa.com',
      pass: process.env.SMTP_PASS,
    },
  })
}

// Genera el HTML del email de confirmación de pedido (RN-032)
function buildOrderConfirmationHtml({ customerName, order }) {
  const { id, items, total, currency, paymentMethod, shipping, estimatedDelivery } = order

  const paymentLabels = {
    COD: 'Contra entrega (COD)',
    WOMPI: 'Wompi (PSE / Nequi / Tarjeta)',
    MERCADOPAGO: 'MercadoPago (Daviplata / Tarjeta)',
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" width="60" style="border-radius:6px;vertical-align:middle;margin-right:10px;">`
          : ''
        }
        <span style="font-size:14px;color:#374151;">${item.name}</span>
      </td>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#374151;">x${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#374151;font-weight:600;">
        ${formatPrice(item.unitPrice)}
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Pedido confirmado</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">✅ ¡Pedido confirmado!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Código: <strong>${id}</strong></p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0;font-size:16px;color:#374151;">Hola <strong>${customerName}</strong>,</p>
              <p style="margin:10px 0 0;font-size:15px;color:#6b7280;">Hemos recibido tu pedido y pronto comenzaremos a prepararlo.</p>
            </td>
          </tr>

          <!-- Productos -->
          <tr>
            <td style="padding:24px 32px 0;">
              <h2 style="margin:0 0 12px;font-size:16px;color:#111827;">Resumen de tu pedido</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Producto</th>
                    <th style="padding:10px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Cant.</th>
                    <th style="padding:10px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background:#f9fafb;">
                    <td colspan="2" style="padding:12px;font-size:15px;color:#111827;font-weight:700;">Total</td>
                    <td style="padding:12px;text-align:right;font-size:16px;color:#6366f1;font-weight:700;">${formatPrice(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Info de envío y pago -->
          <tr>
            <td style="padding:24px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#f9fafb;border-radius:8px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">📦 Envío a</p>
                    <p style="margin:0;font-size:14px;color:#374151;">${shipping.address}</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#374151;">${shipping.city}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#f9fafb;border-radius:8px;padding:16px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">💳 Método de pago</p>
                    <p style="margin:0;font-size:14px;color:#374151;">${paymentLabels[paymentMethod] || paymentMethod}</p>
                    ${estimatedDelivery
                      ? `<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">⏱ ${estimatedDelivery}</p>`
                      : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA WhatsApp -->
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <a href="https://wa.me/57${process.env.WHATSAPP_NUMBER || ''}?text=Hola,%20quiero%20consultar%20mi%20pedido%20${encodeURIComponent(id)}"
                 style="display:inline-block;background:#25d366;color:#fff;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">
                💬 Consultar estado por WhatsApp
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px 32px;text-align:center;border-top:1px solid #f0f0f0;margin-top:28px;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">novainvesa.com · pedidos@novainvesa.com</p>
              <p style="margin:6px 0 0;font-size:12px;color:#d1d5db;">© 2026 Novainvesa. Todos los derechos reservados.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Envía el email de confirmación con reintentos (RN-033)
// 3 intentos, 5 minutos entre cada uno; el pedido NO se cancela por fallo
async function sendOrderConfirmation({ to, customerName, order }) {
  const MAX_RETRIES = 3
  const RETRY_DELAY_MS = 5 * 60 * 1000 // 5 minutos (RN-033)

  const subject = `✅ Pedido confirmado #${order.id}`
  const html = buildOrderConfirmationHtml({ customerName, order })

  const transporter = createTransporter()

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"Novainvesa" <${process.env.SMTP_USER || 'pedidos@novainvesa.com'}>`,
        to,
        subject,
        html,
      })

      logger.info('[email] Confirmación enviada', { to, orderId: order.id, messageId: info.messageId })
      return { messageId: info.messageId, sentTo: to }
    } catch (err) {
      logger.error(`[email] Error enviando confirmación (intento ${attempt}/${MAX_RETRIES})`, {
        to,
        orderId: order.id,
        error: err.message,
      })

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS)
      } else {
        // RN-033: si los 3 intentos fallan, registrar para revisión manual
        logger.error('[email] FALLO DEFINITIVO — revisar manualmente', { to, orderId: order.id })
        throw err
      }
    }
  }
}

module.exports = { sendOrderConfirmation }
