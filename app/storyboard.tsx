import React from "react";
import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "./_layout";

// Import components to showcase
import BookingCard from "./components/BookingCard";
import DriverInfo from "./components/DriverInfo";
import LocationSelector from "./components/LocationSelector";
import TruckTypeSelector from "./components/TruckTypeSelector";
import PriceEstimate from "./components/PriceEstimate";
import OrderStatusTracker from "./components/OrderStatusTracker";
import PaymentOptions from "./components/PaymentOptions";
import RequestsList from "./components/RequestsList";
import EarningsSummary from "./components/EarningsSummary";

export default function StoryboardScreen() {
  const { isDarkMode } = useTheme();

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
      <Stack.Screen options={{ title: "Component Storyboard" }} />

      <Text className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Component Storyboard
      </Text>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          BookingCard
        </Text>
        <BookingCard />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          DriverInfo
        </Text>
        <DriverInfo />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          LocationSelector
        </Text>
        <LocationSelector
          pickupLocation="Bole, Addis Ababa"
          destinationLocation="Megenagna, Addis Ababa"
        />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          TruckTypeSelector
        </Text>
        <TruckTypeSelector selectedType="Medium" />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          PriceEstimate
        </Text>
        <PriceEstimate />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          OrderStatusTracker
        </Text>
        <OrderStatusTracker currentStatus="in_transit" />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          PaymentOptions
        </Text>
        <PaymentOptions />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          RequestsList
        </Text>
        <RequestsList />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          EarningsSummary
        </Text>
        <EarningsSummary />
      </View>
    </View>
  );
}
