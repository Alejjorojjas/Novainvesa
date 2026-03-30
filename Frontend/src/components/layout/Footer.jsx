import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, Instagram, Facebook } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { categories } from '../../config/categories'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-400 pt-12 pb-6">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">

          {/* Marca */}
          <div>
            <span className="font-display font-bold text-xl text-white block mb-3">
              {siteConfig.name}
            </span>
            <p className="text-sm leading-relaxed mb-4">{siteConfig.tagline}</p>
            <div className="flex items-center gap-3">
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer"
                 aria-label="Instagram" className="hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer"
                 aria-label="Facebook" className="hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.categories')}
            </h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/categoria/${cat.slug}`}
                    className="text-sm hover:text-white transition-colors duration-200">
                    {cat.icon} {t(`categories.${cat.id}`, { defaultValue: cat.name })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.policies')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/politica-privacidad" className="text-sm hover:text-white transition-colors duration-200">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-sm hover:text-white transition-colors duration-200">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/devoluciones" className="text-sm hover:text-white transition-colors duration-200">
                  {t('footer.returns')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${siteConfig.contact.email}`}
                   className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-200">
                  <Mail className="w-4 h-4 shrink-0" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.contact.phone}`}
                   className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-200">
                  <Phone className="w-4 h-4 shrink-0" />
                  {siteConfig.contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs mt-6">
          {t('footer.rights', { year })}
        </p>
      </div>
    </footer>
  )
}
