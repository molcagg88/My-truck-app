import React from "react";
import { View, Text } from "react-native";
import { MapPin, Navigation, Truck } from "lucide-react-native";

interface NavigationMapProps {
  // In a real app, you would pass coordinates, markers, etc.
  showDriverLocation?: boolean;
  showDestination?: boolean;
}

const NavigationMap = ({
  showDriverLocation = true,
  showDestination = true,
}: NavigationMapProps) => {
  return (
    <View className="w-full h-full bg-blue-50 dark:bg-neutral-900 relative">
      {/* Map Placeholder */}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-blue-500 dark:text-blue-400 font-medium">
          Navigation Map View
        </Text>
        <Text className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          (Map navigation will be implemented here)
        </Text>
      </View>

      {/* Map Elements */}
      <View className="absolute inset-0">
        {/* Route Line (Placeholder) */}
        <View className="absolute top-1/2 left-10 right-10 h-1 bg-red-500 opacity-70" />

        {/* Driver Marker */}
        {showDriverLocation && (
          <View className="absolute top-1/2 left-10 -translate-x-1/2 -translate-y-1/2">
            <View className="bg-red-600 rounded-full p-2">
              <Truck size={20} color="#ffffff" />
            </View>
            <View className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border-2 border-red-600" />
          </View>
        )}

        {/* Destination Marker */}
        {showDestination && (
          <View className="absolute top-1/2 right-10 -translate-x-1/2 -translate-y-1/2">
            <View className="bg-white dark:bg-gray-700 rounded-full p-2 border-2 border-blue-500">
              <Navigation size={20} color="#3b82f6" />
            </View>
            <View className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white border-2 border-blue-500" />
          </View>
        )}
      </View>

      {/* Map Controls (Placeholder) */}
      <View className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 rounded-lg shadow-md p-2">
        <View className="w-8 h-8 items-center justify-center">
          <Text className="text-gray-800 dark:text-white font-bold">+</Text>
        </View>
        <View className="w-8 h-px bg-gray-200 dark:bg-gray-600 my-1" />
        <View className="w-8 h-8 items-center justify-center">
          <Text className="text-gray-800 dark:text-white font-bold">-</Text>
        </View>
      </View>
    </View>
  );
};

export default NavigationMap;
