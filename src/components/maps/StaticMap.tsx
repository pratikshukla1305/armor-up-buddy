
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface StaticMapProps {
  altText?: string;
  className?: string;
  redirectPath?: string;
  buttonText?: string;
  description?: string;
}

const StaticMap: React.FC<StaticMapProps> = ({ 
  altText = "Map of police stations", 
  className,
  redirectPath = '/police-stations',
  buttonText = "Locate Police Stations",
  description = "Click to view interactive map"
}) => {
  const navigate = useNavigate();
  
  const handleMapClick = () => {
    // For Google Maps redirection
    if (redirectPath.startsWith('http')) {
      window.open(redirectPath, '_blank');
    } else {
      navigate(redirectPath);
    }
  };
  
  return (
    <div className={`relative cursor-pointer rounded-lg overflow-hidden ${className || ''}`}>
      <img 
        src="/lovable-uploads/3f2bac0b-2cf4-41fa-83d0-9da0d44ca7c5.png" 
        alt={altText}
        className="w-full h-auto object-cover"
        onClick={handleMapClick}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col items-center justify-end p-4"
        onClick={handleMapClick}
      >
        <MapPin className="h-10 w-10 text-white mb-2" />
        <Button className="bg-shield-blue hover:bg-blue-700">
          {buttonText}
        </Button>
        <p className="text-white text-sm mt-2">{description}</p>
      </div>
    </div>
  );
};

export default StaticMap;
