import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function CategoryBanner({ category }) {
  const { t } = useTranslation()

  return (
    <section
      className="relative overflow-hidden py-12 md:py-16"
      style={{ backgroundColor: category.color + '15' }}
    >
      {/* Círculo decorativo */}
      <div
        className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/4 translate-x-1/4 pointer-events-none"
        style={{ backgroundColor: category.color }}
      />

      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
          <Link to="/" className="hover:text-[#2563EB] transition-colors duration-200">
            {t('nav.home')}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium" style={{ color: category.color }}>
            {t(`categories.${category.id}`, { defaultValue: category.name })}
          </span>
        </nav>

        {/* Contenido */}
        <div className="flex items-center gap-5">
          <span
            className="text-5xl md:text-6xl w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color + '20' }}
          >
            {category.icon}
          </span>
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-neutral-900">
              {t(`categories.${category.id}`, { defaultValue: category.name })}
            </h1>
            {category.description && (
              <p className="text-neutral-500 mt-1 text-sm md:text-base">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
