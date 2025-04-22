
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { getWantedIndividuals, WantedIndividual } from '@/data/wantedIndividuals';

const CriminalListing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCriminal, setSelectedCriminal] = useState<WantedIndividual | null>(null);
  const [criminals, setCriminals] = useState<WantedIndividual[]>([]);
  const navigate = useNavigate();
  
  // Load the latest data whenever the component mounts or is focused
  useEffect(() => {
    const updateData = () => {
      setCriminals(getWantedIndividuals());
    };
    
    // Initial load
    updateData();
    
    // Also set up a refresh interval to check for new data periodically
    const intervalId = setInterval(updateData, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  const filteredCriminals = criminals.filter(criminal => 
    criminal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    criminal.charges.toLowerCase().includes(searchQuery.toLowerCase()) ||
    criminal.lastKnownLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportSighting = (criminalId: string) => {
    navigate(`/submit-tip?id=${criminalId}`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, charges, or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="bg-blue-600">Filter Results</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCriminals.map((criminal) => (
          <Card key={criminal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{criminal.name}</CardTitle>
                <Badge variant={criminal.dangerLevel === 'High' ? 'destructive' : criminal.dangerLevel === 'Medium' ? 'default' : 'outline'}>
                  {criminal.dangerLevel} Risk
                </Badge>
              </div>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Last seen: {criminal.lastKnownLocation}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="aspect-w-3 aspect-h-4 mb-3">
                <img
                  src={criminal.photoUrl}
                  alt={`Wanted: ${criminal.name}`}
                  className="object-cover w-full h-[200px] rounded-md"
                />
              </div>
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">{criminal.charges}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-semibold mr-1">Case #:</span> {criminal.caseNumber}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-600"
                    onClick={() => setSelectedCriminal(criminal)}
                  >
                    <Info className="h-4 w-4 mr-1" /> Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Case Details: {selectedCriminal?.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={selectedCriminal?.photoUrl}
                        alt={`Wanted: ${selectedCriminal?.name}`}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedCriminal?.name}</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold block">Age:</span>
                          {selectedCriminal?.age}
                        </div>
                        <div>
                          <span className="font-semibold block">Height:</span>
                          {selectedCriminal?.height}
                        </div>
                        <div>
                          <span className="font-semibold block">Weight:</span>
                          {selectedCriminal?.weight}
                        </div>
                        <div>
                          <span className="font-semibold block">Last Known Location:</span>
                          {selectedCriminal?.lastKnownLocation}
                        </div>
                        <div>
                          <span className="font-semibold block">Charges:</span>
                          {selectedCriminal?.charges}
                        </div>
                        <div>
                          <span className="font-semibold block">Case Number:</span>
                          {selectedCriminal?.caseNumber}
                        </div>
                        <div>
                          <span className="font-semibold block">Risk Level:</span>
                          <Badge variant={selectedCriminal?.dangerLevel === 'High' ? 'destructive' : selectedCriminal?.dangerLevel === 'Medium' ? 'default' : 'outline'}>
                            {selectedCriminal?.dangerLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-6">
                        <Button 
                          className="w-full bg-blue-600"
                          onClick={() => handleReportSighting(selectedCriminal?.id || '')}
                        >
                          Report Sighting
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                size="sm"
                className="bg-shield-blue"
                onClick={() => handleReportSighting(criminal.id)}
              >
                Report Sighting
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CriminalListing;
