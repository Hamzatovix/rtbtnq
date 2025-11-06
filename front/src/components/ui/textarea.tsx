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
          "flex min-h-[100px] w-full rounded-2xl border border-mistGray/30 bg-white px-3 py-2 text-sm text-inkSoft placeholder:text-whisper ring-offset-background outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-sageTint focus:[--tw-ring-color:theme(colors.sageTint)] focus:ring-offset-2 focus:border-sageTint appearance-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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


