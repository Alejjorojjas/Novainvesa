import { useTranslation } from 'react-i18next'
import { validateField } from '../../utils/validators'

const FIELDS = [
  { name: 'fullName',    label: 'checkout.form.fullName',    type: 'text',  required: true,  col: 2 },
  { name: 'idNumber',    label: 'checkout.form.idNumber',    type: 'text',  required: false, col: 1 },
  { name: 'email',       label: 'checkout.form.email',       type: 'email', required: true,  col: 1 },
  { name: 'phone',       label: 'checkout.form.phone',       type: 'tel',   required: true,  col: 1 },
  { name: 'department',  label: 'checkout.form.department',  type: 'text',  required: true,  col: 1 },
  { name: 'city',        label: 'checkout.form.city',        type: 'text',  required: true,  col: 1 },
  { name: 'address',     label: 'checkout.form.address',     type: 'text',  required: true,  col: 2 },
  { name: 'neighborhood',label: 'checkout.form.neighborhood',type: 'text',  required: false, col: 1 },
]

export default function CheckoutForm({ formData, errors, onChange, onBlur }) {
  const { t } = useTranslation()

  function handleChange(name, value) {
    onChange(name, value)
  }

  function handleBlur(name) {
    onBlur(name)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
      <h2 className="font-display font-semibold text-lg text-neutral-900 mb-5">
        {t('checkout.steps.data')}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(field => (
          <div
            key={field.name}
            className={field.col === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'}
          >
            <label
              htmlFor={`field-${field.name}`}
              className="block text-sm font-medium text-neutral-700 mb-1"
            >
              {t(field.label)}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              id={`field-${field.name}`}
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={e => handleChange(field.name, e.target.value)}
              onBlur={() => handleBlur(field.name)}
              autoComplete={field.name}
              className={`
                w-full px-4 py-2.5 rounded-xl border text-sm text-neutral-900
                placeholder-neutral-400 transition-all duration-200
                focus:outline-none focus:ring-2 focus:border-transparent
                ${errors[field.name]
                  ? 'border-red-400 bg-red-50 focus:ring-red-300'
                  : 'border-neutral-200 bg-white focus:ring-[#2563EB]'
                }
              `}
            />
            {errors[field.name] && (
              <p className="mt-1 text-xs text-red-500">
                {t(errors[field.name])}
              </p>
            )}
          </div>
        ))}

        {/* Notas — textarea */}
        <div className="col-span-2">
          <label htmlFor="field-notes" className="block text-sm font-medium text-neutral-700 mb-1">
            {t('checkout.form.notes')}
          </label>
          <textarea
            id="field-notes"
            name="notes"
            rows={2}
            value={formData.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder={t('checkout.form.notesPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
