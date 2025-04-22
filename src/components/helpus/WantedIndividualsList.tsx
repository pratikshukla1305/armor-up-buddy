
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getWantedIndividuals, WantedIndividual } from '@/data/wantedIndividuals';
import { AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WantedIndividualsList = () => {
  const [wantedIndividuals, setWantedIndividuals] = React.useState<WantedIndividual[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Get wanted individuals from the data service
    const data = getWantedIndividuals();
    setWantedIndividuals(data);
  }, []);

  const getDangerLevelColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleSubmitTip = (individual: WantedIndividual) => {
    navigate('/submit-tip', { state: { individualName: individual.name, caseNumber: individual.caseNumber } });
  };

  if (wantedIndividuals.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No wanted individuals found at this time.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wantedIndividuals.map((individual) => (
        <Card key={individual.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <div className="aspect-[4/3] bg-gray-100 relative">
            {/* Image or placeholder */}
            {individual.photoUrl ? (
              <img 
                src={individual.photoUrl} 
                alt={individual.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            <Badge className={`absolute top-2 right-2 ${getDangerLevelColor(individual.dangerLevel)}`}>
              {individual.dangerLevel} Risk
            </Badge>
          </div>
          
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{individual.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {individual.lastKnownLocation}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2 pb-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-gray-500">Age:</div>
              <div>{individual.age}</div>
              
              <div className="text-gray-500">Height:</div>
              <div>{individual.height}</div>
              
              <div className="text-gray-500">Weight:</div>
              <div>{individual.weight}</div>
              
              <div className="text-gray-500">Case #:</div>
              <div className="font-mono text-xs">{individual.caseNumber}</div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Charges:</h4>
              <p className="text-sm text-gray-600">{individual.charges}</p>
            </div>
            
            {individual.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Details:</h4>
                <p className="text-sm text-gray-600">{individual.description}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => handleSubmitTip(individual)}
            >
              Submit Tip
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default WantedIndividualsList;
