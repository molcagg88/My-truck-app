import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';
import LiveMap from '../components/LiveMap';
import LocationTracker from '../components/LocationTracker';
import { MOCK_LOCATIONS, Coordinate } from '../utils/mockMapData';
import { Stack } from 'expo-router';

export default function MapDemoScreen() {
  const { isDarkMode } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [driverLocation, setDriverLocation] = useState<Coordinate | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Demo options
  const [showDriver, setShowDriver] = useState(true);
  const [showCurrentLocation, setShowCurrentLocation] = useState(true);
  
  // Handle location updates from the tracker
  const handleLocationUpdate = (location: Coordinate) => {
    setDriverLocation(location);
  };
  
  // Select a random destination
  const selectRandomDestination = () => {
    const randomIndex = Math.floor(Math.random() * MOCK_LOCATIONS.length);
    setDestination({
      latitude: MOCK_LOCATIONS[randomIndex].coordinate.latitude,
      longitude: MOCK_LOCATIONS[randomIndex].coordinate.longitude
    });
  };
  
  // Start a trip with the current destination
  const startTrip = () => {
    setShowRoute(true);
  };
  
  // End the current trip
  const endTrip = () => {
    setShowRoute(false);
  };
  
  // Handle when a user selects a location on the map
  const handleLocationSelect = (location: Coordinate) => {
    setSelectedLocation(location);
    if (showLocationPicker) {
      setDestination(location);
      setShowLocationPicker(false);
    }
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          title: "Map Demo",
          headerBackTitle: "Back",
        }}
      />
      
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }
      ]}>
        <View style={styles.mapContainer}>
          <LiveMap
            initialLocation={driverLocation || undefined}
            showCurrentLocation={showCurrentLocation}
            onLocationSelect={handleLocationSelect}
            showRoute={showRoute}
            destination={destination || undefined}
            driverLocation={showDriver ? driverLocation || undefined : undefined}
            style={styles.map}
          />
        </View>
        
        <ScrollView 
          style={[
            styles.controlsContainer,
            { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }
          ]}
        >
          <Text style={[
            styles.title,
            { color: isDarkMode ? '#ffffff' : '#0f172a' }
          ]}>
            Mock Map Controls
          </Text>
          
          <LocationTracker
            isEnabled={isTracking}
            onLocationChange={handleLocationUpdate}
            showControls={true}
            userId="user-123"
          />
          
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#e2e8f0' : '#334155' }
            ]}>
              Map Options
            </Text>
            
            <View style={styles.optionRow}>
              <Text style={[
                styles.optionText,
                { color: isDarkMode ? '#cbd5e1' : '#475569' }
              ]}>
                Show Current Location
              </Text>
              <Switch
                value={showCurrentLocation}
                onValueChange={setShowCurrentLocation}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
              />
            </View>
            
            <View style={styles.optionRow}>
              <Text style={[
                styles.optionText,
                { color: isDarkMode ? '#cbd5e1' : '#475569' }
              ]}>
                Show Driver
              </Text>
              <Switch
                value={showDriver}
                onValueChange={setShowDriver}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
              />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#e2e8f0' : '#334155' }
            ]}>
              Destination & Route
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }
                ]}
                onPress={() => setShowLocationPicker(true)}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={isDarkMode ? '#3b82f6' : '#3b82f6'}
                />
                <Text style={[
                  styles.buttonText,
                  { color: isDarkMode ? '#f8fafc' : '#334155' }
                ]}>
                  Pick Location
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }
                ]}
                onPress={selectRandomDestination}
              >
                <Ionicons
                  name="shuffle"
                  size={20}
                  color={isDarkMode ? '#3b82f6' : '#3b82f6'}
                />
                <Text style={[
                  styles.buttonText,
                  { color: isDarkMode ? '#f8fafc' : '#334155' }
                ]}>
                  Random Destination
                </Text>
              </TouchableOpacity>
            </View>
            
            {destination && (
              <View style={[
                styles.destinationCard,
                { backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }
              ]}>
                <Ionicons
                  name="flag"
                  size={24}
                  color={isDarkMode ? '#f97316' : '#ea580c'}
                />
                <View style={styles.destinationInfo}>
                  <Text style={[
                    styles.destinationTitle,
                    { color: isDarkMode ? '#f8fafc' : '#0f172a' }
                  ]}>
                    Destination Selected
                  </Text>
                  <Text style={[
                    styles.destinationCoords,
                    { color: isDarkMode ? '#cbd5e1' : '#475569' }
                  ]}>
                    {destination.latitude.toFixed(6)}, {destination.longitude.toFixed(6)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDestination(null)}>
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={isDarkMode ? '#cbd5e1' : '#64748b'}
                  />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.tripButtons}>
              <TouchableOpacity
                style={[
                  styles.tripButton,
                  { 
                    backgroundColor: showRoute ? '#cbd5e1' : '#22c55e',
                    opacity: (!destination || showRoute) ? 0.5 : 1
                  }
                ]}
                onPress={startTrip}
                disabled={!destination || showRoute}
              >
                <Text style={[
                  styles.tripButtonText,
                  { color: showRoute ? '#64748b' : '#ffffff' }
                ]}>
                  Start Trip
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tripButton,
                  {
                    backgroundColor: !showRoute ? '#cbd5e1' : '#ef4444',
                    opacity: !showRoute ? 0.5 : 1
                  }
                ]}
                onPress={endTrip}
                disabled={!showRoute}
              >
                <Text style={[
                  styles.tripButtonText,
                  { color: !showRoute ? '#64748b' : '#ffffff' }
                ]}>
                  End Trip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {showLocationPicker && (
            <View style={[
              styles.pickerOverlay,
              { backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(241, 245, 249, 0.9)' }
            ]}>
              <Text style={[
                styles.pickerText,
                { color: isDarkMode ? '#f8fafc' : '#0f172a' }
              ]}>
                Tap on the map to select a location
              </Text>
              <TouchableOpacity 
                style={styles.pickerCloseButton}
                onPress={() => setShowLocationPicker(false)}
              >
                <Text style={styles.pickerCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    fontWeight: '500',
    marginLeft: 8,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  destinationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destinationTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  destinationCoords: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tripButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  tripButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  pickerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  pickerCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  pickerCloseText: {
    color: '#ffffff',
    fontWeight: '600',
  },
}); 