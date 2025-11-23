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
          "flex min-h-[100px] w-full rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50 bg-fintage-offwhite dark:bg-fintage-charcoal px-3 py-2 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite dark:placeholder:text-fintage-graphite/60 ring-offset-background outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.25)] appearance-none disabled:cursor-not-allowed disabled:opacity-50 transition-fintage",
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


