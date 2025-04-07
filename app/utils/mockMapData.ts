/**
 * Mock map data for development without real Google Maps API
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface Location {
  id: string;
  name: string;
  coordinate: Coordinate;
  description?: string;
}

// Sample locations in Addis Ababa, Ethiopia
export const ADDIS_ABABA_CENTER: Coordinate = {
  latitude: 9.0222,
  longitude: 38.7468
};

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'bole',
    name: 'Bole',
    coordinate: { latitude: 9.0096, longitude: 38.7649 },
    description: 'Bole area, close to airport'
  },
  {
    id: 'meskel_square',
    name: 'Meskel Square',
    coordinate: { latitude: 9.0153, longitude: 38.7674 },
    description: 'Central landmark'
  },
  {
    id: 'piassa',
    name: 'Piassa',
    coordinate: { latitude: 9.0359, longitude: 38.7516 },
    description: 'Historic commercial area'
  },
  {
    id: 'megenagna',
    name: 'Megenagna',
    coordinate: { latitude: 9.0200, longitude: 38.7900 },
    description: 'Major transportation hub'
  },
  {
    id: 'kazanchis',
    name: 'Kazanchis',
    coordinate: { latitude: 9.0134, longitude: 38.7553 },
    description: 'Business district'
  },
  {
    id: 'merkato',
    name: 'Merkato',
    coordinate: { latitude: 9.0356, longitude: 38.7468 },
    description: 'Largest market area'
  },
  {
    id: 'mexico',
    name: 'Mexico Square',
    coordinate: { latitude: 9.0133, longitude: 38.7375 },
    description: 'Main square with monuments'
  },
  {
    id: 'lamberet',
    name: 'Lamberet',
    coordinate: { latitude: 9.0250, longitude: 38.8000 },
    description: 'Eastern district'
  },
  {
    id: 'gurd_shola',
    name: 'Gurd Shola',
    coordinate: { latitude: 9.0300, longitude: 38.7950 },
    description: 'Northern business area'
  },
  {
    id: 'jemo',
    name: 'Jemo',
    coordinate: { latitude: 8.9700, longitude: 38.7200 },
    description: 'Southwestern residential area'
  }
];

// List of sample locations in Addis Ababa with latitude/longitude directly accessible
export const ADDIS_ABABA_LOCATIONS: Coordinate[] = MOCK_LOCATIONS.map(location => ({
  latitude: location.coordinate.latitude,
  longitude: location.coordinate.longitude
}));

// Calculate a path between two coordinates with some random waypoints
export function getMockRoute(start: Coordinate, end: Coordinate): Coordinate[] {
  // Direct line would be boring, let's add some intermediary points
  const latDiff = end.latitude - start.latitude;
  const lngDiff = end.longitude - start.longitude;
  
  // Create 2-4 waypoints
  const numPoints = 2 + Math.floor(Math.random() * 3);
  const route: Coordinate[] = [start];
  
  for (let i = 1; i <= numPoints; i++) {
    // Progress along the route (0-1)
    const progress = i / (numPoints + 1);
    
    // Add some randomness to make it look like a realistic road
    const randomLat = (Math.random() - 0.5) * 0.005; // ~500m deviation
    const randomLng = (Math.random() - 0.5) * 0.005;
    
    route.push({
      latitude: start.latitude + latDiff * progress + randomLat,
      longitude: start.longitude + lngDiff * progress + randomLng
    });
  }
  
  route.push(end);
  return route;
}

// Generate a moving location that simulates a vehicle moving along a route
// Version without callback - use this for simple simulations
export function createSimpleLocationSimulator(route: Coordinate[], durationMs: number = 60000) {
  let startTime = Date.now();
  let currentIndex = 0;
  
  return function getLocation(): Coordinate {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / durationMs, 1);
    
    // Calculate which segment we're on
    const totalSegments = route.length - 1;
    const segmentProgress = progress * totalSegments;
    
    currentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
    const segmentFraction = segmentProgress - currentIndex;
    
    const start = route[currentIndex];
    const end = route[currentIndex + 1];
    
    // Interpolate position
    return {
      latitude: start.latitude + (end.latitude - start.latitude) * segmentFraction,
      longitude: start.longitude + (end.longitude - start.longitude) * segmentFraction
    };
  };
}

// Generate a random string ID
export function generateMockId(): string {
  return Math.random().toString(36).substring(2, 12);
}

// Find a random location within a radius (km) of a center point
export function getRandomLocationNear(center: Coordinate, radiusKm: number): Coordinate {
  // Earth's radius in km
  const earthRadius = 6371;
  
  // Convert radius from km to radians
  const radiusRadians = radiusKm / earthRadius;
  
  // Generate a random distance within the radius
  const distanceRadians = radiusRadians * Math.random();
  
  // Generate a random angle in radians
  const angle = Math.random() * 2 * Math.PI;
  
  // Calculate the random latitude
  const lat1 = center.latitude * (Math.PI / 180);
  const lng1 = center.longitude * (Math.PI / 180);
  
  // Calculate the new latitude and longitude
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceRadians) +
    Math.cos(lat1) * Math.sin(distanceRadians) * Math.cos(angle)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(angle) * Math.sin(distanceRadians) * Math.cos(lat1),
    Math.cos(distanceRadians) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  // Convert back to degrees
  return {
    latitude: lat2 * (180 / Math.PI),
    longitude: lng2 * (180 / Math.PI)
  };
}

/**
 * Find a random location within a specified radius of the center point
 */
