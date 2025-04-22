
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, PlusCircle } from 'lucide-react';
import StaticMap from '@/components/maps/StaticMap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { caseDensityData } from '@/data/caseDensityData'; 
import { createCase, getCases } from '@/services/officerServices';
import { CaseData } from '@/types/officer';
import { supabase } from '@/integrations/supabase/client';

const OfficerCaseMap = () => {
  // Generate Google Maps URL for Chennai
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://www.google.com/maps/search/Chennai+crime+hotspots");
  const [cases, setCases] = useState<CaseData[]>([]);
  const [crimeMappedLocations, setCrimeMappedLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCaseData, setNewCaseData] = useState({
    case_number: '',
    region: '',
    address: '',
    latitude: '',
    longitude: '',
    case_type: '',
    description: '',
    case_date: '',
    case_time: '',
    status: 'Open'
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setIsLoading(true);
        
        // Fetch cases
        const cases = await getCases();
        console.log("Fetched cases:", cases);
        setCases(cases);
        
        // Fetch crime map locations
        const { data: locations, error } = await supabase
          .from('crime_map_locations')
          .select('*');
          
        if (error) {
          console.error("Error fetching crime map locations:", error);
          toast.error("Failed to load crime location data");
        } else {
          console.log("Fetched crime locations:", locations);
          
          // If no real data, add some sample data for demonstration
          const locationsToUse = locations && locations.length > 0 ? locations : [
            {
              id: "1",
              case_id: 1,
              latitude: 13.0827,
              longitude: 80.2707,
              title: "Chennai Central Theft",
              description: "Sample theft case",
              crime_type: "theft"
            },
            {
              id: "2", 
              case_id: 2,
              latitude: 13.0569,
              longitude: 80.2425,
              title: "T Nagar Burglary",
              description: "Sample burglary case",
              crime_type: "burglary"
            },
            {
              id: "3",
              case_id: 3, 
              latitude: 13.1067,
              longitude: 80.2206,
              title: "Anna Nagar Assault",
              description: "Sample assault case",
              crime_type: "assault"
            }
          ];
          
          // Save to session storage for persistence
          sessionStorage.setItem('crime_map_locations', JSON.stringify(locationsToUse));
          setCrimeMappedLocations(locationsToUse);
          
          // Update Google Maps URL with these coordinates
          updateGoogleMapsUrl(locationsToUse);
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
        toast.error("Failed to load case data");
        
        // Try to load from session storage if available
        const storedLocations = sessionStorage.getItem('crime_map_locations');
        if (storedLocations) {
          const parsedLocations = JSON.parse(storedLocations);
          setCrimeMappedLocations(parsedLocations);
          updateGoogleMapsUrl(parsedLocations);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
    
    // Set up a refresh interval
    const intervalId = setInterval(() => {
      loadCases();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const updateGoogleMapsUrl = (locations: any[]) => {
    if (!locations || locations.length === 0) return;
    
    // Create a Google Maps search URL with crime locations
    const coordinatesQuery = locations
      .filter(loc => loc.latitude && loc.longitude)
      .slice(0, 10) // Limit to 10 locations to avoid URL length issues
      .map(loc => `${loc.latitude},${loc.longitude}`)
      .join('|');
    
    if (coordinatesQuery) {
      setGoogleMapsUrl(`https://www.google.com/maps/search/${coordinatesQuery}/`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewCaseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newCaseData.case_number || !newCaseData.address || !newCaseData.case_type || !newCaseData.case_date) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      // Parse latitude and longitude if provided
      const formattedData = {
        ...newCaseData,
        latitude: newCaseData.latitude ? parseFloat(newCaseData.latitude) : null,
        longitude: newCaseData.longitude ? parseFloat(newCaseData.longitude) : null
      };
      
      // First create the case
      const newCases = await createCase(formattedData);
      
      if (newCases && newCases.length > 0) {
        // Then add to crime map locations
        const { data: locationData, error: locationError } = await supabase
          .from('crime_map_locations')
          .insert([{
            case_id: newCases[0].case_id,
            latitude: formattedData.latitude,
            longitude: formattedData.longitude,
            title: newCaseData.case_number,
            description: newCaseData.description,
            crime_type: newCaseData.case_type
          }])
          .select();
          
        if (locationError) {
          console.error("Error adding to crime map:", locationError);
          toast.error("Case added but failed to add to map");
        } else {
          // Update local state with the new location
          if (locationData) {
            const updatedLocations = [...crimeMappedLocations, ...locationData];
            setCrimeMappedLocations(updatedLocations);
            
            // Update session storage
            sessionStorage.setItem('crime_map_locations', JSON.stringify(updatedLocations));
            
            // Update Google Maps URL
            updateGoogleMapsUrl(updatedLocations);
          }
        }
      }
      
      toast.success("Case added successfully");
      setDialogOpen(false);
      
      // Refresh cases
      const updatedCases = await getCases();
      setCases(updatedCases);
      
      // Reset form
      setNewCaseData({
        case_number: '',
        region: '',
        address: '',
        latitude: '',
        longitude: '',
        case_type: '',
        description: '',
        case_date: '',
        case_time: '',
        status: 'Open'
      });
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to add case");
    }
  };

  return (
    <div className="h-full relative">
      <StaticMap 
        altText="Case Distribution Map" 
        redirectPath={googleMapsUrl}
        buttonText="View Crime Locations Map"
        description="Click to see detailed crime locations in Google Maps"
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-shield-blue mb-2"></div>
            <p className="text-shield-blue">Loading crime map data...</p>
          </div>
        </div>
      )}
      
      {/* Show number of crime locations as an overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded shadow">
        <p className="text-sm font-medium">{crimeMappedLocations.length} Crime Locations</p>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full h-12 w-12 p-0 bg-blue-500 hover:bg-blue-600">
              <PlusCircle className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Case Location</DialogTitle>
              <DialogDescription>
                Add details about a new crime case to the map.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_number">Case Number *</Label>
                  <Input
                    id="case_number"
                    name="case_number"
                    value={newCaseData.case_number}
                    onChange={handleInputChange}
                    placeholder="e.g. CR-2025-001"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="case_type">Case Type *</Label>
                  <Select
                    value={newCaseData.case_type}
                    onValueChange={(value) => handleSelectChange('case_type', value)}
                  >
                    <SelectTrigger id="case_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="assault">Assault</SelectItem>
                      <SelectItem value="burglary">Burglary</SelectItem>
                      <SelectItem value="vandalism">Vandalism</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={newCaseData.region}
                    onChange={handleInputChange}
                    placeholder="e.g. Downtown"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newCaseData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Investigating">Investigating</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={newCaseData.address}
                  onChange={handleInputChange}
                  placeholder="Full address of the crime scene"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    value={newCaseData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 13.0827"
                    type="number"
                    step="any"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    value={newCaseData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 80.2707"
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_date">Date *</Label>
                  <Input
                    id="case_date"
                    name="case_date"
                    value={newCaseData.case_date}
                    onChange={handleInputChange}
                    type="date"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="case_time">Time</Label>
                  <Input
                    id="case_time"
                    name="case_time"
                    value={newCaseData.case_time}
                    onChange={handleInputChange}
                    type="time"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newCaseData.description}
                  onChange={handleInputChange}
                  placeholder="Provide details about the case"
                  className="min-h-[100px]"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Case to Map</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Display a summary of crimes when no actual map */}
      <div className="absolute bottom-4 left-4 max-w-xs">
        <div className="bg-white bg-opacity-90 p-3 rounded shadow">
          <h4 className="font-medium mb-2">Crime Locations</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto text-sm">
            {crimeMappedLocations.slice(0, 5).map((location, index) => (
              <div key={index} className="flex items-start">
                <MapPin className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                <span className="truncate">{location.title}</span>
              </div>
            ))}
            {crimeMappedLocations.length > 5 && (
              <p className="text-xs text-gray-500 italic">
                + {crimeMappedLocations.length - 5} more locations
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerCaseMap;
