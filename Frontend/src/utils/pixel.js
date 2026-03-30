import api from '../services/api'

// Llama a fbq() del Pixel del navegador si está disponible
function fireClientPixel(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params)
  }
}

// Envía el evento al backend (Meta Conversions API server-side)
async function fireServerCapi(eventName, userData = {}, customData = {}, eventSourceUrl = '') {
  try {
    await api.post(
      '/api/v1/pixel/event',
      {
        eventName,
        eventTime: Math.floor(Date.now() / 1000),
        userData,
        customData,
        eventSourceUrl: eventSourceUrl || window.location.href,
        actionSource: 'website',
      },
      {
        headers: { 'x-api-key': import.meta.env.VITE_INTERNAL_API_KEY },
      }
    )
  } catch {
    // El fallo de CAPI no debe interrumpir el flujo del usuario
  }
}

// PageView — disparo en cada cambio de ruta
export function trackPageView(userData = {}) {
  fireClientPixel('PageView')
  fireServerCapi('PageView', userData, {}, window.location.href)
}

// ViewContent — al abrir la página de un producto
export function trackViewContent({ product, userData = {} }) {
  const customData = {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: product.price,
    currency: 'COP',
  }
  fireClientPixel('ViewContent', customData)
  fireServerCapi('ViewContent', userData, customData)
}

// AddToCart — al agregar un producto al carrito
export function trackAddToCart({ product, quantity = 1, userData = {} }) {
  const customData = {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * quantity,
    currency: 'COP',
    contents: [{ id: product.id, quantity, item_price: product.price }],
  }
  fireClientPixel('AddToCart', customData)
  fireServerCapi('AddToCart', userData, customData)
}

// InitiateCheckout — al llegar a la página de checkout
export function trackInitiateCheckout({ items = [], total, userData = {} }) {
  const customData = {
    content_ids: items.map(i => i.productId),
    contents: items.map(i => ({ id: i.productId, quantity: i.quantity, item_price: i.price })),
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    value: total,
    currency: 'COP',
  }
  fireClientPixel('InitiateCheckout', customData)
  fireServerCapi('InitiateCheckout', userData, customData)
}

// Purchase — al confirmar el pedido
export function trackPurchase({ orderId, items = [], total, userData = {} }) {
  const customData = {
    order_id: orderId,
    content_ids: items.map(i => i.productId),
    contents: items.map(i => ({ id: i.productId, quantity: i.quantity, item_price: i.price })),
    num_items: items.reduce((acc, i) => acc + i.quantity, 0),
    value: total,
    currency: 'COP',
  }
  fireClientPixel('Purchase', customData)
  fireServerCapi('Purchase', userData, customData)
}

// Search — al realizar una búsqueda
export function trackSearch({ query, userData = {} }) {
  const customData = { search_string: query }
  fireClientPixel('Search', customData)
  fireServerCapi('Search', userData, customData)
}

// Contact — al abrir el chat de WhatsApp
export function trackContact({ userData = {} } = {}) {
  fireClientPixel('Contact')
  fireServerCapi('Contact', userData)
}
