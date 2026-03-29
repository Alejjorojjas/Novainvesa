const jwt = require('jsonwebtoken')
const pool = require('../config/database')

// Middleware para rutas de usuarios — verifica JWT emitido en login
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token de autenticación requerido' },
    })
  }

  const token = authHeader.slice(7)

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Tu sesión expiró. Por favor inicia sesión de nuevo'
      : 'Token inválido'
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message },
    })
  }

  // Verificar que el usuario sigue activo en la BD (RN-002: cuenta suspendida)
  try {
    const [rows] = await pool.query(
      'SELECT id, email, full_name, is_active FROM users WHERE id = ?',
      [payload.userId]
    )

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Cuenta inactiva o no encontrada' },
      })
    }

    req.user = { id: rows[0].id, email: rows[0].email, fullName: rows[0].full_name }
    next()
  } catch (err) {
    console.error('[verifyToken] Error BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al verificar la sesión' },
    })
  }
}

module.exports = { verifyToken }
