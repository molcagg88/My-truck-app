import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Truck, Clock, MapPin } from "lucide-react-native";
import { useTheme } from "../_layout";
import OrderHistoryList from "../components/OrderHistoryList";
import SafeAreaContainer from "../utils/SafeAreaContainer";

const RequestsScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Read active orders from localStorage
      const storedActiveOrders = parseInt(localStorage.getItem('activeOrders') || '0', 10);
      
      // Create mock orders based on the count
      const mockActiveOrders = Array(storedActiveOrders).fill(null).map((_, index) => ({
        id: `order-${index + 1}`,
        status: 'pending',
        pickupLocation: 'Sample Location',
        destinationLocation: 'Sample Location',
        price: 350,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
        truckType: 'Small Truck'
      }));

      setActiveOrders(mockActiveOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/customer/tracking",
      params: { orderId },
    });
  };

  return (
    <SafeAreaContainer
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
          My Requests
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-600 dark:text-neutral-400">Loading orders...</Text>
        </View>
      ) : activeOrders.length > 0 ? (
        <OrderHistoryList orders={activeOrders} onOrderPress={handleOrderPress} />
      ) : (
        <View className="flex-1 bg-white dark:bg-neutral-800 rounded-lg p-8 items-center justify-center shadow-sm m-4">
          <Truck size={40} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
          <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-4 mb-2">
            No active requests
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm mb-4">
            You don't have any active requests at the moment
          </Text>
          <TouchableOpacity
            className="bg-red-500 py-2 px-6 rounded-lg"
            onPress={() => router.push("/customer/booking")}
          >
            <Text className="text-white font-medium">Book a Truck</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaContainer>
  );
};

export default RequestsScreen; 