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
          "flex h-11 w-full rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-background px-3 py-2 text-sm text-inkSoft dark:text-foreground placeholder:text-whisper dark:placeholder:text-muted-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-sageTint dark:focus:ring-ring focus:[--tw-ring-color:theme(colors.sageTint)] dark:focus:[--tw-ring-color:hsl(var(--ring))] focus:ring-offset-2 focus:border-sageTint dark:focus:border-ring appearance-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
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