export function findNearbyLocation(center: Coordinate, radiusKm: number): Coordinate {
  // Convert radius from km to degrees (very rough approximation)
  // 1 degree of latitude is approximately 111 km
  const radiusLat = (radiusKm / 111);
  
  // 1 degree of longitude varies with latitude, but for small distances
  // we can use a simple approximation
  const radiusLng = radiusLat / Math.cos(center.latitude * (Math.PI / 180));
  
  // Generate random offsets within the radius
  const randomLat = (Math.random() * 2 - 1) * radiusLat;
  const randomLng = (Math.random() * 2 - 1) * radiusLng;
  
  return {
    latitude: center.latitude + randomLat,
    longitude: center.longitude + randomLng
  };
}

/**
 * Calculate the haversine distance between two points (in km)
 */
export function haversineDistance(point1: Coordinate, point2: Coordinate): number {
  const earthRadius = 6371; // km
  
  const lat1 = point1.latitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;
  const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const deltaLng = (point2.longitude - point1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * 
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

/**
 * Calculate bearing between two points (0-360 degrees)
 */
function calculateBearing(start: Coordinate, end: Coordinate): number {
  const startLat = start.latitude * Math.PI / 180;
  const startLng = start.longitude * Math.PI / 180;
  const endLat = end.latitude * Math.PI / 180;
  const endLng = end.longitude * Math.PI / 180;
  
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  return bearing;
}

/**
 * Create a simulator that moves along a route over time
 * Version with callback - use this for components that need location updates
 */
export function createMovingLocationSimulator(
  route: Coordinate[], 
  durationMs: number,
  onLocationChange: (location: Coordinate) => void
) {
  let intervalId: NodeJS.Timeout | null = null;
  let currentIndex = 0;
  let isRunning = false;
  
  // Calculate time between points
  const timePerPoint = durationMs / (route.length - 1);
  
  const start = () => {
    if (isRunning) return;
    
    isRunning = true;
    currentIndex = 0;
    
    // Immediately send the first location
    if (route.length > 0) {
      onLocationChange({
        ...route[0],
        timestamp: Date.now(),
        speed: 0,
        heading: 0,
        accuracy: 10
      });
    }
    
    // Set up interval to move through the route
    intervalId = setInterval(() => {
      currentIndex++;
      
      if (currentIndex >= route.length) {
        // End of route reached
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
          isRunning = false;
        }
        return;
      }
      
      const currentPoint = route[currentIndex];
      const prevPoint = route[currentIndex - 1];
      
      // Calculate speed and heading
      const distanceM = haversineDistance(prevPoint, currentPoint) * 1000; // Convert km to meters
      const speedMps = distanceM / (timePerPoint / 1000); // m/s
      const speedKmh = speedMps * 3.6; // Convert m/s to km/h
      
      // Calculate heading (bearing) between points
      const heading = calculateBearing(prevPoint, currentPoint);
      
      // Add additional properties to the location
      const locationWithDetails: Coordinate = {
        ...currentPoint,
        timestamp: Date.now(),
        speed: speedKmh,
        heading,
        accuracy: 5 + Math.random() * 10 // Random accuracy between 5-15 meters
      };
      
      onLocationChange(locationWithDetails);
    }, timePerPoint);
    
    return true;
  };
  
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
  };
  
  return {
    start,
    stop,
    isRunning: () => isRunning
  };
} 