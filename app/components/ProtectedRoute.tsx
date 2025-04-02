import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '../services/authService';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }
      
      // If admin role is required, check if user is admin
      if (requireAdmin) {
        const isAdmin = await authService.isAdmin();
        if (!isAdmin) {
          // Not an admin, redirect to unauthorized or home
          router.replace('/');
          return;
        }
      }
      
      // User is authorized to view this route
      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, requireAdmin]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Checking authorization...</Text>
      </View>
    );
  }

  // Only render children if authorized
  return authorized ? <>{children}</> : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
});
