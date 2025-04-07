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
    <View className={`rounded-lg p-4 shadow-sm ${isDarkMode ? 'bg-neutral-800' : 'bg-white border border-gray-200'}`}>
      {/* Pickup Location */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MapPin size={18} color="#dc2626" />
          <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
            Pickup Location
          </Text>
        </View>
        <TouchableOpacity
          className={`p-3 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-neutral-100'}`}
          onPress={() => onPickupChange(pickupLocation)}
        >
          <Text
            className={pickupLocation 
              ? (isDarkMode ? 'text-white' : 'text-neutral-800') 
              : (isDarkMode ? 'text-neutral-400' : 'text-neutral-500')}
          >
            {pickupLocation || "Enter pickup location"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connector */}
      <View className="flex-row items-center justify-center mb-4">
        <View className={`w-0.5 h-6 ${isDarkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`} />
        <View className={`rounded-full p-1 ${isDarkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
          <ArrowDown size={16} color={isDarkMode ? "#ffffff" : "#6b7280"} />
        </View>
        <View className={`w-0.5 h-6 ${isDarkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`} />
      </View>

      {/* Destination Location */}
      <View>
        <View className="flex-row items-center mb-2">
          <MapPin size={18} color="#3b82f6" />
          <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
            Destination
          </Text>
        </View>
        <TouchableOpacity
          className={`p-3 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-neutral-100'}`}
          onPress={() => onDestinationChange(destinationLocation)}
        >
          <Text
            className={destinationLocation 
              ? (isDarkMode ? 'text-white' : 'text-neutral-800') 
              : (isDarkMode ? 'text-neutral-400' : 'text-neutral-500')}
          >
            {destinationLocation || "Enter destination"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationSelector;
