
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, ArrowRight } from 'lucide-react';
import { calculateDistance, calculateTimeToReach } from '@/utils/locationUtils';

type PoliceStationCardProps = {
  station: any;
  userLocation: { lat: number; lng: number } | null;
  onClick: () => void;
};

const PoliceStationCard = ({ station, userLocation, onClick }: PoliceStationCardProps) => {
  const distance = userLocation 
    ? calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        station.coordinates.lat, 
        station.coordinates.lng
      ) 
    : null;
  
  const timeToReach = distance ? calculateTimeToReach(distance) : null;
  
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (station.phone) {
      window.location.href = `tel:${station.phone}`;
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <h3 className="font-semibold text-shield-dark text-lg">{station.name}</h3>
        
        <div className="flex items-start mt-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />
          <p className="text-gray-600 text-sm line-clamp-2">{station.address}</p>
        </div>
        
        <div className="flex items-center mt-2">
          <Phone className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
          <p className="text-gray-600 text-sm">{station.phone}</p>
        </div>
        
        {distance !== null && (
          <div className="mt-3 flex items-center text-sm text-shield-blue">
            <span>{distance.toFixed(2)} km away</span>
            {timeToReach && (
              <span className="ml-2 text-gray-500">• {timeToReach}</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCall}
          >
            <Phone className="h-3.5 w-3.5 mr-1" />
            Call
          </Button>
          <Button 
            size="sm" 
            className="bg-shield-blue text-white"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoliceStationCard;
