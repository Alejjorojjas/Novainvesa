import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, ShoppingCart, ArrowRight } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { useCart } from '../../hooks/useCart'
import CartItem from './CartItem'

export default function CartDrawer() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, getTotal, isCartOpen, closeCart } = useCart()

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeCart])

  function handleCheckout() {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`
          fixed inset-0 z-50 bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-sm
          bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-display font-semibold text-lg text-neutral-900">
            {t('cart.title')}
          </h2>
          <button
            onClick={closeCart}
            aria-label={t('common.close')}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
            <ShoppingCart className="w-16 h-16 text-neutral-200" />
            <p className="font-semibold text-neutral-700">{t('cart.empty')}</p>
            <p className="text-sm text-neutral-500">{t('cart.emptyDesc')}</p>
            <button
              onClick={closeCart}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors duration-200"
            >
              {t('cart.viewProducts')}
            </button>
          </div>
        ) : (
          <>
            {/* Lista de ítems — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {items.map(item => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-neutral-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium">{t('cart.subtotal')}</span>
                <span className="font-bold text-lg text-neutral-900">{formatPrice(getTotal())}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-xl transition-colors duration-200 shadow-md"
              >
                {t('cart.checkout')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={closeCart}
                className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
