import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  DollarSign,
  Phone,
  MessageCircle,
} from "lucide-react-native";
import { useTheme } from "../_layout";
import NavigationMap from "../components/NavigationMap";
import OrderStatusTracker from "../components/OrderStatusTracker";

const JobDetailsScreen = () => {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { isDarkMode } = useTheme();
  const [currentStatus, setCurrentStatus] = useState<
    "confirmed" | "pickup" | "in_transit" | "delivered"
  >("pickup");

  // Mock job details
  const jobDetails = {
    id: jobId || "job123",
    customerName: "Tigist Haile",
    customerImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tigist",
    customerPhone: "+251987654321",
    customerRating: 4.5,
    pickupLocation: "Piassa, Addis Ababa",
    pickupDetails: "Blue building, 2nd floor",
    destinationLocation: "CMC, Addis Ababa",
    destinationDetails: "Green gate, residential area",
    distance: "12.3 km",
    estimatedTime: "40 mins",
    price: 520,
    currency: "ETB",
    cargoDescription: "Office furniture, 3 boxes",
    cargoWeight: "~150 kg",
  };

  const handleUpdateStatus = () => {
    if (currentStatus === "confirmed") setCurrentStatus("pickup");
    else if (currentStatus === "pickup") setCurrentStatus("in_transit");
    else if (currentStatus === "in_transit") setCurrentStatus("delivered");
    else if (currentStatus === "delivered") {
      // Complete the job and return to dashboard
      router.push("/driver/dashboard");
    }
  };

  const getActionButtonText = () => {
    switch (currentStatus) {
      case "confirmed":
        return "Arrived at Pickup";
      case "pickup":
        return "Start Delivery";
      case "in_transit":
        return "Confirm Delivery";
      case "delivered":
        return "Complete Job";
      default:
        return "Update Status";
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="flex-1">
        {/* Map View */}
        <View className="h-64 w-full">
          <NavigationMap />
          <TouchableOpacity
            className="absolute top-4 left-4 bg-white dark:bg-neutral-800 rounded-full p-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
          </TouchableOpacity>
        </View>

        {/* Job Details */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-800 dark:text-white">
              Job #{jobDetails.id.substring(0, 6)}
            </Text>
            <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
              <Text className="text-primary-600 dark:text-primary-400 font-medium">
                {currentStatus === "confirmed"
                  ? "Confirmed"
                  : currentStatus === "pickup"
                    ? "Pickup"
                    : currentStatus === "in_transit"
                      ? "In Transit"
                      : "Delivered"}
              </Text>
            </View>
          </View>

          {/* Order Status Tracker */}
          <View className="mb-4">
            <OrderStatusTracker
              currentStatus={currentStatus}
              estimatedDeliveryTime={jobDetails.estimatedTime}
            />
          </View>

          {/* Customer Info */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Customer
            </Text>
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: jobDetails.customerImage }}
                className="w-12 h-12 rounded-full bg-gray-200"
              />
              <View className="ml-3">
                <Text className="font-semibold text-neutral-800 dark:text-white">
                  {jobDetails.customerName}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500">★</Text>
                  <Text className="text-neutral-600 dark:text-neutral-400 ml-1">
                    {jobDetails.customerRating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity className="flex-1 mr-2 py-2 bg-primary-500 rounded-lg flex-row items-center justify-center">
                <Phone size={16} color="#ffffff" />
                <Text className="ml-2 text-white font-medium">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 ml-2 py-2 bg-gray-200 dark:bg-neutral-700 rounded-lg flex-row items-center justify-center">
                <MessageCircle
                  size={16}
                  color={isDarkMode ? "#ffffff" : "#374151"}
                />
                <Text className="ml-2 font-medium text-neutral-800 dark:text-white">
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Details */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Location Details
            </Text>
            <View className="mb-4">
              <View className="flex-row items-center mb-1">
                <MapPin size={16} color="#ef4444" />
                <Text className="ml-2 font-medium text-neutral-800 dark:text-white">
                  Pickup
                </Text>
              </View>
              <Text className="text-neutral-700 dark:text-neutral-300 ml-6 mb-1">
                {jobDetails.pickupLocation}
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 ml-6 text-sm">
                {jobDetails.pickupDetails}
              </Text>
            </View>
            <View>
              <View className="flex-row items-center mb-1">
                <MapPin size={16} color="#3b82f6" />
                <Text className="ml-2 font-medium text-neutral-800 dark:text-white">
                  Destination
                </Text>
              </View>
              <Text className="text-neutral-700 dark:text-neutral-300 ml-6 mb-1">
                {jobDetails.destinationLocation}
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 ml-6 text-sm">
                {jobDetails.destinationDetails}
              </Text>
            </View>
          </View>

          {/* Cargo Details */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Cargo Details
            </Text>
            <View className="flex-row items-center mb-2">
              <Package size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                {jobDetails.cargoDescription}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Estimated weight:
              </Text>
              <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                {jobDetails.cargoWeight}
              </Text>
            </View>
          </View>

          {/* Trip Summary */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Trip Summary
            </Text>
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Clock size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
                <Text className="ml-2 text-neutral-600 dark:text-neutral-400">
                  Estimated Time
                </Text>
              </View>
              <Text className="text-neutral-800 dark:text-white">
                {jobDetails.estimatedTime}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Distance
              </Text>
              <Text className="text-neutral-800 dark:text-white">
                {jobDetails.distance}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <DollarSign
                  size={16}
                  color={isDarkMode ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-neutral-600 dark:text-neutral-400">
                  Earnings
                </Text>
              </View>
              <Text className="text-neutral-800 dark:text-white font-bold">
                {jobDetails.currency} {jobDetails.price}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            className="py-4 bg-primary-500 rounded-lg items-center justify-center mb-4"
            onPress={handleUpdateStatus}
          >
            <Text className="text-white font-semibold">
              {getActionButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default JobDetailsScreen;
