'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'compact' | 'default' | 'large'
  showText?: boolean
  className?: string
  href?: string
  onClick?: () => void
  'aria-label'?: string
}

const sizeMap = {
  compact: 'h-9 md:h-11',
  default: 'h-14 md:h-16 lg:h-18',
  large: 'h-16 md:h-18 lg:h-20',
}

export function Logo({ 
  variant = 'default', 
  showText = false,
  className,
  href = '/',
  onClick,
  'aria-label': ariaLabel = 'ROSEBOTANIQUE - на главную'
}: LogoProps) {
  const logoContent = (
    <>
      {/* Логотип - использует CSS фильтры для адаптации к темной теме */}
      <Image
        src="/logo/logo_day.svg"
        alt=""
        width={120}
        height={48}
        className={cn(
          sizeMap[variant],
          'w-auto transition-all duration-300 group-hover:opacity-80 group-hover:scale-105',
          // Инверсия цвета для темной темы: черный -> светлый (Off-White)
          'dark:brightness-0 dark:invert dark:opacity-90'
        )}
        priority
      />
      {/* Текстовое название (показывается если showText=true) */}
      {showText && (
        <span className="font-mono text-sm md:text-base lg:text-xl font-medium text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-accent transition-colors duration-300 tracking-[0.15em] uppercase">
          ROSEBOTANIQUE&nbsp;<span className="text-[0.65em] tracking-[0.1em]">STORE</span>
        </span>
      )}
    </>
  )

  const baseClasses = cn(
    'flex items-center gap-2 md:gap-4 group flex-shrink-0',
    onClick && 'cursor-pointer',
    className
  )

  // Если есть onClick, используем button (для мобильного меню)
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          baseClasses,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'
        )}
      >
        {logoContent}
      </button>
    )
  }

  // Иначе используем Link (для desktop)
  return (
    <Link 
      href={href} 
      aria-label={ariaLabel}
      className={baseClasses}
    >
      {logoContent}
    </Link>
  )
}

