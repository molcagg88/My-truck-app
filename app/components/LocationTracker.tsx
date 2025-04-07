import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';
import { createMovingLocationSimulator, ADDIS_ABABA_CENTER, getMockRoute, findNearbyLocation } from '../utils/mockMapData';

// Mock interval for updates (in milliseconds)
const LOCATION_UPDATE_INTERVAL = 5000;

interface LocationTrackerProps {
  isEnabled?: boolean;
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
  }) => void;
  showControls?: boolean;
  userId?: string;
  apiUrl?: string;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  isEnabled = false,
  onLocationChange,
  showControls = true,
  userId,
  apiUrl = 'http://localhost:3000/api/location',
}) => {
  const { isDarkMode } = useTheme();
  const [isTracking, setIsTracking] = useState(isEnabled);
  const [currentLocation, setCurrentLocation] = useState(ADDIS_ABABA_CENTER);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('granted'); // Mock: always granted
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const locationSimulatorRef = useRef<any>(null);
  
  // Mock function to request location permissions - always successful
  const requestLocationPermissions = async () => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
    setPermissionStatus('granted');
    return 'granted';
  };
  
  // Mock function to start location updates
  const startLocationUpdates = async () => {
    if (permissionStatus !== 'granted') {
      const status = await requestLocationPermissions();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to track your location.'
        );
        return;
      }
    }
    
    setIsTracking(true);
    
    // Clean up any existing simulator
    if (locationSimulatorRef.current) {
      locationSimulatorRef.current.stop();
      locationSimulatorRef.current = null;
    }
    
    // Create a moving location simulator
    // Generate a random path for simulation
    const destination = findNearbyLocation(currentLocation, 2);
    const route = getMockRoute(currentLocation, destination);
    
    // Create simulator with duration of 5 minutes (300000ms)
    const simulator = createMovingLocationSimulator(
      route,
      300000,
      (location) => {
        handleLocationUpdate(location);
      }
    );
    
    simulator.start();
    locationSimulatorRef.current = simulator;
    
    // Also set up a separate interval for more random updates
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }
    
    locationUpdateInterval.current = setInterval(() => {
      // Add some random jitter to the location occasionally
      if (Math.random() > 0.7) {
        const jitteredLocation = {
          latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.0005,
          longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.0005,
          accuracy: Math.random() * 10 + 5,
          heading: Math.random() * 360,
          speed: Math.random() * 15,
          timestamp: Date.now()
        };
        handleLocationUpdate(jitteredLocation);
      }
    }, LOCATION_UPDATE_INTERVAL);
  };
  
  // Stop location updates
  const stopLocationUpdates = () => {
    setIsTracking(false);
    
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
      locationUpdateInterval.current = null;
    }
    
    if (locationSimulatorRef.current) {
      locationSimulatorRef.current.stop();
      locationSimulatorRef.current = null;
    }
  };
  
  // Handle location updates and send to server if needed
  const handleLocationUpdate = (location: any) => {
    setCurrentLocation(location);
    
    // Call the callback if provided
    if (onLocationChange) {
      onLocationChange(location);
    }
    
    // Send to server if userId is provided
    if (userId) {
      sendLocationToServer(location);
    }
  };
  
  // Mock send location to server
  const sendLocationToServer = async (location: any) => {
    if (!userId) return;
    
    try {
      console.log(`[MOCK] Sending location to server: ${JSON.stringify(location)}`);
      
      // This is just a mock implementation - no actual API call
      // In a real implementation, this would be:
      /*
      const response = await fetch(`${apiUrl}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
          timestamp: location.timestamp || Date.now(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      */
    } catch (error) {
      console.error('Error sending location update:', error);
    }
  };
  
  // Toggle background mode (this is just for UI, not functional in mock)
  const toggleBackgroundMode = () => {
    setIsBackgroundMode(!isBackgroundMode);
  };
  
  // Start/stop tracking based on isEnabled prop
  useEffect(() => {
    if (isEnabled && !isTracking) {
      startLocationUpdates();
    } else if (!isEnabled && isTracking) {
      stopLocationUpdates();
    }
    
    // Cleanup function
    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
      if (locationSimulatorRef.current) {
        locationSimulatorRef.current.stop();
      }
    };
  }, [isEnabled]);
  
  if (!showControls && !isTracking) {
    return null; // Don't render anything if tracking is off and controls are hidden
  }

  return (
    <View style={styles.container}>
      {showControls && (
        <View style={[
          styles.controlsContainer,
          { backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={[
            styles.title,
            { color: isDarkMode ? '#ffffff' : '#1f2937' }
          ]}>
            Location Tracker {isTracking ? '(Active)' : '(Inactive)'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.trackingButton,
                { backgroundColor: isTracking ? '#ef4444' : '#10b981' }
              ]}
              onPress={isTracking ? stopLocationUpdates : startLocationUpdates}
            >
              <Ionicons
                name={isTracking ? 'stop-circle' : 'play'}
                size={20}
                color="#ffffff"
              />
              <Text style={styles.buttonText}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.backgroundButton,
                { backgroundColor: isBackgroundMode ? '#3b82f6' : '#6b7280' }
              ]}
              onPress={toggleBackgroundMode}
            >
              <Ionicons
                name={isBackgroundMode ? 'layers' : 'layers-outline'}
                size={20}
                color="#ffffff"
              />
              <Text style={styles.buttonText}>
                {isBackgroundMode ? 'Background On' : 'Background Off'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isTracking && currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={[styles.locationText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>
                Lat: {currentLocation.latitude.toFixed(6)}
              </Text>
              <Text style={[styles.locationText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>
                Lng: {currentLocation.longitude.toFixed(6)}
              </Text>
              {currentLocation.speed !== undefined && (
                <Text style={[styles.locationText, { color: isDarkMode ? '#d1d5db' : '#4b5563' }]}>
                  Speed: {Math.round(currentLocation.speed)} km/h
                </Text>
              )}
            </View>
          )}
        </View>
      )}
      
      {isTracking && !showControls && (
        <View style={[
          styles.minimizedContainer,
          { backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' }
        ]}>
          <Ionicons
            name="location"
            size={18}
            color={isDarkMode ? '#3b82f6' : '#ef4444'}
          />
          <Text style={[
            styles.minimizedText,
            { color: isDarkMode ? '#ffffff' : '#1f2937' }
          ]}>
            Tracking Active
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  controlsContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  backgroundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
  },
  locationInfo: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  locationText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    marginBottom: 4,
  },
  minimizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  minimizedText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default LocationTracker; 