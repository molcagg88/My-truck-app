import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Truck, Info } from "lucide-react-native";
import { useTheme } from "../_layout";

interface TruckType {
  id: string;
  name: string;
  capacity: string;
  description: string;
  pricePerKm: number;
  imageUrl: string;
}

interface TruckTypeSelectorProps {
  selectedTruckId?: string;
  onSelectTruck?: (truckId: string) => void;
}

const TruckTypeSelector = ({
  selectedTruckId = "",
  onSelectTruck = () => {},
}: TruckTypeSelectorProps) => {
  const { isDarkMode } = useTheme();
  const [truckTypes] = useState<TruckType[]>([
    {
      id: "1",
      name: "Small Pickup",
      capacity: "1 ton",
      description: "Best for small moves and deliveries",
      pricePerKm: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1659363421537-c8ab2fd11945?w=300&q=80",
    },
    {
      id: "2",
      name: "Medium Truck",
      capacity: "3 tons",
      description: "Ideal for medium-sized cargo and furniture",
      pricePerKm: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&q=80",
    },
    {
      id: "3",
      name: "Large Truck",
      capacity: "7 tons",
      description: "Perfect for large moves and commercial goods",
      pricePerKm: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1586191582151-f73872dfd183?w=300&q=80",
    },
    {
      id: "4",
      name: "Refrigerated",
      capacity: "5 tons",
      description: "Temperature-controlled for perishable items",
      pricePerKm: 45,
      imageUrl:
        "https://images.unsplash.com/photo-1626248801379-51a0748e0dfa?w=300&q=80",
    },
  ]);

  return (
    <View className={`p-4 rounded-lg shadow-md w-full ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
      <View className="flex-row items-center mb-4">
        <Truck size={24} color="#FF0000" />
        <Text className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Select Truck Type
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="w-full"
      >
        {truckTypes.map((truck) => (
          <TouchableOpacity
            key={truck.id}
            onPress={() => onSelectTruck(truck.id)}
            className={`mr-4 rounded-lg border-2 ${
              selectedTruckId === truck.id 
                ? "border-red-500" 
                : isDarkMode ? "border-neutral-700" : "border-gray-200"
            } overflow-hidden w-[150px]`}
            style={selectedTruckId === truck.id ? styles.selectedShadow : {}}
          >
            <Image
              source={{ uri: truck.imageUrl }}
              className="w-full h-[100px]"
              resizeMode="cover"
            />
            <View className={`p-3 ${isDarkMode ? 'bg-neutral-700' : 'bg-white'}`}>
              <Text className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {truck.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                  {truck.capacity}
                </Text>
                <TouchableOpacity className="ml-auto">
                  <Info size={16} color={isDarkMode ? "#9CA3AF" : "#666666"} />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-red-500 font-semibold mt-2">
                {truck.pricePerKm} Birr/km
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedTruckId && (
        <View className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-neutral-700' : 'bg-gray-50'}`}>
          <Text className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
            {truckTypes.find((t) => t.id === selectedTruckId)?.description ||
              "Select a truck type to see details"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  selectedShadow: {
    boxShadow: '0 2px 4px rgba(255, 0, 0, 0.3)',
  },
});

export default TruckTypeSelector;
