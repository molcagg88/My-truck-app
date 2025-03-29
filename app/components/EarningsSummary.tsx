import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ArrowUpRight,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react-native";

interface EarningsSummaryProps {
  todayEarnings?: number;
  weeklyEarnings?: number;
  totalEarnings?: number;
  currency?: string;
  onViewDetails?: () => void;
}

const EarningsSummary = ({
  todayEarnings = 250,
  weeklyEarnings = 1850,
  totalEarnings = 12500,
  currency = "ETB",
  onViewDetails = () => console.log("View earnings details"),
}: EarningsSummaryProps) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800 dark:text-white">
          Earnings Summary
        </Text>
        <TouchableOpacity
          onPress={onViewDetails}
          className="flex-row items-center"
        >
          <Text className="text-red-600 mr-1 text-sm">View Details</Text>
          <ArrowUpRight size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <DollarSign size={16} color="#dc2626" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              Today
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-800 dark:text-white">
            {currency} {todayEarnings.toLocaleString()}
          </Text>
        </View>

        <View className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex-1 ml-2">
          <View className="flex-row items-center mb-1">
            <Calendar size={16} color="#2563eb" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              This Week
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-800 dark:text-white">
            {currency} {weeklyEarnings.toLocaleString()}
          </Text>
        </View>
      </View>

      <View className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TrendingUp size={16} color="#16a34a" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              Total Earnings
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-800 dark:text-white">
            {currency} {totalEarnings.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EarningsSummary;
