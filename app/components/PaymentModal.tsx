import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../_layout";
import { processDriverCommitmentFee } from "../services/payment";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  jobId: string;
}

export default function PaymentModal({
  visible,
  onClose,
  onSuccess,
  amount,
  jobId,
}: PaymentModalProps) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await processDriverCommitmentFee(jobId, amount);
      onSuccess();
    } catch (err) {
      setError("Failed to process payment. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className={`p-6 rounded-lg mx-4 ${
            isDarkMode ? "bg-neutral-800" : "bg-white"
          }`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              Confirm Payment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
          </View>

          <Text
            className={`text-lg mb-4 ${
              isDarkMode ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            You are about to pay {amount.toLocaleString()} ETB as a commitment fee.
            This amount will be refunded upon successful delivery.
          </Text>

          {error && (
            <Text className="text-red-500 mb-4 text-center">{error}</Text>
          )}

          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              className={`flex-1 p-3 rounded-lg ${
                isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
              }`}
            >
              <Text
                className={`text-center ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePayment}
              disabled={loading}
              className="flex-1 bg-red-500 p-3 rounded-lg"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center">Confirm Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 