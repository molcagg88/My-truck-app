import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from './AuthContext';
import { users } from '../services/api';
import { useError } from './ErrorContext';
import { useLanguage } from './LanguageContext';
import { FEATURES } from '../config';

interface LocationContextType {
  currentLocation: Location.LocationObject | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  updateLocation: (location: Location.LocationObject) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const { user } = useAuth();
  const { handleError } = useError();
  const { t } = useLanguage();

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      handleError(error, t('location.permissionError'));
      return false;
    }
  }, [handleError, t]);

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        Alert.alert(
          t('location.permissionRequired'),
          t('location.permissionMessage'),
          [{ text: t('common.ok') }]
        );
      }
      
      return granted;
    } catch (error) {
      handleError(error, t('location.permissionError'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const hasPermission = await checkPermission();
      
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCurrentLocation(location);
      return location;
    } catch (error) {
      handleError(error, t('location.fetchError'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (location: Location.LocationObject) => {
    try {
      if (!user) return;

      if (FEATURES.MAPS_INTEGRATION) {
        // Real maps integration would go here
        throw new Error('Maps integration not implemented');
      } else {
        // Development mode: Update location in database
        await users.updateLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        });
      }
    } catch (error) {
      handleError(error, t('location.updateError'));
    }
  };

  // Start location updates when component mounts
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startLocationUpdates = async () => {
      try {
        const hasPermission = await checkPermission();
        if (!hasPermission) return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            setCurrentLocation(location);
            updateLocation(location);
          }
        );
      } catch (error) {
        handleError(error, t('location.watchError'));
      }
    };

    startLocationUpdates();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [checkPermission, handleError, t]);

  const value = {
    currentLocation,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    updateLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 