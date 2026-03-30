import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { useProduct, useProducts } from '../hooks/useProducts'
import { usePixel } from '../hooks/usePixel'
import { categories } from '../config/categories'
import SEOHead from '../components/common/SEOHead'
import ProductImages from '../components/product/ProductImages'
import ProductDetail from '../components/product/ProductDetail'
import ProductGrid from '../components/category/ProductGrid'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function ProductPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { trackPageView, trackViewContent } = usePixel()
  const { product, loading, error, refetch } = useProduct(id)

  const category = product ? categories.find(c => c.id === product.category) : null
  const { products: related } = useProducts(
    product ? { category: product.category, limit: 4 } : {}
  )
  const relatedFiltered = related.filter(p => p.id !== id)

  useEffect(() => {
    trackPageView()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (product) trackViewContent(product)
  }, [product]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <ErrorMessage
          message={error || t('errors.serverError')}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.shortDescription}
        image={product.images?.[0]}
      />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-6">
          <Link to="/" className="hover:text-[#2563EB] transition-colors duration-200">
            {t('nav.home')}
          </Link>
          {category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link
                to={`/categoria/${category.slug}`}
                className="hover:text-[#2563EB] transition-colors duration-200"
              >
                {t(`categories.${category.id}`, { defaultValue: category.name })}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Galería + Detalle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductImages images={product.images} name={product.name} />
          <ProductDetail product={product} />
        </div>

        {/* Descripción y beneficios */}
        {(product.description || product.benefits?.length > 0) && (
          <div className="bg-white rounded-2xl p-6 mb-12 shadow-sm">
            {product.description && (
              <div className="mb-6">
                <h2 className="font-display font-semibold text-lg text-neutral-900 mb-3">
                  {t('product.description')}
                </h2>
                <p className="text-neutral-600 leading-relaxed">{product.description}</p>
              </div>
            )}
            {product.benefits?.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-lg text-neutral-900 mb-3">
                  {t('product.benefits')}
                </h2>
                <ul className="space-y-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-neutral-600">
                      <span className="text-[#2563EB] mt-0.5">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Productos relacionados */}
        {relatedFiltered.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-2xl text-neutral-900 mb-6">
              {t('product.relatedProducts')}
            </h2>
            <ProductGrid products={relatedFiltered} loading={false} />
          </div>
        )}
      </div>
    </>
  )
}
