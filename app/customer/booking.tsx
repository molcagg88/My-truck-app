import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, Clock, Package } from "lucide-react-native";
import { useTheme } from "../_layout";
import LocationSelector from "../components/LocationSelector";
import TruckTypeSelector from "../components/TruckTypeSelector";
import PriceEstimate from "../components/PriceEstimate";
import DateTimePicker from "@react-native-community/datetimepicker";
import SafeAreaContainer from "../utils/SafeAreaContainer";
import Typography from "../utils/typography";
import storage from "../utils/storage";
import customerService from "../services/customerService";
import { handleApiError } from "../services/apiUtils";

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log('Form state updated:', {
      pickupLocation,
      destinationLocation,
      selectedTruckId,
      cargoDescription,
      scheduledTime,
      selectedDate
    });
  }, [pickupLocation, destinationLocation, selectedTruckId, cargoDescription, scheduledTime, selectedDate]);

  // Initialize form with passed data
  useEffect(() => {
    console.log('Initializing form with params:', params);
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
    console.log('Submit button clicked');
    console.log('Form state:', {
      pickupLocation,
      destinationLocation,
      selectedTruckId,
      isFormComplete
    });

    try {
    if (pickupLocation && destinationLocation && selectedTruckId) {
        console.log('Form is complete, showing confirmation modal');
        setShowConfirmationModal(true);
      } else {
        console.log('Form is incomplete:', {
          hasPickup: !!pickupLocation,
          hasDestination: !!destinationLocation,
          hasTruckType: !!selectedTruckId
        });
        
        if (typeof window !== 'undefined') {
          window.alert("Please fill in all required fields before submitting.");
        } else {
          Alert.alert(
            "Incomplete Form",
            "Please fill in all required fields before submitting.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
      if (typeof window !== 'undefined') {
        window.alert("An error occurred while submitting your request. Please try again.");
      } else {
        Alert.alert(
          "Error",
          "An error occurred while submitting your request. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const handleConfirmOrder = async () => {
    setShowConfirmationModal(false);
    try {
      // Create the order through the API
      const orderData = {
        pickupLocation,
        destinationLocation,
        truckType: selectedTruckId,
        description: cargoDescription,
        scheduledTime: scheduledTime === "now" ? new Date() : selectedDate,
          price: estimatedPrice,
      };
      
      await customerService.createOrder(orderData);
      
      // Update active orders count using AsyncStorage
      await storage.incrementActiveOrdersCount();
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating order:", error);
      Alert.alert(
        "Error",
        "Failed to create order. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSuccessNavigation = () => {
    setShowSuccessModal(false);
    try {
      router.push("/customer/dashboard");
      console.log('Navigation command sent');
    } catch (navError) {
      console.error('Navigation error:', navError);
      // Fallback navigation if router.push fails
      window.location.href = '/customer/dashboard';
    }
  };

  const isFormComplete =
    pickupLocation && destinationLocation && selectedTruckId;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date changed:', selectedDate);
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <SafeAreaContainer extraPadding={{ top: 10 }}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Typography variant="h2">Book a Truck</Typography>
        </View>
      </View>

        {/* Location Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
            Locations
          </Text>
          <LocationSelector
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
          onPickupChange={(location) => {
            console.log('Pickup location changed:', location);
            setPickupLocation(location);
          }}
          onDestinationChange={(location) => {
            console.log('Destination location changed:', location);
            setDestinationLocation(location);
          }}
          />
        </View>

        {/* Truck Type Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
            Truck Type
          </Text>
          <TruckTypeSelector
            selectedTruckId={selectedTruckId}
          onSelectTruck={(truckId) => {
            console.log('Truck type selected:', truckId);
            setSelectedTruckId(truckId);
          }}
          />
        </View>

        {/* Cargo Description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
            Cargo Details
          </Text>
        <View style={[styles.cargoContainer, isDarkMode ? styles.darkCargoContainer : styles.lightCargoContainer]}>
          <View style={styles.cargoHeader}>
              <Package size={20} color={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Text style={[styles.cargoLabel, isDarkMode ? styles.darkText : styles.lightText]}>
                What are you shipping?
              </Text>
            </View>
            <TextInput
            style={[styles.cargoInput, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Describe your cargo (e.g., furniture, boxes, etc.)"
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
              value={cargoDescription}
            onChangeText={(text) => {
              console.log('Cargo description changed:', text);
              setCargoDescription(text);
            }}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Scheduling */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode ? styles.darkText : styles.lightText]}>
            When do you need it?
          </Text>
        <View style={styles.scheduleButtons}>
            <TouchableOpacity
            style={[
              styles.scheduleButton,
              scheduledTime === "now" ? styles.activeButton : isDarkMode ? styles.darkButton : styles.lightButton
            ]}
            onPress={() => {
              console.log('Schedule time changed to: now');
              setScheduledTime("now");
            }}
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
              style={[
                styles.scheduleButtonText,
                scheduledTime === "now" ? styles.activeButtonText : isDarkMode ? styles.darkText : styles.lightText
              ]}
              >
                Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[
              styles.scheduleButton,
              scheduledTime === "schedule" ? styles.activeButton : isDarkMode ? styles.darkButton : styles.lightButton
            ]}
              onPress={() => {
              console.log('Schedule time changed to: schedule');
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
              style={[
                styles.scheduleButtonText,
                scheduledTime === "schedule" ? styles.activeButtonText : isDarkMode ? styles.darkText : styles.lightText
              ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
          {scheduledTime === "schedule" && (
          <View style={[styles.scheduleDateContainer, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
            <Text style={isDarkMode ? styles.darkText : styles.lightText}>
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
        <View style={styles.section}>
            <PriceEstimate
              price={estimatedPrice}
            distance={calculateDistance(pickupLocation, destinationLocation)} 
            />
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity
        style={[
          styles.submitButton,
          isFormComplete ? styles.activeSubmitButton : isDarkMode ? styles.darkButton : styles.lightButton
        ]}
          onPress={handleContinue}
          disabled={!isFormComplete}
        >
        <Text style={styles.submitButtonText}>
          Submit Job Request
          </Text>
        </TouchableOpacity>

      {/* Order Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.darkModalContent : styles.lightModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
              Confirm Order
            </Text>
            <Text style={[styles.modalMessage, isDarkMode ? styles.darkText : styles.lightText]}>
              Are you sure you want to place this order? Once confirmed, drivers will be able to bid on your job request.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.confirmButtonText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.darkModalContent : styles.lightModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>
              Order Placed Successfully!
            </Text>
            <Text style={[styles.modalMessage, isDarkMode ? styles.darkText : styles.lightText]}>
              Your job request has been submitted successfully. You will be notified when drivers place bids or accept your job.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSuccessNavigation}
              >
                <Text style={styles.confirmButtonText}>Continue to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
      </View>
      </Modal>
    </SafeAreaContainer>
  );
};

// Helper function to simulate distance calculation
const calculateDistance = (pickup: string, destination: string): number => {
  // This would be replaced by actual distance calculation in a real app
  return Math.floor(Math.random() * 40 + 5);
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cargoContainer: {
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cargoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cargoLabel: {
    marginLeft: 8,
  },
  cargoInput: {
    padding: 8,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scheduleButtons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scheduleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  scheduleButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  scheduleDateContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Light mode styles
  lightText: {
    color: '#1f2937',
  },
  lightContainer: {
    backgroundColor: '#f3f4f6',
  },
  lightCargoContainer: {
    backgroundColor: '#f3f4f6',
  },
  lightInput: {
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  lightButton: {
    backgroundColor: '#f3f4f6',
  },
  // Dark mode styles
  darkText: {
    color: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#262626',
  },
  darkCargoContainer: {
    backgroundColor: '#262626',
  },
  darkInput: {
    backgroundColor: '#404040',
    color: '#ffffff',
  },
  darkButton: {
    backgroundColor: '#262626',
  },
  // Active states
  activeButton: {
    backgroundColor: '#ef4444',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  activeSubmitButton: {
    backgroundColor: '#ef4444',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lightModalContent: {
    backgroundColor: '#ffffff',
  },
  darkModalContent: {
    backgroundColor: '#262626',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default BookingScreen;
