import {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackSearch,
  trackContact,
} from '../utils/pixel'

// Hook de conveniencia que expone todos los eventos del Pixel
// userData se puede pasar al hook para propagarlo a todos los eventos
export function usePixel(userData = {}) {
  return {
    trackPageView: () =>
      trackPageView(userData),

    trackViewContent: (product) =>
      trackViewContent({ product, userData }),

    trackAddToCart: (product, quantity = 1) =>
      trackAddToCart({ product, quantity, userData }),

    trackInitiateCheckout: (items, total) =>
      trackInitiateCheckout({ items, total, userData }),

    trackPurchase: (orderId, items, total) =>
      trackPurchase({ orderId, items, total, userData }),

    trackSearch: (query) =>
      trackSearch({ query, userData }),

    trackContact: () =>
      trackContact({ userData }),
  }
}
