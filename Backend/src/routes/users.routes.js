const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/auth.middleware')
const {
  getProfile,
  updateProfile,
  getOrderHistory,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
  getPaymentPreference,
  updatePaymentPreference,
} = require('../controllers/users.controller')

// Todas las rutas de usuarios requieren autenticación JWT (RN-004)
router.use(verifyToken)

// Perfil
router.get('/me', getProfile)
router.put('/me', updateProfile)

// Historial de pedidos (RN-027)
router.get('/me/orders', getOrderHistory)

// Direcciones (RN-026: máx 5, una default)
router.get('/me/addresses', getAddresses)
router.post('/me/addresses', addAddress)
router.put('/me/addresses/:id', updateAddress)
router.delete('/me/addresses/:id', deleteAddress)

// Wishlist (RN-028: máx 50, toggle)
router.get('/me/wishlist', getWishlist)
router.post('/me/wishlist', toggleWishlistItem)
router.delete('/me/wishlist/:productId', removeWishlistItem)

// Método de pago preferido (RN-029)
router.get('/me/payment-preference', getPaymentPreference)
router.put('/me/payment-preference', updatePaymentPreference)

module.exports = router
