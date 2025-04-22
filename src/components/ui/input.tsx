
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-stripe-border bg-white px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-stripe-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stripe-blue focus-visible:ring-offset-0 focus-visible:border-stripe-blue disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm shadow-sm hover:shadow-md",
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
