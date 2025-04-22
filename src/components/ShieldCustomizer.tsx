
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldIcon } from "./ShieldIcon";

interface ShieldCustomizerProps {
  className?: string;
}

type ShieldStyle = "standard" | "reinforced" | "stealth" | "reactive";

interface StyleOption {
  id: ShieldStyle;
  name: string;
  description: string;
  color: string;
}

export function ShieldCustomizer({ className }: ShieldCustomizerProps) {
  const [selectedStyle, setSelectedStyle] = useState<ShieldStyle>("standard");
  
  const styleOptions: StyleOption[] = [
    { 
      id: "standard", 
      name: "Standard", 
      description: "Balanced protection for everyday threats", 
      color: "text-shield-blue"
    },
    { 
      id: "reinforced", 
      name: "Reinforced", 
      description: "Heavy-duty protection for high-risk situations", 
      color: "text-shield-green"
    },
    { 
      id: "stealth", 
      name: "Stealth", 
      description: "Low-profile protection that works silently", 
      color: "text-purple-500"
    },
    { 
      id: "reactive", 
      name: "Reactive", 
      description: "Adaptive shield that responds to threats", 
      color: "text-amber-500"
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-medium">Shield Customization</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {styleOptions.map((style) => (
          <Button
            key={style.id}
            variant={selectedStyle === style.id ? "default" : "outline"}
            className={cn(
              "h-auto flex flex-col items-center justify-center p-4 gap-2",
              selectedStyle === style.id && "border-2 border-primary"
            )}
            onClick={() => setSelectedStyle(style.id)}
          >
            <ShieldIcon 
              size={32} 
              className={style.color} 
            />
            <div className="text-center">
              <h4 className="text-sm font-medium">{style.name}</h4>
              <p className="text-xs text-muted-foreground">{style.description}</p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
