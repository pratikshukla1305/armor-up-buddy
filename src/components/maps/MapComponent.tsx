
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type MapComponentProps = {
  userLocation: { lat: number; lng: number };
  policeStations?: any[];
  onStationClick?: (stationId: string) => void;
  isHeatmap?: boolean;
  heatmapData?: any[];
  centerOnStation?: boolean;
  zoom?: number;
};

const MapComponent = ({ 
  userLocation, 
  policeStations = [], 
  onStationClick,
  isHeatmap = false,
  heatmapData = [],
  centerOnStation = false,
  zoom = 11
}: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Set default token to window object
    window.DEFAULT_MAPBOX_TOKEN = "pk.eyJ1Ijoic2h1ZW5jZSIsImEiOiJjbG9wcmt3czMwYnZsMmtvNnpmNTRqdnl6In0.vLBhYMBZBl2kaOh1Fh44Bw";
    
    // Check if mapboxgl is available (this would normally be imported from mapbox-gl)
    if (!window.mapboxgl) {
      // If mapbox isn't available yet, let's create a script to load it
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.onload = () => {
        // Also load the CSS
        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && map.current) {
      updateMapMarkers();
    }
  }, [mapLoaded, policeStations, userLocation, isHeatmap, heatmapData, centerOnStation]);

  const initializeMap = () => {
    if (!mapContainer.current) return;
    
    // Try to get token from localStorage first, or use default token
    const storedToken = localStorage.getItem('mapbox_token') || window.DEFAULT_MAPBOX_TOKEN;
    
    if (!storedToken) {
      // If no token, display a placeholder map with a message
      displayPlaceholderMap();
      return;
    }
    
    try {
      window.mapboxgl.accessToken = storedToken;
      
      // Create the map
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation.lng, userLocation.lat],
        zoom: zoom
      });
      
      // Add navigation controls
      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
      
      // Wait for map to load
      map.current.on('load', () => {
        setMapLoaded(true);
      });
      
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map initialization failed",
        description: "There was an error loading the map. Please check your Mapbox token.",
        variant: "destructive"
      });
      displayPlaceholderMap();
    }
  };
  
  const displayPlaceholderMap = () => {
    if (!mapContainer.current) return;
    
    // Display a placeholder div with a message
    mapContainer.current.innerHTML = `
      <div class="h-full w-full flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Map requires Mapbox token</h3>
        <p class="text-gray-600 mb-4 max-w-md">
          Please use the "Set Mapbox Token" button above to enter your Mapbox public token.
        </p>
        <p class="text-sm text-gray-500">
          You can get a free token at <a href="https://account.mapbox.com/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline">Mapbox.com</a>
        </p>
      </div>
    `;
  };

  const updateMapMarkers = () => {
    if (!map.current || !mapLoaded) return;
    
    // Remove existing markers
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => {
      marker.remove();
    });
    
    // Add user marker
    new window.mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
    
    // Add police station markers
    policeStations.forEach(station => {
      const el = document.createElement('div');
      el.className = 'station-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1zaGllbGQtYWxlcnQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjZWI0ZDRkIi8+PHBhdGggZD0iTTEyIDhWMTIiLz48cGF0aCBkPSJNMTIgMTZoLjAxIi8+PC9zdmc+)';
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';
      
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([station.coordinates.lng, station.coordinates.lat])
        .addTo(map.current);
      
      // Add popup
      const popup = new window.mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div>
            <h3 class="font-bold">${station.name}</h3>
            <p class="text-sm">${station.address}</p>
          </div>
        `);
      
      marker.setPopup(popup);
      
      // Add click handler
      if (onStationClick) {
        el.addEventListener('click', () => {
          onStationClick(station.id);
        });
      }
    });
    
    // If we need to center on a station instead of the user
    if (centerOnStation && policeStations.length > 0) {
      map.current.flyTo({
        center: [policeStations[0].coordinates.lng, policeStations[0].coordinates.lat],
        zoom: zoom
      });
    } else {
      // Center map on user location
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: zoom
      });
    }
    
    // If it's a heatmap, add heatmap layer
    if (isHeatmap && heatmapData.length > 0) {
      // Create GeoJSON data
      const geojsonData = {
        type: 'FeatureCollection',
        features: heatmapData.map(point => ({
          type: 'Feature',
          properties: {
            intensity: point.count
          },
          geometry: {
            type: 'Point',
            coordinates: [point.coordinates.lng, point.coordinates.lat]
          }
        }))
      };
      
      // Check if source already exists and remove if needed
      if (map.current.getSource('case-data')) {
        if (map.current.getLayer('case-heat')) {
          map.current.removeLayer('case-heat');
        }
        map.current.removeSource('case-data');
      }
      
      // Add the data source
      map.current.addSource('case-data', {
        type: 'geojson',
        data: geojsonData
      });
      
      // Add heatmap layer
      map.current.addLayer({
        id: 'case-heat',
        type: 'heatmap',
        source: 'case-data',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 0,
            10, 1
          ],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.8
        }
      });
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 text-shield-blue animate-spin" />
        </div>
      )}
    </div>
  );
};

export default MapComponent;
