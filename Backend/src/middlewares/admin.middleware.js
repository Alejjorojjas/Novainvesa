const jwt = require('jsonwebtoken')
const pool = require('../config/database')

// Verifica JWT de admin emitido con JWT_ADMIN_SECRET (RN-034)
// JWT_ADMIN_SECRET es DISTINTO de JWT_SECRET (usado por usuarios regulares)
async function verifyAdminToken(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token de administrador requerido' },
    })
  }

  const token = authHeader.slice(7)

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET)
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'La sesión del administrador expiró'
      : 'Token de administrador inválido'
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message },
    })
  }

  // Verificar que el admin sigue activo en la BD (RN-034)
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, is_active FROM admin_users WHERE id = ?',
      [payload.adminId]
    )

    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Cuenta de administrador inactiva o no encontrada' },
      })
    }

    req.admin = {
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
    }
    next()
  } catch (err) {
    console.error('[verifyAdminToken] Error BD:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al verificar la sesión de administrador' },
    })
  }
}

module.exports = { verifyAdminToken }
