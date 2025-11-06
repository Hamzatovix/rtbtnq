import { useMemo } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import enMessages from '@/messages/en.json'
import ruMessages from '@/messages/ru.json'

const messages = { en: enMessages, ru: ruMessages }

export function useTranslations() {
  const { locale } = useLocaleStore()
  
  const t = useMemo(() => {
    return (path: string) => {
      const keys = path.split('.')
      let value: any = messages[locale]
      for (const key of keys) {
        value = value?.[key]
      }
      return value || path
    }
  }, [locale])
  
  return t
}







