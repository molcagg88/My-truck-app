import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { Phone, MessageCircle, Star } from "lucide-react-native";

interface DriverInfoProps {
  driverName?: string;
  driverImage?: string;
  phoneNumber?: string;
  rating?: number;
  vehicleInfo?: string;
  licensePlate?: string;
}

const DriverInfo = ({
  driverName = "Abebe Kebede",
  driverImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=driver123",
  phoneNumber = "+251912345678",
  rating = 4.8,
  vehicleInfo = "Isuzu Truck - Medium",
  licensePlate = "AA 12345",
}: DriverInfoProps) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <View className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center">
        <Image
          source={{ uri: driverImage }}
          className="w-16 h-16 rounded-full bg-gray-200"
          contentFit="cover"
        />
        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {driverName}
            </Text>
            <View className="flex-row items-center">
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {rating}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {vehicleInfo}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            License: {licensePlate}
          </Text>
        </View>
      </View>

      <View className="flex-row mt-4 justify-between">
        <TouchableOpacity
          onPress={handleCall}
          className="flex-1 mr-2 flex-row items-center justify-center bg-red-600 py-2 rounded-md"
        >
          <Phone size={16} color="white" />
          <Text className="ml-2 text-white font-medium">Call Driver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMessage}
          className="flex-1 ml-2 flex-row items-center justify-center bg-gray-200 dark:bg-gray-700 py-2 rounded-md"
        >
          <MessageCircle
            size={16}
            color={"#374151"}
            className="dark:text-white"
          />
          <Text className="ml-2 text-gray-800 dark:text-white font-medium">
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverInfo;
