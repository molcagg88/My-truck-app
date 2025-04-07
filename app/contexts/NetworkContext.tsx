import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean;
  networkType: string | null;
  checkConnection: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [networkType, setNetworkType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      setNetworkType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      setNetworkType(state.type);

      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking network connection:', error);
      Alert.alert(
        'Connection Error',
        'Unable to check network connection. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const value = {
    isConnected,
    isInternetReachable,
    networkType,
    checkConnection,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}; 