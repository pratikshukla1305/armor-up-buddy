
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:transform hover:translate-y-[-2px]",
  {
    variants: {
      variant: {
        default: "bg-stripe-blue text-white hover:bg-stripe-blue-dark shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline:
          "border border-stripe-border bg-white text-stripe-slate hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-stripe-gray text-stripe-slate hover:bg-stripe-gray/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-stripe-blue underline-offset-4 hover:underline",
        stripe: "bg-stripe-blue text-white hover:bg-stripe-blue-dark shadow-md",
        "stripe-outline": "border border-stripe-border bg-white text-stripe-slate hover:bg-stripe-border/50",
        "stripe-secondary": "bg-stripe-gray text-stripe-slate hover:bg-stripe-border/50",
        "stripe-success": "bg-stripe-green text-white hover:bg-stripe-green-light shadow-md",
        "stripe-dark": "bg-stripe-blue-dark text-white hover:bg-stripe-slate shadow-md",
        "stripe-gradient": "bg-stripe-gradient text-white hover:shadow-lg shadow-md",
        "stripe-blue": "bg-stripe-blue text-white hover:bg-blue-600 shadow-md",
        "stripe-cyan": "bg-stripe-cyan text-stripe-slate-dark hover:bg-opacity-90 shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        "stripe-md": "h-11 px-6 py-2.5 rounded-md",
        "stripe-lg": "h-12 px-8 py-3 rounded-md text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  to?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, to, ...props }, ref) => {
    // If we have a "to" prop, render it as a Link
    if (to) {
      return (
        <Link 
          to={to}
          className={cn(buttonVariants({ variant, size, className }))}
        >
          {props.children}
        </Link>
      )
    }
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
