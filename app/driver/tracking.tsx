import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MessageCircle, Phone, Star, AlertTriangle, XCircle } from "lucide-react-native";
import { useTheme } from "../_layout";
import LiveMap from "../components/LiveMap";
import OrderStatusTracker from "../components/OrderStatusTracker";
import DriverInfo from "../components/DriverInfo";
import SafeAreaContainer from "../utils/SafeAreaContainer";
import Typography from "../utils/typography";
import driverService from "../services/driverService";
import { useOrders } from "../contexts/OrderContext";

type OrderStatus = "confirmed" | "pickup" | "in_transit" | "delivered";

interface JobDetails {
  id: string;
  status: OrderStatus;
  pickupLocation: string;
  destinationLocation: string;
  distance: string;
  price: number;
  currency: string;
  customer?: {
    name: string;
    phone: string;
    rating: number;
    profileImage?: string;
  };
  driver?: {
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

const TrackingScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { jobId } = useLocalSearchParams();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateOrderStatus } = useOrders();

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const job = await driverService.getJobDetails(jobId as string);
      setJobDetails(job);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch job details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      if (jobDetails?.status === "confirmed") {
        await updateOrderStatus(jobId as string, "pickup");
      } else if (jobDetails?.status === "pickup") {
        await updateOrderStatus(jobId as string, "in_transit");
      } else if (jobDetails?.status === "in_transit") {
        await updateOrderStatus(jobId as string, "delivered");
        router.push("/driver/tracking");
      }
      await fetchJobDetails();
    } catch (error) {
      Alert.alert("Error", "Failed to update job status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      await updateOrderStatus(jobId as string, "cancelled");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to cancel job");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !jobDetails) {
    return (
      <SafeAreaContainer scrollable={false}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-600 dark:text-neutral-400">Loading job details...</Text>
        </View>
      </SafeAreaContainer>
    );
  }

  if (!jobDetails) {
    return (
      <SafeAreaContainer scrollable={false}>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-red-500 text-center mb-4">Failed to load job details</Text>
          <TouchableOpacity
            className="bg-red-500 py-2 px-4 rounded-lg"
            onPress={fetchJobDetails}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer scrollable={true}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-neutral-800 dark:text-white">
          Job #{jobDetails.id}
        </Text>
        <TouchableOpacity onPress={() => setIsCancelModalVisible(true)}>
          <XCircle size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View className="h-64 mb-6">
        <LiveMap />
      </View>

      {/* Status Tracker */}
      <View className="mb-6">
        <OrderStatusTracker
          currentStatus={jobDetails.status}
        />
      </View>

      {/* Customer Info */}
      {jobDetails.customer && (
        <View className="mb-4">
          <DriverInfo
            driverName={jobDetails.customer.name}
            driverImage={jobDetails.customer.profileImage}
            phoneNumber={jobDetails.customer.phone}
            rating={jobDetails.customer.rating}
          />
        </View>
      )}

      {/* Trip Details */}
      <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-3 text-neutral-800 dark:text-white">
          Trip Details
        </Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-neutral-600 dark:text-neutral-400">Pickup</Text>
          <Text className="text-neutral-800 dark:text-white font-medium">
            {jobDetails.pickupLocation}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-neutral-600 dark:text-neutral-400">Destination</Text>
          <Text className="text-neutral-800 dark:text-white font-medium">
            {jobDetails.destinationLocation}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-neutral-600 dark:text-neutral-400">Distance</Text>
          <Text className="text-neutral-800 dark:text-white font-medium">
            {jobDetails.distance}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-neutral-600 dark:text-neutral-400">Price</Text>
          <Text className="text-neutral-800 dark:text-white font-medium">
            {jobDetails.price} {jobDetails.currency}
          </Text>
        </View>
      </View>

      {/* Cancel Modal */}
      <Modal
        visible={isCancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-4/5">
            <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
              Cancel Job
            </Text>
            <Text className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to cancel this job? This action cannot be undone.
            </Text>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                onPress={() => setIsCancelModalVisible(false)}
              >
                <Text className="text-neutral-600 dark:text-neutral-400">No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-lg"
                onPress={handleCancel}
              >
                <Text className="text-white">Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaContainer>
  );
};

export default TrackingScreen; 