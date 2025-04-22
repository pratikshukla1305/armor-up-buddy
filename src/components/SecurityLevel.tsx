
import { cn } from "@/lib/utils";

interface SecurityLevelProps {
  level: number;
  className?: string;
}

export function SecurityLevel({ level, className }: SecurityLevelProps) {
  // Ensure level is between 0 and 100
  const securityLevel = Math.max(0, Math.min(100, level));
  
  // Determine color based on security level
  const getColorClass = () => {
    if (securityLevel < 30) return "bg-shield-red";
    if (securityLevel < 70) return "bg-amber-500";
    return "bg-shield-green";
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>Security Level</span>
        <span className="font-medium">{securityLevel}%</span>
      </div>
      <div className="h-2 bg-shield-gray/30 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getColorClass())}
          style={{ width: `${securityLevel}%` }}
        />
      </div>
    </div>
  );
}
