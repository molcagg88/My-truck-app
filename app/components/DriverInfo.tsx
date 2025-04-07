import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { Phone, MessageCircle, Star } from "lucide-react-native";
import { useTheme } from "../_layout";

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
  const { isDarkMode } = useTheme();
  
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <View className={`w-full rounded-lg p-4 shadow-sm border ${
      isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-100'
    }`}>
      <View className="flex-row items-center">
        <Image
          source={{ uri: driverImage }}
          className="w-16 h-16 rounded-full bg-gray-200"
          contentFit="cover"
        />
        <View className="ml-4 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {driverName}
            </Text>
            <View className="flex-row items-center">
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text className={`ml-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {rating}
              </Text>
            </View>
          </View>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {vehicleInfo}
          </Text>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
          className={`flex-1 ml-2 flex-row items-center justify-center py-2 rounded-md ${
            isDarkMode ? 'bg-neutral-700' : 'bg-gray-200'
          }`}
        >
          <MessageCircle
            size={16}
            color={isDarkMode ? "#FFFFFF" : "#374151"}
          />
          <Text className={`ml-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverInfo;
