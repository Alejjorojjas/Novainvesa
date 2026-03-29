const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Rutas
const healthRoutes    = require('./src/routes/health.routes')
const productsRoutes  = require('./src/routes/products.routes')
const ordersRoutes    = require('./src/routes/orders.routes')
const paymentsRoutes  = require('./src/routes/payments.routes')
const webhooksRoutes  = require('./src/routes/webhooks.routes')
const trackingRoutes  = require('./src/routes/tracking.routes')
const authRoutes      = require('./src/routes/auth.routes')
const usersRoutes     = require('./src/routes/users.routes')
const adminRoutes     = require('./src/routes/admin.routes')
const pixelRoutes     = require('./src/routes/pixel.routes')
const emailRoutes     = require('./src/routes/email.routes')
const coverageRoutes  = require('./src/routes/coverage.routes')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de seguridad
app.use(helmet())
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas solicitudes, intenta mas tarde' } }
})
app.use(limiter)

// Parseo de JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Registro de rutas
app.use('/api/health',          healthRoutes)
app.use('/api/v1/products',     productsRoutes)
app.use('/api/v1/orders',       ordersRoutes)
app.use('/api/v1/payments',     paymentsRoutes)
app.use('/api/v1/webhooks',     webhooksRoutes)
app.use('/api/v1/tracking',     trackingRoutes)
app.use('/api/v1/auth',         authRoutes)
app.use('/api/v1/users',        usersRoutes)
app.use('/api/v1/admin',        adminRoutes)
app.use('/api/v1/pixel',        pixelRoutes)
app.use('/api/v1/email',        emailRoutes)
app.use('/api/v1/coverage',     coverageRoutes)

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' }
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log('Servidor Novainvesa corriendo en puerto ' + PORT)
  console.log('Ambiente: ' + process.env.NODE_ENV)
})

module.exports = app
