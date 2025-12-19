import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm",
        // Shimmer эффект согласно дизайн-системе
        // Используем токены --color-surface-alt вместо hardcoded цветов
        "bg-surface-alt",
        "bg-gradient-to-r from-surface-alt via-[hsl(var(--color-surface-alt)/0.85)] to-surface-alt",
        "dark:via-[hsl(var(--color-surface-alt)/1.1)]",
        "bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

