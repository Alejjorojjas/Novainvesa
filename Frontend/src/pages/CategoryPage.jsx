import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { categories } from '../config/categories'
import { useProducts } from '../hooks/useProducts'
import { usePixel } from '../hooks/usePixel'
import SEOHead from '../components/common/SEOHead'
import CategoryBanner from '../components/category/CategoryBanner'
import ProductGrid from '../components/category/ProductGrid'

export default function CategoryPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const { trackPageView } = usePixel()

  const category = categories.find(c => c.slug === slug)
  const { products, loading, error, refetch } = useProducts({ category: slug, limit: 20 })

  useEffect(() => {
    trackPageView()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!category) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
        <p className="text-8xl font-bold text-neutral-100 mb-4">404</p>
        <h1 className="text-neutral-800 font-bold text-2xl mb-4">{t('notFound.title')}</h1>
        <Link to="/" className="inline-block bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200">
          {t('common.backToHome')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title={t(`categories.${category.id}`, { defaultValue: category.name })}
        description={category.description}
      />
      <CategoryBanner category={category} />
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-8 dark:bg-gray-900">
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onRetry={refetch}
        />
      </div>
    </>
  )
}
