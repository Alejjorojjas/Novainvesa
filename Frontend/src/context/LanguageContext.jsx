import { createContext, useContext, useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'

import esTranslation from '../locales/es/translation.json'
import enTranslation from '../locales/en/translation.json'
import ptTranslation from '../locales/pt/translation.json'

const STORAGE_KEY = 'novainvesa_lang'
const SUPPORTED_LANGS = ['es', 'en', 'pt']
const DEFAULT_LANG = 'es'

// Inicializar i18next una sola vez
if (!i18n.isInitialized) {
  const savedLang = localStorage.getItem(STORAGE_KEY)
  const initialLang = SUPPORTED_LANGS.includes(savedLang) ? savedLang : DEFAULT_LANG

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: esTranslation },
        en: { translation: enTranslation },
        pt: { translation: ptTranslation },
      },
      lng: initialLang,
      fallbackLng: DEFAULT_LANG,
      interpolation: {
        escapeValue: false, // React escapa por defecto
      },
    })
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { i18n: i18nInstance } = useTranslation()

  // Persistir el idioma en localStorage cuando cambie
  useEffect(() => {
    const handleLangChange = (lang) => {
      localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.lang = lang
    }

    i18nInstance.on('languageChanged', handleLangChange)
    // Setear el atributo lang inicial
    document.documentElement.lang = i18nInstance.language

    return () => {
      i18nInstance.off('languageChanged', handleLangChange)
    }
  }, [i18nInstance])

  function changeLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return
    i18nInstance.changeLanguage(lang)
  }

  return (
    <LanguageContext.Provider
      value={{
        currentLang: i18nInstance.language,
        supportedLangs: SUPPORTED_LANGS,
        changeLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage debe usarse dentro de <LanguageProvider>')
  return ctx
}
