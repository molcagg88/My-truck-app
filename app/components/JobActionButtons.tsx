import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  CheckCircle,
  XCircle,
  Phone,
  MessageCircle,
} from "lucide-react-native";

interface JobActionButtonsProps {
  onAccept?: () => void;
  onDecline?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  status?: "pending" | "accepted" | "in_progress" | "completed";
}

const JobActionButtons = ({
  onAccept = () => {},
  onDecline = () => {},
  onCall = () => {},
  onMessage = () => {},
  status = "pending",
}: JobActionButtonsProps) => {
  if (status === "pending") {
    return (
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-red-600 px-4 py-3 rounded-lg flex-row items-center justify-center flex-1 mr-2"
          onPress={onAccept}
        >
          <CheckCircle size={16} color="#ffffff" />
          <Text className="text-white font-medium ml-1">Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-200 px-4 py-3 rounded-lg flex-row items-center justify-center flex-1"
          onPress={onDecline}
        >
          <XCircle size={16} color="#4b5563" />
          <Text className="text-gray-700 font-medium ml-1">Decline</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between">
      <TouchableOpacity
        className="bg-red-600 px-4 py-3 rounded-lg flex-row items-center justify-center flex-1 mr-2"
        onPress={onCall}
      >
        <Phone size={16} color="#ffffff" />
        <Text className="text-white font-medium ml-1">Call</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-200 px-4 py-3 rounded-lg flex-row items-center justify-center flex-1"
        onPress={onMessage}
      >
        <MessageCircle size={16} color="#4b5563" />
        <Text className="text-gray-700 font-medium ml-1">Message</Text>
      </TouchableOpacity>
    </View>
  );
};

export default JobActionButtons;
