import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const STORAGE_KEY = 'novainvesa_cart'
const MAX_ITEMS = 20
const MAX_QTY = 10
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 días (RN-011)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Cargar desde localStorage respetando TTL de 7 días (RN-011)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved)
      const updatedAt = parsed.updatedAt ? new Date(parsed.updatedAt) : null
      if (updatedAt && Date.now() - updatedAt.getTime() < TTL_MS) {
        setItems(parsed.items || [])
      }
      // Si expiró: carrito vacío silenciosamente (RN-011)
    } catch {
      // JSON inválido: ignorar
    }
  }, [])

  // Persistir en localStorage con timestamp
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items, updatedAt: new Date().toISOString() })
    )
  }, [items])

  // Agregar ítem con límites RN-010
  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) }
            : i
        )
      }
      if (prev.length >= MAX_ITEMS) return prev // RN-010: máx 20 productos distintos
      return [
        ...prev,
        {
          productId: product.id,
          dropiProductId: product.dropiProductId,
          name: product.name,
          image: product.images?.[0],
          price: product.price,
          currency: 'COP',
          quantity: Math.min(quantity, MAX_QTY),
          category: product.category,
        },
      ]
    })
  }

  const removeItem = (productId) =>
    setItems(prev => prev.filter(i => i.productId !== productId))

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return removeItem(productId)
    setItems(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, quantity: Math.min(qty, MAX_QTY) }
          : i
      )
    )
  }

  const clearCart = () => setItems([])
  const getTotal = () => items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const getItemCount = () => items.reduce((acc, i) => acc + i.quantity, 0)
  const isInCart = (productId) => items.some(i => i.productId === productId)
  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        getTotal, getItemCount, isInCart,
        isCartOpen, openCart, closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
