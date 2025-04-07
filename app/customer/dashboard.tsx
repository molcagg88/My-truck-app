import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Settings, MapPin, Calendar, Package, Truck, Clock, DollarSign, AlertCircle, List } from "lucide-react-native";
import { useTheme } from "../_layout";
import { useAuth } from "../auth/authContext";
import BookingCard from "../components/BookingCard";
import OrderHistoryList from "../components/OrderHistoryList";
import JobPaymentModal from "../components/JobPaymentModal";
import SafeAreaContainer from "../utils/SafeAreaContainer";
import customerService, { Order, CustomerStats } from "../services/customerService";
import { handleApiError } from "../services/apiUtils";

const CustomerDashboard = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "history">("bookings");
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [paymentPendingOrders, setPaymentPendingOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Order | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read active orders from localStorage
      const storedActiveOrders = parseInt(localStorage.getItem('activeOrders') || '0', 10);
      
      // Create mock orders based on the count
      const mockActiveOrders: Order[] = Array(storedActiveOrders).fill(null).map((_, index) => ({
        id: `order-${index + 1}`,
        status: 'pending',
        pickupLocation: 'Sample Location',
        destinationLocation: 'Sample Location',
        price: 350,
        date: new Date().toISOString(),
        truckType: 'Small Truck'
      }));

      setActiveOrders(mockActiveOrders);
      setPaymentPendingOrders([]); // No pending payments for now
      setOrderHistory([]); // No history for now

      // Set mock stats
      setStats({
        activeOrders: storedActiveOrders,
        totalOrders: storedActiveOrders,
        completedOrders: 0,
        totalSpent: 0
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
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

  const handleBookingPress = () => {
    router.push("/customer/booking");
  };

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: "/customer/tracking",
      params: { orderId },
    });
  };
  
  const handlePaymentSuccess = async () => {
    Alert.alert(
      "Payment Successful",
      "Your payment has been processed successfully. The driver will be notified.",
      [{ text: "OK" }]
    );
    await fetchDashboardData();
  };
  
  const handlePayButtonPress = (order: Order) => {
    setSelectedJob(order);
    setShowPaymentModal(true);
  };

  const handleActiveOrdersPress = () => {
    router.push("/customer/requests");
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
      {stats && (
        <View className="flex-row flex-wrap justify-between px-4 mb-4">
          <TouchableOpacity 
            className="bg-white dark:bg-neutral-800 rounded-lg p-4 w-[48%] mb-4 shadow-sm"
            onPress={handleActiveOrdersPress}
          >
            <View className="flex-row items-center mb-2">
              <Package size={20} color="#ef4444" />
              <Text className="ml-2 text-neutral-600 dark:text-neutral-400">Active Orders</Text>
            </View>
            <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
              {stats.activeOrders}
            </Text>
          </TouchableOpacity>
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
      )}
      
      {/* Booking Card */}
      <BookingCard onBookingInitiated={handleBookingPress} />

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
                onPress={handleBookingPress}
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

      {/* Payment Modal */}
      {selectedJob && (
        <JobPaymentModal
          isVisible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          jobId={selectedJob.id}
          bidAmount={selectedJob.price}
          bidderName={selectedJob.driver?.name || 'Assigned Driver'}
          pickupLocation={selectedJob.pickupLocation}
          destinationLocation={selectedJob.destinationLocation}
          isDarkMode={isDarkMode}
        />
      )}
    </SafeAreaContainer>
  );
};

export default CustomerDashboard;
