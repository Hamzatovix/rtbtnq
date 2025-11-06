'use client'

import { useLocaleStore } from '@/store/locale-store'
import { localeConfigs } from '@/i18n/config'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-xl md:rounded-2xl h-10 w-10 md:h-11 md:w-11 border border-mistGray/30 bg-transparent hover:bg-sageTint/5 transition-all duration-500 ease-out">
          <Globe className="h-4 w-4 md:h-5 md:w-5" />
          <span className="sr-only">Switch language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.values(localeConfigs).map((config) => (
          <DropdownMenuItem
            key={config.locale}
            onClick={() => setLocale(config.locale)}
            className={locale === config.locale ? 'bg-sageTint/10' : ''}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.flag}</span>
              <span className="text-sm font-light">{config.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

