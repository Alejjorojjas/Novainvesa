const pool = require('../config/database')

// GET /api/v1/users/me
async function getProfile(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, full_name, phone, id_number,
              email_verified, created_at, last_login_at
       FROM users WHERE id = ?`,
      [req.user.id]
    )

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' },
      })
    }

    const u = rows[0]
    return res.json({
      success: true,
      data: {
        user: {
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone || null,
          idNumber: u.id_number || null,
          emailVerified: Boolean(u.email_verified),
          createdAt: u.created_at,
          lastLoginAt: u.last_login_at || null,
        },
      },
    })
  } catch (err) {
    console.error('[getProfile] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener el perfil' },
    })
  }
}

// PUT /api/v1/users/me
async function updateProfile(req, res) {
  const { fullName, phone, idNumber } = req.body || {}

  if (fullName !== undefined && fullName.trim().length < 3) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'El nombre debe tener mínimo 3 caracteres' },
    })
  }

  try {
    const updates = []
    const values = []

    if (fullName !== undefined) {
      updates.push('full_name = ?')
      values.push(fullName.trim())
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      values.push(phone?.trim() || null)
    }
    if (idNumber !== undefined) {
      updates.push('id_number = ?')
      values.push(idNumber?.trim() || null)
    }

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No hay campos para actualizar' },
      })
    }

    values.push(req.user.id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

    return res.json({ success: true, message: 'Perfil actualizado exitosamente' })
  } catch (err) {
    console.error('[updateProfile] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al actualizar el perfil' },
    })
  }
}

// GET /api/v1/users/me/orders
async function getOrderHistory(req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const offset = (page - 1) * limit

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
      [req.user.id]
    )

    const [orders] = await pool.query(
      `SELECT id, order_code, status, payment_method, payment_status,
              total, currency, tracking_number, carrier,
              shipping_city, estimated_delivery, created_at
       FROM orders WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    )

    // Obtener ítems de cada pedido
    const orderIds = orders.map(o => o.id)
    let itemsByOrder = {}

    if (orderIds.length) {
      const [items] = await pool.query(
        `SELECT order_id, product_id, product_name, product_image,
                quantity, unit_price, subtotal, currency
         FROM order_items WHERE order_id IN (?)`,
        [orderIds]
      )
      for (const item of items) {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
        itemsByOrder[item.order_id].push({
          productId: item.product_id,
          name: item.product_name,
          image: item.product_image || null,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          subtotal: Number(item.subtotal),
          currency: item.currency,
        })
      }
    }

    const formatted = orders.map(o => ({
      id: o.order_code,
      status: o.status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      total: Number(o.total),
      currency: o.currency,
      trackingNumber: o.tracking_number || null,
      carrier: o.carrier || null,
      shippingCity: o.shipping_city,
      estimatedDelivery: o.estimated_delivery || null,
      createdAt: o.created_at,
      items: itemsByOrder[o.id] || [],
    }))

    return res.json({
      success: true,
      data: {
        orders: formatted,
        pagination: {
          total: Number(total),
          page,
          limit,
          totalPages: Math.ceil(Number(total) / limit),
          hasNextPage: page * limit < Number(total),
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (err) {
    console.error('[getOrderHistory] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener el historial de pedidos' },
    })
  }
}

// GET /api/v1/users/me/addresses
async function getAddresses(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, alias, full_name, phone, country, department,
              city, address, neighborhood, notes, is_default, created_at
       FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    )

    return res.json({
      success: true,
      data: {
        addresses: rows.map(a => ({
          id: a.id,
          alias: a.alias,
          fullName: a.full_name,
          phone: a.phone,
          country: a.country,
          department: a.department,
          city: a.city,
          address: a.address,
          neighborhood: a.neighborhood || null,
          notes: a.notes || null,
          isDefault: Boolean(a.is_default),
          createdAt: a.created_at,
        })),
      },
    })
  } catch (err) {
    console.error('[getAddresses] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener las direcciones' },
    })
  }
}

