import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        data-rb-input=""
        className={cn(
          "flex min-h-[100px] w-full rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/60 bg-fintage-offwhite dark:bg-fintage-graphite/30 px-3 py-2 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/50 ring-offset-background outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.35)] hover:border-fintage-graphite/40 dark:hover:border-fintage-graphite/70 appearance-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-fintage-graphite/5 dark:disabled:bg-fintage-graphite/15 disabled:border-fintage-graphite/20 dark:disabled:border-fintage-graphite/30 transition-fintage",
          // Error state
          "aria-invalid:border-fintage-punch/50 dark:aria-invalid:border-fintage-punch/60 aria-invalid:focus:ring-fintage-punch/30 dark:aria-invalid:focus:ring-fintage-punch/40 aria-invalid:focus:border-fintage-punch/60 dark:aria-invalid:focus:border-fintage-punch/70",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }


