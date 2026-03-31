import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { usePixel } from '../hooks/usePixel'
import { formatPrice } from '../utils/formatters'
import { validateField, validateCheckoutForm, isFormValid } from '../utils/validators'
import CheckoutForm from '../components/checkout/CheckoutForm'
import api from '../services/api'

const INITIAL_FORM = {
  fullName: '', idNumber: '', email: '', phone: '',
  department: '', city: '', address: '', neighborhood: '',
  notes: '', paymentMethod: '', codCoverageVerified: false,
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCart()
  const pixel = usePixel()

  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const total = getTotal()

  // Pixel: InitiateCheckout al montar — falla silenciosamente
  useEffect(() => {
    try {
      pixel.trackInitiateCheckout(items, total)
    } catch {
      // el pixel no debe bloquear el checkout
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Carrito vacío → redirigir
  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-12 h-12 text-neutral-300" />
        <p className="text-neutral-600">{t('cart.empty')}</p>
        <Link
          to="/"
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          {t('cart.continueShopping')}
        </Link>
      </div>
    )
  }

  function handleChange(name, value) {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleBlur(name) {
    const error = validateField(name, formData[name], formData)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validateCheckoutForm(formData)
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const orderPayload = {
        customer: {
          full_name: formData.fullName,
          id_number: formData.idNumber,
          email: formData.email,
          phone: formData.phone,
        },
        shipping_address: {
          department: formData.department,
          city: formData.city,
          address: formData.address,
          neighborhood: formData.neighborhood,
          notes: formData.notes,
        },
        items: items.map(i => ({
          product_id: i.productId,
          dropi_product_id: i.dropiProductId,
          name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
        })),
        payment_method: formData.paymentMethod,
        total,
      }

      const { data } = await api.post('/api/v1/orders', orderPayload)
      const orderId = data?.data?.orderId || data?.data?.id

      try {
        pixel.trackPurchase(orderId, items, total)
      } catch {
        // el pixel no debe bloquear la confirmación
      }

      clearCart()
      navigate(`/confirmacion/${orderId}`)
    } catch (err) {
      setSubmitError(
        err.response?.data?.error?.message || t('errors.orderFailed')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-semibold text-2xl text-neutral-900 mb-6">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Formulario */}
          <div className="flex-1 min-w-0">
            <CheckoutForm
              formData={formData}
              errors={errors}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* Resumen del pedido */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h2 className="font-display font-semibold text-lg text-neutral-900 mb-4">
                {t('checkout.summary')}
              </h2>

              <ul className="space-y-3 mb-4">
                {items.map(item => (
                  <li key={item.productId} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 bg-neutral-100"
                        onError={e => { e.target.src = '/placeholder.jpg' }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{item.name}</p>
                      <p className="text-xs text-neutral-500">× {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-neutral-100 pt-3 flex justify-between items-center mb-5">
                <span className="font-semibold text-neutral-800">{t('checkout.total')}</span>
                <span className="font-bold text-lg text-neutral-900">{formatPrice(total)}</span>
              </div>

              {submitError && (
                <p className="text-sm text-red-500 mb-3 text-center">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-neutral-300 text-white font-bold py-4 rounded-xl transition-colors duration-200"
              >
                {submitting ? t('checkout.processing') : t('checkout.confirm')}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
