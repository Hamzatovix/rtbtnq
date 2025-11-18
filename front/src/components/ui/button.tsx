'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap font-light ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-ring focus-visible:ring-offset-2 transition-[transform,background-color] duration-250 ease-brand disabled:opacity-50 disabled:pointer-events-none active:scale-95',
  {
    variants: {
      variant: {
        primary: 'text-primary-foreground dark:text-primary-foreground border border-mistGray/60 dark:border-border bg-primary dark:bg-primary hover:bg-[hsl(160_12%_50%)] dark:hover:bg-[hsl(35_18%_67%)] active:bg-[hsl(160_12%_48%)] dark:active:bg-[hsl(35_18%_60%)]',
        ghost: 'text-ink-soft dark:text-foreground hover:bg-mistGray/20 dark:hover:bg-muted/30 active:bg-mistGray/30 dark:active:bg-muted/40',
        outline: 'text-ink-soft dark:text-foreground border border-mistGray/60 dark:border-border bg-transparent hover:bg-mistGray/10 dark:hover:bg-muted/20 active:bg-mistGray/20 dark:active:bg-muted/30',
      },
      size: {
        sm: 'h-9 px-3 rounded-full text-subtle',
        md: 'h-10 px-4 rounded-full text-subtle',
        lg: 'h-11 px-6 rounded-full text-subtle tracking-wide',
        icon: 'h-11 w-11 rounded-full',
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


