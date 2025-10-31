'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 transition-[transform,background-color] duration-250 ease-brand disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'text-ink-soft border border-mistGray/60 bg-sageTint hover:bg-mistGray/20',
        ghost: 'text-ink-soft hover:bg-mistGray/20',
        outline: 'text-ink-soft border border-mistGray/60 bg-transparent hover:bg-mistGray/10',
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


