'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  let language = 'de'
  let setLanguage = (lang: string) => {}
  
  try {
    const lang = useLanguage()
    language = lang.language
    setLanguage = lang.setLanguage
  } catch {
    // Context not available, component won't work but won't crash
    return null
  }

  const toggleLanguage = () => {
    const newLang = language === 'de' ? 'en' : 'de'
    setLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition w-full"
      title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
    >
      <Languages size={18} />
      <span className="font-medium">{language === 'de' ? 'DE' : 'EN'}</span>
    </button>
  )
}
