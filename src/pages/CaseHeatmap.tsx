import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BarChart, MapPin, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { caseDensityData } from '@/data/caseDensityData';
import StaticMap from '@/components/maps/StaticMap';

const caseTypes = [
  { id: "all", name: "All Cases" },
  { id: "theft", name: "Theft" },
  { id: "assault", name: "Assault" },
  { id: "cybercrime", name: "Cybercrime" },
  { id: "fraud", name: "Fraud" }
];

const timeRanges = [
  { id: "1m", name: "Last Month" },
  { id: "3m", name: "Last 3 Months" },
  { id: "6m", name: "Last 6 Months" },
  { id: "1y", name: "Last Year" },
  { id: "all", name: "All Time" }
];

const CaseHeatmap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCaseType, setSelectedCaseType] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [isMapView, setIsMapView] = useState(true);

  const filteredCaseData = caseDensityData.filter(item => {
    const matchesType = selectedCaseType === "all" || item.type === selectedCaseType;
    return matchesType;
  });

  const totalCases = filteredCaseData.reduce((sum, item) => sum + item.count, 0);
  const highestDensityArea = [...filteredCaseData].sort((a, b) => b.count - a.count)[0]?.region || "N/A";

  const getGoogleMapsUrl = () => {
    let region = highestDensityArea !== "N/A" ? highestDensityArea : "Chennai";
    region = `${region} crime hotspots`;
    return `https://www.google.com/maps/search/${encodeURIComponent(region)}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow mt-16 md:mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-shield-dark">Case Density Map</h1>
              <p className="text-gray-600 mt-1">
                Visualize reported cases across different regions
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={isMapView ? "default" : "outline"} 
                onClick={() => setIsMapView(true)}
                className={isMapView ? "bg-shield-blue text-white" : ""}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </Button>
              <Button 
                variant={!isMapView ? "default" : "outline"} 
                onClick={() => setIsMapView(false)}
                className={!isMapView ? "bg-shield-blue text-white" : ""}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Statistics View
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-4 flex flex-col justify-between">
              <div className="text-gray-500 text-sm font-medium">Total Cases</div>
              <div className="text-3xl font-bold mt-2">{totalCases}</div>
              <div className="text-gray-400 text-xs mt-2">Based on current filters</div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4 flex flex-col justify-between">
              <div className="text-gray-500 text-sm font-medium">Highest Density Area</div>
              <div className="text-xl font-bold mt-2 truncate">{highestDensityArea}</div>
              <div className="text-gray-400 text-xs mt-2">Based on current filters</div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4 flex items-center">
              <div className="w-full">
                <label className="text-gray-500 text-sm font-medium">Case Type</label>
                <Select 
                  value={selectedCaseType} 
                  onValueChange={setSelectedCaseType}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-4 flex items-center">
              <div className="w-full">
                <label className="text-gray-500 text-sm font-medium">Time Range</label>
                <Select 
                  value={selectedTimeRange} 
                  onValueChange={setSelectedTimeRange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges.map(range => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-shield-blue animate-spin mb-4" />
                <p className="text-gray-500">Loading case data...</p>
              </div>
            </div>
          ) : (
            isMapView ? (
              <div className="h-[600px] rounded-lg overflow-hidden">
                <StaticMap
                  altText="Case Density Map"
                  redirectPath={getGoogleMapsUrl()}
                  buttonText="View Crime Hotspot Map"
                  description="Click to see detailed crime hotspots on Google Maps"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Case Distribution by Area</h2>
                <div className="space-y-4">
                  {filteredCaseData.map(item => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-1/3 text-gray-700">{item.region}</div>
                      <div className="w-2/3">
                        <div className="flex items-center">
                          <div 
                            className="h-8 bg-shield-blue rounded"
                            style={{ width: `${(item.count / Math.max(...filteredCaseData.map(d => d.count))) * 100}%` }}
                          ></div>
                          <span className="ml-3 text-gray-700 font-medium">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredCaseData.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium text-gray-900">No data available</h3>
                      <p className="text-gray-500 mt-1">
                        No case data matches your current filter criteria.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CaseHeatmap;
