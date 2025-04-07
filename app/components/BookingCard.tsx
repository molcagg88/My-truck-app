import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Truck, ArrowRight, Calendar } from "lucide-react-native";
import { useTheme } from "../_layout";

interface BookingCardProps {
  onBookingInitiated?: () => void;
  isCollapsed?: boolean;
}

// Mock implementation of location selector
const LocationSelector = ({
  placeholder = "Enter location",
  value = "",
  onLocationSelected = (location: string) => {},
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <TouchableOpacity
      className={`p-3 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-gray-100'}`}
      onPress={() => onLocationSelected("Sample Location")}
    >
      <Text className={value 
        ? (isDarkMode ? 'text-white' : 'text-gray-800') 
        : (isDarkMode ? 'text-neutral-400' : 'text-gray-400')
      }>
        {value || placeholder}
      </Text>
    </TouchableOpacity>
  );
};

// Mock implementation of truck type selector
const TruckTypeSelector = ({
  onTruckTypeSelected = (truckType: string) => {},
  selectedTruckType = "",
}) => {
  const { isDarkMode } = useTheme();
  const truckTypes = [
    { id: "1", name: "Small Pickup", capacity: "1 ton" },
    { id: "2", name: "Medium Truck", capacity: "3 tons" },
    { id: "3", name: "Large Truck", capacity: "7 tons" },
  ];

  return (
    <View className="flex-row space-x-2 overflow-hidden">
      {truckTypes.map((truck) => (
        <TouchableOpacity
          key={truck.id}
          className={`p-3 rounded-lg border ${
            selectedTruckType === truck.id 
              ? isDarkMode 
                ? 'border-red-500 bg-red-900/30' 
                : 'border-red-500 bg-red-50'
              : isDarkMode 
                ? 'border-neutral-600 bg-neutral-700' 
                : 'border-gray-200 bg-gray-50'
          }`}
          onPress={() => onTruckTypeSelected(truck.id)}
        >
          <Text
            className={`text-sm font-medium ${
              selectedTruckType === truck.id 
                ? 'text-red-500' 
                : isDarkMode ? 'text-neutral-300' : 'text-gray-700'
            }`}
          >
            {truck.name}
          </Text>
          <Text className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
            {truck.capacity}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const BookingCard = ({
  onBookingInitiated = () => {},
  isCollapsed = false,
}: BookingCardProps) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState(!isCollapsed);
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedTruckType, setSelectedTruckType] = useState("");

  const handleStartBooking = () => {
    if (expanded) {
      if (pickupLocation && destinationLocation && selectedTruckType) {
        onBookingInitiated();
        router.push({
          pathname: "/customer/booking",
          params: {
            pickup: pickupLocation,
            destination: destinationLocation,
            truckType: selectedTruckType,
          },
        });
      }
    } else {
      setExpanded(true);
    }
  };

  return (
    <View className={`rounded-xl shadow-md p-4 mx-4 my-2 ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
      <View className="mb-4">
        <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Book a Truck
        </Text>
      </View>

      {expanded ? (
        <>
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <MapPin size={18} color="#ef4444" />
              <Text className={`ml-2 font-medium ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>
                Pickup Location
              </Text>
            </View>
            <LocationSelector
              placeholder="Enter pickup location"
              value={pickupLocation}
              onLocationSelected={setPickupLocation}
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <MapPin size={18} color="#ef4444" />
              <Text className={`ml-2 font-medium ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>
                Destination
              </Text>
            </View>
            <LocationSelector
              placeholder="Enter destination"
              value={destinationLocation}
              onLocationSelected={setDestinationLocation}
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Truck size={18} color="#ef4444" />
              <Text className={`ml-2 font-medium ${isDarkMode ? 'text-neutral-300' : 'text-gray-700'}`}>
                Truck Type
              </Text>
            </View>
            <TruckTypeSelector
              onTruckTypeSelected={setSelectedTruckType}
              selectedTruckType={selectedTruckType}
            />
          </View>

          <TouchableOpacity
            className={`py-3 rounded-lg flex-row justify-center items-center ${
              pickupLocation && destinationLocation && selectedTruckType 
                ? "bg-red-500" 
                : isDarkMode ? "bg-neutral-700" : "bg-gray-300"
            }`}
            onPress={handleStartBooking}
            disabled={
              !pickupLocation || !destinationLocation || !selectedTruckType
            }
          >
            <Text className="text-white font-bold mr-2">Continue Booking</Text>
            <ArrowRight size={18} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          className={`flex-row items-center justify-between p-3 rounded-lg ${
            isDarkMode ? 'bg-neutral-700' : 'bg-gray-100'
          }`}
          onPress={handleStartBooking}
        >
          <View className="flex-row items-center">
            <Calendar size={20} color="#ef4444" />
            <Text className={isDarkMode ? 'text-white ml-2' : 'text-gray-700 ml-2'}>
              Schedule a truck delivery
            </Text>
          </View>
          <ArrowRight size={18} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BookingCard;
