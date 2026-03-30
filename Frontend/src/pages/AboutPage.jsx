import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'

const VALUES = [
  { icon: '🤝', key: 'trust', title: 'Confianza', desc: 'Productos verificados y pagos seguros en cada compra.' },
  { icon: '🚀', key: 'delivery', title: 'Entrega rápida', desc: 'Despacho en 24 h y cobertura en todo el país.' },
  { icon: '💬', key: 'support', title: 'Soporte real', desc: 'Equipo disponible por WhatsApp para resolver cualquier duda.' },
  { icon: '♻️', key: 'returns', title: 'Devoluciones fáciles', desc: 'Política clara de cambios y garantía en todos los productos.' },
]

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <>
      <SEOHead
        title="Sobre Nosotros — Novainvesa"
        description="Conoce a Novainvesa, tu tienda de dropshipping de confianza en Colombia. Productos de calidad, entregas rápidas y atención personalizada."
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2563EB] to-blue-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-display font-bold mb-4">
            {t('about.title', 'Sobre Novainvesa')}
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            {t('about.subtitle', 'Somos una tienda colombiana comprometida con llevar los mejores productos directamente a tu puerta, con precios justos y atención de primera.')}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-800 mb-4">
              {t('about.story.title', 'Nuestra historia')}
            </h2>
            <p className="text-neutral-600 mb-4 leading-relaxed">
              {t('about.story.p1', 'Novainvesa nació con una misión clara: hacer que comprar en línea en Colombia sea fácil, confiable y accesible para todos. Trabajamos con proveedores verificados para ofrecerte productos de calidad en categorías como mascotas, hogar, tecnología, belleza y fitness.')}
            </p>
            <p className="text-neutral-600 leading-relaxed">
              {t('about.story.p2', 'Gracias a nuestra red logística y al sistema de pago contra entrega, puedes comprar sin arriesgar tu dinero. Recibe primero, paga después — así de simple.')}
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">🛍️</div>
            <p className="text-3xl font-bold text-[#2563EB] mb-1">+10.000</p>
            <p className="text-neutral-600 text-sm">pedidos entregados</p>
            <div className="border-t border-blue-100 my-4" />
            <p className="text-3xl font-bold text-[#2563EB] mb-1">+500</p>
            <p className="text-neutral-600 text-sm">ciudades con cobertura</p>
            <div className="border-t border-blue-100 my-4" />
            <p className="text-3xl font-bold text-[#2563EB] mb-1">4.8 ⭐</p>
            <p className="text-neutral-600 text-sm">calificación promedio</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-neutral-100 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-neutral-800 text-center mb-10">
            {t('about.values.title', 'Nuestros valores')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.key} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-neutral-800 mb-2">{v.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 text-center">
        <h2 className="text-2xl font-display font-bold text-neutral-800 mb-4">
          {t('about.cta.title', '¿Tienes alguna pregunta?')}
        </h2>
        <p className="text-neutral-500 mb-6">
          {t('about.cta.desc', 'Nuestro equipo está listo para ayudarte por WhatsApp.')}
        </p>
        <a
          href="https://wa.me/573001234567"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors mr-4"
        >
          Escribir por WhatsApp
        </a>
        <Link
          to="/"
          className="inline-block border border-[#2563EB] text-[#2563EB] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Ver productos
        </Link>
      </section>
    </>
  )
}
