import { useEffect } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react'
import { formatPrice } from '../utils/formatters'
import { usePixel } from '../hooks/usePixel'
import { siteConfig } from '../config/site'
import SEOHead from '../components/common/SEOHead'

function getDeliveryRange(city) {
  if (!city) return '4-7'
  const major = ['bogot', 'medell', 'cali', 'barranquilla']
  return major.some(c => city.toLowerCase().includes(c)) ? '2-4' : '4-7'
}

export default function ConfirmationPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { trackPurchase } = usePixel()

  const order = location.state?.order
  const orderId = order?.id || searchParams.get('orderId')
  const deliveryDays = getDeliveryRange(order?.shipping?.city)
  const whatsappMsg = orderId
    ? 'Hola! Quisiera consultar mi pedido ' + orderId
    : siteConfig.contact.whatsappMessage
  const whatsappHref =
    'https://wa.me/' + siteConfig.contact.whatsapp + '?text=' + encodeURIComponent(whatsappMsg)

  useEffect(() => {
    if (order) trackPurchase(order.id, order.items || [], order.total || 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SEOHead title={t('confirmation.title')} />
      <div className="max-w-[600px] mx-auto px-4 md:px-6 py-12">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl md:text-3xl text-neutral-900 text-center mb-2">
          {t('confirmation.title')}
        </h1>
        <p className="text-neutral-500 text-center mb-8">{t('confirmation.subtitle')}</p>

        {orderId && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-center mb-6">
            <p className="text-sm text-blue-600 font-medium mb-1">{t('confirmation.orderCode')}</p>
            <p className="font-bold text-xl text-blue-800 tracking-wide">{orderId}</p>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            {order.items?.length > 0 && (
              <div className="space-y-3 mb-4 pb-4 border-b border-neutral-100">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
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
                      <p className="text-xs text-neutral-500">x{item.quantity || 1}</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 shrink-0">
                      {formatPrice((item.unitPrice || item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {order.total > 0 && (
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-neutral-700">{t('cart.total')}</span>
                <span className="font-bold text-xl text-neutral-900">{formatPrice(order.total)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-neutral-50 rounded-xl px-4 py-3">
              <Package className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm text-neutral-600">
                {t('checkout.summary.estimatedDelivery', { days: deliveryDays + ' ' + t('common.days') })}
              </p>
            </div>
          </div>
        )}

        {order?.customer?.email && (
          <p className="text-center text-sm text-neutral-500 mb-8">
            {t('confirmation.emailSent')}{' '}
            <span className="font-medium text-neutral-700">{order.customer.email}</span>
          </p>
        )}

        <div className="flex flex-col gap-3">
          {orderId && (
            <Link
              to={'/rastrear/' + orderId}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-xl transition-colors duration-200"
            >
              {t('confirmation.trackOrder')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22C55E] text-white font-bold py-3.5 rounded-xl transition-colors duration-200"
          >
            {t('confirmation.whatsappConsult')}
          </a>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold py-3.5 rounded-xl transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            {t('confirmation.continueShopping')}
          </Link>
        </div>
      </div>
    </>
  )
}
