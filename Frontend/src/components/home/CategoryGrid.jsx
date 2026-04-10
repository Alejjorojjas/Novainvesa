import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categories } from '../../config/categories'

export default function CategoryGrid() {
  const { t } = useTranslation()

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-12">
      <h2 className="font-display font-semibold text-2xl text-neutral-900 dark:text-white mb-6">
        {t('home.categories')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/categoria/${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-transparent hover:border-neutral-200 dark:hover:border-gray-600 transition-all duration-200"
          >
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: cat.color + '20' }}
            >
              {cat.icon}
            </span>
            <span
              className="text-sm font-semibold text-center leading-tight"
              style={{ color: cat.color }}
            >
              {t(`categories.${cat.id}`, { defaultValue: cat.name })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