// POST /api/v1/users/me/addresses
async function addAddress(req, res) {
  const { alias, fullName, phone, country, department, city, address, neighborhood, notes, isDefault } = req.body || {}

  if (!fullName?.trim() || !phone?.trim() || !department?.trim() || !city?.trim() || !address?.trim()) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'fullName, phone, department, city y address son requeridos' },
    })
  }

  try {
    // RN-026: máximo 5 direcciones por usuario
    const [[{ cnt }]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM user_addresses WHERE user_id = ?',
      [req.user.id]
    )

    if (Number(cnt) >= 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'LIMIT_REACHED', message: 'Alcanzaste el límite de 5 direcciones guardadas' },
      })
    }

    // RN-026: si se marca como default, desmarcar la anterior
    if (isDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
        [req.user.id]
      )
    }

    // Si es la primera dirección, ponerla como default automáticamente
    const setDefault = isDefault || Number(cnt) === 0

    const [result] = await pool.query(
      `INSERT INTO user_addresses
         (user_id, alias, full_name, phone, country, department,
          city, address, neighborhood, notes, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        alias?.trim() || 'Mi casa',
        fullName.trim(),
        phone.trim(),
        country || 'CO',
        department.trim(),
        city.trim(),
        address.trim(),
        neighborhood?.trim() || null,
        notes?.trim() || null,
        setDefault ? 1 : 0,
      ]
    )

    return res.status(201).json({
      success: true,
      data: { addressId: result.insertId },
      message: 'Dirección agregada exitosamente',
    })
  } catch (err) {
    console.error('[addAddress] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al agregar la dirección' },
    })
  }
}

// PUT /api/v1/users/me/addresses/:id
async function updateAddress(req, res) {
  const addressId = parseInt(req.params.id)
  const { alias, fullName, phone, country, department, city, address, neighborhood, notes, isDefault } = req.body || {}

  try {
    // Verificar que la dirección pertenece al usuario (RN-037)
    const [rows] = await pool.query(
      'SELECT id FROM user_addresses WHERE id = ? AND user_id = ?',
      [addressId, req.user.id]
    )

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Dirección no encontrada' },
      })
    }

    // RN-026: si se marca como default, desmarcar la anterior
    if (isDefault) {
      await pool.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?',
        [req.user.id]
      )
    }

    const updates = []
    const values = []

    if (alias !== undefined)        { updates.push('alias = ?');        values.push(alias.trim()) }
    if (fullName !== undefined)     { updates.push('full_name = ?');    values.push(fullName.trim()) }
    if (phone !== undefined)        { updates.push('phone = ?');        values.push(phone.trim()) }
    if (country !== undefined)      { updates.push('country = ?');      values.push(country) }
    if (department !== undefined)   { updates.push('department = ?');   values.push(department.trim()) }
    if (city !== undefined)         { updates.push('city = ?');         values.push(city.trim()) }
    if (address !== undefined)      { updates.push('address = ?');      values.push(address.trim()) }
    if (neighborhood !== undefined) { updates.push('neighborhood = ?'); values.push(neighborhood?.trim() || null) }
    if (notes !== undefined)        { updates.push('notes = ?');        values.push(notes?.trim() || null) }
    if (isDefault !== undefined)    { updates.push('is_default = ?');   values.push(isDefault ? 1 : 0) }

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No hay campos para actualizar' },
      })
    }

    values.push(addressId)
    await pool.query(`UPDATE user_addresses SET ${updates.join(', ')} WHERE id = ?`, values)

    return res.json({ success: true, message: 'Dirección actualizada exitosamente' })
  } catch (err) {
    console.error('[updateAddress] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al actualizar la dirección' },
    })
  }
}

// DELETE /api/v1/users/me/addresses/:id
async function deleteAddress(req, res) {
  const addressId = parseInt(req.params.id)

  try {
    const [rows] = await pool.query(
      'SELECT id, is_default FROM user_addresses WHERE id = ? AND user_id = ?',
      [addressId, req.user.id]
    )

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Dirección no encontrada' },
      })
    }

    await pool.query('DELETE FROM user_addresses WHERE id = ?', [addressId])

    // RN-026: si era la default, marcar la más reciente como nueva default
    if (rows[0].is_default) {
      await pool.query(
        `UPDATE user_addresses SET is_default = TRUE
         WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [req.user.id]
      )
    }

    return res.json({ success: true, message: 'Dirección eliminada exitosamente' })
  } catch (err) {
    console.error('[deleteAddress] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al eliminar la dirección' },
    })
  }
}

