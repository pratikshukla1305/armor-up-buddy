
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'subtle';
}

const SOSButton = ({ 
  onClick, 
  className,
  size = 'default',
  variant = 'default'
}: SOSButtonProps) => {
  const sizeClasses = {
    'sm': 'text-xs py-1 px-2 gap-1',
    'default': 'text-sm py-2 px-3 gap-1.5',
    'lg': 'text-base py-3 px-4 gap-2'
  };
  
  const variantClasses = {
    'default': 'bg-red-600 hover:bg-red-700 text-white',
    'outline': 'border-2 border-red-600 text-red-600 hover:bg-red-50',
    'subtle': 'bg-red-100 text-red-700 hover:bg-red-200'
  };
  
  return (
    <Button
      onClick={onClick}
      className={cn(
        "font-bold rounded-md shadow-lg flex items-center justify-center animate-sos-pulse",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      type="button"
    >
      <AlertTriangle className={cn("h-4 w-4", size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      <span className="font-bold">SOS</span>
    </Button>
  );
};

export default SOSButton;
