import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { useCart } from '../../hooks/useCart'
import { usePixel } from '../../hooks/usePixel'

export default function ProductCard({ product }) {
  const { t } = useTranslation()
  const { addItem, isInCart } = useCart()
  const { trackAddToCart } = usePixel()

  const hasOffer = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)
  const inCart = isInCart(product.id)

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) return
    addItem(product)
    trackAddToCart(product, 1)
  }

  return (
    <Link
      to={`/producto/${product.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = '/placeholder.jpg' }}
        />
        {hasOffer && (
          <span className="absolute top-2 left-2 bg-[#F97316] text-white text-xs font-bold px-2 py-1 rounded-lg">
            {t('product.sale')}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-neutral-700 text-sm font-semibold px-3 py-1 rounded-lg">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-neutral-500 text-xs mb-1 truncate">{product.category}</p>
        <h3 className="text-neutral-800 font-semibold text-sm sm:text-base leading-tight line-clamp-2 mb-2 flex-1">
          {product.name}
        </h3>

        {/* Precios */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-neutral-900 font-bold text-base sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {hasOffer && (
            <span className="text-neutral-400 text-sm line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`
            w-full flex items-center justify-center gap-2
            text-sm font-semibold py-2 rounded-xl
            transition-colors duration-200
            ${!!product.inStock
              ? inCart
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }
          `}
        >
          <ShoppingCart className="w-4 h-4" />
          {inCart ? t('product.inCart') : t('product.addToCart')}
        </button>
      </div>
    </Link>
  )
}
