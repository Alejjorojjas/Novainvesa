import { useLanguage } from '../../context/LanguageContext'

export default function LanguageSelector() {
  const { currentLang, supportedLangs, changeLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 border border-neutral-200 rounded-lg p-0.5">
      {supportedLangs.map(lang => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          aria-label={`Cambiar idioma a ${lang.toUpperCase()}`}
          className={`
            px-2 py-1 rounded text-xs font-semibold uppercase transition-colors duration-200
            ${currentLang === lang
              ? 'bg-[#2563EB] text-white'
              : 'text-neutral-500 hover:text-neutral-800'
            }
          `}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
