import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-rb-input=""
        className={cn(
          "flex h-11 w-full rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50 bg-fintage-offwhite dark:bg-fintage-charcoal px-3 py-2 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/60 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.25)] appearance-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-fintage-graphite/5 dark:disabled:bg-fintage-graphite/10 transition-fintage",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }


