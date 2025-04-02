import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, ArrowDown } from "lucide-react-native";
import { useTheme } from "../_layout";

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
  const { isDarkMode } = useTheme();

  return (
    <View className="bg-neutral-800 dark:bg-neutral-900 rounded-lg p-4 shadow-sm">
      {/* Pickup Location */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MapPin size={18} color="#dc2626" />
          <Text className="ml-2 text-neutral-200 dark:text-neutral-100 font-medium">
            Pickup Location
          </Text>
        </View>
        <TouchableOpacity
          className="bg-neutral-700 dark:bg-neutral-800 p-3 rounded-lg"
          onPress={() => onPickupChange(pickupLocation)}
        >
          <Text
            className={`${pickupLocation ? "text-neutral-100 dark:text-white" : "text-neutral-400 dark:text-neutral-500"}`}
          >
            {pickupLocation || "Enter pickup location"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connector */}
      <View className="flex-row items-center justify-center mb-4">
        <View className="w-0.5 h-6 bg-neutral-600 dark:bg-neutral-700" />
        <View className="bg-neutral-600 dark:bg-neutral-700 rounded-full p-1">
          <ArrowDown size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </View>
        <View className="w-0.5 h-6 bg-neutral-600 dark:bg-neutral-700" />
      </View>

      {/* Destination Location */}
      <View>
        <View className="flex-row items-center mb-2">
          <MapPin size={18} color="#3b82f6" />
          <Text className="ml-2 text-neutral-200 dark:text-neutral-100 font-medium">
            Destination
          </Text>
        </View>
        <TouchableOpacity
          className="bg-neutral-700 dark:bg-neutral-800 p-3 rounded-lg"
          onPress={() => onDestinationChange(destinationLocation)}
        >
          <Text
            className={`${destinationLocation ? "text-neutral-100 dark:text-white" : "text-neutral-400 dark:text-neutral-500"}`}
          >
            {destinationLocation || "Enter destination"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationSelector;
