import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Star } from "lucide-react-native";
import { useTheme } from "../_layout";

const RatingScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    // Here you would typically send the rating and comment to your backend
    console.log("Rating submitted:", { rating, comment });
    router.push("/customer/dashboard");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <View className="p-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color={isDarkMode ? "#ffffff" : "#374151"} />
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-6 text-neutral-800 dark:text-white">
          Rate Your Experience
        </Text>

        <View className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
            How would you rate your delivery?
          </Text>

          <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="mx-1"
              >
                <Star
                  size={40}
                  color={star <= rating ? "#FF0000" : "#D1D5DB"}
                  fill={star <= rating ? "#FF0000" : "none"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
            Tell us about your experience
          </Text>

          <TextInput
            className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 text-neutral-800 dark:text-white mb-6"
            placeholder="Share your thoughts about the delivery..."
            placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            className={`py-4 rounded-lg ${
              rating === 0 ? "bg-gray-300 dark:bg-gray-700" : "bg-red-500"
            }`}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text className="text-white font-semibold text-center">
              Submit Rating
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RatingScreen; 