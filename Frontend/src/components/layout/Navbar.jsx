import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react'
import { categories } from '../../config/categories'
import { useCart } from '../../hooks/useCart'
import LanguageSelector from './LanguageSelector'

export default function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { getItemCount } = useCart()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Enfocar input al abrir búsqueda mobile
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) return
    navigate(`/buscar?q=${encodeURIComponent(q)}`)
    setQuery('')
    setSearchOpen(false)
  }

  const cartCount = getItemCount()

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">

        {/* Fila principal */}
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="font-display font-bold text-xl text-[#2563EB] shrink-0">
            Novainvesa
          </Link>

          {/* Búsqueda desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
              />
            </div>
          </form>

          {/* Acciones */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Búsqueda mobile */}
            <button
              onClick={() => setSearchOpen(o => !o)}
              aria-label={t('nav.search')}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </button>

            <LanguageSelector />

            {/* Mi cuenta */}
            <Link
              to="/cuenta"
              aria-label={t('nav.myAccount')}
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Carrito */}
            <Link
              to="/carrito"
              aria-label={t('nav.cart')}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Hamburguesa */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menú"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Búsqueda mobile expandible */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
                />
              </div>
            </form>
          </div>
        )}

        {/* Categorías barra secondary — solo desktop */}
        <div className="hidden md:flex items-center gap-5 py-2 border-t border-neutral-100">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="text-sm text-neutral-600 hover:text-[#2563EB] font-medium transition-colors duration-200 whitespace-nowrap"
            >
              {cat.icon} {t(`categories.${cat.id}`, { defaultValue: cat.name })}
            </Link>
          ))}
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 shadow-lg">
          <div className="max-w-[1280px] mx-auto px-4 py-4 space-y-1">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2 pb-1">
              {t('footer.categories')}
            </p>
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:text-[#2563EB] transition-colors duration-200"
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium text-sm">
                  {t(`categories.${cat.id}`, { defaultValue: cat.name })}
                </span>
              </Link>
            ))}
            <div className="border-t border-neutral-100 pt-3">
              <Link
                to="/cuenta"
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span className="font-medium text-sm">{t('nav.myAccount')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
