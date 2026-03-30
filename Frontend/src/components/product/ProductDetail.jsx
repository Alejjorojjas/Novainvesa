import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { useCart } from '../../hooks/useCart'
import { usePixel } from '../../hooks/usePixel'
import WhatsAppButton from './WhatsAppButton'

const MAX_QTY = 10

export default function ProductDetail({ product }) {
  const { t } = useTranslation()
  const { addItem, isInCart } = useCart()
  const { trackAddToCart } = usePixel()
  const [qty, setQty] = useState(1)

  const hasOffer = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)
  const inCart = isInCart(product.id)

  function handleAddToCart() {
    if (!product.inStock) return
    addItem(product, qty)
    trackAddToCart(product, qty)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Categoría + nombre */}
      <div>
        <p className="text-sm text-neutral-500 mb-1">{product.category}</p>
        <h1 className="font-display font-semibold text-xl md:text-2xl text-neutral-900 leading-snug">
          {product.name}
        </h1>
      </div>

      {/* Precios */}
      <div className="flex items-end gap-3">
        <span className="font-bold text-2xl md:text-3xl text-neutral-900">
          {formatPrice(product.price)}
        </span>
        {hasOffer && (
          <>
            <span className="text-neutral-400 text-lg line-through mb-0.5">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="bg-[#F97316] text-white text-xs font-bold px-2 py-1 rounded-lg mb-0.5">
              {t('product.sale')}
            </span>
          </>
        )}
      </div>

      {/* Descripción corta */}
      {product.shortDescription && (
        <p className="text-neutral-600 text-sm leading-relaxed">
          {product.shortDescription}
        </p>
      )}

      {/* Selector de cantidad */}
      {product.inStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-700">{t('product.quantity')}</span>
          <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Disminuir cantidad"
              className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors duration-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-semibold text-neutral-900 text-sm">
              {qty}
            </span>
            <button
              onClick={() => setQty(q => Math.min(MAX_QTY, q + 1))}
              disabled={qty >= MAX_QTY}
              aria-label="Aumentar cantidad"
              className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {qty >= MAX_QTY && (
            <p className="text-xs text-[#F97316]">{t('cart.maxQuantity')}</p>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`
            w-full flex items-center justify-center gap-2
            font-bold px-6 py-4 rounded-xl text-base
            transition-all duration-200
            ${product.inStock
              ? inCart
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md hover:shadow-lg'
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }
          `}
        >
          <ShoppingCart className="w-5 h-5" />
          {!product.inStock
            ? t('product.outOfStock')
            : inCart
              ? t('product.inCart')
              : t('product.addToCart')
          }
        </button>

        <WhatsAppButton product={product} />
      </div>

      {/* Señales de confianza */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
        {[
          { icon: Truck, label: t('product.shipping') },
          { icon: Shield, label: t('product.guarantee') },
          { icon: RotateCcw, label: t('product.returns') },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <Icon className="w-5 h-5 text-[#2563EB]" />
            <span className="text-xs text-neutral-500 leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
