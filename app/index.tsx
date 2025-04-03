import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StatusBar, Animated, Dimensions, Platform, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "./_layout";
import { ArrowRight } from "lucide-react-native";

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
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <Animated.View 
        className="flex-1 px-6 pt-12"
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
        </View>
      </Animated.View>

      {/* Footer - Terms and Privacy */}
      <View className="pb-10 px-6">
        <Text className="text-gray-500 dark:text-gray-400 text-xs text-center">
          By continuing, you agree to our{" "}
          <Text className="font-medium">Terms of Service</Text> and{" "}
          <Text className="font-medium">Privacy Policy</Text>
        </Text>
        
        <Text className="text-gray-400 dark:text-gray-500 text-xs text-center mt-3">
          We use phone number verification for all users
        </Text>
      </View>
    </SafeAreaView>
  );
} 