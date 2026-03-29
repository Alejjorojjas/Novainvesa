const express = require('express')
const rateLimit = require('express-rate-limit')
const { body } = require('express-validator')
const authController = require('../controllers/auth.controller')

const router = express.Router()

// RN-038: Login de usuario → 5 intentos / 15 minutos / IP → bloqueo temporal
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // solo cuenta los intentos fallidos
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
    },
  },
})

// Validaciones de registro
const registerValidations = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    // RN-003: al menos 1 letra y 1 número
    .matches(/[a-zA-Z]/).withMessage('La contraseña debe contener al menos una letra')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número'),
  body('fullName')
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ min: 3 }).withMessage('El nombre debe tener mínimo 3 caracteres')
    .trim(),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone('any').withMessage('El número de teléfono no es válido'),
]

// Validaciones de login
const loginValidations = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
]

router.post('/register', registerValidations, authController.register)
router.post('/login', loginLimiter, loginValidations, authController.login)

module.exports = router
