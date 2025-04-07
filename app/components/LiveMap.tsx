import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';
import { MapView, Marker, Polyline } from './MockMapView';
import { createMovingLocationSimulator, getMockRoute, ADDIS_ABABA_CENTER, ADDIS_ABABA_LOCATIONS } from '../utils/mockMapData';

interface LiveMapProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onLocationSelect?: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  showCurrentLocation?: boolean;
  showRoute?: boolean;
  destination?: {
    latitude: number;
    longitude: number;
  };
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  style?: any;
}

const LiveMap: React.FC<LiveMapProps> = ({
  initialLocation,
  onLocationSelect,
  showCurrentLocation = true,
  showRoute = false,
  destination,
  driverLocation,
  style
}) => {
  const { isDarkMode } = useTheme();
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || ADDIS_ABABA_CENTER
  );
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [mockDriverLocation, setMockDriverLocation] = useState(driverLocation);
  const locationSimulatorRef = useRef<any>(null);
  
  // Set up a mock location permission request
  const requestLocationPermission = async () => {
    // Simulate a delay for permission request
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful permission
    return true;
  };
  
  useEffect(() => {
    // Request location permission when component mounts
    const setupLocation = async () => {
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission) {
        // Start with a random location in Addis Ababa
        const randomStartLocation = 
          ADDIS_ABABA_LOCATIONS[Math.floor(Math.random() * ADDIS_ABABA_LOCATIONS.length)];
        
        setCurrentLocation({
          latitude: randomStartLocation.latitude,
          longitude: randomStartLocation.longitude
        });
      } else {
        Alert.alert(
          "Location Permission",
          "Location permission is required to use this feature."
        );
      }
    };
    
    setupLocation();
  }, []);
  
  // Generate route when destination changes
  useEffect(() => {
    if (destination && currentLocation) {
      const route = getMockRoute(currentLocation, destination);
      setRouteCoordinates(route);
      
      // Clean up previous simulator
      if (locationSimulatorRef.current) {
        locationSimulatorRef.current.stop();
      }
      
      // Create driver movement simulator if needed
      if (showRoute) {
        const simulator = createMovingLocationSimulator(
          route,
          30000, // 30 seconds to complete route
          (location) => {
            setMockDriverLocation(location);
          }
        );
        
        simulator.start();
        locationSimulatorRef.current = simulator;
      }
    }
    
    return () => {
      if (locationSimulatorRef.current) {
        locationSimulatorRef.current.stop();
      }
    };
  }, [destination, currentLocation, showRoute]);
  
  // Update driver location from props if provided
  useEffect(() => {
    if (driverLocation) {
      setMockDriverLocation(driverLocation);
    }
  }, [driverLocation]);
  
  const handleMapPress = (e: any) => {
    if (onLocationSelect) {
      const coordinates = {
        latitude: e.nativeEvent?.coordinate?.latitude || ADDIS_ABABA_CENTER.latitude,
        longitude: e.nativeEvent?.coordinate?.longitude || ADDIS_ABABA_CENTER.longitude
      };
      
      // In our mock implementation, we'll simulate map press by selecting a random location
      const randomLocation = 
        ADDIS_ABABA_LOCATIONS[Math.floor(Math.random() * ADDIS_ABABA_LOCATIONS.length)];
      
      setSelectedLocation(randomLocation);
      onLocationSelect(randomLocation);
    }
  };
  
  const zoomIn = () => {
    if (mapRef.current) {
      // In a real implementation, this would call the map's animateToRegion
      // For our mock, we just need to show the control
    }
  };
  
  const zoomOut = () => {
    if (mapRef.current) {
      // In a real implementation, this would call the map's animateToRegion
      // For our mock, we just need to show the control
    }
  };
  
  const centerOnUser = () => {
    if (mapRef.current && currentLocation) {
      // In a real implementation, this would center on the user
      // For our mock, we just need to show the control
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={showCurrentLocation}
        followsUserLocation={false}
      >
        {showCurrentLocation && (
          <Marker
            coordinate={currentLocation}
            title="You are here"
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}
        
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
          />
        )}
        
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
          >
            <View style={styles.destinationMarker}>
              <Ionicons 
                name="location" 
                size={24} 
                color="#ef4444"
              />
            </View>
          </Marker>
        )}
        
        {mockDriverLocation && (
          <Marker
            coordinate={mockDriverLocation}
            title="Driver"
          >
            <View style={styles.driverMarker}>
              <Ionicons 
                name="car" 
                size={20} 
                color={isDarkMode ? '#3b82f6' : '#1d4ed8'}
              />
            </View>
          </Marker>
        )}
        
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={isDarkMode ? '#3b82f6' : '#1d4ed8'}
          />
        )}
      </MapView>
      
      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: isDarkMode ? '#374151' : 'white' }]} 
          onPress={zoomIn}
        >
          <Ionicons name="add" size={24} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: isDarkMode ? '#374151' : 'white' }]} 
          onPress={zoomOut}
        >
          <Ionicons name="remove" size={24} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, { backgroundColor: isDarkMode ? '#374151' : 'white' }]} 
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={24} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>

      {onLocationSelect && (
        <View style={styles.footer}>
          <Text style={[styles.hintText, { color: isDarkMode ? 'white' : 'black' }]}>
            Tap on the map to select a location
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default LiveMap;
