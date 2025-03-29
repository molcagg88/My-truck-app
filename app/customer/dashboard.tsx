import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Bell, Settings, MapPin, Calendar } from "lucide-react-native";
import { useTheme } from "../_layout";
import BookingCard from "../components/BookingCard";
import OrderHistoryList from "../components/OrderHistoryList";

const CustomerDashboard = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<"bookings" | "history">(
    "bookings",
  );

  const handleBookingInitiated = () => {
    router.push("/customer/booking");
  };

  const handleViewOrder = (orderId: string) => {
    router.push({
      pathname: "/customer/tracking",
      params: { orderId },
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <View className="p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            Hello, Abebe
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
      <View className="p-4">
        {activeTab === "bookings" ? (
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-8 items-center justify-center shadow-sm">
            <Calendar size={40} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-4 mb-2">
              No active bookings
            </Text>
            <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm">
              Book a truck to get started
            </Text>
            <TouchableOpacity
              className="mt-4 py-2 px-4 bg-red-500 rounded-lg"
              onPress={handleBookingInitiated}
            >
              <Text className="text-white font-medium">Book Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <OrderHistoryList onViewOrder={handleViewOrder} />
        )}
      </View>
    </ScrollView>
  );
};

export default CustomerDashboard;
