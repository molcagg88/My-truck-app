import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, ArrowDown } from "lucide-react-native";

interface LocationSelectorProps {
  pickupLocation?: string;
  destinationLocation?: string;
  onPickupChange?: (location: string) => void;
  onDestinationChange?: (location: string) => void;
}

const LocationSelector = ({
  pickupLocation = "",
  destinationLocation = "",
  onPickupChange = () => {},
  onDestinationChange = () => {},
}: LocationSelectorProps) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      {/* Pickup Location */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MapPin size={18} color="#dc2626" />
          <Text className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
            Pickup Location
          </Text>
        </View>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
          onPress={() => onPickupChange(pickupLocation)}
        >
          <Text
            className={`${pickupLocation ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
          >
            {pickupLocation || "Enter pickup location"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connector */}
      <View className="flex-row items-center justify-center mb-4">
        <View className="w-0.5 h-6 bg-gray-200 dark:bg-gray-600" />
        <View className="bg-gray-200 dark:bg-gray-600 rounded-full p-1">
          <ArrowDown size={16} color="#6b7280" />
        </View>
        <View className="w-0.5 h-6 bg-gray-200 dark:bg-gray-600" />
      </View>

      {/* Destination Location */}
      <View>
        <View className="flex-row items-center mb-2">
          <MapPin size={18} color="#3b82f6" />
          <Text className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
            Destination
          </Text>
        </View>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
          onPress={() => onDestinationChange(destinationLocation)}
        >
          <Text
            className={`${destinationLocation ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
          >
            {destinationLocation || "Enter destination"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationSelector;
