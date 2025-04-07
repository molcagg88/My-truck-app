import React from "react";
import { View, Text } from "react-native";
import {
  Clock,
  DollarSign,
  MapPin,
  Truck,
} from "lucide-react-native";
import { useTheme } from "../_layout";

interface PriceEstimateProps {
  distance?: number | string;
  duration?: number;
  price?: number;
  currency?: string;
}

const PriceEstimate = ({
  distance = 12.5,
  duration = 45,
  price = 850,
  currency = "ETB",
}: PriceEstimateProps) => {
  const { isDarkMode } = useTheme();
  
  return (
    <View className={`p-4 rounded-lg shadow-md w-full border ${isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}`}>
      <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Price Estimate
      </Text>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <MapPin size={18} color="#FF0000" />
          <Text className={`ml-2 ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>Distance</Text>
        </View>
        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{distance} km</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Clock size={18} color="#FF0000" />
          <Text className={`ml-2 ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>Estimated Time</Text>
        </View>
        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{duration} min</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Truck size={18} color="#FF0000" />
          <Text className={`ml-2 ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>Truck Type</Text>
        </View>
        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Standard</Text>
      </View>

      <View className={`h-px my-3 ${isDarkMode ? 'bg-neutral-700' : 'bg-gray-200'}`} />

      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <DollarSign size={18} color="#FF0000" />
          <Text className={`ml-2 font-bold ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>Total Price</Text>
        </View>
        <Text className="font-bold text-xl text-red-600">
          {price} {currency}
        </Text>
      </View>

      <Text className={`text-xs text-center ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
        Final price may vary based on actual distance and time
      </Text>
    </View>
  );
};

export default PriceEstimate;
