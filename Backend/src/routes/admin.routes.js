const express = require('express')
const rateLimit = require('express-rate-limit')
const router = express.Router()
const { verifyAdminToken } = require('../middlewares/admin.middleware')
const {
  adminLogin,
  getDashboard,
  listOrders,
  getOrderDetail,
  updateOrderStatus,
  listUsers,
  getUserDetail,
  getProductStats,
  getSearches,
} = require('../controllers/admin.controller')

// RN-005: máximo 3 intentos de login admin / 15 minutos / IP
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos fallidos. Acceso bloqueado por 15 minutos.',
    },
  },
})

// Login — público (con rate limiting estricto)
router.post('/login', adminLoginLimiter, adminLogin)

// Todas las demás rutas requieren JWT de admin
router.use(verifyAdminToken)

// Dashboard (RN-036: métricas en tiempo real)
router.get('/dashboard', getDashboard)

// Gestión de pedidos (RN-035, RN-036)
router.get('/orders', listOrders)
router.get('/orders/:orderId', getOrderDetail)
router.put('/orders/:orderId/status', updateOrderStatus)

// Gestión de usuarios (RN-036)
router.get('/users', listUsers)
router.get('/users/:userId', getUserDetail)

// Métricas de productos (RN-036)
router.get('/product-stats', getProductStats)

// Búsquedas populares
router.get('/searches', getSearches)

module.exports = router
