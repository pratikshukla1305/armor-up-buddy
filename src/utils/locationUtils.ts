
/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Converts degrees to radians
 * @param deg Angle in degrees
 * @returns Angle in radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Calculates an estimated time to reach a location based on distance
 * @param distanceKm Distance in kilometers
 * @param averageSpeed Average speed in km/h (default: 30)
 * @returns Estimated time in a human-readable format
 */
export const calculateTimeToReach = (
  distanceKm: number, 
  averageSpeed: number = 30
): string => {
  // Calculate time in hours
  const timeHours = distanceKm / averageSpeed;
  
  // Convert to minutes
  const totalMinutes = Math.round(timeHours * 60);
  
  if (totalMinutes < 1) {
    return "Less than a minute";
  } else if (totalMinutes === 1) {
    return "1 minute";
  } else if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
  }
};
