import Link, { LinkProps } from 'next/link'
import { cn } from '@/lib/utils'
import * as React from 'react'

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  underline?: 'hover' | 'always' | 'none'
}

export function InlineLink({ className, underline = 'hover', ...props }: Props) {
  return (
    <Link
      {...props}
      className={cn(
        'text-fintage-charcoal dark:text-fintage-offwhite underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:focus-visible:ring-focus-ring focus-visible:ring-offset-2 hover:text-accent dark:hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        underline === 'hover' && 'hover:underline',
        underline === 'always' && 'underline',
        underline === 'none' && 'no-underline',
        className
      )}
    />
  )
}

