'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none uppercase tracking-wider text-sm',
  {
    variants: {
      variant: {
        // Primary: Light - bg Charcoal Black, text Off-White; Dark - bg Off-White, text Charcoal Black
        primary: 'bg-fintage-charcoal dark:bg-fintage-offwhite text-fintage-offwhite dark:!text-fintage-charcoal border border-fintage-charcoal dark:border-fintage-offwhite hover:brightness-90 dark:hover:bg-[hsl(var(--fintage-offwhite)/0.95)] dark:hover:!text-fintage-charcoal active:brightness-85 dark:active:bg-[hsl(var(--fintage-offwhite)/0.90)] dark:active:!text-fintage-charcoal shadow-fintage-sm',
        // Secondary: transparent с border, hover использует greige акцент
        secondary: 'bg-transparent border border-fintage-graphite/30 dark:border-fintage-graphite/50 text-foreground hover:bg-hover-bg dark:hover:bg-hover-bg hover:border-hover-border dark:hover:border-hover-border active:bg-active-bg dark:active:bg-active-bg active:border-active-border dark:active:border-active-border',
        // Accent: Greige фон с новым акцентом #C3B39C
        accent: 'bg-accent text-accent-foreground border border-accent hover:brightness-110 active:brightness-105 shadow-fintage-sm',
        ghost: 'text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg active:bg-active-bg dark:active:bg-active-bg border border-transparent',
        outline: 'text-fintage-charcoal dark:text-fintage-offwhite border border-fintage-charcoal dark:border-accent bg-transparent hover:bg-fintage-charcoal hover:text-fintage-offwhite dark:hover:bg-accent/20 dark:hover:text-fintage-offwhite active:bg-fintage-graphite dark:active:bg-accent/30',
      },
      size: {
        sm: 'h-9 px-4 rounded-sm text-xs',
        md: 'h-10 px-6 rounded-sm text-xs',
        lg: 'h-12 px-8 rounded-sm text-sm',
        icon: 'h-10 w-10 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


