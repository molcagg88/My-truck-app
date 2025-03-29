import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, Package } from "lucide-react-native";
import { useTheme } from "../_layout";
import LocationSelector from "../components/LocationSelector";
import TruckTypeSelector from "../components/TruckTypeSelector";
import PriceEstimate from "../components/PriceEstimate";

const BookingScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedTruckType, setSelectedTruckType] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [scheduledTime, setScheduledTime] = useState<"now" | "schedule">("now");

  // Estimated price based on selections
  const estimatedPrice = selectedTruckType
    ? selectedTruckType === "Small"
      ? 350
      : selectedTruckType === "Medium"
        ? 550
        : selectedTruckType === "Large"
          ? 850
          : 0
    : 0;

  const handleContinue = () => {
    if (pickupLocation && destinationLocation && selectedTruckType) {
      router.push({
        pathname: "/customer/payment",
        params: {
          price: estimatedPrice,
          pickup: pickupLocation,
          destination: destinationLocation,
          truckType: selectedTruckType,
          cargo: cargoDescription,
          scheduled: scheduledTime,
        },
      });
    }
  };

  const isFormComplete =
    pickupLocation && destinationLocation && selectedTruckType;

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">
          Book a Truck
        </Text>

        {/* Location Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Locations
          </Text>
          <LocationSelector
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            onPickupChange={setPickupLocation}
            onDestinationChange={setDestinationLocation}
          />
        </View>

        {/* Truck Type Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Truck Type
          </Text>
          <TruckTypeSelector
            selectedType={selectedTruckType}
            onSelectType={setSelectedTruckType}
          />
        </View>

        {/* Cargo Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Cargo Details
          </Text>
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Package size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                What are you shipping?
              </Text>
            </View>
            <TouchableOpacity className="py-2 px-4 bg-gray-100 dark:bg-neutral-700 rounded-lg">
              <Text className="text-neutral-600 dark:text-neutral-400">
                {cargoDescription || "Tap to describe your cargo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scheduling */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            When do you need it?
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 mr-2 p-4 rounded-lg flex-row items-center justify-center ${scheduledTime === "now" ? "bg-primary-500" : "bg-white dark:bg-neutral-800"}`}
              onPress={() => setScheduledTime("now")}
            >
              <Clock
                size={20}
                color={
                  scheduledTime === "now"
                    ? "#ffffff"
                    : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
              <Text
                className={`ml-2 font-medium ${scheduledTime === "now" ? "text-white" : "text-neutral-700 dark:text-neutral-300"}`}
              >
                Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ml-2 p-4 rounded-lg flex-row items-center justify-center ${scheduledTime === "schedule" ? "bg-primary-500" : "bg-white dark:bg-neutral-800"}`}
              onPress={() => setScheduledTime("schedule")}
            >
              <Calendar
                size={20}
                color={
                  scheduledTime === "schedule"
                    ? "#ffffff"
                    : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
              <Text
                className={`ml-2 font-medium ${scheduledTime === "schedule" ? "text-white" : "text-neutral-700 dark:text-neutral-300"}`}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Estimate */}
        {isFormComplete && (
          <View className="mb-6">
            <PriceEstimate
              price={estimatedPrice}
              currency="ETB"
              estimatedTime="45 min"
              distance="7.5 km"
            />
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isFormComplete}
          className={`py-4 rounded-lg ${!isFormComplete ? "bg-neutral-300 dark:bg-neutral-700" : "bg-primary-500"}`}
        >
          <Text className="text-white font-semibold text-center">
            Continue to Payment
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BookingScreen;
