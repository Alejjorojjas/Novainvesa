import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { productsService } from '../../services/products.service'

const COD_LIMIT = 500_000 // RN-018

const METHODS = [
  {
    id: 'WOMPI',
    labelKey: 'checkout.payment.wompi',
    descKey: 'checkout.payment.wompiDesc',
    icon: '💳',
  },
  {
    id: 'MERCADOPAGO',
    labelKey: 'checkout.payment.mercadopago',
    descKey: 'checkout.payment.mercadopagoDesc',
    icon: '🏦',
  },
  {
    id: 'COD',
    labelKey: 'checkout.payment.cod',
    descKey: 'checkout.payment.codDesc',
    icon: '💵',
  },
]

export default function PaymentSelector({ paymentMethod, onChange, city, total }) {
  const { t } = useTranslation()
  const [codStatus, setCodStatus] = useState('idle') // idle | checking | available | unavailable
  const [codMessage, setCodMessage] = useState('')
  const debounceRef = useRef(null)

  // Verificar cobertura COD cuando cambia la ciudad (RN-018)
  useEffect(() => {
    if (!city || city.trim().length < 2) {
      setCodStatus('idle')
      setCodMessage('')
      // Si COD estaba seleccionado, deseleccionar
      if (paymentMethod === 'COD') onChange('')
      return
    }

    // Deseleccionar COD mientras se verifica
    setCodStatus('checking')

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productsService.checkCodCoverage(city.trim())
        if (data.codAvailable) {
          setCodStatus('available')
          setCodMessage('')
        } else {
          setCodStatus('unavailable')
          setCodMessage(t('checkout.payment.codNotAvailable'))
          if (paymentMethod === 'COD') onChange('')
        }
      } catch {
        // Si falla la consulta, asumimos disponible para no bloquear
        setCodStatus('available')
        setCodMessage('')
      }
    }, 600)

    return () => clearTimeout(debounceRef.current)
  }, [city]) // eslint-disable-line react-hooks/exhaustive-deps

  // RN-018: COD no disponible si total >= $500.000
  const codOverLimit = total >= COD_LIMIT
  const codDisabled = codStatus === 'unavailable' || codOverLimit || codStatus === 'checking'

  function isCodUnavailableMessage() {
    if (codOverLimit) return t('checkout.payment.codMaxAmount')
    if (codStatus === 'unavailable') return codMessage
    return ''
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 md:p-6">
      <h2 className="font-display font-semibold text-lg text-neutral-900 dark:text-white mb-1">
        {t('checkout.payment.title')}
      </h2>
      {codStatus === 'checking' && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-gray-400 mb-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t('checkout.payment.verifying')}
        </p>
      )}

      <div className="space-y-3 mt-4">
        {METHODS.map(method => {
          const isCod = method.id === 'COD'
          const disabled = isCod && codDisabled
          const unavailableMsg = isCod ? isCodUnavailableMessage() : ''

          return (
            <label
              key={method.id}
              className={`
                flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer
                transition-all duration-200
                ${disabled
                  ? 'border-neutral-100 dark:border-gray-700 bg-neutral-50 dark:bg-gray-700/50 opacity-60 cursor-not-allowed'
                  : paymentMethod === method.id
                    ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/30'
                    : 'border-neutral-200 dark:border-gray-600 hover:border-neutral-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                }
              `}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                disabled={disabled}
                onChange={() => !disabled && onChange(method.id)}
                className="mt-0.5 accent-[#2563EB]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {t(method.labelKey)}
                  </span>
                  {isCod && codStatus === 'available' && !codOverLimit && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5 ml-7">
                  {t(method.descKey)}
                </p>
                {unavailableMsg && (
                  <p className="flex items-center gap-1 text-xs text-amber-600 mt-1.5 ml-7">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {unavailableMsg}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
