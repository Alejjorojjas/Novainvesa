import { useTranslation } from 'react-i18next'
import { ShoppingCart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'

export default function ProductGrid({ products, loading, error, onRetry, emptyQuery }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} className="py-12" />
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        {emptyQuery ? (
          <>
            <Search className="w-16 h-16 text-neutral-300 mb-4" />
            <h3 className="text-neutral-700 font-semibold text-xl mb-2">
              {t('search.noResults', { query: emptyQuery })}
            </h3>
            <p className="text-neutral-500 mb-6 max-w-sm">
              {t('search.noResultsDesc')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
            >
              {t('search.viewCategories')}
            </Link>
          </>
        ) : (
          <>
            <ShoppingCart className="w-16 h-16 text-neutral-300 mb-4" />
            <h3 className="text-neutral-700 font-semibold text-xl mb-2">
              {t('common.loading')}
            </h3>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
