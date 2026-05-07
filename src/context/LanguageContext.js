'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import translations from '@/lib/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh')

  const LANG_CYCLE = ['zh', 'en', 'ja']

  useEffect(() => {
    const stored = localStorage.getItem('artisan-lang')
    if (LANG_CYCLE.includes(stored)) {
      setLang(stored)
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const idx = LANG_CYCLE.indexOf(prev)
      const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]
      localStorage.setItem('artisan-lang', next)
      return next
    })
  }, [])

  const t = useCallback((key) => translations[lang][key] || key, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
