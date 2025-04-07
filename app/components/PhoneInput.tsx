import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronDown, Phone, ArrowRight } from "lucide-react-native";
import { useTheme } from "../_layout";

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  isLoading?: boolean;
}

const PhoneInput = ({
  value,
  onChangeText,
  placeholder = "9XX XXX XXXX",
  countryCode = "+251", // Ethiopia country code
  onCountryCodeChange,
  isLoading = false,
}: PhoneInputProps) => {
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const { isDarkMode } = useTheme();

  // Country codes for the dropdown (simplified for demo)
  const countryCodes = [
    { code: "+251", country: "Ethiopia" }
  ];

  return (
    <View className={`w-full p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
      <Text className={`font-medium mb-2 ${isDarkMode ? 'text-neutral-200' : 'text-gray-700'}`}>
        Enter your phone number
      </Text>
      <View className="flex-row items-center mb-4">
        {/* Country code selector */}
        <TouchableOpacity
          className={`flex-row items-center rounded-l-lg px-2 h-12 justify-center border-r ${
            isDarkMode 
              ? 'bg-neutral-700 border-neutral-600' 
              : 'bg-gray-100 border-gray-300'
          }`}
          onPress={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
          style={{ pointerEvents: 'auto' }}
        >
          <Text className={`font-medium mr-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {countryCode}
          </Text>
          <ChevronDown size={16} color={isDarkMode ? "#FFFFFF" : "#374151"} />
        </TouchableOpacity>

        {/* Phone number input */}
        <View className={`flex-row flex-1 items-center rounded-r-lg px-3 h-12 ${
          isDarkMode ? 'bg-neutral-700' : 'bg-gray-100'
        }`}>
          <Phone size={18} color={isDarkMode ? "#FFFFFF" : "#374151"} className="mr-2" />
          <TextInput
            className={`flex-1 text-base ${isDarkMode ? 'text-white' : 'text-black'}`}
            placeholder={placeholder}
            placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChangeText}
            maxLength={10}
          />
        </View>
      </View>

      {/* Country code dropdown (simplified) */}
      {isCountryCodeOpen && (
        <View className={`rounded-lg shadow-md mb-4 absolute top-20 left-4 z-10 w-48 ${
          isDarkMode ? 'bg-neutral-800' : 'bg-white'
        }`}>
          {countryCodes.map((item) => (
            <TouchableOpacity
              key={item.code}
              className={`px-4 py-3 border-b ${
                isDarkMode ? 'border-neutral-700' : 'border-gray-100'
              }`}
              onPress={() => {
                onCountryCodeChange?.(item.code);
                setIsCountryCodeOpen(false);
              }}
              style={{ pointerEvents: 'auto' }}
            >
              <Text className={isDarkMode ? 'text-white' : 'text-black'}>
                {item.country} ({item.code})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text className={`text-xs mt-3 text-center ${
        isDarkMode ? 'text-neutral-400' : 'text-gray-500'
      }`}>
        We'll send a verification code to this number via GeezSMS
      </Text>
    </View>
  );
};

// Remove unnecessary StyleSheet since we're using TailwindCSS/NativeWind classes
const styles = StyleSheet.create({});

export default PhoneInput;
