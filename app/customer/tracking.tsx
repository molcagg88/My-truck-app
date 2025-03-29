import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Star } from "lucide-react-native";
import { useTheme } from "../_layout";
import LiveMap from "../components/LiveMap";
import OrderStatusTracker from "../components/OrderStatusTracker";
import DriverInfo from "../components/DriverInfo";

const TrackingScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [currentStatus, setCurrentStatus] = useState<
    "confirmed" | "pickup" | "in_transit" | "delivered"
  >("pickup");

  // Mock order details
  const orderDetails = {
    orderId: "#TRK-12345",
    pickupLocation: "Bole, Addis Ababa",
    destinationLocation: "Megenagna, Addis Ababa",
    estimatedDeliveryTime: "45 min",
    distance: "7.5 km",
    price: 350,
    currency: "ETB",
    truckType: "Medium Truck",
    driverName: "Abebe Kebede",
    driverPhone: "+251912345678",
    driverRating: 4.8,
    driverImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=driver123",
    licensePlate: "AA 12345",
  };

  const handleComplete = () => {
    if (currentStatus === "confirmed") setCurrentStatus("pickup");
    else if (currentStatus === "pickup") setCurrentStatus("in_transit");
    else if (currentStatus === "in_transit") setCurrentStatus("delivered");
    else if (currentStatus === "delivered") {
      // Show rating dialog or navigate to rating screen
      router.push("/customer/dashboard");
    }
  };

  const handleCancel = () => {
    // Show cancellation confirmation
    router.push("/customer/dashboard");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="flex-1">
        {/* Map View */}
        <View className="h-64 w-full">
          <LiveMap />
          <TouchableOpacity
            className="absolute top-4 left-4 bg-white dark:bg-neutral-800 rounded-full p-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
          </TouchableOpacity>
        </View>

        {/* Order Details */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-800 dark:text-white">
              Order {orderDetails.orderId}
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
              estimatedDeliveryTime={orderDetails.estimatedDeliveryTime}
            />
          </View>

          {/* Driver Info */}
          <View className="mb-4">
            <DriverInfo
              driverName={orderDetails.driverName}
              driverImage={orderDetails.driverImage}
              phoneNumber={orderDetails.driverPhone}
              rating={orderDetails.driverRating}
              vehicleInfo={orderDetails.truckType}
              licensePlate={orderDetails.licensePlate}
            />
          </View>

          {/* Trip Details */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Trip Details
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Pickup
              </Text>
              <Text className="text-neutral-800 dark:text-white font-medium">
                {orderDetails.pickupLocation}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Destination
              </Text>
              <Text className="text-neutral-800 dark:text-white font-medium">
                {orderDetails.destinationLocation}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Distance
              </Text>
              <Text className="text-neutral-800 dark:text-white font-medium">
                {orderDetails.distance}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Price
              </Text>
              <Text className="text-neutral-800 dark:text-white font-medium">
                {orderDetails.currency} {orderDetails.price}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {currentStatus !== "delivered" ? (
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="flex-1 mr-2 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg items-center justify-center"
                onPress={handleCancel}
              >
                <Text className="font-medium text-neutral-800 dark:text-white">
                  Cancel Order
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 ml-2 py-3 bg-primary-500 rounded-lg items-center justify-center"
                onPress={handleComplete}
              >
                <Text className="font-medium text-white">
                  {currentStatus === "in_transit"
                    ? "Confirm Delivery"
                    : "Track Order"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="py-3 bg-primary-500 rounded-lg items-center justify-center mb-4"
              onPress={handleComplete}
            >
              <View className="flex-row items-center">
                <Star size={20} color="#ffffff" />
                <Text className="font-medium text-white ml-2">
                  Rate Your Experience
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default TrackingScreen;
