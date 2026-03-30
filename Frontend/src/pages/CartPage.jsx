import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react'
import { formatPrice } from '../utils/formatters'
import { useCart } from '../hooks/useCart'
import { usePixel } from '../hooks/usePixel'
import CartItem from '../components/cart/CartItem'
import SEOHead from '../components/common/SEOHead'

export default function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, getTotal, getItemCount } = useCart()
  const { trackPageView } = usePixel()

  useEffect(() => {
    trackPageView()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const total = getTotal()
  const count = getItemCount()

  return (
    <>
      <SEOHead title={t('cart.title')} />
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-neutral-900 mb-8">
          {t('cart.title')}
        </h1>

        {items.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingCart className="w-20 h-20 text-neutral-200 mb-6" />
            <h2 className="font-semibold text-xl text-neutral-700 mb-2">{t('cart.empty')}</h2>
            <p className="text-neutral-500 mb-8 max-w-sm">{t('cart.emptyDesc')}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-8 py-3.5 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('cart.viewProducts')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de ítems */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                <p className="text-sm text-neutral-500 mb-4">
                  {t('cart.item', { count })}
                </p>
                <div className="divide-y divide-neutral-100">
                  {items.map(item => (
                    <CartItem key={item.productId} item={item} />
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="mt-4 flex items-center gap-2 text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('cart.continueShopping')}
              </button>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
                <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">
                  {t('checkout.summary.title')}
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{t('cart.subtotal')}</span>
                    <span className="font-medium text-neutral-900">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{t('checkout.summary.shipping')}</span>
                    <span className="font-medium text-green-600">{t('checkout.summary.shippingFree')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-5">
                  <span className="font-semibold text-neutral-900">{t('cart.total')}</span>
                  <span className="font-bold text-xl text-neutral-900">{formatPrice(total)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-xl transition-colors duration-200 shadow-md mb-3"
                >
                  {t('cart.checkout')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
