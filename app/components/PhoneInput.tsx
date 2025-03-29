import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronDown, Phone, ArrowRight } from "lucide-react-native";

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

  // Country codes for the dropdown (simplified for demo)
  const countryCodes = [
    { code: "+251", country: "Ethiopia" },
    { code: "+254", country: "Kenya" },
    { code: "+256", country: "Uganda" },
    { code: "+255", country: "Tanzania" },
  ];

  return (
    <View className="w-full bg-white p-4 rounded-lg shadow-sm">
      <Text className="text-gray-700 font-medium mb-2">
        Enter your phone number
      </Text>
      <View className="flex-row items-center mb-4">
        {/* Country code selector */}
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-l-lg px-2 py-3 border-r border-gray-300"
          onPress={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
        >
          <Text className="text-black font-medium mr-1">{countryCode}</Text>
          <ChevronDown size={16} color="#374151" />
        </TouchableOpacity>

        {/* Phone number input */}
        <View className="flex-row flex-1 items-center bg-gray-100 rounded-r-lg px-3 py-2">
          <Phone size={18} color="#374151" className="mr-2" />
          <TextInput
            className="flex-1 text-base text-black h-10"
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChangeText}
            maxLength={10}
          />
        </View>
      </View>

      {/* Country code dropdown (simplified) */}
      {isCountryCodeOpen && (
        <View className="bg-white rounded-lg shadow-md mb-4 absolute top-20 left-4 z-10 w-48">
          {countryCodes.map((item) => (
            <TouchableOpacity
              key={item.code}
              className="px-4 py-3 border-b border-gray-100"
              onPress={() => {
                onCountryCodeChange?.(item.code);
                setIsCountryCodeOpen(false);
              }}
            >
              <Text className="text-black">
                {item.country} ({item.code})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text className="text-gray-500 text-xs mt-3 text-center">
        We'll send a verification code to this number via GeezSMS
      </Text>
    </View>
  );
};

export default PhoneInput;