// GET /api/v1/users/me/wishlist
async function getWishlist(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT product_id, product_name, product_image, product_price, category_slug, added_at
       FROM wishlist WHERE user_id = ? ORDER BY added_at DESC`,
      [req.user.id]
    )

    return res.json({
      success: true,
      data: {
        wishlist: rows.map(w => ({
          productId: w.product_id,
          name: w.product_name,
          image: w.product_image || null,
          price: w.product_price ? Number(w.product_price) : null,
          category: w.category_slug || null,
          addedAt: w.added_at,
        })),
        total: rows.length,
      },
    })
  } catch (err) {
    console.error('[getWishlist] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener la wishlist' },
    })
  }
}

// POST /api/v1/users/me/wishlist — toggle (agrega o elimina)
async function toggleWishlistItem(req, res) {
  const { productId, productName, productImage, productPrice, categorySlug } = req.body || {}

  if (!productId || !productName) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'productId y productName son requeridos' },
    })
  }

  try {
    // RN-028: verificar si ya existe para hacer toggle
    const [existing] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    )

    if (existing.length) {
      // Ya está en wishlist → eliminar
      await pool.query(
        'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
        [req.user.id, productId]
      )

      // RN-030: decrementar wishlist_count en product_stats
      await pool.query(
        `UPDATE product_stats SET wishlist_count = GREATEST(0, wishlist_count - 1)
         WHERE product_id = ?`,
        [productId]
      )

      return res.json({ success: true, data: { action: 'removed' }, message: 'Producto eliminado de favoritos' })
    }

    // RN-028: máximo 50 productos en wishlist
    const [[{ cnt }]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM wishlist WHERE user_id = ?',
      [req.user.id]
    )

    if (Number(cnt) >= 50) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LIMIT_REACHED',
          message: 'Alcanzaste el límite de 50 favoritos. Elimina alguno para agregar nuevos.',
        },
      })
    }

    await pool.query(
      `INSERT INTO wishlist (user_id, product_id, product_name, product_image, product_price, category_slug)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        productId,
        productName,
        productImage || null,
        productPrice || null,
        categorySlug || null,
      ]
    )

    // RN-030: incrementar wishlist_count en product_stats
    await pool.query(
      `INSERT INTO product_stats (product_id, product_name, category_slug, wishlist_count)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE wishlist_count = wishlist_count + 1`,
      [productId, productName, categorySlug || null]
    )

    return res.status(201).json({
      success: true,
      data: { action: 'added' },
      message: 'Producto agregado a favoritos',
    })
  } catch (err) {
    console.error('[toggleWishlistItem] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al actualizar la wishlist' },
    })
  }
}

// DELETE /api/v1/users/me/wishlist/:productId
async function removeWishlistItem(req, res) {
  const productId = req.params.productId

  try {
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    )

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'El producto no está en tu lista de favoritos' },
      })
    }

    await pool.query(
      `UPDATE product_stats SET wishlist_count = GREATEST(0, wishlist_count - 1)
       WHERE product_id = ?`,
      [productId]
    )

    return res.json({ success: true, message: 'Producto eliminado de favoritos' })
  } catch (err) {
    console.error('[removeWishlistItem] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al eliminar de favoritos' },
    })
  }
}

// GET /api/v1/users/me/payment-preference
async function getPaymentPreference(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT preferred_method, updated_at FROM user_payment_preferences WHERE user_id = ?',
      [req.user.id]
    )

    return res.json({
      success: true,
      data: {
        preferredMethod: rows.length ? rows[0].preferred_method : null,
        updatedAt: rows.length ? rows[0].updated_at : null,
      },
    })
  } catch (err) {
    console.error('[getPaymentPreference] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al obtener la preferencia de pago' },
    })
  }
}

// PUT /api/v1/users/me/payment-preference
async function updatePaymentPreference(req, res) {
  const { preferredMethod } = req.body || {}
  const validMethods = ['WOMPI', 'MERCADOPAGO', 'COD']

  if (!preferredMethod || !validMethods.includes(preferredMethod)) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: `preferredMethod debe ser uno de: ${validMethods.join(', ')}` },
    })
  }

  try {
    // RN-029: NUNCA guardar datos de tarjeta — solo el nombre del método
    await pool.query(
      `INSERT INTO user_payment_preferences (user_id, preferred_method)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE preferred_method = VALUES(preferred_method)`,
      [req.user.id, preferredMethod]
    )

    return res.json({
      success: true,
      data: { preferredMethod },
      message: 'Método de pago preferido actualizado',
    })
  } catch (err) {
    console.error('[updatePaymentPreference] Error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Error al actualizar la preferencia de pago' },
    })
  }
}

module.exports = {
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
}
