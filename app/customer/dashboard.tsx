import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Settings, MapPin, Calendar, Package, Truck, Clock, DollarSign } from "lucide-react-native";
import { useTheme } from "../_layout";
import { useAuth } from "../auth/authContext";
import BookingCard from "../components/BookingCard";
import OrderHistoryList from "../components/OrderHistoryList";
import customerService, { Order, CustomerStats } from "../services/customerService";
import { handleApiError } from "../services/apiUtils";
import SafeAreaContainer from "../utils/SafeAreaContainer";

const CustomerDashboard = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "history">("bookings");
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, activeOrdersData, historyData] = await Promise.all([
        customerService.getStats(),
        customerService.getActiveOrders(),
        customerService.getOrderHistory()
      ]);
      setStats(statsData);
      setActiveOrders(activeOrdersData);
      setOrderHistory(historyData);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(handleApiError(error, 'Failed to load dashboard data. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleBookingInitiated = () => {
    router.push("/customer/booking");
  };

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/customer/tracking",
      params: { orderId },
    });
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View className="flex-row flex-wrap justify-between px-4 mb-4">
        <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-[48%] mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Package size={20} color="#ef4444" />
            <Text className="ml-2 text-neutral-600 dark:text-neutral-400">Active Orders</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            {stats.activeOrders}
          </Text>
        </View>
        <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-[48%] mb-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <Clock size={20} color="#ef4444" />
            <Text className="ml-2 text-neutral-600 dark:text-neutral-400">Total Orders</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            {stats.totalOrders}
          </Text>
        </View>
        <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-[48%] shadow-sm">
          <View className="flex-row items-center mb-2">
            <Truck size={20} color="#ef4444" />
            <Text className="ml-2 text-neutral-600 dark:text-neutral-400">Completed</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            {stats.completedOrders}
          </Text>
        </View>
        <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-[48%] shadow-sm">
          <View className="flex-row items-center mb-2">
            <DollarSign size={20} color="#ef4444" />
            <Text className="ml-2 text-neutral-600 dark:text-neutral-400">Total Spent</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            ETB {stats.totalSpent.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaContainer scrollable={false}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-600 dark:text-neutral-400">Loading dashboard...</Text>
        </View>
      </SafeAreaContainer>
    );
  }

  if (error) {
    return (
      <SafeAreaContainer scrollable={false}>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-red-500 py-2 px-4 rounded-lg"
            onPress={fetchDashboardData}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            Hello, {user?.name || 'User'}
          </Text>
          <Text className="text-neutral-600 dark:text-neutral-400">
            Where are you shipping today?
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            className="mr-4"
            onPress={() => router.push("/notifications")}
          >
            <Bell size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Settings size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {renderStats()}

      {/* Booking Card */}
      <BookingCard onBookingInitiated={handleBookingInitiated} />

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 dark:border-neutral-800 mx-4 mt-4">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "bookings" ? "border-b-2 border-red-500" : ""}`}
          onPress={() => setActiveTab("bookings")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "bookings" ? "text-red-500" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            Active Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "history" ? "border-b-2 border-red-500" : ""}`}
          onPress={() => setActiveTab("history")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "history" ? "text-red-500" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === "bookings" ? (
          activeOrders.length > 0 ? (
            <OrderHistoryList orders={activeOrders} onOrderPress={handleOrderPress} />
          ) : (
            <View className="flex-1 bg-white dark:bg-neutral-800 rounded-lg p-8 items-center justify-center shadow-sm m-4">
              <Calendar size={40} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-4 mb-2">
                No active bookings
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm mb-4">
                You don't have any active bookings at the moment
              </Text>
              <TouchableOpacity
                className="bg-red-500 py-2 px-6 rounded-lg"
                onPress={handleBookingInitiated}
              >
                <Text className="text-white font-medium">Book Now</Text>
              </TouchableOpacity>
            </View>
          )
        ) : orderHistory.length > 0 ? (
          <OrderHistoryList orders={orderHistory} onOrderPress={handleOrderPress} />
        ) : (
          <View className="flex-1 bg-white dark:bg-neutral-800 rounded-lg p-8 items-center justify-center shadow-sm m-4">
            <Clock size={40} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-4">
              No order history yet
            </Text>
            <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm">
              Your completed orders will appear here
            </Text>
          </View>
        )}
      </View>
    </SafeAreaContainer>
  );
};

export default CustomerDashboard;
