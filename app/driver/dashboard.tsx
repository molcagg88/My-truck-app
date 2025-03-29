import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Bell, Settings, MapPin, Clock, Truck } from "lucide-react-native";
import { useTheme } from "../_layout";
import RequestsList from "../components/RequestsList";
import EarningsSummary from "../components/EarningsSummary";

const DriverDashboard = () => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "requests" | "active" | "completed"
  >("requests");

  // Mock active job
  const activeJob = {
    id: "job123",
    customerName: "Tigist Haile",
    pickupLocation: "Piassa, Addis Ababa",
    destinationLocation: "CMC, Addis Ababa",
    distance: "12.3 km",
    estimatedTime: "40 mins",
    price: 520,
    status: "in_transit",
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleViewJobDetails = (jobId: string) => {
    router.push({
      pathname: "/driver/job-details",
      params: { jobId },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-neutral-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-neutral-800 dark:text-white">
            Driver Dashboard
          </Text>
          <View className="flex-row items-center">
            <View
              className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-neutral-400"} mr-2`}
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

      {/* Online/Offline Toggle */}
      <View className="px-4 mb-4">
        <TouchableOpacity
          className={`py-3 rounded-lg flex-row items-center justify-center ${isOnline ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
          onPress={handleToggleOnline}
        >
          <Text className="font-semibold text-white">
            {isOnline ? "Go Offline" : "Go Online"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Earnings Summary */}
      <View className="px-4 mb-4">
        <EarningsSummary
          todayEarnings={250}
          weeklyEarnings={1850}
          totalEarnings={12500}
          currency="ETB"
          onViewDetails={() => router.push("/driver/earnings")}
        />
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 dark:border-neutral-800 mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "requests" ? "border-b-2 border-primary-500" : ""}`}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "requests" ? "text-primary-500" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "active" ? "border-b-2 border-primary-500" : ""}`}
          onPress={() => setActiveTab("active")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "active" ? "text-primary-500" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${activeTab === "completed" ? "border-b-2 border-primary-500" : ""}`}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            className={`text-center font-medium ${activeTab === "completed" ? "text-primary-500" : "text-neutral-600 dark:text-neutral-400"}`}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="px-4 mb-8">
        {activeTab === "requests" && (
          <RequestsList
            onAccept={(id) => handleViewJobDetails(id)}
            onDecline={(id) => console.log(`Declined job ${id}`)}
            onCallCustomer={(id) =>
              console.log(`Calling customer for job ${id}`)
            }
          />
        )}

        {activeTab === "active" && (
          <View>
            {activeJob ? (
              <TouchableOpacity
                className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-neutral-700"
                onPress={() => handleViewJobDetails(activeJob.id)}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-semibold text-lg text-neutral-800 dark:text-white">
                    {activeJob.customerName}
                  </Text>
                  <View className="bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-full">
                    <Text className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                      In Progress
                    </Text>
                  </View>
                </View>

                <View className="mb-3">
                  <View className="flex-row items-center mb-2">
                    <MapPin size={16} color="#ef4444" />
                    <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                      {activeJob.pickupLocation}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#3b82f6" />
                    <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                      {activeJob.destinationLocation}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-row items-center">
                    <Clock
                      size={16}
                      color={isDarkMode ? "#9ca3af" : "#6b7280"}
                    />
                    <Text className="ml-1 text-neutral-600 dark:text-neutral-400">
                      {activeJob.estimatedTime}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Truck
                      size={16}
                      color={isDarkMode ? "#9ca3af" : "#6b7280"}
                    />
                    <Text className="ml-1 text-neutral-600 dark:text-neutral-400">
                      {activeJob.distance}
                    </Text>
                  </View>
                  <Text className="font-bold text-neutral-800 dark:text-white">
                    ETB {activeJob.price}
                  </Text>
                </View>

                <TouchableOpacity
                  className="mt-3 py-2 bg-primary-500 rounded-lg items-center"
                  onPress={() => handleViewJobDetails(activeJob.id)}
                >
                  <Text className="text-white font-medium">View Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ) : (
              <View className="bg-white dark:bg-neutral-800 rounded-lg p-8 items-center justify-center shadow-sm">
                <Text className="text-neutral-600 dark:text-neutral-400 text-center mb-2">
                  No active jobs
                </Text>
                <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm">
                  Accept a new request to start earning
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "completed" && (
          <View className="bg-white dark:bg-neutral-800 rounded-lg p-8 items-center justify-center shadow-sm">
            <Text className="text-neutral-600 dark:text-neutral-400 text-center mb-2">
              No completed jobs today
            </Text>
            <Text className="text-neutral-500 dark:text-neutral-500 text-center text-sm">
              Completed jobs will appear here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DriverDashboard;
