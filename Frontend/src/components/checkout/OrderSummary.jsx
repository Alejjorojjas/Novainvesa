import { useTranslation } from 'react-i18next'
import { formatPrice } from '../../utils/formatters'

// RN-023: tiempo de entrega según ciudad
function getEstimatedDelivery(city = '') {
  const major = ['bogot', 'medell', 'cali', 'barranquilla']
  if (major.some(c => city.toLowerCase().includes(c))) return '2-4'
  return '4-7'
}

export default function OrderSummary({ items = [], total = 0, city = '' }) {
  const { t } = useTranslation()
  const days = getEstimatedDelivery(city)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
      <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">
        {t('checkout.summary.title')}
      </h2>

      {/* Lista de productos */}
      <div className="space-y-3 mb-4 pb-4 border-b border-neutral-100 max-h-52 overflow-y-auto">
        {items.map(item => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
              <img
                src={item.image || '/placeholder.jpg'}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = '/placeholder.jpg' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-neutral-500">x{item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-neutral-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="space-y-2 mb-4 pb-4 border-b border-neutral-100">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">{t('checkout.summary.subtotal')}</span>
          <span className="text-neutral-900">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">{t('checkout.summary.shipping')}</span>
          <span className="text-green-600 font-medium">{t('checkout.summary.shippingFree')}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-neutral-900">{t('checkout.summary.total')}</span>
        <span className="font-bold text-xl text-neutral-900">{formatPrice(total)}</span>
      </div>

      {/* Tiempo estimado RN-023 */}
      {city && (
        <p className="text-xs text-neutral-500 text-center bg-neutral-50 rounded-lg py-2 px-3">
          🚚 {t('checkout.summary.estimatedDelivery', { days: `${days} ${t('common.days')}` })}
        </p>
      )}
    </div>
  )
}
