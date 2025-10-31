'use client'

import { usePathname } from 'next/navigation'

export function HideOnBackoffice({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isBackoffice = pathname?.startsWith('/backoffice')
  if (isBackoffice) return null
  return <>{children}</>
}


