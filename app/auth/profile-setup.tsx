import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, User, Truck, Users, Car, FileText } from "lucide-react-native";
import { useTheme } from "../_layout";
import authService, { ProfileUpdateResponse } from "../services/authService";
import storage from "../utils/storage";
import SafeAreaContainer from "../utils/SafeAreaContainer";

type UserRole = "Customer" | "Driver" | "Affiliate";

// Map frontend role types to backend role values
const roleMapping = {
  "Customer": "customer",
  "Driver": "driver",
  "Affiliate": "affiliate"
};

const ProfileSetup = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [plateImage, setPlateImage] = useState<string | null>(null);
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (fullName && selectedRole) {
      // Validate driver-specific fields
      if (selectedRole === "Driver") {
        if (!plateNumber || !plateImage || !licenseImage) {
          // Show error message or handle validation
          Alert.alert("Error", "Please complete all driver information fields");
          return;
        }
      }

      try {
        setIsLoading(true);
        
        // Convert frontend role to backend role value
        const roleValue = roleMapping[selectedRole];
        
        // Create profile update data
        const profileData = {
          name: fullName,
          role: roleValue,
          ...(email && { email }), // Only include email if provided
          ...(selectedRole === "Driver" && {
            vehicleInfo: {
              plateNumber,
              plateImage,
              licenseImage
            }
          })
        };
        
        console.log("Updating profile with data:", profileData);
        
        // Send profile update to server
        const updateResponse: ProfileUpdateResponse = await authService.updateProfile(profileData);
        
        // Store the new token if provided
        if (updateResponse.token) {
          console.log("Received new token after profile update, saving it");
          await storage.setToken(updateResponse.token);
        }
        
        // Navigate to the appropriate dashboard based on role
        if (selectedRole === "Customer") {
          router.replace("/customer/dashboard");
        } else if (selectedRole === "Driver") {
          router.replace("/driver/dashboard");
        } else {
          // Affiliate dashboard would go here
          router.replace("/customer/dashboard"); // Temporary fallback
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert(
          "Profile Update Failed",
          "Failed to update your profile. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageUpload = (type: "plate" | "license") => {
    // Simulate successful upload for development
    if (type === "plate") {
      setPlateImage("plate_photo.jpg");
    } else {
      setLicenseImage("license_photo.jpg");
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
    <SafeAreaContainer extraPadding={{ top: 10 }}>
      <View className="p-0">
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

        {/* Driver-specific fields */}
        {selectedRole === "Driver" && (
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
              Vehicle Information
            </Text>

            <View className="mb-6">
              <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Vehicle Plate Number
              </Text>
              <TextInput
                className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 text-neutral-800 dark:text-white"
                placeholder="Enter your vehicle plate number"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                value={plateNumber}
                onChangeText={setPlateNumber}
                autoCapitalize="characters"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Vehicle Plate Photo
              </Text>
              <TouchableOpacity
                onPress={() => handleImageUpload("plate")}
                className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Car size={24} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
                  <Text className="ml-3 text-neutral-800 dark:text-white">
                    {plateImage ? "Plate photo uploaded" : "Upload plate photo"}
                  </Text>
                </View>
                <Camera size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Driver's License Photo
              </Text>
              <TouchableOpacity
                onPress={() => handleImageUpload("license")}
                className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <FileText size={24} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
                  <Text className="ml-3 text-neutral-800 dark:text-white">
                    {licenseImage ? "License photo uploaded" : "Upload license photo"}
                  </Text>
                </View>
                <Camera size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          className={`py-4 rounded-lg ${
            !fullName || !selectedRole || (selectedRole === "Driver" && (!plateNumber || !plateImage || !licenseImage)) || isLoading
              ? "bg-neutral-300 dark:bg-neutral-700"
              : "bg-primary-500"
          }`}
          disabled={!fullName || !selectedRole || (selectedRole === "Driver" && (!plateNumber || !plateImage || !licenseImage)) || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-center">
              Complete Setup
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  );
};

export default ProfileSetup;
