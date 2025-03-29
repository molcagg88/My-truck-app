import React, { useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Moon,
  Sun,
  User,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Truck,
  Star,
  Settings,
} from "lucide-react-native";
import { useTheme } from "../_layout";

interface SettingsMenuProps {
  userName?: string;
  phoneNumber?: string;
  userRole?: "Customer" | "Driver" | "Affiliate";
}

const SettingsMenu = ({
  userName = "John Doe",
  phoneNumber = "+251 91 234 5678",
  userRole = "Customer",
}: SettingsMenuProps) => {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      {/* User Profile Section */}
      <View className="p-4 mb-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm mx-4 mt-4">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
            <Text className="text-primary-600 text-xl font-bold">
              {userName
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </Text>
          </View>
          <View className="ml-4">
            <Text className="text-lg font-bold text-neutral-800 dark:text-white">
              {userName}
            </Text>
            <Text className="text-neutral-500 dark:text-neutral-400">
              {phoneNumber}
            </Text>
            <View className="bg-primary-100 px-2 py-1 rounded-full mt-1 self-start">
              <Text className="text-primary-600 text-xs">{userRole}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="mt-4 flex-row items-center justify-between bg-gray-50 dark:bg-neutral-700 p-3 rounded-lg"
          onPress={() => navigateTo("/settings/profile")}
        >
          <View className="flex-row items-center">
            <User size={20} color={isDarkMode ? "#fff" : "#374151"} />
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Edit Profile
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <View className="p-4 mb-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm mx-4">
        <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          APPEARANCE
        </Text>
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center">
            {isDarkMode ? (
              <Moon size={20} color="#fff" />
            ) : (
              <Sun size={20} color="#374151" />
            )}
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#d1d5db", true: "#ff3b30" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Account Section */}
      <View className="p-4 mb-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm mx-4">
        <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          ACCOUNT
        </Text>

        {userRole === "Driver" && (
          <TouchableOpacity
            className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-700"
            onPress={() => navigateTo("/driver/vehicle-management")}
          >
            <View className="flex-row items-center">
              <Truck size={20} color={isDarkMode ? "#fff" : "#374151"} />
              <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
                Manage Vehicles
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-700"
          onPress={() => navigateTo("/settings/payment-methods")}
        >
          <View className="flex-row items-center">
            <CreditCard size={20} color={isDarkMode ? "#fff" : "#374151"} />
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Payment Methods
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-700"
          onPress={() => navigateTo("/settings/security")}
        >
          <View className="flex-row items-center">
            <Shield size={20} color={isDarkMode ? "#fff" : "#374151"} />
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Security
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>

        {userRole !== "Affiliate" && (
          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => navigateTo("/settings/ratings")}
          >
            <View className="flex-row items-center">
              <Star size={20} color={isDarkMode ? "#fff" : "#374151"} />
              <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
                My Ratings & Reviews
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications Section */}
      <View className="p-4 mb-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm mx-4">
        <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          NOTIFICATIONS
        </Text>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3"
          onPress={() => navigateTo("/settings/notifications")}
        >
          <View className="flex-row items-center">
            <Bell size={20} color={isDarkMode ? "#fff" : "#374151"} />
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Notification Preferences
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {/* Support & About Section */}
      <View className="p-4 mb-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm mx-4">
        <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          SUPPORT & ABOUT
        </Text>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-700"
          onPress={() => navigateTo("/settings/help")}
        >
          <View className="flex-row items-center">
            <HelpCircle size={20} color={isDarkMode ? "#fff" : "#374151"} />
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Help & Support
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-neutral-700"
          onPress={() => navigateTo("/settings/about")}
        >
          <View className="flex-row items-center">
            <Settings size={20} color={isDarkMode ? "#fff" : "#374151"} />
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              About My Truck App
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between py-3"
          onPress={() => navigateTo("/settings/terms")}
        >
          <View className="flex-row items-center">
            <Text className="ml-3 font-medium text-neutral-800 dark:text-white">
              Terms & Privacy Policy
            </Text>
          </View>
          <ChevronRight size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        className="mx-4 mb-8 p-4 bg-primary-500 rounded-lg items-center"
        onPress={() => navigateTo("/")}
      >
        <View className="flex-row items-center">
          <LogOut size={20} color="#ffffff" />
          <Text className="ml-2 text-white font-medium">Logout</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsMenu;
