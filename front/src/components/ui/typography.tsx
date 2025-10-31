import * as React from 'react'
import { cn } from '@/lib/utils'

const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-display-1 font-light text-ink-soft leading-[0.95] tracking-normal',
      className
    )}
    {...props}
  />
))
H1.displayName = 'H1'

const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { size?: 'section' | 'display' }
>(({ className, size = 'section', ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      size === 'display' ? 'text-display-2 font-light text-ink-soft leading-tight tracking-wide' : 'text-title-1 font-light text-ink-soft leading-tight tracking-wide',
      className
    )}
    {...props}
  />
))
H2.displayName = 'H2'

const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-title-1 font-light text-ink-soft leading-tight tracking-wide',
      className
    )}
    {...props}
  />
))
H3.displayName = 'H3'

const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-body-lg font-light text-ink-soft/80 leading-relaxed tracking-wide',
      className
    )}
    {...props}
  />
))
Lead.displayName = 'Lead'

const Body = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-body font-light text-ink-soft leading-relaxed',
      className
    )}
    {...props}
  />
))
Body.displayName = 'Body'

const Small = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-small font-light text-ink-soft/70 leading-relaxed',
      className
    )}
    {...props}
  />
))
Small.displayName = 'Small'

export { H1, H2, H3, Lead, Body, Small }
