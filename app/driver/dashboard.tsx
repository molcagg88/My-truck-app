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
    <View className={`flex-1 ${isDarkMode ? "bg-neutral-900" : "bg-neutral-50"}`}>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              Driver Dashboard
            </Text>
            <TouchableOpacity
              onPress={handleToggleOnline}
              disabled={hasActiveJob}
              className={`px-4 py-2 rounded-lg ${
                isOnline
                  ? hasActiveJob 
                    ? "bg-neutral-400"
                    : "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              <Text className="text-white font-medium">
                {isOnline ? "Go Offline" : "Go Online"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View className="flex-row space-x-4 mb-4">
            <View
              className={`flex-1 p-4 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-white"
              }`}
            >
              <Text
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                Active Jobs
              </Text>
              <Text
                className={`text-3xl font-bold ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                {activeJobs.length}
              </Text>
            </View>
            <View
              className={`flex-1 p-4 rounded-lg ${
                isDarkMode ? "bg-neutral-800" : "bg-white"
              }`}
            >
              <Text
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                Available Jobs
              </Text>
              <Text
                className={`text-3xl font-bold ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                {jobRequests.length}
              </Text>
            </View>
          </View>

          {/* Job Requests Section */}
          {isOnline && jobRequests.length > 0 && (
            <View className="mb-4">
              <Text
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
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
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            </View>
          )}

          {/* Active Jobs Section */}
          {activeJobs.length > 0 && (
            <View className="mb-4">
              <Text
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                Active Jobs
              </Text>
              <RequestsList
                requests={activeJobs}
                onAccept={() => {}}
                onDecline={() => {}}
                onBid={() => {}}
                onAcceptBid={() => {}}
                onDeclineBid={() => {}}
                onCounterBid={() => {}}
                driverId="driver123"
              />
            </View>
          )}

          {/* Empty States */}
          {!isOnline && (
            <View className="items-center justify-center py-8">
              <Text
                className={`text-lg ${
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                You are currently offline. Go online to see job requests.
              </Text>
            </View>
          )}

          {isOnline && jobRequests.length === 0 && !hasActiveJob && (
            <View className="items-center justify-center py-8">
              <Text
                className={`text-lg ${
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                }`}
              >
                No job requests available at the moment.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={handlePaymentFailure}
        onSuccess={handlePaymentSuccess}
        amount={COMMITMENT_FEE}
        jobId={selectedJob?.id || ""}
      />

      <Modal
        visible={showWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarning(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className={`p-6 rounded-lg mx-4 ${
              isDarkMode ? "bg-neutral-800" : "bg-white"
            }`}
          >
            <Text
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-neutral-900"
              }`}
            >
              {warningMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setShowWarning(false)}
              className={`p-3 rounded-lg ${
                isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
              }`}
            >
              <Text
                className={`text-center ${
                  isDarkMode ? "text-white" : "text-neutral-900"
                }`}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}



