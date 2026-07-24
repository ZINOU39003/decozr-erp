import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Using string interpolation for classes to avoid complex variants setup for now
    let variantClasses = ""
    if (variant === "default") variantClasses = "bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
    else if (variant === "destructive") variantClasses = "bg-[var(--color-danger)] text-white hover:bg-red-600"
    else if (variant === "outline") variantClasses = "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)]"
    else if (variant === "secondary") variantClasses = "bg-[var(--color-bg-card)] text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]"
    else if (variant === "ghost") variantClasses = "hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)]"
    else if (variant === "link") variantClasses = "text-[var(--color-primary-500)] underline-offset-4 hover:underline"

    let sizeClasses = ""
    if (size === "default") sizeClasses = "h-10 px-4 py-2"
    else if (size === "sm") sizeClasses = "h-9 rounded-md px-3 text-xs"
    else if (size === "lg") sizeClasses = "h-11 rounded-md px-8"
    else if (size === "icon") sizeClasses = "h-10 w-10"

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary-500)] disabled:pointer-events-none disabled:opacity-50",
          variantClasses,
          sizeClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
