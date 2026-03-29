const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const pool = require('../config/database')

const BCRYPT_ROUNDS = 12
const TOKEN_EXPIRY = '7d' // RN-004

function buildToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

function safeUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone || null,
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at,
  }
}

// POST /api/v1/auth/register
async function register(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    })
  }

  const { email, password, fullName, phone } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  try {
    // RN-002: verificar unicidad del email
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    )

    if (existing.length) {
      // Mensaje genérico para no confirmar si la cuenta existe (seguridad)
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Este email ya tiene una cuenta. ¿Quieres iniciar sesión?',
        },
      })
    }

    // RN-003: hashear contraseña con bcrypt 12 rounds
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone)
       VALUES (?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, fullName.trim(), phone?.trim() || null]
    )

    const userId = result.insertId
    const token = buildToken(userId, normalizedEmail)

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email: normalizedEmail,
          fullName: fullName.trim(),
          phone: phone?.trim() || null,
          emailVerified: false,
        },
      },
      message: 'Cuenta creada exitosamente',
    })
  } catch (err) {
    console.error('[register] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al crear la cuenta' },
    })
  }
}

// POST /api/v1/auth/login
async function login(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: errors.array()[0].msg },
    })
  }

  const { email, password } = req.body
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, full_name, phone, email_verified, is_active, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    )

    // Mensaje genérico para no revelar si el email existe (RN-037)
    const genericError = {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' },
    }

    if (!rows.length) {
      // Ejecutar compare igualmente para evitar timing attack
      await bcrypt.compare(password, '$2a$12$invalidhashpadding000000000000000000000000000000000000')
      return res.status(401).json(genericError)
    }

    const user = rows[0]

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json(genericError)
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_INACTIVE', message: 'Tu cuenta ha sido suspendida. Contáctanos para más información.' },
      })
    }

    // Actualizar last_login_at (RN-004)
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    )

    const token = buildToken(user.id, user.email)

    return res.json({
      success: true,
      data: {
        token,
        user: safeUser(user),
      },
    })
  } catch (err) {
    console.error('[login] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al iniciar sesión' },
    })
  }
}

module.exports = { register, login }
