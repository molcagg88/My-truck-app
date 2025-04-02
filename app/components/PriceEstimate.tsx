import React from "react";
import { View, Text } from "react-native";
import {
  Clock,
  DollarSign,
  MapPin,
  Truck,
} from "lucide-react-native";

interface PriceEstimateProps {
  distance?: number;
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
  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full border border-gray-200">
      <Text className="text-lg font-bold text-gray-800 mb-3">
        Price Estimate
      </Text>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <MapPin size={18} color="#FF0000" />
          <Text className="text-gray-700 ml-2">Distance</Text>
        </View>
        <Text className="font-semibold text-gray-800">{distance} km</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Clock size={18} color="#FF0000" />
          <Text className="text-gray-700 ml-2">Estimated Time</Text>
        </View>
        <Text className="font-semibold text-gray-800">{duration} min</Text>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Truck size={18} color="#FF0000" />
          <Text className="text-gray-700 ml-2">Truck Type</Text>
        </View>
        <Text className="font-semibold text-gray-800">Standard</Text>
      </View>

      <View className="h-px bg-gray-200 my-3" />

      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <DollarSign size={18} color="#FF0000" />
          <Text className="text-gray-700 ml-2 font-bold">Total Price</Text>
        </View>
        <Text className="font-bold text-xl text-red-600">
          {price} {currency}
        </Text>
      </View>

      <Text className="text-xs text-gray-500 text-center">
        Final price may vary based on actual distance and time
      </Text>
    </View>
  );
};

export default PriceEstimate;
