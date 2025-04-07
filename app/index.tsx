import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Animated, Dimensions, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "./_layout";
import { ArrowRight } from "lucide-react-native";
import SafeAreaContainer from "./utils/SafeAreaContainer";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const windowHeight = Dimensions.get('window').height;
  
  // Determine if we should use the native driver (not supported on web)
  const useNative = Platform.OS !== 'web';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: useNative,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: useNative,
      })
    ]).start();
  }, []);

  return (
    <SafeAreaContainer scrollable={false} extraPadding={{ top: 10 }}>
      <Animated.View 
        className="flex-1"
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Header and Logo */}
        <View className="items-center mb-10 mt-4">
          <Image
            source={require("../assets/images/logo.jpg")}
            style={{ width: 80, height: 80, borderRadius: 16 }}
            resizeMode="contain"
          />
        </View>

        {/* Main Headline */}
        <View className="mb-14">
          <Text className="text-4xl font-bold text-gray-900 dark:text-white text-center">
            Move with My Truck
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-300 text-center mt-3">
            Reliable transport, simplified.
          </Text>
        </View>

        {/* Main CTA Section */}
        <View className="flex-1 justify-center mb-8">
          {/* Single Continue Button */}
          <TouchableOpacity
            className="bg-black dark:bg-white w-full rounded-xl py-4 mb-5"
            onPress={() => router.push('/auth/phone-verification')}
            style={{ pointerEvents: 'auto' }}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white dark:text-black text-center font-semibold text-lg mr-2">
                Continue
              </Text>
              <ArrowRight size={20} color={isDarkMode ? "#000000" : "#FFFFFF"} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card,
              { backgroundColor: isDarkMode ? "#1f2937" : "#ffffff" }
            ]}
            onPress={() => router.push("/screens/MapDemoScreen")}
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name="map-outline"
                size={24}
                color={isDarkMode ? "#3b82f6" : "#3b82f6"}
              />
            </View>
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDarkMode ? "#f3f4f6" : "#1f2937" }
                ]}
              >
                Map Demo
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  { color: isDarkMode ? "#9ca3af" : "#6b7280" }
                ]}
              >
                Try our mocked map implementation
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Footer - Terms and Privacy */}
      <View className="pb-10">
        <Text className="text-gray-500 dark:text-gray-400 text-xs text-center">
          By continuing, you agree to our{" "}
          <Text className="font-medium">Terms of Service</Text> and{" "}
          <Text className="font-medium">Privacy Policy</Text>
        </Text>
        
        <Text className="text-gray-400 dark:text-gray-500 text-xs text-center mt-3">
          We use phone number verification for all users
        </Text>
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  }
}); 