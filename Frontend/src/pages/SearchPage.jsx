import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEOHead from '../components/common/SEOHead'
import ProductGrid from '../components/category/ProductGrid'
import { useProductSearch } from '../hooks/useProducts'
import { trackSearch } from '../utils/pixel'
import { categories as CATEGORIES } from '../config/categories'

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)

  const { results, total, loading, error } = useProductSearch(query)

  const pageTitle = query
    ? query + ' — Buscar | Novainvesa'
    : 'Buscar productos — Novainvesa'

  useEffect(() => {
    if (query) trackSearch({ query })
  }, [query])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) setSearchParams({ q: trimmed })
  }

  return (
    <>
      <SEOHead
        title={pageTitle}
        description="Encuentra los mejores productos en Novainvesa."
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('search.placeholder', 'Buscar productos...')}
            className="flex-1 border border-neutral-300 rounded-lg px-4 py-3 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('search.button', 'Buscar')}
          </button>
        </form>

        {query ? (
          <>
            {!loading && !error && (
              <p className="text-neutral-500 text-sm mb-6">
                {total > 0
                  ? t('search.results', { count: total, query })
                  : t('search.noResults', { query })}
              </p>
            )}

            <ProductGrid products={results} loading={loading} error={error} />

            {!loading && !error && total === 0 && (
              <div className="mt-10 text-center">
                <p className="text-neutral-600 mb-6 font-medium">
                  {t('search.browseSuggestion', 'Explora nuestras categorías:')}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={'/categoria/' + cat.slug}
                      className="border border-neutral-300 text-neutral-700 px-5 py-2 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                    >
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-neutral-700 mb-2">
              {t('search.emptyTitle', '¿Qué estás buscando?')}
            </h2>
            <p className="text-neutral-500 mb-8">
              {t('search.emptyDesc', 'Escribe el nombre de un producto para encontrarlo.')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={'/categoria/' + cat.slug}
                  className="border border-neutral-300 text-neutral-700 px-5 py-2 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
