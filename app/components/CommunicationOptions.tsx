import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Phone, MessageSquare, MessageCircle } from "lucide-react-native";
import { useTheme } from "../_layout";
import { messagingService } from "../services/messaging";

interface CommunicationOptionsProps {
  phoneNumber: string;
  name: string;
  role: "customer" | "driver";
}

const CommunicationOptions = ({ phoneNumber, name, role }: CommunicationOptionsProps) => {
  const { isDarkMode } = useTheme();

  const handleCall = async () => {
    const result = await messagingService.makePhoneCall(phoneNumber);
    if (!result.success) {
      Alert.alert("Error", typeof result.error === "string" ? result.error : "Failed to initiate call");
    }
  };

  const handleSMS = async () => {
    const result = await messagingService.sendSMS({
      phoneNumber,
      message: `Hello ${name}, I'm contacting you about your ${role === "driver" ? "delivery job" : "truck service"}.`,
    });
    if (!result.success) {
      Alert.alert("Error", typeof result.error === "string" ? result.error : "Failed to send SMS");
    }
  };

  const handleWhatsApp = async () => {
    const result = await messagingService.sendWhatsAppMessage({
      phoneNumber,
      message: `Hello ${name}, I'm contacting you about your ${role === "driver" ? "delivery job" : "truck service"}.`,
    });
    if (!result.success) {
      Alert.alert("Error", typeof result.error === "string" ? result.error : "Failed to open WhatsApp");
    }
  };

  return (
    <View className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
        Contact {name}
      </Text>
      
      <View className="space-y-3">
        <TouchableOpacity
          className="flex-row items-center bg-white dark:bg-neutral-700 p-3 rounded-lg"
          onPress={handleCall}
        >
          <Phone size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
          <Text className="ml-3 text-neutral-800 dark:text-white">Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-white dark:bg-neutral-700 p-3 rounded-lg"
          onPress={handleSMS}
        >
          <MessageSquare size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
          <Text className="ml-3 text-neutral-800 dark:text-white">Send SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-white dark:bg-neutral-700 p-3 rounded-lg"
          onPress={handleWhatsApp}
        >
          <MessageCircle size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
          <Text className="ml-3 text-neutral-800 dark:text-white">WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommunicationOptions; 