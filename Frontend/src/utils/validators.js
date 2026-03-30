// Validaciones del formulario de checkout según RN-014

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Valida todos los campos del checkout.
// Retorna un objeto { fieldName: 'clave-i18n' } — vacío si todo es válido.
export function validateCheckoutForm(formData) {
  const errors = {}

  // Nombre completo: mínimo 3 caracteres
  if (!formData.fullName || formData.fullName.trim().length < 3) {
    errors.fullName = 'errors.nameTooShort'
  }

  // Email: formato válido
  if (!formData.email || !EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = 'errors.emailInvalid'
  }

  // Teléfono: mínimo 10 dígitos
  const digits = (formData.phone || '').replace(/\D/g, '')
  if (digits.length < 10) {
    errors.phone = 'errors.phoneTooShort'
  }

  // Ciudad: requerida
  if (!formData.city || !formData.city.trim()) {
    errors.city = 'errors.required'
  }

  // Dirección: mínimo 10 caracteres
  if (!formData.address || formData.address.trim().length < 10) {
    errors.address = 'errors.addressTooShort'
  }

  // Método de pago: requerido
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'errors.paymentRequired'
  }

  // COD: si el método es COD, la cobertura debe estar verificada
  if (formData.paymentMethod === 'COD' && !formData.codCoverageVerified) {
    errors.paymentMethod = 'errors.codCoverage'
  }

  return errors
}

// Retorna true si el formulario no tiene errores
export function isFormValid(errors) {
  return Object.keys(errors).length === 0
}

// Validación individual de campo (para feedback en tiempo real)
export function validateField(name, value, formData = {}) {
  switch (name) {
    case 'fullName':
      return value.trim().length >= 3 ? null : 'errors.nameTooShort'
    case 'email':
      return EMAIL_REGEX.test(value.trim()) ? null : 'errors.emailInvalid'
    case 'phone':
      return value.replace(/\D/g, '').length >= 10 ? null : 'errors.phoneTooShort'
    case 'city':
      return value.trim() ? null : 'errors.required'
    case 'address':
      return value.trim().length >= 10 ? null : 'errors.addressTooShort'
    case 'paymentMethod':
      if (!value) return 'errors.paymentRequired'
      if (value === 'COD' && !formData.codCoverageVerified) return 'errors.codCoverage'
      return null
    default:
      return null
  }
}
