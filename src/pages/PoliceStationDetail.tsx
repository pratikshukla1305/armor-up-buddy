import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Video, Clock, ChevronLeft, Star, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { policeStations } from '@/data/policeStations';
import { toast } from '@/hooks/use-toast';
import { calculateDistance, calculateTimeToReach } from '@/utils/locationUtils';

const PoliceStationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [timeToReach, setTimeToReach] = useState<string | null>(null);

  useEffect(() => {
    // Find the station by ID
    const foundStation = policeStations.find(s => s.id === id);
    
    if (foundStation) {
      setStation(foundStation);
    }
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          if (foundStation) {
            // Calculate distance
            const dist = calculateDistance(
              userPos.lat, userPos.lng,
              foundStation.coordinates.lat, foundStation.coordinates.lng
            );
            setDistance(dist);
            
            // Calculate estimated time to reach
            setTimeToReach(calculateTimeToReach(dist));
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "We can't calculate distance without your location.",
            variant: "destructive"
          });
        }
      );
    }
    
    setLoading(false);
  }, [id]);

  const handleCall = () => {
    if (station && station.phone) {
      window.location.href = `tel:${station.phone}`;
    }
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call Feature",
      description: "This feature would initiate a video call with the police station.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center mt-16">
          <Loader2 className="h-12 w-12 text-shield-blue animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow mt-16 md:mt-20">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-shield-dark mb-4">Police Station Not Found</h1>
              <p className="text-gray-600 mb-8">
                The police station you're looking for doesn't exist or may have been moved.
              </p>
              <Link to="/police-stations">
                <Button className="bg-shield-blue text-white">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Police Stations
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow mt-16 md:mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link to="/police-stations" className="inline-flex items-center text-shield-blue hover:underline">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Police Stations
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-shield-dark">{station?.name}</h1>
                  
                  <div className="flex items-start mt-4">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{station?.address}</p>
                  </div>
                  
                  <div className="flex items-center mt-4">
                    <Phone className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{station?.phone}</p>
                  </div>
                  
                  {timeToReach && (
                    <div className="flex items-center mt-4">
                      <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700">
                          {timeToReach} estimated travel time
                          {distance && ` (${distance.toFixed(2)} km away)`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-6 space-x-4">
                    <Button onClick={handleCall} className="flex-1 bg-shield-blue text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Station
                    </Button>
                    <Button onClick={handleVideoCall} variant="outline" className="flex-1">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                <h2 className="text-xl font-semibold text-shield-dark mb-4">Location</h2>
                
                <div className="h-[400px] rounded-lg overflow-hidden bg-gray-100 border">
                  <img 
                    src="/lovable-uploads/3f2bac0b-2cf4-41fa-83d0-9da0d44ca7c5.png" 
                    alt="Station Location Map" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="mt-4">
                  <a 
                    href={station ? `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}` : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-shield-blue hover:underline flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Get directions via Google Maps
                  </a>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-shield-dark mb-4">Station Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Jurisdiction</h3>
                    <p className="mt-1">{station?.jurisdiction || "Information not available"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Operating Hours</h3>
                    <p className="mt-1">{station?.hours || "24 hours / 7 days"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Services</h3>
                    <ul className="mt-1 space-y-1">
                      {(station?.services || ["FIR Filing", "Emergency Response", "General Enquiries"]).map((service, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-shield-blue mr-2"></div>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-shield-dark mb-4">Citizen Reviews</h2>
                
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-5 w-5 ${star <= (station?.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700">{station?.rating || 4}/5</span>
                  <span className="ml-2 text-gray-500">({station?.reviewCount || 12} reviews)</span>
                </div>
                
                <div className="space-y-4">
                  {(station?.reviews || [
                    { name: "Rahul Singh", text: "Quick response time when I reported an incident. Professional staff.", date: "2 months ago" },
                    { name: "Priya Patel", text: "Clean facility and helpful officers. They assisted me promptly with my documentation.", date: "4 months ago" }
                  ]).map((review, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{review.name}</span>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="mt-1 text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PoliceStationDetail;
