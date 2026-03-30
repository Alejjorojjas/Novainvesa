import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, X } from 'lucide-react'
import SEOHead from '../components/common/SEOHead'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatters'

// Wishlist state is stored in localStorage — key 'novainvesa_wishlist'
// Items: [{ id, name, price, image, slug }]
function useWishlist() {
  const raw = localStorage.getItem('novainvesa_wishlist')
  const items = raw ? JSON.parse(raw) : []

  function remove(id) {
    const updated = items.filter((i) => i.id !== id)
    localStorage.setItem('novainvesa_wishlist', JSON.stringify(updated))
    window.dispatchEvent(new Event('wishlist-updated'))
  }

  return { items, remove }
}

function WishlistItem({ item, onRemove }) {
  const { addItem } = useCart()

  function handleAddToCart() {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image }, 1)
  }

  return (
    <div className="flex gap-4 bg-white border border-neutral-200 rounded-xl p-4">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Heart size={24} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={'/producto/' + item.id}
          className="font-medium text-neutral-800 hover:text-[#2563EB] line-clamp-2 text-sm"
        >
          {item.name}
        </Link>
        <p className="text-[#2563EB] font-bold mt-1">{formatPrice(item.price)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onRemove(item.id)}
          className="text-neutral-400 hover:text-red-500 transition-colors"
          aria-label="Quitar de favoritos"
        >
          <X size={16} />
        </button>
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors mt-auto"
        >
          <ShoppingCart size={13} />
          Agregar
        </button>
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const { t } = useTranslation()
  const { items, remove } = useWishlist()

  return (
    <>
      <SEOHead title="Favoritos — Novainvesa" />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">
          {t('wishlist.title', 'Favoritos')}
        </h1>
        {items.length > 0 && (
          <p className="text-neutral-500 text-sm mb-8">
            {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        )}

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <WishlistItem key={item.id} item={item} onRemove={remove} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart size={48} className="text-neutral-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-neutral-700 mb-2">
              {t('wishlist.empty', 'No tienes favoritos aún')}
            </h2>
            <p className="text-neutral-500 mb-6">
              {t('wishlist.emptyDesc', 'Guarda los productos que te gusten para comprarlos después.')}
            </p>
            <Link
              to="/"
              className="inline-block bg-[#2563EB] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('wishlist.explore', 'Explorar productos')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
