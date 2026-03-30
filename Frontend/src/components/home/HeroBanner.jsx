import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'

export default function HeroBanner() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6]">
      {/* Círculos decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 text-center">
        {/* Badge */}
        <span className="inline-block bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          🚚 {t('home.hero.badge')}
        </span>

        {/* Título */}
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-3 leading-tight">
          {t('home.hero.title')}
        </h1>
        <p className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white/80 mb-8">
          {t('home.hero.subtitle')}
        </p>

        {/* CTA */}
        <Link
          to="/categoria/mascotas"
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105"
        >
          {t('home.hero.cta')}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
