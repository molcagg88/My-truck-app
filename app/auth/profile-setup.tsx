import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, User, Truck, Users } from "lucide-react-native";
import { useTheme } from "../_layout";

type UserRole = "Customer" | "Driver" | "Affiliate";

const ProfileSetup = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleSubmit = () => {
    if (fullName && selectedRole) {
      // In a real app, you would save the profile data here
      console.log("Profile data:", { fullName, email, role: selectedRole });

      // Navigate to the appropriate dashboard based on role
      if (selectedRole === "Customer") {
        router.push("/customer/dashboard");
      } else if (selectedRole === "Driver") {
        router.push("/driver/dashboard");
      } else {
        // Affiliate dashboard would go here
        router.push("/");
      }
    }
  };

  const RoleCard = ({ role, icon: Icon }: { role: UserRole; icon: any }) => (
    <TouchableOpacity
      className={`flex-1 p-4 rounded-lg mr-2 ${selectedRole === role ? "bg-primary-100 border-2 border-primary-500" : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"}`}
      onPress={() => setSelectedRole(role)}
    >
      <View className="items-center">
        <View
          className={`w-12 h-12 rounded-full items-center justify-center ${selectedRole === role ? "bg-primary-500" : "bg-gray-100 dark:bg-neutral-700"}`}
        >
          <Icon
            size={24}
            color={
              selectedRole === role
                ? "#ffffff"
                : isDarkMode
                  ? "#9ca3af"
                  : "#6b7280"
            }
          />
        </View>
        <Text
          className={`mt-2 font-medium ${selectedRole === role ? "text-primary-700 dark:text-primary-400" : "text-neutral-700 dark:text-neutral-300"}`}
        >
          {role}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="p-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold mb-2 text-neutral-800 dark:text-white">
            Complete your profile
          </Text>
          <Text className="text-neutral-600 dark:text-neutral-400">
            Let's set up your account to get started
          </Text>
        </View>

        {/* Profile Picture */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-neutral-700 items-center justify-center overflow-hidden">
              <User size={40} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-primary-500 w-8 h-8 rounded-full items-center justify-center">
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-primary-500 font-medium">
            Add profile picture
          </Text>
        </View>

        {/* Form Fields */}
        <View className="mb-6">
          <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Full Name
          </Text>
          <TextInput
            className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-800 dark:text-white"
            placeholder="Enter your full name"
            placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
            Email (Optional)
          </Text>
          <TextInput
            className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-800 dark:text-white"
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-8">
          <Text className="text-sm font-medium mb-4 text-neutral-700 dark:text-neutral-300">
            I am a...
          </Text>
          <View className="flex-row">
            <RoleCard role="Customer" icon={User} />
            <RoleCard role="Driver" icon={Truck} />
            <RoleCard role="Affiliate" icon={Users} />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className={`py-4 rounded-lg ${!fullName || !selectedRole ? "bg-neutral-300 dark:bg-neutral-700" : "bg-primary-500"}`}
          disabled={!fullName || !selectedRole}
        >
          <Text className="text-white font-semibold text-center">
            Complete Setup
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileSetup;
