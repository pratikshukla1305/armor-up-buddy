
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

interface SecurityCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  severity?: "low" | "medium" | "high";
  className?: string;
}

export function SecurityCard({ 
  title, 
  description, 
  icon = <ShieldAlert className="w-5 h-5" />, 
  severity = "medium",
  className 
}: SecurityCardProps) {
  const severityStyles = {
    low: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
    medium: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20",
    high: "border-l-shield-red bg-red-50 dark:bg-red-950/20",
  };

  return (
    <div className={cn(
      "p-4 border-l-4 rounded-md shadow-sm",
      severityStyles[severity],
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="mt-0.5">
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
