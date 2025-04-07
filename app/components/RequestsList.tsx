import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { MapPin, Clock, Package, Gavel, Check, X } from "lucide-react-native";
import { useTheme } from "../_layout";
import BidModal from "./BidModal";
import PaymentModal from "./PaymentModal";
import { processDriverCommitmentFee } from "../services/payment";
import { useColorScheme } from "react-native";
import { Star } from "lucide-react-native";
import BidResponseModal from "./BidResponseModal";
import { sendBidNotification, sendCounterBidNotification, sendBidAcceptedNotification, sendBidDeclinedNotification } from "../services/notifications";
import { handleApiError } from "../services/apiUtils";
import biddingService from "../services/bidding";

interface JobRequest {
  id: string;
  pickup: string;
  destination: string;
  estimatedTime: string;
  price: number;
  status: "pending" | "bidding" | "accepted" | "delivered" | "cancelled" | "declined";
  currentBid?: number;
  customerId: string;
  driverId?: string;
}

interface RequestsListProps {
  requests: JobRequest[];
  onAccept: (jobId: string) => void;
  onDecline: (jobId: string) => void;
  onBid: (jobId: string, amount: number) => void;
  onAcceptBid: (jobId: string) => void;
  onDeclineBid: (jobId: string) => void;
  onCounterBid: (jobId: string, amount: number) => void;
  driverId: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const COMMITMENT_FEE = 400;

const RequestsList: React.FC<RequestsListProps> = ({
  requests,
  onAccept,
  onDecline,
  onBid,
  onAcceptBid,
  onDeclineBid,
  onCounterBid,
  driverId,
  refreshing,
  onRefresh,
}) => {
  const { isDarkMode } = useTheme();
  const colorScheme = useColorScheme();
  const [showBidModal, setShowBidModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBidResponseModal, setShowBidResponseModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);

  const hasActiveJob = requests.some(request => request.status === "accepted");

  const handleBidClick = (job: JobRequest) => {
    setSelectedJob(job);
    setShowBidModal(true);
  };

  const handleBidSubmit = async (amount: number) => {
    if (selectedJob) {
      try {
        await biddingService.createBid({
          jobId: selectedJob.id,
          proposedPrice: amount
        });
        
        // Call the parent component's onBid method to update UI
        onBid(selectedJob.id, amount);
        
        // If implemented, send notification
        try {
          await sendBidNotification("customer-id", selectedJob.id, amount);
        } catch (notificationError) {
          console.error("Failed to send notification:", notificationError);
        }
        
        setShowBidModal(false);
        Alert.alert("Success", "Your bid has been placed successfully!");
      } catch (error) {
        Alert.alert("Error", handleApiError(error, "Failed to place bid. Please try again."));
      }
    }
  };

  const handleAcceptClick = (job: JobRequest) => {
    if (hasActiveJob) {
      Alert.alert(
        "Cannot Accept Job",
        "Please complete your current job before accepting a new one."
      );
      return;
    }
    onAccept(job.id);
  };

  const handlePaymentConfirm = async () => {
    if (selectedJob) {
      try {
        await processDriverCommitmentFee(selectedJob.id, COMMITMENT_FEE);
        onAccept(selectedJob.id);
        setShowPaymentModal(false);
        setSelectedJob(null);
      } catch (error) {
        Alert.alert(
          "Payment Failed",
          "Failed to process commitment fee. Please try again."
        );
      }
    }
  };

  const handleBidResponse = async (action: "accept" | "decline" | "counter", amount?: number) => {
    if (!selectedJob) return;

    try {
      switch (action) {
        case "accept":
          await biddingService.acceptBid(selectedJob.id);
          // Call the parent component's method to update UI
          await onAcceptBid(selectedJob.id);
          
          // If notification service is implemented
          try {
            await sendBidAcceptedNotification(selectedJob.driverId!, selectedJob.id, selectedJob.currentBid!);
          } catch (notificationError) {
            console.error("Failed to send notification:", notificationError);
          }
          break;
          
        case "decline":
          await biddingService.declineBid(selectedJob.id);
          // Call the parent component's method to update UI
          await onDeclineBid(selectedJob.id);
          
          // If notification service is implemented
          try {
            await sendBidDeclinedNotification(selectedJob.driverId!, selectedJob.id);
          } catch (notificationError) {
            console.error("Failed to send notification:", notificationError);
          }
          break;
          
        case "counter":
          if (amount) {
            await biddingService.counterBid(selectedJob.id, amount);
            // Call the parent component's method to update UI
            await onCounterBid(selectedJob.id, amount);
            
            // If notification service is implemented
            try {
              await sendCounterBidNotification(selectedJob.driverId!, selectedJob.id, amount);
            } catch (notificationError) {
              console.error("Failed to send notification:", notificationError);
            }
          }
          break;
      }
      
      setShowBidResponseModal(false);
      Alert.alert("Success", `Bid ${action}ed successfully!`);
    } catch (error) {
      Alert.alert("Error", handleApiError(error, `Failed to ${action} bid. Please try again.`));
    }
  };

  const renderRequestItem = (item: JobRequest) => (
    <View
      key={item.id}
      className={`p-4 rounded-lg mb-4 ${
        isDarkMode ? "bg-neutral-800" : "bg-white"
      } shadow-sm`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text
              className={`ml-1 text-sm ${
                isDarkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              From: {item.pickup}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text
              className={`ml-1 text-sm ${
                isDarkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              To: {item.destination}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Clock size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text
              className={`ml-1 text-sm ${
                isDarkMode ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              {item.estimatedTime}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Package size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text
              className={`ml-1 text-sm font-medium ${
                isDarkMode ? "text-neutral-200" : "text-neutral-800"
              }`}
            >
              {item.price.toLocaleString()} ETB
            </Text>
          </View>
          {item.currentBid && (
            <Text
              className={`mt-2 text-sm ${
                isDarkMode ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              Current bid: {item.currentBid.toLocaleString()} ETB
            </Text>
          )}
        </View>
        <View className="ml-4">
          {item.status === "pending" && (
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => handleAcceptClick(item)}
                className={`p-2 rounded-lg mr-2 ${
                  hasActiveJob ? "bg-neutral-400" : "bg-red-500"
                }`}
                disabled={hasActiveJob}
              >
                <Check size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDecline(item.id)}
                className="bg-neutral-300 dark:bg-neutral-700 p-2 rounded-lg mr-2"
              >
                <X size={20} color={isDarkMode ? "#ffffff" : "#374151"} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleBidClick(item)}
                className="bg-yellow-500 p-2 rounded-lg"
              >
                <Gavel size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
          {item.status === "bidding" && item.currentBid && (
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => handleAcceptClick(item)}
                className={`p-2 rounded-lg mr-2 ${
                  hasActiveJob ? "bg-neutral-400" : "bg-red-500"
                }`}
                disabled={hasActiveJob}
              >
                <Check size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDecline(item.id)}
                className="bg-neutral-300 dark:bg-neutral-700 p-2 rounded-lg"
              >
                <X size={20} color={isDarkMode ? "#ffffff" : "#374151"} />
              </TouchableOpacity>
            </View>
          )}
          {item.status === "accepted" && (
            <View className="bg-green-500 p-2 rounded-lg">
              <Text className="text-white text-sm">Accepted</Text>
            </View>
          )}
          {item.status === "delivered" && (
            <View className="bg-blue-500 p-2 rounded-lg">
              <Text className="text-white text-sm">Delivered</Text>
            </View>
          )}
          {item.status === "cancelled" && (
            <View className="bg-neutral-300 dark:bg-neutral-700 p-2 rounded-lg">
              <Text className={`text-sm ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
                Cancelled
              </Text>
            </View>
          )}
          {item.status === "declined" && (
            <View className="bg-red-500 p-2 rounded-lg">
              <Text className="text-white text-sm">Declined</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        <View className="px-4">
          {requests.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text
                className={`text-lg ${
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                No job requests available
              </Text>
            </View>
          ) : (
            requests.map(renderRequestItem)
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      {showBidModal && selectedJob && (
        <BidModal
          visible={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedJob(null);
          }}
          onSubmit={handleBidSubmit}
          currentPrice={selectedJob.price}
          jobId={selectedJob.id}
        />
      )}
      {showBidResponseModal && selectedJob && (
        <BidResponseModal
          visible={showBidResponseModal}
          onClose={() => setShowBidResponseModal(false)}
          onAccept={() => handleBidResponse("accept")}
          onDecline={() => handleBidResponse("decline")}
          onCounterBid={(amount: number) => handleBidResponse("counter", amount)}
          currentBid={selectedJob.currentBid!}
          originalPrice={selectedJob.price}
        />
      )}
    </View>
  );
};

export default RequestsList;
