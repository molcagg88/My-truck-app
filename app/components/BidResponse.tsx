import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../_layout";
import { biddingService } from "../services/bidding";
import { messagingService } from "../services/messaging";

interface Bid {
  id: string;
  jobId: string;
  driverId: string;
  customerId: string;
  originalPrice: number;
  proposedPrice: number;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

interface BidResponseProps {
  bid: Bid;
  driverPhoneNumber: string;
  onBidResponded?: () => void;
}

const BidResponse = ({ bid, driverPhoneNumber, onBidResponded }: BidResponseProps) => {
  const { isDarkMode } = useTheme();

  const handleAcceptBid = async () => {
    try {
      await biddingService.acceptBid(bid.id);
      await messagingService.sendSMS({
        phoneNumber: driverPhoneNumber,
        message: `Your bid of ETB ${bid.proposedPrice} has been accepted for job ${bid.jobId}. Please proceed with the delivery.`,
      });
      Alert.alert("Success", "Bid accepted and driver notified");
      onBidResponded?.();
    } catch (error) {
      Alert.alert("Error", "Failed to accept bid. Please try again.");
    }
  };

  const handleDeclineBid = async () => {
    try {
      await biddingService.declineBid(bid.id);
      await messagingService.sendSMS({
        phoneNumber: driverPhoneNumber,
        message: `Your bid of ETB ${bid.proposedPrice} has been declined for job ${bid.jobId}.`,
      });
      Alert.alert("Success", "Bid declined and driver notified");
      onBidResponded?.();
    } catch (error) {
      Alert.alert("Error", "Failed to decline bid. Please try again.");
    }
  };

  return (
    <View className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
        Driver's Bid
      </Text>
      
      <View className="mb-4">
        <Text className="text-neutral-600 dark:text-neutral-400 mb-2">
          Original Price: ETB {bid.originalPrice}
        </Text>
        <Text className="text-neutral-800 dark:text-white text-lg font-semibold mb-2">
          Proposed Price: ETB {bid.proposedPrice}
        </Text>
        <Text className="text-neutral-600 dark:text-neutral-400">
          Difference: ETB {bid.proposedPrice - bid.originalPrice}
        </Text>
      </View>

      <View className="flex-row space-x-4">
        <TouchableOpacity
          className="flex-1 py-3 rounded-lg bg-red-500"
          onPress={handleDeclineBid}
        >
          <Text className="text-white font-semibold text-center">Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 rounded-lg bg-green-500"
          onPress={handleAcceptBid}
        >
          <Text className="text-white font-semibold text-center">Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BidResponse; 