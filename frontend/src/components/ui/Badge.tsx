import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantClasses = ""
  
  if (variant === "default") variantClasses = "border-transparent bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
  else if (variant === "secondary") variantClasses = "border-transparent bg-[var(--color-bg-card)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]"
  else if (variant === "destructive") variantClasses = "border-transparent bg-[var(--color-danger)]/20 text-[var(--color-danger)]"
  else if (variant === "success") variantClasses = "border-transparent bg-[var(--color-success)]/20 text-[var(--color-success)]"
  else if (variant === "warning") variantClasses = "border-transparent bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
  else if (variant === "info") variantClasses = "border-transparent bg-[var(--color-info)]/20 text-[var(--color-info)]"
  else if (variant === "outline") variantClasses = "text-[var(--color-text-main)] border-[var(--color-border)]"

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2",
        variantClasses,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
