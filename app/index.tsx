import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Truck, User, Users } from "lucide-react-native";
import { useTheme } from "./_layout";

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handleRoleSelection = (role: string) => {
    router.push("/auth/phone-verification");
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 px-6 py-10">
      {/* Logo and Header */}
      <View className="items-center mb-10">
        <Image
          source={require("../assets/images/splash-icon.png")}
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
          My Truck App
        </Text>
        <Text className="text-center text-neutral-600 dark:text-neutral-400">
          Connect with reliable truck services for all your delivery needs
        </Text>
      </View>

      {/* Role Selection */}
      <Text className="text-xl font-bold mb-4 text-neutral-800 dark:text-white">
        Continue as...
      </Text>

      <TouchableOpacity
        className="flex-row items-center p-4 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        onPress={() => handleRoleSelection("customer")}
      >
        <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
          <User size={24} color="#ef4444" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-semibold text-neutral-800 dark:text-white">
            Customer
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Book trucks for your deliveries
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center p-4 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        onPress={() => handleRoleSelection("driver")}
      >
        <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
          <Truck size={24} color="#3b82f6" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-semibold text-neutral-800 dark:text-white">
            Driver
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Provide delivery services
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center p-4 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        onPress={() => handleRoleSelection("affiliate")}
      >
        <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
          <Users size={24} color="#10b981" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-semibold text-neutral-800 dark:text-white">
            Affiliate
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Refer customers and earn
          </Text>
        </View>
      </TouchableOpacity>

      {/* Terms and Privacy */}
      <View className="mt-auto items-center">
        <Text className="text-neutral-500 dark:text-neutral-400 text-sm text-center">
          By continuing, you agree to our
        </Text>
        <View className="flex-row">
          <TouchableOpacity>
            <Text className="text-red-600 text-sm">Terms of Service</Text>
          </TouchableOpacity>
          <Text className="text-neutral-500 dark:text-neutral-400 text-sm mx-1">
            and
          </Text>
          <TouchableOpacity>
            <Text className="text-red-600 text-sm">Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
