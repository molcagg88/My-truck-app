import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import {
  ChevronRight,
  Package,
  Clock,
  MapPin,
  Truck,
} from "lucide-react-native";

interface OrderItem {
  id: string;
  date: string;
  status: "completed" | "in-progress" | "cancelled" | "pending" | "accepted";
  pickupLocation: string;
  destinationLocation: string;
  truckType: string;
  price: number;
}

interface OrderHistoryListProps {
  orders?: OrderItem[];
  onOrderPress?: (orderId: string) => void;
}

const getStatusColor = (status: OrderItem["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "cancelled":
      return "bg-red-500";
    case "pending":
      return "bg-yellow-500";
    case "accepted":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

const OrderHistoryList = ({
  orders = [
    {
      id: "1",
      date: "2023-10-15",
      status: "completed",
      pickupLocation: "Bole, Addis Ababa",
      destinationLocation: "Piassa, Addis Ababa",
      truckType: "Medium Truck",
      price: 1200,
    },
    {
      id: "2",
      date: "2023-10-10",
      status: "in-progress",
      pickupLocation: "Megenagna, Addis Ababa",
      destinationLocation: "Kality, Addis Ababa",
      truckType: "Large Truck",
      price: 2500,
    },
    {
      id: "3",
      date: "2023-10-05",
      status: "cancelled",
      pickupLocation: "Sarbet, Addis Ababa",
      destinationLocation: "CMC, Addis Ababa",
      truckType: "Small Truck",
      price: 800,
    },
  ],
  onOrderPress = (orderId) => console.log(`Order ${orderId} pressed`),
}: OrderHistoryListProps) => {
  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
      onPress={() => onOrderPress(item.id)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <Package size={18} color="#FF0000" />
          <Text className="ml-2 font-semibold text-gray-800 dark:text-gray-200">
            Order #{item.id}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View
            className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(item.status)}`}
          />
          <Text className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {item.status.replace("-", " ")}
          </Text>
        </View>
      </View>

      <View className="border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
        <View className="flex-row items-center mb-1">
          <MapPin size={16} color="#FF0000" />
          <Text className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex-1">
            From: {item.pickupLocation}
          </Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={16} color="#FF0000" />
          <Text className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex-1">
            To: {item.destinationLocation}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Truck size={16} color="#FF0000" />
          <Text className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {item.truckType}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            ETB {item.price}
          </Text>
          <ChevronRight size={16} color="#6B7280" className="ml-1" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800 dark:text-white">
          Order History
        </Text>
        <TouchableOpacity>
          <Text className="text-red-600 dark:text-red-400">See All</Text>
        </TouchableOpacity>
      </View>

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <View className="items-center justify-center py-8">
          <Package size={48} color="#FF0000" />
          <Text className="mt-4 text-gray-500 dark:text-gray-400 text-center">
            No order history yet.
          </Text>
          <TouchableOpacity className="mt-4 bg-red-600 py-2 px-4 rounded-lg">
            <Text className="text-white font-semibold">Book a Truck</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OrderHistoryList;
