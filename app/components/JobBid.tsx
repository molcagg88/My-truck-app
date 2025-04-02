import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../_layout";
import { biddingService } from "../services/bidding";

interface JobBidProps {
  jobId: string;
  driverId: string;
  customerId: string;
  originalPrice: number;
  onBidPlaced?: () => void;
}

const JobBid = ({ jobId, driverId, customerId, originalPrice, onBidPlaced }: JobBidProps) => {
  const { isDarkMode } = useTheme();
  const [proposedPrice, setProposedPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitBid = async () => {
    if (!proposedPrice) {
      Alert.alert("Error", "Please enter a proposed price");
      return;
    }

    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      await biddingService.createBid({
        jobId,
        driverId,
        customerId,
        originalPrice,
        proposedPrice: price,
      });
      Alert.alert("Success", "Your bid has been sent to the customer");
      onBidPlaced?.();
    } catch (error) {
      Alert.alert("Error", "Failed to place bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
        Place a Bid
      </Text>
      
      <View className="mb-4">
        <Text className="text-neutral-600 dark:text-neutral-400 mb-2">
          Original Price: ETB {originalPrice}
        </Text>
        <TextInput
          className="bg-white dark:bg-neutral-700 p-3 rounded-lg text-neutral-800 dark:text-white"
          placeholder="Enter your proposed price"
          placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
          keyboardType="numeric"
          value={proposedPrice}
          onChangeText={setProposedPrice}
        />
      </View>

      <TouchableOpacity
        className={`py-3 rounded-lg ${
          isSubmitting ? "bg-neutral-400 dark:bg-neutral-600" : "bg-primary-500"
        }`}
        onPress={handleSubmitBid}
        disabled={isSubmitting}
      >
        <Text className="text-white font-semibold text-center">
          {isSubmitting ? "Submitting..." : "Submit Bid"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default JobBid; 