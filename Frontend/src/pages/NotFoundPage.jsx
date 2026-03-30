import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEOHead from '../components/common/SEOHead'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <>
      <SEOHead title="404 — Novainvesa" />
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-[10rem] font-bold text-neutral-200 leading-none select-none">404</p>
        <h1 className="text-2xl font-display font-bold text-neutral-800 -mt-4 mb-2">
          {t('notFound.title', 'Página no encontrada')}
        </h1>
        <p className="text-neutral-500 mb-8 max-w-md">
          {t('notFound.description', 'La página que buscas no existe o fue movida.')}
        </p>
        <Link
          to="/"
          className="inline-block bg-[#2563EB] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {t('notFound.cta', 'Volver al inicio')}
        </Link>
      </div>
    </>
  )
}
