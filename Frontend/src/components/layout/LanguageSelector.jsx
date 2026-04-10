import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSelector() {
  const { currentLang, supportedLangs, changeLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 border border-neutral-200 dark:border-gray-600 rounded-lg p-0.5">
      {supportedLangs.map(lang => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          aria-label={`Cambiar idioma a ${lang.toUpperCase()}`}
          className={`
            px-2 py-1 rounded text-xs font-semibold uppercase transition-colors duration-200
            ${currentLang === lang
              ? 'bg-[#2563EB] text-white dark:text-white'
              : 'text-neutral-600 dark:text-gray-400 border border-neutral-200 dark:border-gray-600 hover:text-neutral-800 dark:hover:text-gray-200'
            }
          `}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
