import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { X, Gavel } from "lucide-react-native";
import { useTheme } from "../_layout";

interface BidModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  currentPrice: number;
  jobId: string;
}

const BidModal: React.FC<BidModalProps> = ({
  visible,
  onClose,
  onSubmit,
  currentPrice,
  jobId,
}) => {
  const { isDarkMode } = useTheme();
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid bid amount.");
      return;
    }

    if (amount >= currentPrice) {
      Alert.alert(
        "Invalid Bid",
        "Your bid must be less than the current price."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(amount);
      setBidAmount("");
    } catch (error) {
      Alert.alert("Error", "Failed to place bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <View
          className={`rounded-t-3xl p-6 ${
            isDarkMode ? "bg-neutral-800" : "bg-white"
          }`}
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-neutral-800"
              }`}
            >
              Place Your Bid
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X
                size={24}
                color={isDarkMode ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text
              className={`text-sm mb-2 ${
                isDarkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              Current Price
            </Text>
            <Text
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-neutral-800"
              }`}
            >
              {currentPrice.toLocaleString()} ETB
            </Text>

            <Text
              className={`text-sm mb-2 ${
                isDarkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              Your Bid Amount
            </Text>
            <View className="flex-row items-center">
              <TextInput
                className={`flex-1 border rounded-lg p-4 mr-2 ${
                  isDarkMode
                    ? "bg-neutral-700 border-neutral-600 text-white"
                    : "bg-white border-gray-200 text-neutral-800"
                }`}
                placeholder="Enter bid amount"
                placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text
                className={`text-sm ${
                  isDarkMode ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                ETB
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !bidAmount}
            className={`py-4 rounded-lg flex-row items-center justify-center ${
              isSubmitting || !bidAmount
                ? "bg-neutral-300 dark:bg-neutral-700"
                : "bg-yellow-500"
            }`}
          >
            <Gavel size={20} color="#ffffff" className="mr-2" />
            <Text className="text-white font-semibold">
              {isSubmitting ? "Placing Bid..." : "Place Bid"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BidModal; 