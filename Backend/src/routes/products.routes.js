const express = require('express')
const { query } = require('express-validator')
const productsController = require('../controllers/products.controller')

const router = express.Router()

// Validaciones para GET /
const listValidations = [
  query('category')
    .optional()
    .isString()
    .trim()
    .isIn(['mascotas', 'hogar', 'tecnologia', 'belleza', 'fitness'])
    .withMessage('Categoría inválida'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entre 1 y 50'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('El parámetro featured debe ser true o false'),
]

// Validaciones para GET /search
const searchValidations = [
  query('q')
    .notEmpty().withMessage('El parámetro q es requerido')
    .isString().trim()
    .isLength({ min: 2 }).withMessage('La búsqueda debe tener mínimo 2 caracteres'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entre 1 y 50'),
]

// IMPORTANTE: /search debe ir antes que /:id para evitar que Express lo interprete como un ID
router.get('/search', searchValidations, productsController.searchProducts)
router.get('/', listValidations, productsController.getProducts)
router.get('/:id', productsController.getProductById)

module.exports = router
