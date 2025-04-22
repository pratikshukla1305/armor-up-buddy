
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShieldControlsProps {
  initialStatus?: boolean;
  onStatusChange?: (status: boolean) => void;
  className?: string;
}

export function ShieldControls({ 
  initialStatus = false, 
  onStatusChange,
  className
}: ShieldControlsProps) {
  const [isActive, setIsActive] = useState(initialStatus);

  const toggleShield = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Button 
        variant={isActive ? "destructive" : "default"}
        size="lg"
        className="w-full gap-2"
        onClick={toggleShield}
      >
        {isActive ? (
          <>
            <ShieldOff className="w-5 h-5" />
            Deactivate Shield
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Activate Shield
          </>
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isActive 
          ? "Your shield is active and providing protection." 
          : "Your shield is currently inactive. Activate for protection."}
      </p>
    </div>
  );
}
