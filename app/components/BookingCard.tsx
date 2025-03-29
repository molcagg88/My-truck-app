import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Truck, ArrowRight, Calendar } from "lucide-react-native";

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
  return (
    <TouchableOpacity
      className="bg-gray-100 p-3 rounded-lg"
      onPress={() => onLocationSelected("Sample Location")}
    >
      <Text className={`${value ? "text-gray-800" : "text-gray-400"}`}>
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
          className={`p-3 rounded-lg border ${selectedTruckType === truck.id ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50"}`}
          onPress={() => onTruckTypeSelected(truck.id)}
        >
          <Text
            className={`text-sm font-medium ${selectedTruckType === truck.id ? "text-red-500" : "text-gray-700"}`}
          >
            {truck.name}
          </Text>
          <Text className="text-xs text-gray-500">{truck.capacity}</Text>
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
  const [expanded, setExpanded] = useState(!isCollapsed);
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedTruckType, setSelectedTruckType] = useState("");

  const handleStartBooking = () => {
    if (expanded) {
      if (pickupLocation && destinationLocation && selectedTruckType) {
        onBookingInitiated();
        router.push("/customer/booking");
      }
    } else {
      setExpanded(true);
    }
  };

  return (
    <View className="bg-white rounded-xl shadow-md p-4 mx-4 my-2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Book a Truck</Text>
        <TouchableOpacity
          className="bg-red-500 rounded-full p-2"
          onPress={() => setExpanded(!expanded)}
        >
          <ArrowRight size={18} color="white" />
        </TouchableOpacity>
      </View>

      {expanded ? (
        <>
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <MapPin size={18} color="#ef4444" />
              <Text className="ml-2 text-gray-700 font-medium">
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
              <Text className="ml-2 text-gray-700 font-medium">
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
              <Text className="ml-2 text-gray-700 font-medium">Truck Type</Text>
            </View>
            <TruckTypeSelector
              onTruckTypeSelected={setSelectedTruckType}
              selectedTruckType={selectedTruckType}
            />
          </View>

          <TouchableOpacity
            className={`py-3 rounded-lg flex-row justify-center items-center ${pickupLocation && destinationLocation && selectedTruckType ? "bg-red-500" : "bg-gray-300"}`}
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
          className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg"
          onPress={handleStartBooking}
        >
          <View className="flex-row items-center">
            <Calendar size={20} color="#ef4444" />
            <Text className="ml-2 text-gray-700">
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
