
import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShieldIconProps extends React.ComponentProps<typeof Shield> {
  status?: "active" | "inactive" | "warning" | "danger";
  animation?: "pulse" | "activate" | "none";
  size?: number;
}

export function ShieldIcon({ 
  status = "inactive", 
  animation = "none", 
  size = 64,
  className,
  ...props 
}: ShieldIconProps) {
  const statusColors = {
    active: "text-shield-green fill-shield-green/20",
    inactive: "text-shield-gray fill-shield-gray/20",
    warning: "text-amber-500 fill-amber-500/20",
    danger: "text-shield-red fill-shield-red/20",
  };

  const animationClasses = {
    pulse: "animate-shield-pulse",
    activate: "animate-shield-activate",
    none: "",
  };

  return (
    <Shield 
      size={size} 
      className={cn(
        statusColors[status],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  );
}
