import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  RefreshControl,
} from "react-native";
import { useTheme } from "../_layout";
import { useRouter } from "expo-router";
import RequestsList from "../components/RequestsList";
import { Bell, Settings, MapPin, Clock, Truck, Package, Gavel, Check, X } from "lucide-react-native";
import PaymentModal from "../components/PaymentModal";
import SafeAreaContainer from "../utils/SafeAreaContainer";

const COMMITMENT_FEE = 400;

type JobStatus = "pending" | "bidding" | "accepted" | "delivered" | "cancelled" | "declined";

interface JobRequest {
  id: string;
  pickup: string;
  destination: string;
  estimatedTime: string;
  price: number;
  status: JobStatus;
  customerId: string;
  currentBid?: number;
  driverId?: string;
  distance?: string;
}

// Sample job requests for testing
const sampleRequests: JobRequest[] = [
  {
    id: "1",
    pickup: "Bole, Addis Ababa",
    destination: "Bishoftu, Oromia",
    estimatedTime: "2 hours",
    price: 2500,
    status: "pending",
    customerId: "customer1",
    distance: "45 km",
  },
  {
    id: "2",
    pickup: "Megenagna, Addis Ababa",
    destination: "Adama, Oromia",
    estimatedTime: "3 hours",
    price: 3500,
    status: "bidding",
    currentBid: 3200,
    customerId: "customer2",
    distance: "95 km",
  },
  {
    id: "3",
    pickup: "Piassa, Addis Ababa",
    destination: "Debre Birhan, Amhara",
    estimatedTime: "4 hours",
    price: 4500,
    status: "pending",
    customerId: "customer3",
    distance: "130 km",
  },
  {
    id: "4",
    pickup: "Merkato, Addis Ababa",
    destination: "Hawassa, SNNPR",
    estimatedTime: "5 hours",
    price: 5500,
    status: "accepted",
    customerId: "customer4",
    driverId: "driver1",
    distance: "275 km",
  },
  {
    id: "5",
    pickup: "Bole, Addis Ababa",
    destination: "Dire Dawa, Dire Dawa",
    estimatedTime: "6 hours",
    price: 6500,
    status: "delivered",
    customerId: "customer5",
    driverId: "driver1",
    distance: "515 km",
  },
];

