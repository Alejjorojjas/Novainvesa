import { useTranslation } from 'react-i18next'
import { Plus, Minus, X } from 'lucide-react'
import { formatPrice } from '../../utils/formatters'
import { useCart } from '../../hooks/useCart'

export default function CartItem({ item, compact = false }) {
  const { t } = useTranslation()
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 dark:border-gray-700 last:border-0">
      {/* Imagen */}
      <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-gray-700">
        <img
          src={item.image || '/placeholder.jpg'}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = '/placeholder.jpg' }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-500 dark:text-gray-400 truncate">{item.category}</p>
        <p className="text-sm font-semibold text-neutral-800 dark:text-white leading-tight line-clamp-2 mb-2">
          {item.name}
        </p>

        <div className="flex items-center justify-between gap-2">
          {/* Selector de cantidad */}
          <div className="flex items-center border border-neutral-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              aria-label="Disminuir"
              className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-sm font-semibold text-neutral-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              aria-label="Aumentar"
              className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-40"
              disabled={item.quantity >= 10}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-sm font-bold text-neutral-900 dark:text-white shrink-0">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>

        {item.quantity >= 10 && (
          <p className="text-xs text-[#F97316] mt-1">{t('cart.maxQuantity')}</p>
        )}
      </div>

      {/* Eliminar */}
      <button
        onClick={() => removeItem(item.productId)}
        aria-label={t('cart.remove')}
        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
