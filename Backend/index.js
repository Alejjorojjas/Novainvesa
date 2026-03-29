const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const healthRoutes = require('./src/routes/health.routes')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de seguridad
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
  ],
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

// Rutas
app.use('/api/health', healthRoutes)

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
