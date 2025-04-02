import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Bell, Package, Truck } from "lucide-react-native";
import { useTheme } from "./_layout";

interface Notification {
  id: string;
  type: "order" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationsScreen = () => {
  const { isDarkMode } = useTheme();
  const notifications: Notification[] = [
    {
      id: "1",
      type: "order",
      title: "Order Accepted",
      message: "Your order #123 has been accepted by Driver Abebe",
      timestamp: "2 minutes ago",
      read: false,
    },
    {
      id: "2",
      type: "system",
      title: "Welcome to TruckApp",
      message: "Thank you for joining our platform. We're here to help you with your shipping needs.",
      timestamp: "1 hour ago",
      read: true,
    },
  ];

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
        !item.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <View className="flex-row items-start">
        <View className="mt-1 mr-3">
          {item.type === "order" ? (
            <Package size={20} color="#FF0000" />
          ) : (
            <Bell size={20} color="#FF0000" />
          )}
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white">
            {item.title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 mt-1">
            {item.message}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {item.timestamp}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </Text>
      </View>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-4">
          <Bell size={48} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-4">
            No notifications yet
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotificationsScreen; 