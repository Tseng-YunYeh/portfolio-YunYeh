import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import en from '../i18n/en.json'
import fr from '../i18n/fr.json'
import es from '../i18n/es.json'
import zh from '../i18n/zh.json'

const allTranslations = { en, fr, es, zh }
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const switchLanguage = useCallback((newLang) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }, [])

  const i18n = useMemo(() => allTranslations[lang], [lang])

  // Localize an object like { en: "...", fr: "..." }
  const tObj = useCallback(
    (obj) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      return obj[lang] || obj.en || ''
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, i18n, tObj }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
