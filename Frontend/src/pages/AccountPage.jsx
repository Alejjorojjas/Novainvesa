import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, MapPin, CreditCard, Lock } from 'lucide-react'
import SEOHead from '../components/common/SEOHead'

const TABS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'address', label: 'Dirección', icon: MapPin },
  { id: 'payment', label: 'Pago preferido', icon: CreditCard },
  { id: 'security', label: 'Seguridad', icon: Lock },
]

function LoginPrompt({ t }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-3">
        {t('account.loginRequired', 'Inicia sesión para ver tu cuenta')}
      </h2>
      <p className="text-neutral-500 mb-8">
        {t('account.loginDesc', 'Guarda tus datos de envío y revisa tus pedidos anteriores.')}
      </p>
      <button className="bg-[#2563EB] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        {t('account.loginBtn', 'Iniciar sesión')}
      </button>
    </div>
  )
}

function ProfileTab({ t }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-neutral-800 mb-4">{t('account.profile.title', 'Datos personales')}</h3>
      {[
        { label: 'Nombre completo', placeholder: 'Juan Pérez' },
        { label: 'Correo electrónico', placeholder: 'juan@ejemplo.com', type: 'email' },
        { label: 'Teléfono', placeholder: '3001234567', type: 'tel' },
      ].map((f) => (
        <div key={f.label}>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
          <input
            type={f.type || 'text'}
            placeholder={f.placeholder}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
      ))}
      <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        {t('account.save', 'Guardar cambios')}
      </button>
    </div>
  )
}

function AddressTab({ t }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-neutral-800 mb-4">{t('account.address.title', 'Dirección de entrega')}</h3>
      {[
        { label: 'Departamento', placeholder: 'Cundinamarca' },
        { label: 'Ciudad', placeholder: 'Bogotá' },
        { label: 'Dirección', placeholder: 'Calle 123 # 45-67' },
        { label: 'Barrio / Apto', placeholder: 'Chapinero, Apto 301' },
      ].map((f) => (
        <div key={f.label}>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
          <input
            type="text"
            placeholder={f.placeholder}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
      ))}
      <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        {t('account.save', 'Guardar cambios')}
      </button>
    </div>
  )
}

function PaymentTab({ t }) {
  const [preferred, setPreferred] = useState('COD')
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-neutral-800 mb-4">{t('account.payment.title', 'Método de pago preferido')}</h3>
      {[
        { id: 'COD', label: 'Contra entrega (COD)', desc: 'Paga en efectivo al recibir tu pedido.' },
        { id: 'WOMPI', label: 'Wompi', desc: 'Nequi, PSE, tarjeta débito/crédito.' },
        { id: 'MERCADOPAGO', label: 'MercadoPago', desc: 'Daviplata, tarjeta débito/crédito.' },
      ].map((m) => (
        <label
          key={m.id}
          className={
            'flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ' +
            (preferred === m.id ? 'border-[#2563EB] bg-blue-50' : 'border-neutral-200 hover:border-neutral-300')
          }
        >
          <input
            type="radio"
            name="preferred"
            value={m.id}
            checked={preferred === m.id}
            onChange={() => setPreferred(m.id)}
            className="mt-0.5 accent-[#2563EB]"
          />
          <div>
            <p className="font-medium text-neutral-800">{m.label}</p>
            <p className="text-sm text-neutral-500">{m.desc}</p>
          </div>
        </label>
      ))}
      <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        {t('account.save', 'Guardar cambios')}
      </button>
    </div>
  )
}

function SecurityTab({ t }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-neutral-800 mb-4">{t('account.security.title', 'Cambiar contraseña')}</h3>
      {[
        { label: 'Contraseña actual', id: 'current' },
        { label: 'Nueva contraseña', id: 'new' },
        { label: 'Confirmar nueva contraseña', id: 'confirm' },
      ].map((f) => (
        <div key={f.id}>
          <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
          <input
            type="password"
            className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
      ))}
      <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        {t('account.security.update', 'Actualizar contraseña')}
      </button>
    </div>
  )
}

export default function AccountPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('profile')
  const isLoggedIn = false // TODO: connect to auth context

  const TAB_CONTENT = { profile: ProfileTab, address: AddressTab, payment: PaymentTab, security: SecurityTab }
  const TabContent = TAB_CONTENT[activeTab]

  return (
    <>
      <SEOHead title="Mi cuenta — Novainvesa" />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-8">
          {t('account.title', 'Mi cuenta')}
        </h1>

        {isLoggedIn ? (
          <div className="grid md:grid-cols-4 gap-6">
            <nav className="md:col-span-1 space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ' +
                    (activeTab === id ? 'bg-[#2563EB] text-white' : 'text-neutral-600 hover:bg-neutral-100')
                  }
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="md:col-span-3 bg-white border border-neutral-200 rounded-xl p-6">
              <TabContent t={t} />
            </div>
          </div>
        ) : (
          <LoginPrompt t={t} />
        )}
      </div>
    </>
  )
}
