import { useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, Users, LogOut,
  TrendingUp, Package, DollarSign, Eye,
} from 'lucide-react'
import SEOHead from '../components/common/SEOHead'
import { formatPrice } from '../utils/formatters'
import api from '../services/api'

// ─── Auth ──────────────────────────────────────────────────────────────────

function useAdminAuth() {
  const [token, setToken] = useState(() => sessionStorage.getItem('nova_admin_token'))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/v1/admin/login', { email, password })
      sessionStorage.setItem('nova_admin_token', data.data.token)
      setToken(data.data.token)
    } catch (err) {
      const code = err.response?.data?.error?.code
      if (code === 'INVALID_CREDENTIALS') setError('Credenciales incorrectas.')
      else if (code === 'ACCOUNT_LOCKED') setError('Cuenta bloqueada. Intenta en 15 minutos.')
      else setError('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    sessionStorage.removeItem('nova_admin_token')
    setToken(null)
  }

  return { token, login, logout, error, loading }
}

// ─── Login screen ───────────────────────────────────────────────────────────

function AdminLogin({ onLogin, error, loading }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center mx-auto mb-3">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-neutral-900">Panel Novainvesa</h1>
          <p className="text-neutral-500 text-sm mt-1">Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Metric card ────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
      <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' + color}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  )
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  { id: 'NOVA-20250328-0091', customer: 'Ana García',    city: 'Bogotá',    total: 189900, status: 'delivered', method: 'COD'        },
  { id: 'NOVA-20250329-0092', customer: 'Luis Martínez', city: 'Medellín',  total: 254800, status: 'shipped',   method: 'WOMPI'      },
  { id: 'NOVA-20250329-0093', customer: 'Clara López',   city: 'Cali',      total: 98000,  status: 'confirmed', method: 'MERCADOPAGO'},
  { id: 'NOVA-20250330-0094', customer: 'Pedro Ruiz',    city: 'Cartagena', total: 315000, status: 'pending',   method: 'COD'        },
  { id: 'NOVA-20250330-0095', customer: 'Sofía Torres',  city: 'Bogotá',    total: 128900, status: 'cancelled', method: 'WOMPI'      },
]

const MOCK_USERS = [
  { id: 1, name: 'Admin Principal', email: 'admin@novainvesa.com', role: 'super_admin', lastLogin: '30 mar 2025' },
  { id: 2, name: 'Soporte 1',       email: 'soporte@novainvesa.com', role: 'admin',   lastLogin: '29 mar 2025' },
]

const STATUS_STYLES = {
  pending:   { label: 'Pendiente',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed: { label: 'Confirmado', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  shipped:   { label: 'Enviado',    bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered: { label: 'Entregado',  bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled: { label: 'Cancelado',  bg: 'bg-red-100',    text: 'text-red-700'    },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  return (
    <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + s.bg + ' ' + s.text}>
      {s.label}
    </span>
  )
}

// ─── Dashboard tab ───────────────────────────────────────────────────────────

function DashboardTab() {
  const metrics = [
    { icon: ShoppingBag, label: 'Pedidos hoy',   value: '12',            color: 'bg-[#2563EB]' },
    { icon: DollarSign,  label: 'Ventas hoy',    value: formatPrice(1847600), color: 'bg-[#F97316]' },
    { icon: TrendingUp,  label: 'Tasa conversión', value: '3.4%',        color: 'bg-emerald-500' },
    { icon: Eye,         label: 'Visitas hoy',   value: '348',           color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h2 className="text-lg font-display font-bold text-neutral-800 mb-5">Resumen del día</h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <h3 className="font-semibold text-neutral-800 mb-3">Últimos pedidos</h3>
      <OrdersTable orders={MOCK_ORDERS.slice(0, 3)} />
    </div>
  )
}

// ─── Orders tab ──────────────────────────────────────────────────────────────

function OrdersTable({ orders }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="pb-3 pr-4 font-medium">Pedido</th>
            <th className="pb-3 pr-4 font-medium">Cliente</th>
            <th className="pb-3 pr-4 font-medium">Ciudad</th>
            <th className="pb-3 pr-4 font-medium">Total</th>
            <th className="pb-3 pr-4 font-medium">Pago</th>
            <th className="pb-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
              <td className="py-3 pr-4 font-mono text-xs text-neutral-700">{o.id}</td>
              <td className="py-3 pr-4 text-neutral-800">{o.customer}</td>
              <td className="py-3 pr-4 text-neutral-600">{o.city}</td>
              <td className="py-3 pr-4 font-semibold text-neutral-800">{formatPrice(o.total)}</td>
              <td className="py-3 pr-4 text-neutral-600">{o.method}</td>
              <td className="py-3"><StatusBadge status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrdersTab() {
  return (
    <div>
      <h2 className="text-lg font-display font-bold text-neutral-800 mb-5">Todos los pedidos</h2>
      <OrdersTable orders={MOCK_ORDERS} />
    </div>
  )
}

// ─── Users tab ───────────────────────────────────────────────────────────────

function UsersTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-display font-bold text-neutral-800">Administradores</h2>
        <button className="bg-[#2563EB] text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          + Nuevo admin
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="pb-3 pr-4 font-medium">Nombre</th>
              <th className="pb-3 pr-4 font-medium">Correo</th>
              <th className="pb-3 pr-4 font-medium">Rol</th>
              <th className="pb-3 font-medium">Último acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {MOCK_USERS.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-neutral-800">{u.name}</td>
                <td className="py-3 pr-4 text-neutral-600">{u.email}</td>
                <td className="py-3 pr-4">
                  <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' +
                    (u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                    {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="py-3 text-neutral-500">{u.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main dashboard ──────────────────────────────────────────────────────────

const NAV_TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'orders',    label: 'Pedidos',    icon: Package          },
  { id: 'users',     label: 'Admins',     icon: Users            },
]

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const TAB_CONTENT = { dashboard: DashboardTab, orders: OrdersTab, users: UsersTab }
  const TabContent = TAB_CONTENT[activeTab]

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-neutral-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-neutral-700">
          <p className="font-display font-bold text-lg">Novainvesa</p>
          <p className="text-neutral-400 text-xs mt-0.5">Panel de administración</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ' +
                (activeTab === id
                  ? 'bg-[#2563EB] text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white')
              }
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        <TabContent />
      </main>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { token, login, logout, error, loading } = useAdminAuth()

  return (
    <>
      <SEOHead title="Admin — Novainvesa" />
      {token ? (
        <AdminDashboard onLogout={logout} />
      ) : (
        <AdminLogin onLogin={login} error={error} loading={loading} />
      )}
    </>
  )
}
