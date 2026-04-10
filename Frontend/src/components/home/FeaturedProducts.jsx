import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import ProductGrid from '../category/ProductGrid'

export default function FeaturedProducts() {
  const { t } = useTranslation()
  const { products, loading, error, refetch } = useProducts({ featured: true, limit: 8 })

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-semibold text-2xl text-neutral-900 dark:text-white">
          {t('home.featured')}
        </h2>
        <Link
          to="/categoria/mascotas"
          className="flex items-center gap-1 text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium transition-colors duration-200"
        >
          {t('home.viewAll')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </section>
  )
}
