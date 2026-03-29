import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('novainvesa_cart')
    if (saved) setItems(JSON.parse(saved).items || [])
  }, [])

  useEffect(() => {
    localStorage.setItem('novainvesa_cart', JSON.stringify({ items, updatedAt: new Date().toISOString() }))
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, 10) } : i)
      }
      return [...prev, { productId: product.id, dropiProductId: product.dropiProductId, name: product.name, image: product.images?.[0], price: product.price, currency: 'COP', quantity, category: product.category }]
    })
  }

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId))

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return removeItem(productId)
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.min(qty, 10) } : i))
  }

  const clearCart = () => setItems([])
  const getTotal = () => items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const getItemCount = () => items.reduce((acc, i) => acc + i.quantity, 0)
  const isInCart = (productId) => items.some(i => i.productId === productId)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
