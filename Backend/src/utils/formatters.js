// Formatea un precio en COP según el idioma (RN-041)
// Siempre sin decimales (RN-008)

const FORMAT_BY_LOCALE = {
  es: { prefix: '$', separator: '.', suffix: '' },      // $89.900
  en: { prefix: 'COP ', separator: ',', suffix: '' },   // COP 89,900
  pt: { prefix: 'R$ ', separator: '.', suffix: '' },    // R$ 89.900  (nota: no es BRL real)
}

function formatPrice(amount, locale = 'es') {
  const config = FORMAT_BY_LOCALE[locale] || FORMAT_BY_LOCALE.es
  const rounded = Math.round(Number(amount))

  // Separador de miles según locale
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, config.separator)

  return `${config.prefix}${formatted}${config.suffix}`
}

// Convierte pesos COP a centavos (usado por Wompi que recibe amount_in_cents)
function toCents(amountCOP) {
  return Math.round(Number(amountCOP) * 100)
}

// Convierte centavos de Wompi a pesos COP
function fromCents(cents) {
  return Math.round(Number(cents) / 100)
}

module.exports = { formatPrice, toCents, fromCents }
