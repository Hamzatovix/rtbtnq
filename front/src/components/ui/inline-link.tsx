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
        'text-ink-soft underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2',
        underline === 'hover' && 'hover:underline',
        underline === 'always' && 'underline',
        underline === 'none' && 'no-underline',
        className
      )}
    />
  )
}

