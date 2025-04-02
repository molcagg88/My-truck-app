import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, Clock, Package } from "lucide-react-native";
import { useTheme } from "../_layout";
import LocationSelector from "../components/LocationSelector";
import TruckTypeSelector from "../components/TruckTypeSelector";
import PriceEstimate from "../components/PriceEstimate";
import DateTimePicker from "@react-native-community/datetimepicker";

const BookingScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [scheduledTime, setScheduledTime] = useState<"now" | "schedule">("now");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initialize form with passed data
  useEffect(() => {
    if (params.pickup) setPickupLocation(params.pickup as string);
    if (params.destination) setDestinationLocation(params.destination as string);
    if (params.truckType) setSelectedTruckId(params.truckType as string);
  }, [params]);

  // Estimated price based on selections
  const estimatedPrice = selectedTruckId
    ? selectedTruckId === "1"
      ? 350
      : selectedTruckId === "2"
        ? 550
        : selectedTruckId === "3"
          ? 850
          : selectedTruckId === "4"
            ? 950
            : 0
    : 0;

  const handleContinue = () => {
    if (pickupLocation && destinationLocation && selectedTruckId) {
      router.push({
        pathname: "/customer/payment",
        params: {
          price: estimatedPrice,
          pickup: pickupLocation,
          destination: destinationLocation,
          truckType: selectedTruckId,
          cargo: cargoDescription,
          scheduled: scheduledTime,
          scheduledDate: scheduledTime === "schedule" ? selectedDate.toISOString() : undefined,
        },
      });
    }
  };

  const isFormComplete =
    pickupLocation && destinationLocation && selectedTruckId;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">
          Book a Truck
        </Text>

        {/* Location Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Locations
          </Text>
          <LocationSelector
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            onPickupChange={setPickupLocation}
            onDestinationChange={setDestinationLocation}
          />
        </View>

        {/* Truck Type Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Truck Type
          </Text>
          <TruckTypeSelector
            selectedTruckId={selectedTruckId}
            onSelectTruck={setSelectedTruckId}
          />
        </View>

        {/* Cargo Description */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            Cargo Details
          </Text>
          <View className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <Package size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Text className="ml-2 text-neutral-700 dark:text-neutral-300">
                What are you shipping?
              </Text>
            </View>
            <TextInput
              className="py-2 px-4 bg-white dark:bg-neutral-700 rounded-lg text-neutral-800 dark:text-white"
              placeholder="Describe your cargo (e.g., furniture, boxes, etc.)"
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              value={cargoDescription}
              onChangeText={setCargoDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Scheduling */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">
            When do you need it?
          </Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 mr-2 p-4 rounded-lg flex-row items-center justify-center ${
                scheduledTime === "now" ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-800"
              }`}
              onPress={() => setScheduledTime("now")}
            >
              <Clock
                size={20}
                color={
                  scheduledTime === "now"
                    ? "#ffffff"
                    : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
              <Text
                className={`ml-2 font-medium ${
                  scheduledTime === "now" ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 ml-2 p-4 rounded-lg flex-row items-center justify-center ${
                scheduledTime === "schedule" ? "bg-primary-500" : "bg-neutral-100 dark:bg-neutral-800"
              }`}
              onPress={() => {
                setScheduledTime("schedule");
                setShowDatePicker(true);
              }}
            >
              <Calendar
                size={20}
                color={
                  scheduledTime === "schedule"
                    ? "#ffffff"
                    : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
              <Text
                className={`ml-2 font-medium ${
                  scheduledTime === "schedule" ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
          {scheduledTime === "schedule" && (
            <View className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Text className="text-neutral-700 dark:text-neutral-300">
                Scheduled for: {selectedDate.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Price Estimate */}
        {isFormComplete && (
          <View className="mb-6">
            <PriceEstimate
              price={estimatedPrice}
              currency="ETB"
              duration={45}
              distance={7.5}
            />
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isFormComplete}
          className={`py-4 rounded-lg ${
            !isFormComplete ? "bg-neutral-300 dark:bg-neutral-700" : "bg-primary-500"
          }`}
        >
          <Text className="text-white font-semibold text-center">
            Continue to Payment
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BookingScreen;