export default function DriverDashboard() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [activeJobs, setActiveJobs] = useState<JobRequest[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(
    sampleRequests.filter(job => job.status === "pending" || job.status === "bidding")
  );
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);

  const hasActiveJob = activeJobs.length > 0;

  const handleAccept = async (jobId: string) => {
    if (hasActiveJob) {
      setWarningMessage("Please complete your current job before accepting a new one.");
      setShowWarning(true);
      return;
    }

    setSelectedJob(jobRequests.find(job => job.id === jobId) || null);
    setShowPaymentModal(true);
  };

  const handleDecline = (jobId: string) => {
    setJobRequests(jobRequests.filter(job => job.id !== jobId));
  };

  const handleBid = (jobId: string, amount: number) => {
    setJobRequests(
      jobRequests.map(job =>
        job.id === jobId
          ? { ...job, currentBid: amount, bidderId: "driver123" }
          : job
      )
    );
  };

  const handleAcceptBid = (jobId: string) => {
    if (hasActiveJob) {
      setWarningMessage("Please complete your current job before accepting a new one.");
      setShowWarning(true);
      return;
    }

    setSelectedJob(jobRequests.find(job => job.id === jobId) || null);
    setShowPaymentModal(true);
  };

  const handleDeclineBid = (jobId: string) => {
    setJobRequests(
      jobRequests.map(job =>
        job.id === jobId ? { ...job, currentBid: undefined, bidderId: undefined } : job
      )
    );
  };

  const handleCounterBid = (jobId: string, amount: number) => {
    setJobRequests(
      jobRequests.map(job =>
        job.id === jobId ? { ...job, currentBid: amount } : job
      )
    );
  };

  const handlePaymentSuccess = async () => {
    if (selectedJob) {
      const updatedJob = { ...selectedJob, status: "accepted" as const, driverId: "driver123" };
      setActiveJobs([...activeJobs, updatedJob]);
      setJobRequests(jobRequests.filter(job => job.id !== selectedJob.id));
      setShowPaymentModal(false);
      setSelectedJob(null);
      setShowWarning(true);
      setWarningMessage("Job accepted! Please keep your location on and confirm checkpoints every 2 hours.");
    }
  };

  const handlePaymentFailure = () => {
    setShowPaymentModal(false);
    setSelectedJob(null);
  };

  const handleToggleOnline = () => {
    if (hasActiveJob) {
      setWarningMessage("Cannot go offline while you have an active job. Please complete your current job first.");
      setShowWarning(true);
      return;
    }
    setIsOnline(!isOnline);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaContainer
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
              Driver Dashboard
            </Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`h-3 w-3 rounded-full mr-2 ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text className="text-neutral-600 dark:text-neutral-400">
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="mr-4"
              onPress={() => router.push("/notifications")}
            >
              <Bell size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Settings size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Card */}
        <View
          className={`mb-6 p-4 rounded-lg ${
            isOnline
              ? "bg-green-50 dark:bg-green-900"
              : "bg-red-50 dark:bg-red-900"
          }`}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                className={`text-lg font-semibold ${
                  isOnline
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {isOnline ? "You're online" : "You're offline"}
              </Text>
              <Text
                className={`${
                  isOnline
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isOnline
                  ? "You're visible to customers"
                  : "You're not receiving any jobs"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleOnline}
              className={`py-2 px-4 rounded-lg ${
                isOnline
                  ? "bg-white dark:bg-neutral-800"
                  : "bg-white dark:bg-neutral-800"
              }`}
            >
              <Text
                className={`font-medium ${
                  isOnline
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isOnline ? "Go Offline" : "Go Online"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job Requests */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-neutral-800 dark:text-white mb-4">
            Job Requests
          </Text>
          <RequestsList
            requests={jobRequests}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onBid={handleBid}
            onAcceptBid={handleAcceptBid}
            onDeclineBid={handleDeclineBid}
            onCounterBid={handleCounterBid}
            driverId="driver123"
          />
        </View>

        {/* Active Jobs */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-neutral-800 dark:text-white mb-4">
            Active Jobs
          </Text>
          {activeJobs.length > 0 ? (
            activeJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm mb-4"
                onPress={() => router.push({
                  pathname: "/driver/job-details",
                  params: { jobId: job.id }
                })}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-neutral-800 dark:text-white">
                      Delivery Job #{job.id}
                    </Text>
                    <Text className="text-neutral-600 dark:text-neutral-400">
                      Distance: {job.distance}
                    </Text>
                  </View>
                  <View className="bg-green-100 dark:bg-green-900 py-1 px-3 rounded-full">
                    <Text className="text-green-800 dark:text-green-200 text-sm">Active</Text>
                  </View>
                </View>
                <View className="flex-row items-center mb-2">
                  <MapPin
                    size={18}
                    color={isDarkMode ? "#9ca3af" : "#6b7280"}
                    className="mr-2"
                  />
                  <Text className="text-neutral-600 dark:text-neutral-400 flex-1">
                    {job.pickup}
                  </Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <MapPin
                    size={18}
                    color={isDarkMode ? "#9ca3af" : "#6b7280"}
                    className="mr-2"
                  />
                  <Text className="text-neutral-600 dark:text-neutral-400 flex-1">
                    {job.destination}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center pt-2 border-t border-gray-200 dark:border-neutral-700">
                  <View className="flex-row items-center">
                    <Clock
                      size={16}
                      color={isDarkMode ? "#9ca3af" : "#6b7280"}
                      className="mr-1"
                    />
                    <Text className="text-neutral-500 dark:text-neutral-500">
                      {job.estimatedTime}
                    </Text>
                  </View>
                  <Text className="font-semibold text-neutral-800 dark:text-white">
                    ETB {job.price.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white dark:bg-neutral-800 p-8 rounded-lg items-center justify-center">
              <Truck size={40} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-4 mb-2">
                No active jobs
              </Text>
              <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm">
                Accept a job request to start earning
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Warning Modal */}
      <Modal
        transparent={true}
        visible={showWarning}
        animationType="fade"
        onRequestClose={() => setShowWarning(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-neutral-800 m-5 p-5 rounded-lg w-[90%]">
            <Text className="text-lg font-semibold text-neutral-800 dark:text-white mb-3">
              Notice
            </Text>
            <Text className="text-neutral-600 dark:text-neutral-400 mb-4">
              {warningMessage}
            </Text>
            <TouchableOpacity
              className="bg-red-500 py-2 rounded-lg"
              onPress={() => setShowWarning(false)}
            >
              <Text className="text-white text-center font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      {selectedJob && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={handlePaymentFailure}
          onSuccess={handlePaymentSuccess}
          amount={COMMITMENT_FEE}
          jobId={selectedJob.id}
        />
      )}
    </SafeAreaContainer>
  );
}



