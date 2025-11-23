import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold transition-fintage focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 uppercase tracking-wider",
  {
    variants: {
      variant: {
        // Default: использует --color-surface-alt согласно дизайн-системе
        default:
          "border-transparent bg-[hsl(var(--color-surface-alt))] dark:bg-[hsl(var(--color-surface-alt))] text-[hsl(var(--color-text-primary))] shadow-fintage-sm",
        // Accent: Electric Punch для New/Drop/Sale
        accent:
          "border-transparent bg-fintage-punch text-white shadow-fintage-sm",
        // Outline: с border для темной темы
        outline:
          "text-[hsl(var(--color-text-primary))] border-fintage-graphite/30 dark:border-[hsl(var(--color-border-subtle))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

