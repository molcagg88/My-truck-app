import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { getToken } from '../utils/auth';

interface LocationTrackerProps {
  driverId: string;
  onLocationUpdate?: (location: Location.LocationObject) => void;
}

function LocationTracker({ driverId, onLocationUpdate }: LocationTrackerProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    setupWebSocket();
    startLocationUpdates();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [driverId]);

  const setupWebSocket = async () => {
    try {
      const token = await getToken();
      const wsUrl = `ws://localhost:3000?token=${token}`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('WebSocket connected');
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      setWs(websocket);
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  };

  const startLocationUpdates = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Start watching position
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'LOCATION_UPDATE',
              driverId,
              location: {
                lat: newLocation.coords.latitude,
                lng: newLocation.coords.longitude,
              },
            }));
          }
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        }
      );

      return () => {
        locationSubscription.remove();
      };
    } catch (error) {
      console.error('Error starting location updates:', error);
      setErrorMsg('Error starting location updates');
    }
  };

  if (errorMsg) {
    return <div>Error: {errorMsg}</div>;
  }

  return (
    <div>
      {location ? (
        <div>
          <p>Latitude: {location.coords.latitude}</p>
          <p>Longitude: {location.coords.longitude}</p>
          <p>Accuracy: {location.coords.accuracy}m</p>
          <p>Last Update: {new Date(location.timestamp).toLocaleString()}</p>
        </div>
      ) : (
        <p>Getting location...</p>
      )}
    </div>
  );
}

export default LocationTracker; 