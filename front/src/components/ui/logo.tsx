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
  compact: 'h-6 md:h-8',
  default: 'h-10 max-[390px]:h-8 md:h-11 lg:h-12',
  large: 'h-11 md:h-12 lg:h-14',
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
      <Image
        src="/logo/logo_day.png"
        alt=""
        width={416}
        height={432}
        className={cn(
          sizeMap[variant],
          'w-auto transition-all duration-300 group-hover:opacity-80'
        )}
        priority
      />
      {/* Текстовое название (показывается если showText=true) */}
      {showText && (
        <span className="font-mono text-sm max-[390px]:text-xs md:text-base lg:text-xl font-medium text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-accent transition-colors duration-300 tracking-[0.15em] uppercase">
          ROSEBOTANIQUE&nbsp;<span className="text-[0.65em] tracking-[0.1em]">STORE</span>
        </span>
      )}
    </>
  )

  const baseClasses = cn(
    'flex items-center gap-1.5 max-[370px]:gap-1 max-[390px]:gap-1.5 md:gap-4 group flex-shrink-0',
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

