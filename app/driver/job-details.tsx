import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Modal, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  DollarSign,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import { useTheme } from "../_layout";
import NavigationMap from "../components/NavigationMap";
import OrderStatusTracker from "../components/OrderStatusTracker";
import SafeAreaContainer from "../utils/SafeAreaContainer";
import Typography from "../utils/typography";

const JobDetailsScreen = () => {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { isDarkMode } = useTheme();
  const [currentStatus, setCurrentStatus] = useState<
    "confirmed" | "pickup" | "in_transit" | "delivered"
  >("pickup");
  
  // Add state for confirmation modal
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("");
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // Mock job details
  const jobDetails = {
    id: jobId || "job123",
    customerName: "Tigist Haile",
    customerImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tigist",
    customerPhone: "+251987654321",
    customerRating: 4.5,
    pickupLocation: "Piassa, Addis Ababa",
    pickupDetails: "Blue building, 2nd floor",
    destinationLocation: "CMC, Addis Ababa",
    destinationDetails: "Green gate, residential area",
    distance: "12.3 km",
    estimatedTime: "40 mins",
    price: 520,
    currency: "ETB",
    cargoDescription: "Office furniture, 3 boxes",
    cargoWeight: "~150 kg",
  };

  const showConfirmation = (action: string, title: string, message: string) => {
    setConfirmationAction(action);
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setIsConfirmationVisible(true);
  };

  const handleConfirmAction = () => {
    setIsConfirmationVisible(false);
    
    // Handle the actual status update
    if (confirmationAction === "start_delivery") {
      setCurrentStatus("in_transit");
    } else if (confirmationAction === "confirm_delivery") {
      setCurrentStatus("delivered");
    } else if (confirmationAction === "complete_job") {
      // Complete the job and return to dashboard
      router.push("/driver/dashboard");
    }
  };

  const handleUpdateStatus = () => {
    if (currentStatus === "confirmed") {
      setCurrentStatus("pickup");
    } else if (currentStatus === "pickup") {
      // Show confirmation for starting delivery
      showConfirmation(
        "start_delivery",
        "Start Delivery?",
        "Confirm that you have picked up all items and are ready to start the delivery."
      );
    } else if (currentStatus === "in_transit") {
      // Show confirmation for delivery completion
      showConfirmation(
        "confirm_delivery",
        "Confirm Delivery?",
        "Confirm that you have successfully delivered all items to the customer."
      );
    } else if (currentStatus === "delivered") {
      // Show confirmation for completing the job
      showConfirmation(
        "complete_job",
        "Complete Job?",
        "This will mark the job as completed and you'll be redirected to the dashboard."
      );
    }
  };

  const getActionButtonText = () => {
    switch (currentStatus) {
      case "confirmed":
        return "Arrived at Pickup";
      case "pickup":
        return "Start Delivery";
      case "in_transit":
        return "Confirm Delivery";
      case "delivered":
        return "Complete Job";
      default:
        return "Update Status";
    }
  };

  return (
    <SafeAreaContainer extraPadding={{ top: 10 }}>
      <View className="flex-1">
        {/* Header with back button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
          </TouchableOpacity>
          <Typography variant="h2">Job Details</Typography>
        </View>

        {/* Map View */}
        <View className="h-64 w-full rounded-lg overflow-hidden mb-4">
          <NavigationMap />
        </View>

        {/* Job Details */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-800 dark:text-white">
              Job #{jobDetails.id.substring(0, 6)}
            </Text>
            <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
              <Text className="text-primary-600 dark:text-primary-400 font-medium">
                {currentStatus === "confirmed"
                  ? "Confirmed"
                  : currentStatus === "pickup"
                    ? "Pickup"
                    : currentStatus === "in_transit"
                      ? "In Transit"
                      : "Delivered"}
              </Text>
            </View>
          </View>

          {/* Order Status Tracker */}
          <View className="mb-4">
            <OrderStatusTracker
              currentStatus={currentStatus}
              estimatedDeliveryTime={jobDetails.estimatedTime}
            />
          </View>

          {/* Customer Info */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Customer
            </Text>
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: jobDetails.customerImage }}
                className="w-12 h-12 rounded-full bg-gray-200"
              />
              <View className="ml-3">
                <Text className="font-semibold text-neutral-800 dark:text-white">
                  {jobDetails.customerName}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500">★</Text>
                  <Text className="text-neutral-600 dark:text-neutral-400 ml-1">
                    {jobDetails.customerRating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity className="flex-1 mr-2 py-2 bg-primary-500 rounded-lg flex-row items-center justify-center">
                <Phone size={16} color="#ffffff" />
                <Text className="ml-2 text-white font-medium">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 ml-2 py-2 bg-gray-200 dark:bg-neutral-700 rounded-lg flex-row items-center justify-center">
                <MessageCircle
                  size={16}
                  color={isDarkMode ? "#ffffff" : "#374151"}
                />
                <Text className="ml-2 font-medium text-neutral-800 dark:text-white">
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Details */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Location Details
            </Text>
            <View className="mb-4">
              <View className="flex-row items-center mb-1">
                <MapPin size={16} color="#ef4444" />
                <Text className="ml-2 font-medium text-neutral-800 dark:text-white">
                  Pickup
                </Text>
              </View>
              <Text className="text-neutral-700 dark:text-neutral-300 ml-6 mb-1">
                {jobDetails.pickupLocation}
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 ml-6 text-sm">
                {jobDetails.pickupDetails}
              </Text>
            </View>
            <View>
              <View className="flex-row items-center mb-1">
                <MapPin size={16} color="#3b82f6" />
                <Text className="ml-2 font-medium text-neutral-800 dark:text-white">
                  Destination
                </Text>
              </View>
              <Text className="text-neutral-700 dark:text-neutral-300 ml-6 mb-1">
                {jobDetails.destinationLocation}
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-400 ml-6 text-sm">
                {jobDetails.destinationDetails}
              </Text>
            </View>
          </View>

          {/* Cargo Details */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Cargo Details
            </Text>
            <View className="flex-row items-center mb-2">
              <Package size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                {jobDetails.cargoDescription}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Estimated weight:
              </Text>
              <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                {jobDetails.cargoWeight}
              </Text>
            </View>
          </View>

          {/* Trip Summary */}
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
              Trip Summary
            </Text>
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Clock size={16} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
                <Text className="ml-2 text-neutral-600 dark:text-neutral-400">
                  Estimated Time
                </Text>
              </View>
              <Text className="text-neutral-800 dark:text-white">
                {jobDetails.estimatedTime}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-neutral-600 dark:text-neutral-400">
                Distance
              </Text>
              <Text className="text-neutral-800 dark:text-white">
                {jobDetails.distance}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <DollarSign
                  size={16}
                  color={isDarkMode ? "#9ca3af" : "#6b7280"}
                />
                <Text className="ml-2 text-neutral-600 dark:text-neutral-400">
                  Earnings
                </Text>
              </View>
              <Text className="text-neutral-800 dark:text-white font-bold">
                {jobDetails.currency} {jobDetails.price}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            className="py-4 bg-primary-500 rounded-lg items-center justify-center mb-4"
            onPress={handleUpdateStatus}
          >
            <Text className="text-white font-semibold">
              {getActionButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isConfirmationVisible}
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            isDarkMode ? { backgroundColor: '#1f2937' } : { backgroundColor: '#ffffff' }
          ]}>
            <View style={styles.modalHeader}>
              <AlertCircle size={24} color="#f59e0b" />
              <Text style={[
                styles.modalTitle,
                isDarkMode ? { color: '#ffffff' } : { color: '#374151' }
              ]}>
                {confirmationTitle}
              </Text>
            </View>
            
            <Text style={[
              styles.modalMessage,
              isDarkMode ? { color: '#d1d5db' } : { color: '#4b5563' }
            ]}>
              {confirmationMessage}
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsConfirmationVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmAction}
              >
                <CheckCircle size={16} color="#ffffff" />
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default JobDetailsScreen;
