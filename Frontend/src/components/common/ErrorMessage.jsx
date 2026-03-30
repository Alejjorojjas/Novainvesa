import { AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ErrorMessage({ message, onRetry, className = '' }) {
  const { t } = useTranslation()

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
      <p className="text-neutral-700 font-medium mb-1">{t('common.error')}</p>
      {message && (
        <p className="text-neutral-500 text-sm mb-4 max-w-xs">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}
