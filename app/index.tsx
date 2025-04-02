import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "./_layout";

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 px-6">
      {/* Main Content */}
      <View className="flex-1 justify-center items-center">
        {/* Logo and Header */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 md:w-24 md:h-24 mb-3">
            <Image
              source={require("../assets/images/logo.jpg")}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white mb-1">
            My Truck 
          </Text>
          <Text className="text-center text-neutral-600 dark:text-neutral-400 text-sm">
            Connect with reliable truck services for all your delivery needs
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          className="bg-primary-500 py-3 px-8 rounded-lg mb-6 w-48"
          onPress={() => router.push("/auth/phone-verification")}
        >
          <Text className="text-white font-semibold text-center text-lg">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terms and Privacy */}
      <View className="py-4 items-center">
        <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
          By continuing, you agree to our
        </Text>
        <View className="flex-row">
          <TouchableOpacity>
            <Text className="text-primary-500 text-sm">Terms of Service</Text>
          </TouchableOpacity>
          <Text className="text-neutral-500 dark:text-neutral-400 text-sm mx-1">
            and
          </Text>
          <TouchableOpacity>
            <Text className="text-primary-500 text-sm">Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 