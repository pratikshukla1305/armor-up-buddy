
import React from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdvisoryCardProps {
  advisory: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    imageUrl: string;
    type: 'police' | 'government' | 'emergency';
  };
}

const AdvisoryCard = ({ advisory }: AdvisoryCardProps) => {
  const getBadgeColor = () => {
    switch(advisory.type) {
      case 'police':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'government':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[16/9] overflow-hidden">
        <img 
          src={advisory.imageUrl} 
          alt={advisory.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Badge className={cn("font-normal capitalize", getBadgeColor())}>
            {advisory.type}
          </Badge>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {advisory.date}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{advisory.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {advisory.description}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {advisory.location}
        </div>
        
        <Link to={`/advisory/${advisory.id}`}>
          <Button variant="outline" className="w-full flex justify-center items-center">
            View Details
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdvisoryCard;
