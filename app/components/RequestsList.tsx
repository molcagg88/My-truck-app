import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import {
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Phone,
} from "lucide-react-native";

interface RequestItem {
  id: string;
  customerName: string;
  customerRating: number;
  pickupLocation: string;
  destinationLocation: string;
  distance: string;
  estimatedTime: string;
  price: number;
  timestamp: string;
}

interface RequestsListProps {
  requests?: RequestItem[];
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onCallCustomer?: (requestId: string) => void;
}

const RequestsList = ({
  requests = [
    {
      id: "1",
      customerName: "Abebe Kebede",
      customerRating: 4.8,
      pickupLocation: "Bole, Addis Ababa",
      destinationLocation: "Megenagna, Addis Ababa",
      distance: "7.5 km",
      estimatedTime: "25 mins",
      price: 350,
      timestamp: "2 mins ago",
    },
    {
      id: "2",
      customerName: "Tigist Haile",
      customerRating: 4.5,
      pickupLocation: "Piassa, Addis Ababa",
      destinationLocation: "CMC, Addis Ababa",
      distance: "12.3 km",
      estimatedTime: "40 mins",
      price: 520,
      timestamp: "5 mins ago",
    },
    {
      id: "3",
      customerName: "Dawit Mekonnen",
      customerRating: 4.9,
      pickupLocation: "Kazanchis, Addis Ababa",
      destinationLocation: "Ayat, Addis Ababa",
      distance: "15.8 km",
      estimatedTime: "50 mins",
      price: 680,
      timestamp: "8 mins ago",
    },
  ],
  onAccept = (id) => console.log(`Request ${id} accepted`),
  onDecline = (id) => console.log(`Request ${id} declined`),
  onCallCustomer = (id) => console.log(`Calling customer for request ${id}`),
}: RequestsListProps) => {
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null,
  );

  const toggleRequestExpansion = (id: string) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            className={`text-sm ${star <= Math.round(rating) ? "text-yellow-500" : "text-gray-300"}`}
          >
            ★
          </Text>
        ))}
        <Text className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderRequestItem = ({ item }: { item: RequestItem }) => {
    const isExpanded = expandedRequestId === item.id;

    return (
      <TouchableOpacity
        className="bg-white rounded-lg mb-3 p-4 shadow-sm border border-gray-100"
        onPress={() => toggleRequestExpansion(item.id)}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.customerName}`,
              }}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
            <View className="ml-3">
              <Text className="font-semibold text-gray-800">
                {item.customerName}
              </Text>
              {renderStars(item.customerRating)}
            </View>
          </View>
          <View className="bg-red-100 px-2 py-1 rounded">
            <Text className="text-red-700 font-medium text-xs">
              {item.timestamp}
            </Text>
          </View>
        </View>

        <View className="mt-3 border-t border-gray-100 pt-3">
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color="#ef4444" />
            <Text className="ml-2 text-gray-700 flex-1">
              {item.pickupLocation}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <MapPin size={16} color="#3b82f6" />
            <Text className="ml-2 text-gray-700 flex-1">
              {item.destinationLocation}
            </Text>
          </View>

          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center">
              <Clock size={14} color="#6b7280" />
              <Text className="ml-1 text-gray-600 text-sm">
                {item.estimatedTime}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 text-sm">{item.distance}</Text>
            </View>
            <View className="flex-row items-center">
              <DollarSign size={14} color="#6b7280" />
              <Text className="ml-1 text-gray-800 font-semibold">
                {item.price} ETB
              </Text>
            </View>
          </View>

          {isExpanded && (
            <View className="mt-4 pt-3 border-t border-gray-100">
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center justify-center flex-1 mr-2"
                  onPress={() => onAccept(item.id)}
                >
                  <CheckCircle size={16} color="#ffffff" />
                  <Text className="text-white font-medium ml-1">Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded-lg flex-row items-center justify-center flex-1 mr-2"
                  onPress={() => onDecline(item.id)}
                >
                  <XCircle size={16} color="#4b5563" />
                  <Text className="text-gray-700 font-medium ml-1">
                    Decline
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center justify-center flex-1"
                  onPress={() => onCallCustomer(item.id)}
                >
                  <Phone size={16} color="#ffffff" />
                  <Text className="text-white font-medium ml-1">Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-gray-50 p-4 rounded-lg">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-800">Job Requests</Text>
        <Text className="text-sm text-red-600 font-medium">
          {requests.length} new
        </Text>
      </View>

      {requests.length > 0 ? (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="max-h-[500px]" // Limit height to ensure it doesn't take up too much space
        />
      ) : (
        <View className="py-8 items-center justify-center bg-white rounded-lg">
          <Text className="text-gray-500">No requests available</Text>
          <Text className="text-gray-400 text-sm mt-1">
            New job requests will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

export default RequestsList;
