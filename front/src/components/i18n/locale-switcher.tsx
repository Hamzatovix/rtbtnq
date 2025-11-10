'use client'

import { useLocaleStore } from '@/store/locale-store'
import { useClientLocale } from '@/hooks/useClientLocale'
import { localeConfigs } from '@/i18n/config'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LocaleSwitcher() {
  const locale = useClientLocale()
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl md:rounded-2xl border border-mistGray/30 bg-white/80 px-4 py-2 text-sm font-light uppercase tracking-wide text-inkSoft hover:bg-white transition-all duration-500 ease-out shadow-sm"
        >
          <Globe className="h-4 w-4 md:h-5 md:w-5" />
          <span suppressHydrationWarning>{locale.toUpperCase()}</span>
          <span className="sr-only">Switch language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" sideOffset={8} className="w-40">
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

