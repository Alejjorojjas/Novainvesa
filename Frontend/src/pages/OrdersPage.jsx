import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import SEOHead from '../components/common/SEOHead'
import { formatPrice } from '../utils/formatters'

const STATUS_STYLES = {
  pending:    { label: 'Pendiente',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed:  { label: 'Confirmado',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
  shipped:    { label: 'Enviado',      bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered:  { label: 'Entregado',    bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled:  { label: 'Cancelado',    bg: 'bg-red-100',    text: 'text-red-700'    },
}

// Mock data — replace with real API call once auth is implemented
const MOCK_ORDERS = [
  {
    id: 'NOVA-20250315-0042',
    date: '15 mar 2025',
    status: 'delivered',
    total: 189900,
    items: [{ name: 'Collar GPS para perros', qty: 1, image: null }],
  },
  {
    id: 'NOVA-20250320-0058',
    date: '20 mar 2025',
    status: 'shipped',
    total: 254800,
    items: [
      { name: 'Kit organizador de cocina', qty: 2, image: null },
      { name: 'Dispensador de jabón automático', qty: 1, image: null },
    ],
  },
]

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  return (
    <span className={'text-xs font-semibold px-2.5 py-1 rounded-full ' + s.bg + ' ' + s.text}>
      {s.label}
    </span>
  )
}

function OrderCard({ order }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-mono text-sm font-semibold text-neutral-800">{order.id}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{order.date}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-1 mb-4">
        {order.items.map((item, i) => (
          <p key={i} className="text-sm text-neutral-600">
            {item.qty > 1 && <span className="font-medium">{item.qty}x </span>}
            {item.name}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <p className="font-semibold text-neutral-800">{formatPrice(order.total)}</p>
        <Link
          to={'/confirmacion?orderId=' + order.id}
          className="flex items-center gap-1 text-sm text-[#2563EB] font-medium hover:underline"
        >
          Ver detalle <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}

function LoginPrompt({ t }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-3">
        {t('orders.loginRequired', 'Inicia sesión para ver tus pedidos')}
      </h2>
      <p className="text-neutral-500 mb-8">
        {t('orders.loginDesc', 'Consulta el estado y el historial de todas tus compras.')}
      </p>
      <button className="bg-[#2563EB] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        {t('account.loginBtn', 'Iniciar sesión')}
      </button>
    </div>
  )
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const isLoggedIn = false // TODO: connect to auth context
  const orders = MOCK_ORDERS

  return (
    <>
      <SEOHead title="Mis pedidos — Novainvesa" />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-8">
          {t('orders.title', 'Mis pedidos')}
        </h1>

        {isLoggedIn ? (
          orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package size={48} className="text-neutral-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-neutral-700 mb-2">
                {t('orders.empty', 'Todavía no tienes pedidos')}
              </h2>
              <p className="text-neutral-500 mb-6">
                {t('orders.emptyDesc', 'Cuando realices tu primera compra aparecerá aquí.')}
              </p>
              <Link
                to="/"
                className="inline-block bg-[#2563EB] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('orders.shop', 'Explorar productos')}
              </Link>
            </div>
          )
        ) : (
          <LoginPrompt t={t} />
        )}
      </div>
    </>
  )
}
